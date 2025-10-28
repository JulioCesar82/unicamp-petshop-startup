const util = require('util');
const crudRepository = require('../repositories/postgres/crud.repository');

const { pool } = require('../config/database');
const { client } = require('../providers/storage');
const createUpload = require('../config/upload-multipart-form-data');
const { folder } = require('../config/cloudinary');

const petImageUpload = createUpload({
    folder: (req, file) => folder,
    public_id: (req, file) => `pet${req.params.id}-image`,
});

const uploadToBucketAsync = util.promisify(petImageUpload.single('image'));

const petCrud = crudRepository('pet', 'pet_id', ['tutor_id', 'name', 'image_path', 'birth_date', 'species', 'animal_type', 'fur_type', 'ignore_recommendation']);

const uploadImageAsync = async (req, res, organizationId) => {
    const dbClient = await pool.connect();
    try {
        await dbClient.query('BEGIN');

        await uploadToBucketAsync(req, res);

        const imagePath = req.file.path;
        const petId = req.params.id;

        const pet = await petCrud.updateAsync(petId, { image_path: imagePath }, organizationId, dbClient);

        if (pet) {
            await dbClient.query('COMMIT');
            return pet;
        } else {
            await dbClient.query('ROLLBACK');
            return null;
        }
    } catch (error) {
        await dbClient.query('ROLLBACK');
        // If there is an error, we need to delete the image from upload
        
        if (req.file) {
            client.uploader.destroy(req.file.filename);
        }

        throw error;
    } finally {
        dbClient.release();
    }
};

module.exports = {
    uploadImageAsync
};