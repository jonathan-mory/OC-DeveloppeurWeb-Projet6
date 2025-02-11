const Book = require('../models/Book');

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) => res.status(400).json({ error }));
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) => res.status(404).json({ error }));
};

exports.postBook = (req, res, next) => {
    delete req.body._id;
    const book = new Book({
        ...req.body,
    });
    book.save()
        .then(() => res.status(201).json({ message: 'Livre enregistré !' }))
        .catch();
};

exports.modifyBook = (req, res, next) => {};
