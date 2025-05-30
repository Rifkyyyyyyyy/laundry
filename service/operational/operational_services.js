const Operational = require('../../model/operational/operational');
const ApiError = require('../../utils/apiError');
const { handleImageUpload, handleImageDestroys } = require('../cloudinary/cloudinary');
const { getPagination } = require('../../utils/func');

const createOperationalReports = async ({ outletId, createdBy, category, title, description, image }) => {
  try {
    const allowedCategories = ['Mesin Rusak', 'Kebersihan', 'Air Mati', 'Listrik', 'Lainnya'];

    if (!allowedCategories.includes(category)) {
      throw new ApiError(400, 'Kategori tidak valid');
    }
    if (!image) {
      throw new ApiError(400, 'Foto Harus Ada');
    }

    let photoId = await handleImageUpload('operational', image);

    console.log(`id photo : ${photoId}`);

    const newReport = await Operational.create({
      outletId,
      createdBy,
      category,
      title,
      description,
      photo: photoId
    });

    const populatedReport = await Operational.findById(newReport._id)
      .populate({
        path: 'createdBy',
        select: 'username role photo outletId',
        populate: [
          {
            path: 'photo',
            select: 'url'
          },
          {
            path: 'outletId',
            select: 'name' // menampilkan nama outlet
          }
        ]
      })
      .populate('photo')
    return populatedReport;
  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(500, 'Gagal membuat laporan operasional');
  }
};



const updateOperationalReports = async (
  reportId,
  { outletId, category, title, description, isResolved, image }
) => {
  try {
    const existingReport = await Operational.findById(reportId);
    if (!existingReport) throw new ApiError(404, 'Laporan tidak ditemukan');

    // Handle image replacement
    let foto = existingReport.foto;
    if (image) {
      // Destroy old image if exists
      if (foto) {
        await handleImageDestroys(foto);
      }
      // Upload new image
      foto = await handleImageUpload('operational', image);
    }

    // Siapkan object update yang akan disimpan
    const updateData = {};

    if (outletId) updateData.outletId = outletId;
    if (category) updateData.category = category;
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (typeof isResolved !== 'undefined') updateData.isResolved = isResolved;

    updateData.foto = foto;

    const updated = await Operational.findByIdAndUpdate(reportId, updateData, { new: true })
      .populate('dibuatOleh', 'name role')
      .populate('foto');

    return updated;
  } catch (error) {
    throw new ApiError(500, 'Gagal mengupdate laporan operasional');
  }
};



const getAllOperationalByOutletId = async (outletId, page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    const data = await Operational.find({ outletId })
      .populate({
        path: 'createdBy',
        select: 'username role photo outletId',
        populate: [
          {
            path: 'photo',
            select: 'url'
          },
          {
            path: 'outletId',
            select: 'name' // menampilkan nama outlet
          }
        ]
      })
      .populate('photo') // untuk field photo di Operational (jika ada)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await Operational.countDocuments({ outletId });

    return {
      data,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(500, 'Gagal mengambil laporan berdasarkan outlet');
  }
};


const getAllOperationalReports = async (page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    const data = await Operational.find()
      .populate({
        path: 'createdBy',
        select: 'username role photo outletId',
        populate: [
          {
            path: 'photo',
            select: 'url'
          },
          {
            path: 'outletId',
            select: 'name' // menampilkan nama outlet
          }
        ]
      })
      .populate('photo') // untuk field photo di Operational (jika ada)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageLimit);

    const totalCount = await Operational.countDocuments();

    return {
      data,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    };
  } catch (error) {
    throw new ApiError(500, 'Gagal mengambil semua laporan operasional');
  }
};


const answerFeedBackByOwner = async ({ reportId, ownerId, message }) => {
  try {
    console.log(`data : ${reportId} ${ownerId} ${message}`);

    const report = await Operational.findById(reportId);
    if (!report) throw new ApiError(404, 'Laporan tidak ditemukan');

    report.feedback.push({
      ownerId,
      message
    });

    await report.save();

    return await Operational.findById(reportId)
      .populate({
        path: 'createdBy',
        select: 'username role photo outletId',
        populate: [
          {
            path: 'photo',
            select: 'url'
          },
          {
            path: 'outletId',
            select: 'name' // menampilkan nama outlet
          }
        ]
      })
      .populate('photo'); // populate photo yang terkait dengan laporan itu sendiri

  } catch (error) {
    console.log(`error : ${error}`);
    throw new ApiError(500, 'Gagal mengirim feedback');
  }
};



const markAsDownFeedback = async (reportId) => {
  try {
    const updated = await Operational.findByIdAndUpdate(
      reportId,
      { isResolved: true }, // pastikan field sesuai, sebelumnya `isSelesai`, sekarang `isResolved`
      { new: true }
    )
      .populate({
        path: 'createdBy',
        select: 'username role photo outletId',
        populate: [
          {
            path: 'photo',
            select: 'url'
          },
          {
            path: 'outletId',
            select: 'name'
          }
        ]
      })
      .populate({
        path: 'photo',
        select: 'url public_id'
      })
      .populate({
        path: 'feedback.ownerId',
        select: 'username photo',
        populate: {
          path: 'photo',
          select: 'url'
        }
      });

    if (!updated) throw new ApiError(404, 'Laporan tidak ditemukan');
    return updated;
  } catch (error) {
    console.error(error);
    throw new ApiError(500, 'Gagal menandai laporan selesai');
  }
};



const filterFeedBackByNotResolved = async (outletId, page = 1, limit = 5) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });

    // Hitung total dokumen yang belum selesai
    const totalCount = await Operational.countDocuments({ outletId, isSelesai: false });

    // Ambil data dengan pagination dan populate
    const data = await Operational.find({ outletId, isSelesai: false })
      .populate('dibuatOleh', 'name')
      .populate('foto')
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    return {
      data,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / metadata.limit),
      }
    };
  } catch (error) {
    throw new ApiError(500, 'Gagal memfilter laporan yang belum selesai');
  }
};


module.exports = {
  createOperationalReports,
  updateOperationalReports,
  getAllOperationalByOutletId,
  getAllOperationalReports,
  answerFeedBackByOwner,
  markAsDownFeedback,
  filterFeedBackByNotResolved
};
