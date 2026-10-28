const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  bookId: {
    type: String,
    required: [true, 'bookId la bat buoc'],
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: [true, 'Tieu de la bat buoc'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Tac gia la bat buoc'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Gia la bat buoc'],
    min: [0, 'Gia khong duoc am']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: 'Chua phan loai'
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
