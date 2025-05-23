const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({
  url: {
    type: String,
    required: true,  // URL gambar yang di-hosting
  },
  public_id: {
    type: String,
    required: true,  // ID gambar di layanan penyimpanan gambar
  },
}, { versionKey: false, timestamps: false });

module.exports = mongoose.model('File', fileSchema);
