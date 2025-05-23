const Outlet = require('../../model/outlet/outlet');
const { getPagination } = require('../../utils/func');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../../utils/apiError');
const { handleImageDestroys, handleImageUpload } = require('../cloudinary/cloudinary');

const createOutletService = async ({ name, address, lat, long, openingTime, closingTime, contactNumber, image, openingDays }) => {
  try {
    console.log('Data yang masuk:', {
      name,
      address,
      lat,
      long,
      openingTime,
      closingTime,
      contactNumber,
      image,
      openingDays,
    });

    // Validasi wajib isi semua
    if (!name || !address || !lat || !long || !openingTime || !closingTime || !openingDays || !Array.isArray(openingDays) || openingDays.length === 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Semua field wajib diisi dengan benar');
    }

    // Konversi lat dan long dari string ke number
    const latNum = Number(lat);
    const longNum = Number(long);

    // Cek apakah hasil konversi valid number
    if (isNaN(latNum) || isNaN(longNum)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Koordinat lokasi tidak valid');
    }

    const existingOutlet = await Outlet.findOne({ name });
    if (existingOutlet) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Nama outlet sudah digunakan');
    }

    const photoId = image ? await handleImageUpload('outlets', image) : null;

    const newOutlet = await Outlet.create({
      name,
      location: {
        address,
        lat: latNum,
        long: longNum,
      },
      phone: contactNumber || '',
      openingDays,
      openingTime,
      closingTime,
      photo: photoId
    });

    return newOutlet;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || 'Gagal membuat outlet');
  }
};



const updateOutletService = async (id, updateData) => {
  try {
    const outlet = await Outlet.findById(id).populate('photo');
    if (!outlet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Outlet tidak ditemukan');
    }

    // Tangani gambar
    if (updateData.image) {
      if (outlet.photo?._id) {
        await handleImageDestroys(outlet.photo._id);
      }
      const photoId = await handleImageUpload('outlets', updateData.image);
      updateData.photo = photoId;
      delete updateData.image;
    }

    // Update lokasi jika ada
    if (updateData.location) {
      outlet.location.address = updateData.location.address ?? outlet.location.address;
      outlet.location.lat = updateData.location.lat ?? outlet.location.lat;
      outlet.location.long = updateData.location.long ?? outlet.location.long;
      delete updateData.location;
    }

    // Update properti lainnya
    for (const key in updateData) {
      outlet[key] = updateData[key];
    }

    const updatedOutlet = await outlet.save();

    return updatedOutlet;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || 'Gagal memperbarui outlet');
  }
};

const getAllOutletsServices = async (page, limit) => {
  try {
    const { skip, limit: pageLimit, metadata } = getPagination({ page, limit });
    const totalCount = await Outlet.countDocuments();

    const outlets = await Outlet.find()
      .skip(skip)
      .limit(pageLimit)
      .populate('photo');

    return {
      outlets,
      pagination: {
        ...metadata,
        totalCount,
        totalPages: Math.ceil(totalCount / pageLimit),
      },
    };
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Gagal mengambil data outlet');
  }
};

const deleteOutletService = async (id) => {
  try {
    const outlet = await Outlet.findById(id).populate('photo');
    if (!outlet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Outlet tidak ditemukan');
    }

    if (outlet.photo?._id) {
      await handleImageDestroys(outlet.photo._id);
    }

    await Outlet.findByIdAndDelete(id);
    return outlet;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || 'Gagal menghapus outlet');
  }
};

const getOutletsByLocationServices = async (city) => {
  try {
    return await Outlet.find({ city });
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil outlet berdasarkan lokasi');
  }
};

const getOutletByNameService = async (name) => {
  try {
    const outlet = await Outlet.findOne({ name });
    if (!outlet) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Outlet tidak ditemukan');
    }
    return outlet;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, error?.message || 'Gagal mengambil outlet berdasarkan nama');
  }
};

const getAllListOutlesServices = async () => {
  try {
    const outlets = await Outlet.find({}, { _id: 1, name: 1 });
    return outlets;
  } catch (error) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Gagal mengambil daftar outlet');
  }
};

module.exports = {
  createOutletService,
  updateOutletService,
  getAllOutletsServices,
  deleteOutletService,
  getOutletsByLocationServices,
  getOutletByNameService,
  getAllListOutlesServices
};
