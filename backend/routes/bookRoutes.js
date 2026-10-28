const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET /api/books?search=keyword
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { bookId: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } }
          ]
        }
      : {};
    const books = await Book.find(filter).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    next(err);
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Khong tim thay sach' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// POST /api/books
router.post('/', async (req, res, next) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

// PUT /api/books/:id
router.put('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Khong tim thay sach' });
    res.json(book);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Khong tim thay sach' });
    res.json({ message: 'Da xoa sach thanh cong' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
