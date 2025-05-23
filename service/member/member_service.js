const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Member = require('../../model/member/member');

const {
  Types
} = require('mongoose')

const {
  getPagination,
  calculateExpiredDate
} = require('../../utils/func')

const crypto = require('crypto');


const createMemberService = async (userId, outletId, membershipLevel, membershipDuration) => {
  // Validasi membershipDuration, hanya boleh 1, 3, 6, atau 12
  const validDurations = [1, 3, 6, 12];
  if (!validDurations.includes(membershipDuration)) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Durasi keanggotaan tidak valid. Pilih antara 1, 3, 6, atau 12 bulan.');
  }

  // Cek apakah user sudah menjadi member
  const existingMember = await Member.findOne({ userId });
  if (existingMember) {
    throw new ApiError(STATUS_CODES.BAD_REQUEST, 'User sudah terdaftar sebagai member');
  }

  // Generate member number unik
  const memberNumber = 'MBR-' + crypto.randomBytes(6).toString('hex').toUpperCase(); // 12-karakter hex

  // Set tanggal bergabung (joinDate)
  const joinDate = new Date();

  // Menghitung expiredDate berdasarkan membershipDuration (dalam bulan)
  const expiredDate = new Date(joinDate);
  expiredDate.setMonth(expiredDate.getMonth() + membershipDuration); // Menambahkan membershipDuration ke bulan expiredDate

  // Membuat anggota baru
  const newMember = new Member({
    userId,
    outletId,
    membershipLevel,
    joinDate,
    expiredDate, // Tanggal kadaluwarsa dihitung di sini
    points: 0,
    memberNumber
  });

  // Simpan member baru ke database
  await newMember.save();
  return newMember;
};



// GET ALL MEMBERS
const getAllMembersService = async (page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    // Fetch members with pagination and populate 'name' from outletId and 'name' and 'email' from userId
    const members = await Member.find()
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name')  // Populate 'name' field from outletId
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: {
          path: 'photo',
          select: 'url'  // atau sesuaikan field yang ingin ditampilkan dari File
        }
      })

    const totalCount = await Member.countDocuments();

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Terjadi kesalahan saat mengambil data member');
  }
};


// GET MEMBER BY ID
const getMemberByIdService = async (id) => {
  const member = await Member.findById(id);
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  return member;
};

// UPDATE MEMBER BY ID
const updateMemberService = async (id, data) => {
  const updatedMember = await Member.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updatedMember) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan untuk diperbarui');
  }
  return updatedMember;
};

// DELETE MEMBER BY ID
const deleteMemberService = async (id) => {
  const deletedMember = await Member.findByIdAndDelete(id);
  if (!deletedMember) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  }
  return deletedMember;
};

// GET ACTIVE MEMBERS
const getActiveMembersService = async () => {
  return await Member.find({ isActive: true });
};

// GET MEMBER BY USER ID
const getMemberByUserIdService = async (userId) => {
  const member = await Member.findOne({ userId });
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  return member;
};

// VALIDATE MEMBER STATUS
const validateMemberStatusService = async (id) => {
  const member = await Member.findById(id);
  if (!member) throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');

  if (!member.isActive) {
    throw new ApiError(STATUS_CODES.FORBIDDEN, 'Member tidak aktif');
  }

  return member;
};

// GET MEMBERS BY OUTLET ID
const getMembersByOutletIdService = async (outletId, page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const members = await Member.find({ outletId })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name')  // Populate 'name' field from outletId
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: {
          path: 'photo',
          select: 'url'  // atau sesuaikan field yang ingin ditampilkan dari File
        }
      })


    const totalCount = await Member.countDocuments({ outletId });

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal mengambil data member berdasarkan outlet');
  }
};


const searchMemberService = async (searchTerm, outletId, page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const aggregation = [
      {
        $match: {
          outletId: new Types.ObjectId(outletId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          $or: [
            { 'user.username': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },
      {
        $lookup: {
          from: 'files',
          localField: 'user.photo',
          foreignField: '_id',
          as: 'user.photo'
        }
      },
      {
        $unwind: {
          path: '$user.photo',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'outlets',
          localField: 'outletId',
          foreignField: '_id',
          as: 'outlet'
        }
      },
      {
        $unwind: {
          path: '$outlet',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $skip: skip },
            { $limit: pageLimit },
            {
              $project: {
                _id: 1,
                membershipLevel: 1,
                joinDate: 1,
                expiredDate: 1,
                points: 1,
                memberNumber: 1,
                outletId: {
                  _id: '$outlet._id',
                  name: '$outlet.name'
                },
                userId: {
                  _id: '$user._id',
                  username: '$user.username',
                  email: '$user.email',
                  photo: {
                    _id: '$user.photo._id',
                    url: '$user.photo.url'
                  }
                }
              }
            }
          ]
        }
      }
    ];

    const result = await Member.aggregate(aggregation);
    const members = result[0]?.data || [];
    const totalCount = result[0]?.metadata[0]?.total || 0;

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    console.log(`error: ${error}`);
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal melakukan pencarian member');
  }
};



const filterMemberByTierService = async (outletId, page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    // Prioritaskan berdasarkan urutan tier: platinum > gold > silver
    const tierOrder = ['platinum', 'gold', 'silver'];
    let highestTier;

    // Cek tier tertinggi yang tersedia di outlet tersebut
    for (const tier of tierOrder) {
      const count = await Member.countDocuments({ outletId, membershipLevel: tier });
      if (count > 0) {
        highestTier = tier;
        break;
      }
    }

    if (!highestTier) {
      return {
        members: [],
        pagination: {
          ...metadata,
          totalCount: 0,
          totalPages: 0
        }
      };
    }

    const members = await Member.find({ outletId, membershipLevel: highestTier })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name')
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: { path: 'photo', select: 'url' }
      });

    const totalCount = await Member.countDocuments({ outletId, membershipLevel: highestTier });

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal memfilter member berdasarkan tier tertinggi');
  }
};


const filterMemberByJoinDateService = async (outletId, sort = 'desc', page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const sortOrder = sort === 'asc' ? 1 : -1;

    const query = { outletId };

    const members = await Member.find(query)
      .sort({ joinDate: sortOrder })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name')
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: { path: 'photo', select: 'url' }
      });

    const totalCount = await Member.countDocuments(query);

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal memfilter member berdasarkan tanggal join');
  }
};



const filterMemberByPointsService = async (outletId, sort = 'desc', page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    const sortOrder = sort === 'asc' ? 1 : -1;

    const query = { outletId };

    const members = await Member.find(query)
      .sort({ points: sortOrder })
      .skip(skip)
      .limit(pageLimit)
      .populate('outletId', 'name')
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: { path: 'photo', select: 'url' }
      });

    const totalCount = await Member.countDocuments(query);

    return {
      members,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(STATUS_CODES.INTERNAL_SERVER_ERROR, 'Gagal memfilter member berdasarkan poin');
  }
};


module.exports = {
  createMemberService,
  getAllMembersService,
  getMemberByIdService,
  updateMemberService,
  deleteMemberService,
  getActiveMembersService,
  getMemberByUserIdService,
  validateMemberStatusService,
  getMembersByOutletIdService,
  searchMemberService,
  filterMemberByJoinDateService,
  filterMemberByPointsService,
  filterMemberByTierService
};
