const { body } = require('express-validator');

exports.validateSignup = [
    body('email')
        .isEmail()
        .withMessage("L'email n'est pas valide")
        .notEmpty()
        .withMessage("L'email est requis"),
    body('password')
        .isLength({ min: 4 })
        .withMessage('Le mot de passe doit contenir au moins 4 caractères')
        .notEmpty()
        .withMessage('Le mot de passe est requis'),
];

exports.validateBookCreation = [
    body('book.title')
        .notEmpty()
        .withMessage('Le titre est requis')
        .isLength({ min: 2 })
        .withMessage('Le titre doit contenir au moins 2 caractères'),

    body('book.author')
        .notEmpty()
        .withMessage("L'auteur est requis")
        .isLength({ min: 2 })
        .withMessage("Le nom de l'auteur doit contenir au moins 2 caractères"),

    body('book.year')
        .isInt({ min: 1000, max: new Date().getFullYear() })
        .withMessage("L'année doit être valide"),

    body('book.genre').notEmpty().withMessage('Le genre est requis'),

    body('book.ratings')
        .isArray({ min: 1 })
        .withMessage('Le livre doit avoir au moins une note'),

    body('book.ratings.*.grade')
        .isInt({ min: 0, max: 5 })
        .withMessage('Chaque note doit être comprise entre 0 et 5'),
];

exports.validateBookRating = [
    body('rating')
        .isInt({ min: 0, max: 5 })
        .withMessage('La note doit être comprise entre 0 et 5')
        .notEmpty()
        .withMessage('La note est requise'),
];
