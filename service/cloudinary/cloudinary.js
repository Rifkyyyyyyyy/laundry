const File = require('../../model/file/file');
const fs = require('fs');
const cloudinary = require('../../cloudinary')


const handleImageUpload = async (folderName, image) => {
    const uploaded = await cloudinary.uploader.upload(image.data, {
        folder: folderName,

    });

    const file = await File.create({
        url: uploaded.secure_url,
        public_id: uploaded.public_id,
    });

    if (image.tempFilePath && fs.existsSync(image.tempFilePath)) {
        fs.unlinkSync(image.tempFilePath);
    }

    return file._id;
};



const handleImageDestroys = async (publicId) => {
    try {
      // Cari data file berdasarkan public_id
      const file = await File.findOne({ public_id: publicId });
      if (!file) {
        console.warn(`File dengan public_id "${publicId}" tidak ditemukan`);
        return;
      }
  
      // Hapus file dari Cloudinary
      await cloudinary.uploader.destroy(publicId);
  
      // Hapus file dari database
      await File.findByIdAndDelete(file._id);
    } catch (error) {
      console.error(`handleImageDestroys error: ${error.message}`);
    }
  };
  


module.exports = {
    handleImageUpload,
    handleImageDestroys,
};
