const Book = require('../models/Book');
const fs = require('fs');

exports.getAllBooks = (req, res, next) => {
    Book.find()
        .then((books) => res.status(200).json(books))
        .catch((error) =>
            res.status(400).json({
                message: 'Erreur lors de la récupération des livres',
                error: error,
            })
        );
};

exports.getOneBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => res.status(200).json(book))
        .catch((error) =>
            res.status(404).json({
                message: 'Erreur lors de la récupération du livre',
                error: error,
            })
        );
};

exports.postBook = (req, res, next) => {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;
    const book = new Book({
        ...bookObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
            req.sharpFileName
        }`,
    });
    book.save()
        .then(() => {
            res.status(201).json({
                message: 'Livre enregistré avec succès dans la base de données',
            });
        })
        .catch((error) => {
            res.status(500).json({
                message:
                    "Erreur lors de l'enregistrement du livre dans la base de données",
                error: error,
            });
        });
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file
        ? {
              ...JSON.parse(req.body.book),
              imageUrl: `${req.protocol}://${req.get('host')}/images/${
                  req.sharpFileName
              }`,
          }
        : { ...req.body };
    delete bookObject.userId;
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                return res.status(401).json({
                    message: "Vous n'êtes pas autorisé à modifier le livre",
                });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.updateOne(
                        { _id: req.params.id },
                        { ...bookObject, _id: req.params.id }
                    )
                        .then(() =>
                            res.status(200).json({ message: 'Livre modifié !' })
                        )
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (book.userId != req.auth.userId) {
                return res.status(401).json({
                    message: "Vous n'êtes pas autorisé à supprimer le livre",
                });
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({ _id: req.params.id })
                        .then(() => {
                            res.status(200).json({
                                message: 'Objet supprimé !',
                            });
                        })
                        .catch((error) => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

exports.postBookRating = (req, res, next) => {
    Book.findOne({ _id: req.params.id })
        .then((book) => {
            if (
                book.ratings.some((rating) => rating.userId === req.auth.userId)
            ) {
                return res.status(403).json({
                    message:
                        'Impossible de donner plusieurs notes à un livre à partir du même utilisateur',
                });
            }
            const newRating = {
                userId: req.body.userId,
                grade: req.body.rating,
            };
            const updatedRatings = [...book.ratings, newRating];
            const sumOfUpdatedRatings = updatedRatings
                .map((rating) => rating.grade)
                .reduce(
                    (accumulator, currentValue) => accumulator + currentValue,
                    0
                );
            const newAverageRating =
                sumOfUpdatedRatings / updatedRatings.length;
            Book.updateOne(
                { _id: req.params.id },
                { ratings: updatedRatings, averageRating: newAverageRating }
            )
                .then(() => {
                    Book.findById(req.params.id)
                        .then((book) => {
                            res.status(201).json(book);
                        })
                        .catch((error) =>
                            res.status(401).json({
                                message:
                                    'Erreur lors de récupération du livre modifié',
                                error: error,
                            })
                        );
                })
                .catch((error) =>
                    res.status(401).json({
                        message:
                            'Erreur lors de la mise à jour des notes du livre',
                        error: error,
                    })
                );
        })
        .catch((error) =>
            res.status(401).json({
                message: 'Erreur lors de la récupération du livre à modifier',
                error: error,
            })
        );
};

exports.getBestRatedBooks = (req, res, next) => {
    Book.find()
        .then((books) => {
            const threeBestBooks = books
                .sort((a, b) => b.averageRating - a.averageRating)
                .slice(0, 3);
            res.status(200).json(threeBestBooks);
        })
        .catch((error) =>
            res.status(400).json({
                message: 'Erreur lors de la récupération des livres',
                error: error,
            })
        );
};
