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

exports.validateBookRating = [
    body('rating')
        .isInt({ min: 0, max: 5 })
        .withMessage('La note doit être comprise entre 0 et 5')
        .notEmpty()
        .withMessage('La note est requise'),
];
