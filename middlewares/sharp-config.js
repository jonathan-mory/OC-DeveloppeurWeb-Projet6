const sharp = require('sharp');
const path = require('path');

module.exports = (req, res, next) => {
    if (!req.file) {
        return next();
    }
    const { buffer, originalname } = req.file;
    const fileName = originalname
        .split(' ')
        .join('_')
        .replace(/\.[^/.]+$/, '');
    const timeStamp = Date.now();
    const outputFileName = `${timeStamp}_${fileName}.webp`;
    sharp(buffer)
        .resize({
            width: 405,
            height: 568,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
        })
        .webp({ quality: 50 })
        .toFile(path.join(__dirname, '..', 'images', outputFileName), (err) => {
            if (err) {
                return res.status(500).json({
                    message: "Erreur lors de l'optimisation de l'image",
                    error: err,
                });
            }
            req.sharpFileName = outputFileName;
            next();
        });
};
