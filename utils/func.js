const crypto = require('crypto');

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



module.exports = { getPagination , generateMD5Hash };