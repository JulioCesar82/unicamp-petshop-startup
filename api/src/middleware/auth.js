const organizationRepository = require('../repositories/postgres/organization.repository');
const { statusCodes, apiKeyHeaderName } = require('../config/general');

const authenticateApiKeyAsync = async (req, res, next) => {
    const apiKey = req.headers[apiKeyHeaderName];
    if (!apiKey) {
        return res.status(statusCodes.UNAUTHORIZED).json({ message: 'API Key is required.' });
    }

    try {
        const organization = await organizationRepository.getOrganizationByApiKeyAsync(apiKey);
        if (!organization) {
            return res.status(statusCodes.FORBIDDEN).json({ message: 'Invalid API Key.' });
        }

        if (organization.links && organization.links.length > 0) {
            const referer = req.headers.referer || req.headers.origin;
            const currentHost = req.headers.host;
            
            // Permite requisições do Swagger UI hospedado ou dos links autorizados
            if (!referer || (!referer.includes(currentHost) && !organization.links.some(link => referer.startsWith(link)))) {
                console.error('Referer check failed:',  req.headers);
                return res.status(statusCodes.FORBIDDEN).json({ message: 'Referer not allowed.' });
            }
        }

        req.organization_id = organization.organization_id;
        
        next();
    } catch (error) {
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
};

module.exports = { 
    authenticateApiKeyAsync
};
