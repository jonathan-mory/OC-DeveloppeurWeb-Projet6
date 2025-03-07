exports.bookParser = (req, res, next) => {
    if (req.body.book) {
        try {
            const book = JSON.parse(req.body.book);
            Object.assign(req.body, book);
        } catch (error) {
            return res.status(400).json({ message: 'Format JSON invalide' });
        }
    }
    next();
};
