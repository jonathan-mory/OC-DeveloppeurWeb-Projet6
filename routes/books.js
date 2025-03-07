const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const sharp = require('../middlewares/sharp-config');

const bookCtrl = require('../controllers/book');
const { validateBookRating } = require('../middlewares/validators');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRatedBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', auth, multer, sharp, bookCtrl.postBook);
router.post('/:id/rating', auth, validateBookRating, bookCtrl.postBookRating);
router.put('/:id', multer, auth, sharp, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

module.exports = router;
