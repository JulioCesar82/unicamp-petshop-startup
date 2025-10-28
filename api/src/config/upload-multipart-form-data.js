const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { client } = require('../providers/storage');
const { format } = require('./cloudinary');

const createUploadMiddleware = (options) => {
    const storage = new CloudinaryStorage({
        cloudinary: client,
        params: async (req, file) => {
            const folder = options.folder ? await options.folder(req, file) : undefined;
            const public_id = await options.public_id(req, file);
            return {
                folder,
                public_id,
                format: format || 'png',
            };
        },
    });

    return multer({ storage });
};

module.exports = createUploadMiddleware;
