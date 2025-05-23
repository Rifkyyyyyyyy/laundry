const crypto = require('crypto');
const Order = require('../model/order/order');
const fs = require('fs');


const getPagination = ({ page = 1, limit = 10 }) => {
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    return {
        skip,
        limit,
        metadata: { page, limit }
    };
};



/**
 * Fungsi untuk menghasilkan hash MD5 dari string
 * @param {string} data - Data yang ingin di-hash
 * @returns {string} - Hasil hash MD5
 */
const generateMD5Hash = (data) => {
  return crypto.createHash('md5').update(data).digest('hex');
};


const calculateExpiredDate = (currentDate, durationInMonths) => {
  const newDate = new Date(currentDate);
  newDate.setMonth(newDate.getMonth() + durationInMonths);
  return newDate;
};

/**
 * Convert image file buffer to base64 data URL format
 * @param {Object} image - Image object from req.files
 * @param {Buffer} image.data - Image buffer
 * @param {string} image.mimetype - MIME type (e.g., image/jpeg)
 * @param {string} image.name - File name
 * @returns {Object} - Formatted image with base64 data
 */


const formatImageToBase64 = (image) => {
  if (!image || !image.tempFilePath || !image.mimetype || !image.name) {
    throw new Error('Invalid image format');
  }

  const base64String = fs.readFileSync(image.tempFilePath, { encoding: 'base64' });

  if (!base64String || base64String.length < 50) {
    throw new Error('Image data is empty or too short');
  }

  return {
    name: image.name,
    type: image.mimetype,
    data: `data:${image.mimetype};base64,${base64String}`,
  };
};



const generateQueueNumber = async (outletId) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const lastOrder = await Order.findOne({
      outletId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    }).sort({ queueNumber: -1 });

    const nextQueueNumber = lastOrder ? lastOrder.queueNumber + 1 : 1;
    return nextQueueNumber;
  } catch (error) {
    throw new Error('Failed to generate queue number: ' + error.message);
  }
};


const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius bumi dalam KM
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  ;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;

  return distance;
}





module.exports = { getPagination , generateMD5Hash , calculateExpiredDate , formatImageToBase64 ,  generateQueueNumber , getDistanceFromLatLonInKm};