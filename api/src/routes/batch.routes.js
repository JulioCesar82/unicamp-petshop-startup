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
 *       500:
 *         description: Some server error
 */
router.get('/ltv-by-pet-profile', batchController.getLTVByPetProfileAsync);

module.exports = router;
