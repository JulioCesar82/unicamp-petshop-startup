const express = require('express');
const router = express.Router();

const batchController = require('../controllers/batch.controller');
const { authenticateApiKeyAsync } = require('../middleware/auth');

router.use(authenticateApiKeyAsync);

/**
 * @swagger
 * tags:
 *   name: Batch
 *   description: The batch processing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Batch:
 *       type: object
 *       properties:
 *         execution_id:
 *           type: integer
 *         target_table:
 *           type: string
 *         start_time:
 *           type: string
 *           format: date-time
 *         end_time:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum:
 *             - RUNNING
 *             - FAILED
 *             - COMPLETED
 *         error_message:
 *           type: string
 *           nullable: true
 *         records_processed:
 *           type: integer
 *           nullable: true
 *       example:
 *         execution_id: 1
 *         target_table: "vaccine_recommendation"
 *         start_time: "2025-11-03T20:12:27.362Z"
 *         end_time: "2025-11-03T20:12:38.377Z"
 *         status: "COMPLETED"
 *         error_message: null
 *         records_processed: null
 */

/**
 * @swagger
 * /batch/{entity}:
 *   post:
 *     summary: Start a job for a given entity
 *     tags: [Batch]
 *     parameters:
 *       - in: path
 *         name: entity
 *         schema:
 *           type: string
 *           enum: 
 *             - vaccine-recommendation
 *             - booking-reference
 *             - booking-recommendation
 *             - ltv-by-pet-profile
 *         required: true
 *         description: The entity to process
 *     responses:
 *       202:
 *         description: Job started
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Some server error
 */
router.post('/:entity', batchController.startJobAsync);

/**
 * @swagger
 * /batch/{id}/status:
 *   get:
 *     summary: Get job status by ID
 *     tags: [Batch]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Batch'
 *       500:
 *         description: Some server error
 */
router.get('/:id/status', batchController.getJobStatusAsync);

/**
 * @swagger
 * /batch/{id}/result:
 *   get:
 *     summary: Get job result by ID
 *     tags: [Batch]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job result
 *       500:
 *         description: Some server error
 */
router.get('/:id/result', batchController.getJobResultAsync);

/**
 * @swagger
 * /batch/ltv-by-pet-profile:
 *   get:
 *     summary: Get LTV by pet profile
 *     tags: [Batch]
 *     responses:
 *       200:
 *         description: LTV by pet profile
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   species:
 *                     type: string
 *                   animal_type:
 *                     type: string
 *                   fur_type:
 *                     type: string
 *                   total_value:
 *                     type: string
 *             example:
 *               - species: "Cão"
 *                 animal_type: "Golden Retriever"
 *                 fur_type: "Longo"
 *                 total_value: "527.50"
 *               - species: "Cão"
 *                 animal_type: "Shih Tzu"
 *                 fur_type: "Longo"
 *                 total_value: "251.00"
 *               - species: "Gato"
 *                 animal_type: "Siamês"
 *                 fur_type: "Curto"
 *                 total_value: "527.50"
 *       500:
 *         description: Some server error
 */
router.get('/ltv-by-pet-profile', batchController.getLTVByPetProfileAsync);

module.exports = router;
