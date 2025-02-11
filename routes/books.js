const express = require('express');
const router = express.Router();

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/:id', bookCtrl.getOneBook);
router.post('/', bookCtrl.postBook);

module.exports = router;
