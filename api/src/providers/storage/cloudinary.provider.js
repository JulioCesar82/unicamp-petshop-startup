const cloudinary = require('cloudinary').v2;
const { cloud_name, api_key, api_secret } = require('../../config/cloudinary');

let configuredClient;

function getClient() {
    if (!configuredClient) {
        if (!cloud_name || !api_key || !api_secret) {
            throw new Error('Cloudinary environment variables are not configured');
        }

        cloudinary.config({
            cloud_name,
            api_key,
            api_secret,
        });

        configuredClient = cloudinary;
    }

    return configuredClient;
}

module.exports = {
    client: getClient()
};