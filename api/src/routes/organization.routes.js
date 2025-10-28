const express = require('express');
const router = express.Router();

const organizationController = require('../controllers/organization.controller');
const { createOrganizationValidator } = require('../validators/organization.validator');
const { authenticateApiKeyAsync } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: The organizations managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       required:
 *         - name
 *         - social_name
 *         - description
 *         - identification_code
 *       properties:
 *         organization_id:
 *           type: integer
 *           description: The auto-generated id of the organization.
 *         name:
 *           type: string
 *           description: The name of the organization.
 *         social_name:
 *           type: string
 *           description: The social name of the organization.
 *         description:
 *           type: string
 *           description: The description of the organization.
 *         identification_code:
 *           type: string
 *           description: The identification code of the organization.
 *       example:
 *         name: "PetShop Feliz"
 *         social_name: "PetShop Feliz LTDA"
 *         description: "O melhor para o seu pet."
 *         identification_code: "12345678000199"
 */


/**
 * @swagger
 * /organization:
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - social_name
 *               - description
 *               - identification_code
 *               - invite_code
 *             properties:
 *               name:
 *                 type: string
 *               social_name:
 *                 type: string
 *               description:
 *                 type: string
 *               identification_code:
 *                 type: string
 *               invite_code:
 *                 type: string
 *             example:
 *               name: "PetShop Feliz"
 *               social_name: "PetShop Feliz LTDA"
 *               description: "O melhor para o seu pet."
 *               identification_code: "12345678000199"
 *               invite_code: "super-secret-invite-code"
 *     responses:
 *       201:
 *         description: The organization was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 organization_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 social_name:
 *                   type: string
 *                 description:
 *                   type: string
 *                 identification_code:
 *                   type: string
 *                 apiKey:
 *                   type: string
 *               example:
 *                 organization_id: 1
 *                 name: "PetShop Feliz"
 *                 social_name: "PetShop Feliz LTDA"
 *                 description: "O melhor para o seu pet."
 *                 identification_code: "12345678000199"
 *                 apiKey: "a1b2c3d4e5f6..."
 *       400:
 *         description: Invalid or expired invite code
 *       500:
 *         description: Some server error
 */
router.post('/', createOrganizationValidator, organizationController.createAsync);

/**
 * @swagger
 * /organization:
 *   get:
 *     summary: Get the organization
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: The organization description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: The organization was not found
 */
router.get('/', authenticateApiKeyAsync, organizationController.findOneAsync);

/**
 * @swagger
 * /organization:
 *   delete:
 *     summary: Disable the organization
 *     tags: [Organizations]
 *     responses:
 *       200:
 *         description: The organization was successfully disabled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Organization'
 *       404:
 *         description: The organization was not found or already disabled
 */
router.delete('/', authenticateApiKeyAsync, organizationController.disableAsync);

module.exports = router;
