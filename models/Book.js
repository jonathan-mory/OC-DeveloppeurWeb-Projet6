const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    grade: { type: Number, required: true, min: 0, max: 5 },
});

const bookSchema = mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    author: { type: String, required: true },
    imageUrl: { type: String, required: true },
    year: { type: String, required: true },
    genre: { type: String, required: true },
    ratings: { type: [ratingSchema], required: true },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
});

module.exports = mongoose.model('Book', bookSchema);
