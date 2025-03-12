
const mongoose = require('mongoose');

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // El documento se eliminará después de 10 minutos (600 segundos)
  }
});

module.exports = mongoose.model('VerificationCode', verificationCodeSchema);
