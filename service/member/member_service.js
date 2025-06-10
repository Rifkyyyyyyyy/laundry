const ApiError = require('../../utils/apiError');
const { STATUS_CODES } = require('http');
const Member = require('../../model/member/member');

const {
  Types
} = require('mongoose')

const {
  getPagination,
} = require('../../utils/func')

const crypto = require('crypto');


const createMemberService = async (userId, outletId, membershipLevel, membershipDuration) => {
  try {
    console.log(`durasi : ${membershipDuration}`);
    // Validasi membershipDuration, hanya boleh 1, 3, 6, atau 12
    const validDurations = [1, 3, 6, 12];
    if (!validDurations.includes(membershipDuration)) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'Durasi keanggotaan tidak valid. Pilih antara 1, 3, 6, atau 12 bulan.');
    }

    // Cek apakah user sudah menjadi member
    const existingMember = await Member.findOne({ userId });
    if (existingMember) {
      throw new ApiError(STATUS_CODES.BAD_REQUEST, 'User sudah terdaftar sebagai member.');
    }

    // Generate member number unik (12 karakter hex uppercase)
    const memberNumber = 'MBR-' + crypto.randomBytes(6).toString('hex').toUpperCase();

    // Set tanggal bergabung dan tanggal kedaluwarsa
    const joinDate = new Date();
    const expiredDate = new Date(joinDate);
    expiredDate.setMonth(expiredDate.getMonth() + membershipDuration);

    // Membuat anggota baru
    const newMember = new Member({
      userId,
      outletId,
      membershipLevel,
      joinDate,
      expiredDate,
      points: 0,
      memberNumber
    });

    // Simpan member dan populate data terkait
    await newMember.save();
    return await newMember
      .populate('outletId', 'name')
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: { path: 'photo', select: 'url' }
      });
  } catch (error) {
    console.log(`error : ${error}`);
    // Tangani error tidak terduga
    throw new ApiError(
      error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || 'Terjadi kesalahan saat membuat member.'
    );
  }
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



const updateMemberService = async (id, membershipLevel, membershipDuration) => {
  try {
    const validDurations = [1, 3, 6, 12];
    const updateData = {};

    if (membershipLevel !== undefined) {
      updateData.membershipLevel = membershipLevel;
    }

    if (membershipDuration !== undefined) {
      if (!validDurations.includes(membershipDuration)) {
        throw new ApiError(
          STATUS_CODES.BAD_REQUEST,
          'Durasi keanggotaan tidak valid. Pilih antara 1, 3, 6, atau 12 bulan.'
        );
      }

      const now = new Date();
      const newExpiredDate = new Date(now);
      newExpiredDate.setMonth(newExpiredDate.getMonth() + membershipDuration);

      updateData.expiredDate = newExpiredDate;
      updateData.joinedDate = now; // ← set joinedDate ke sekarang juga
    }

    const updatedMember = await Member.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('outletId', 'name')
      .populate({
        path: 'userId',
        select: 'username email photo',
        populate: { path: 'photo', select: 'url' },
      });

    if (!updatedMember) {
      throw new ApiError(
        STATUS_CODES.NOT_FOUND,
        'Member tidak ditemukan untuk diperbarui.'
      );
    }

    return updatedMember;
  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(
      error.statusCode || STATUS_CODES.INTERNAL_SERVER_ERROR,
      error.message || 'Terjadi kesalahan saat memperbarui member.'
    );
  }
};




// DELETE MEMBER BY ID
const deleteMemberService = async (id) => {
  const deletedMember = await Member.findByIdAndDelete(id);
  if (!deletedMember) {
    throw new ApiError(STATUS_CODES.NOT_FOUND, 'Member tidak ditemukan');
  }
  return deletedMember;
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


const searchAllMemberService = async (searchTerm, page = 1, limit = 5) => {
  const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

  try {
    console.log(`data : ${searchTerm} - PAGE : ${page} - limit : ${limit}`);

    const aggregation = [
      // Lookup user data
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },

      // Pastikan user.photo valid ObjectId, jika tidak set null agar $lookup tidak error
      {
        $addFields: {
          'user.photo': {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$user.photo', null] },
                  { $ne: ['$user.photo', ''] },
                  { $regexMatch: { input: { $toString: '$user.photo' }, regex: /^[a-fA-F0-9]{24}$/ } }
                ]
              },
              then: '$user.photo',
              else: null
            }
          }
        }
      },

      // Lookup file photo jika ada
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

      // Filter sesuai search term di username atau email
      {
        $match: {
          $or: [
            { 'user.username': { $regex: searchTerm, $options: 'i' } },
            { 'user.email': { $regex: searchTerm, $options: 'i' } }
          ]
        }
      },

      // Lookup outlet
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

      // Facet untuk pagination dan data
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
  updateMemberService,
  deleteMemberService,
  getMembersByOutletIdService,
  searchMemberService,
  filterMemberByJoinDateService,
  filterMemberByPointsService,
  filterMemberByTierService ,
  searchAllMemberService
};
