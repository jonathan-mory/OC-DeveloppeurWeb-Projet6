const { default: mongoose } = require('mongoose');
const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');

exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Book.find();
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération des livres',
            error: error,
        });
    }
};

exports.getOneBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        res.status(200).json(book);
    } catch (error) {
        if (error instanceof mongoose.Error.CastError) {
            return res.status(404).json({ message: 'ID de livre invalide' });
        }
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération du livre',
            error: error,
        });
    }
};

exports.postBook = async (req, res, next) => {
    try {
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
        await book.save();
        res.status(201).json({
            message: 'Livre enregistré avec succès dans la base de données',
        });
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message:
                    'La note du livre envoyée en base de données doit être compris entre 0 et 5 ',
            });
        }
        res.status(500).json({
            message:
                "Erreur serveur lors de l'enregistrement du livre dans la base de données",
            error: error,
        });
    }
};

exports.modifyBook = async (req, res, next) => {
    try {
        const bookObject = req.file
            ? {
                  ...JSON.parse(req.body.book),
                  imageUrl: `${req.protocol}://${req.get('host')}/images/${
                      req.sharpFileName
                  }`,
              }
            : { ...req.body };
        delete bookObject.userId;
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Livre non trouvé' });
        }
        if (book.userId != req.auth.userId) {
            return res.status(401).json({
                message: "Vous n'êtes pas autorisé à modifier le livre",
            });
        }
        if (req.file && book.imageUrl) {
            const oldFilename = book.imageUrl.split('/images/')[1];
            if (oldFilename) {
                const oldFilePath = path.join(
                    __dirname,
                    '../images',
                    oldFilename
                );
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
        }
        await Book.updateOne(
            { _id: req.params.id },
            { ...bookObject, _id: req.params.id }
        );
        res.status(200).json({ message: 'Livre modifié' });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur lors de la modification du livre',
            error: error,
        });
    }
};

exports.deleteBook = async (req, res, next) => {
    try {
        const book = await Book.findById(req.params.id);
        if (book.userId != req.auth.userId) {
            return res.status(401).json({
                message: "Vous n'êtes pas autorisé à supprimer le livre",
            });
        }
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, async () => {
            try {
                await Book.deleteOne({ _id: req.params.id });
                res.status(200).json({ message: 'Objet supprimé !' });
            } catch (error) {
                res.status(401).json({ error });
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur lors de la suppression du livre',
            error: error,
        });
    }
};

exports.postBookRating = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const book = await Book.findById(req.params.id);
        if (book.ratings.some((rating) => rating.userId === req.auth.userId)) {
            return res.status(403).json({
                message:
                    'Impossible de donner plusieurs notes à un livre à partir du même utilisateur',
            });
        }
        const newRating = {
            userId: req.auth.userId,
            grade: req.body.rating,
        };
        const updatedRatings = [...book.ratings, newRating];
        const sumOfUpdatedRatings = updatedRatings.reduce(
            (acc, curr) => acc + curr.grade,
            0
        );
        const newAverageRating = sumOfUpdatedRatings / updatedRatings.length;
        const roundedAverageRating = Math.round(newAverageRating * 100) / 100;
        await Book.updateOne(
            { _id: req.params.id },
            { ratings: updatedRatings, averageRating: roundedAverageRating }
        );
        const updatedBook = await Book.findById(req.params.id);
        res.status(201).json(updatedBook);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur lors de la mise à jour des notes du livre',
            error: error,
        });
    }
};

exports.getBestRatedBooks = async (req, res, next) => {
    try {
        const books = await Book.find(null, null, {
            sort: { averageRating: -1 },
            limit: 3,
        });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({
            message: 'Erreur serveur lors de la récupération des livres',
            error: error,
        });
    }
};
