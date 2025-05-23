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


const handleImageDestroys = async (fileId) => {
    const file = await File.findById(fileId);
    if (!file) return;

    // Hapus dari Cloudinary jika public_id tersedia
    if (file.public_id) {
        await cloudinary.uploader.destroy(file.public_id);
    }

    // Hapus record dari database
    await File.findByIdAndDelete(fileId);
};



module.exports = {
    handleImageUpload,
    handleImageDestroys,
};
