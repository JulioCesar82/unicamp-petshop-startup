const crypto = require('crypto');

module.exports = {
    generateApiKey: () => crypto.randomBytes(32).toString('hex')
}