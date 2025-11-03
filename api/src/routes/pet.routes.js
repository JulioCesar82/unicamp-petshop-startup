const express = require('express');
const router = express.Router();

const petController = require('../controllers/pet.controller');
const { validatePet, validatePetList, validateDeletePetList } = require('../validators/pet.validator');
const { validatePagination } = require('../validators/pagination.validator');

const { authenticateApiKeyAsync } = require('../middleware/auth');

router.use(authenticateApiKeyAsync);

/**
 * @swagger
 * tags:
 *   name: Pets
 *   description: The pets managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pet:
 *       type: object
 *       required:
 *         - name
 *         - species
 *         - animal_type
 *       properties:
 *         pet_id:
 *           type: integer
 *           description: The auto-generated id of the pet.
 *         tutor_id:
 *           type: integer
 *           description: The id of the tutor of the pet.
 *         name:
 *           type: string
 *           description: The name of your pet.
 *         image_path:
 *           type: string
 *           nullable: true
 *         birth_date:
 *           type: string
 *           format: date-time
 *         ignore_recommendation:
 *           type: boolean
 *         species:
 *           type: string
 *           description: The species of your pet.
 *         animal_type:
 *           type: string
 *           description: The type of your pet.
 *         fur_type:
 *           type: string
 *           description: The fur type of your pet.
 *         dcreated:
 *           type: string
 *           format: date-time
 *         dlastupdate:
 *           type: string
 *           format: date-time
 *         nenabled:
 *           type: boolean
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         organization_id:
 *           type: integer
 *       example:
 *         pet_id: 1
 *         tutor_id: 1
 *         name: "Ana Carolina"
 *         image_path: null
 *         birth_date: "2025-11-03T03:00:00.000Z"
 *         ignore_recommendation: false
 *         species: "Cão"
 *         animal_type: "Golden Retriever"
 *         fur_type: "Longo"
 *         dcreated: "2025-11-03T20:10:22.337Z"
 *         dlastupdate: "2025-11-03T20:10:22.337Z"
 *         nenabled: true
 *         email: "ana.carolina@email.com"
 *         phone: "55 91234-5678"
 *         organization_id: 1
 *
 */

// POST (Creates list of pets with given input array): /pet/createWithList
/**
 * @swagger
 * /pet/createWithList:
 *   post:
 *     summary: Creates list of pets with given input array
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: The list of pets was successfully created.
 *       400:
 *         description: Erro de validação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso proibido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/createWithList', validatePetList, petController.createWithListAsync);

// POST (Add a new pet): /pet
/**
 * @swagger
 * /pet:
 *   post:
 *     summary: Create a new pet
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       201:
 *         description: The pet was successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       500:
 *         description: Some server error
 */
router.post('/', validatePet, petController.createAsync);

// PUT (uploads an image): /pet/{id}/uploadImage
/**
 * @swagger
 * /pet/{id}/uploadImage:
 *   put:
 *     summary: Uploads an image to a pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *             example:
 *               pet_id: 1
 *               tutor_id: 1
 *               name: "Ana Carolina"
 *               image_path: "https://res.cloudinary.com/ddq4phlks/image/upload/v1762203761/pet-images/pet1-image.png"
 *               birth_date: "2025-11-03T03:00:00.000Z"
 *               ignore_recommendation: false
 *               species: "Cão"
 *               animal_type: "Golden Retriever"
 *               fur_type: "Longo"
 *               dcreated: "2025-11-03T20:10:22.337Z"
 *               dlastupdate: "2025-11-03T20:10:22.337Z"
 *               nenabled: true
 *               email: "ana.carolina@email.com"
 *               phone: "55 91234-5678"
 *               organization_id: 1
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.put('/:id/uploadImage', petController.uploadImageAsync);

// PUT (Update an existing pet): /pet/{id}
/**
 * @swagger
 * /pet/{id}:
 *   put:
 *     summary: Update an existing pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pet'
 *     responses:
 *       200:
 *         description: The pet was successfully updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.put('/:id', validatePet, petController.updateAsync);

// PUT (Updates list of pets with given input array): /pet/updateWithList
/**
 * @swagger
 * /pet/updateWithList:
 *   put:
 *     summary: Updates list of pets with given input array
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/Pet'
 *                 - type: object
 *                   required: ['id']
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the pet to update
 *           example:
 *             - id: 1
 *               name: "Bolinha"
 *               species: "Cão"
 *               animal_type: "Pug"
 *               fur_type: "Curto"
 *               birth_date: "2022-01-15"
 *               tutor_id: 1
 *     responses:
 *       200:
 *         description: The list of pets was successfully updated.
 *       404:
 *         description: One or more pets were not found
 *       500:
 *         description: Some server error
 */
router.put('/updateWithList', validatePetList, petController.updateWithListAsync);

// DELETE (Delete an pet): /pet/{id}
/**
 * @swagger
 * /pet/{id}:
 *   delete:
 *     summary: Deletes a pet by ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     responses:
 *       204:
 *         description: The pet was successfully deleted.
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.delete('/:id', petController.removeAsync);

// DELETE (Deletes list of pets with given input array): /pet/deleteWithList
/**
 * @swagger
 * /pet/deleteWithList:
 *   delete:
 *     summary: Deletes a list of pets
 *     tags: [Pets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *             example:
 *               ids: [1, 2, 3]
 *     responses:
 *       204:
 *         description: The pets were successfully deleted.
 *       500:
 *         description: Some server error
 */
router.delete('/deleteWithList', validateDeletePetList, petController.deleteWithListAsync);

// GET (Finds Pets by id): /pet?id={id}
/**
 * @swagger
 * /pet/{id}:
 *   get:
 *     summary: Get a pet by ID
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     responses:
 *       200:
 *         description: The pet description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pet'
 *             example:
 *               pet_id: 1
 *               tutor_id: 1
 *               name: "Ana Carolina"
 *               image_path: null
 *               birth_date: "2025-11-03T03:00:00.000Z"
 *               ignore_recommendation: false
 *               species: "Cão"
 *               animal_type: "Golden Retriever"
 *               fur_type: "Longo"
 *               dcreated: "2025-11-03T20:10:22.337Z"
 *               dlastupdate: "2025-11-03T20:10:22.337Z"
 *               nenabled: true
 *               email: "ana.carolina@email.com"
 *               phone: "55 91234-5678"
 *               organization_id: 1
 *       404:
 *         description: The pet was not found
 */
router.get('/:id', petController.getByIdAsync);

// GET (Finds Pets by species, animal_type or fur_type): /pet?type={type}&animal_type={animal_type}&fur_type={fur_type}
/**
 * @swagger
 * /pet:
 *   get:
 *     summary: Finds Pets by species, animal_type or fur_type
 *     tags: [Pets]
 *     parameters:
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: 
 *             - Cão
 *             - Gato
 *         description: The species of the pet
 *       - in: query
 *         name: animal_type
 *         schema:
 *           type: string
 *         description: The animal type of the pet
 *       - in: query
 *         name: fur_type
 *         schema:
 *           type: string
 *         description: The fur type of the pet
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to retrieve per page.
 *     responses:
 *       200:
 *         description: A list of pets.
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       items:
 *                         $ref: '#/components/schemas/Pet'
 *             example:
 *               data:
 *                 - pet_id: 1
 *                   tutor_id: 1
 *                   name: "Ana Carolina"
 *                   image_path: null
 *                   birth_date: "2025-11-03T03:00:00.000Z"
 *                   ignore_recommendation: false
 *                   species: "Cão"
 *                   animal_type: "Golden Retriever"
 *                   fur_type: "Longo"
 *                   dcreated: "2025-11-03T20:10:22.337Z"
 *                   dlastupdate: "2025-11-03T20:10:22.337Z"
 *                   nenabled: true
 *                   email: "ana.carolina@email.com"
 *                   phone: "55 91234-5678"
 *                   organization_id: 1
 *                 - pet_id: 3
 *                   tutor_id: 2
 *                   name: "Bruno Martins"
 *                   image_path: null
 *                   birth_date: "2025-07-03T03:00:00.000Z"
 *                   ignore_recommendation: false
 *                   species: "Cão"
 *                   animal_type: "Shih Tzu"
 *                   fur_type: "Longo"
 *                   dcreated: "2025-11-03T20:10:22.337Z"
 *                   dlastupdate: "2025-11-03T20:10:22.337Z"
 *                   nenabled: true
 *                   email: "bruno.martins@email.com"
 *                   phone: "55 99876-5432"
 *                   organization_id: 1
 *               pagination:
 *                 totalItems: 2
 *                 totalPages: 1
 *                 currentPage: "1"
 *                 pageSize: "10"
 *       500:
 *         description: Some server error
 */
router.get('/', validatePagination, petController.findPetsByCriteriaAsync);


// PUT (Ignore all recommendations for a pet): /pet/{id}/recommendations/ignore-all
/**
 * @swagger
 * /pet/{id}/recommendations/ignore-all:
 *   put:
 *     summary: Ignore all recommendations for a pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     responses:
 *       200:
 *         description: All recommendations ignored.
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.put('/:id/recommendations/ignore-all', petController.updateRecommendationAsync);

// GET (Finds booking recommendations by id): /pet/{id}/recommendations/booking
/**
 * @swagger
 * /pet/{id}/recommendations/booking:
 *   get:
 *     summary: Finds booking recommendations by id
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to retrieve per page.
 *     responses:
 *       200:
 *         description: A list of booking recommendations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       booking_recommendation_id:
 *                         type: integer
 *                       pet_id:
 *                         type: integer
 *                       suggested_date:
 *                         type: string
 *                         format: date-time
 *                       average_frequency_days:
 *                         type: integer
 *                       ignore_recommendation:
 *                         type: boolean
 *                       dcreated:
 *                         type: string
 *                         format: date-time
 *                       dlastupdate:
 *                         type: string
 *                         format: date-time
 *                       nenabled:
 *                         type: boolean
 *                       tutor_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       image_path:
 *                         type: string
 *                         nullable: true
 *                       birth_date:
 *                         type: string
 *                         format: date-time
 *                       species:
 *                         type: string
 *                       animal_type:
 *                         type: string
 *                       fur_type:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       organization_id:
 *                         type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               data:
 *                 - booking_recommendation_id: 1
 *                   pet_id: 1
 *                   suggested_date: "2025-11-09T03:00:00.000Z"
 *                   average_frequency_days: 5
 *                   ignore_recommendation: false
 *                   dcreated: "2025-11-03T20:10:22.337Z"
 *                   dlastupdate: "2025-11-03T20:10:22.337Z"
 *                   nenabled: true
 *                   tutor_id: 1
 *                   name: "Ana Carolina"
 *                   image_path: null
 *                   birth_date: "2025-11-03T03:00:00.000Z"
 *                   species: "Cão"
 *                   animal_type: "Golden Retriever"
 *                   fur_type: "Longo"
 *                   email: "ana.carolina@email.com"
 *                   phone: "55 91234-5678"
 *                   organization_id: 1
 *               pagination:
 *                 totalItems: 1
 *                 totalPages: 1
 *                 currentPage: "1"
 *                 pageSize: "10"
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.get('/:id/recommendations/booking', validatePagination, petController.getBookingRecommendationsAsync);

// GET (Finds vaccine recommendations by id): /pet/{id}/recommendations/vaccine
/**
 * @swagger
 * /pet/{id}/recommendations/vaccine:
 *   get:
 *     summary: Finds vaccine recommendations by id
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to retrieve.
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: The number of items to retrieve per page.
 *     responses:
 *       200:
 *         description: A list of vaccine recommendations.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       vaccine_recommendation_id:
 *                         type: integer
 *                       pet_id:
 *                         type: integer
 *                       vaccine_reference_id:
 *                         type: integer
 *                       vaccine_name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       mandatory:
 *                         type: boolean
 *                       suggested_date:
 *                         type: string
 *                         format: date-time
 *                       ignore_recommendation:
 *                         type: boolean
 *                       dcreated:
 *                         type: string
 *                         format: date-time
 *                       dlastupdate:
 *                         type: string
 *                         format: date-time
 *                       nenabled:
 *                         type: boolean
 *                       tutor_id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       image_path:
 *                         type: string
 *                         nullable: true
 *                       birth_date:
 *                         type: string
 *                         format: date-time
 *                       species:
 *                         type: string
 *                       animal_type:
 *                         type: string
 *                       fur_type:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       organization_id:
 *                         type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               data:
 *                 - vaccine_recommendation_id: 1
 *                   pet_id: 1
 *                   vaccine_reference_id: 1
 *                   vaccine_name: "Aplicação de Microchip"
 *                   description: "Registro de aplicação de microchip de identificação."
 *                   mandatory: false
 *                   suggested_date: "2026-01-03T03:00:00.000Z"
 *                   ignore_recommendation: false
 *                   dcreated: "2025-11-03T20:10:22.337Z"
 *                   dlastupdate: "2025-11-03T20:10:22.337Z"
 *                   nenabled: true
 *                   tutor_id: 1
 *                   name: "Ana Carolina"
 *                   image_path: null
 *                   birth_date: "2025-11-03T03:00:00.000Z"
 *                   species: "Cão"
 *                   animal_type: "Golden Retriever"
 *                   fur_type: "Longo"
 *                   email: "ana.carolina@email.com"
 *                   phone: "55 91234-5678"
 *                   organization_id: 1
 *               pagination:
 *                 totalItems: 5
 *                 totalPages: 1
 *                 currentPage: "1"
 *                 pageSize: "10"
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.get('/:id/recommendations/vaccine', validatePagination, petController.getVaccineRecommendationsAsync);

// DELETE (Disables a booking recommendation for a pet): /pet/{id}/recommendations/booking
/**
 * @swagger
 * /pet/{id}/recommendations/booking:
 *   delete:
 *     summary: Disables a booking recommendation for a pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *     responses:
 *       204:
 *         description: The booking recommendation was successfully disabled.
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.delete('/:id/recommendations/booking', petController.disableBookingRecommendationAsync);

// DELETE (Disables a specific vaccine recommendation for a pet): /pet/{id}/recommendations/vaccine/{vaccineName}
/**
 * @swagger
 * /pet/{id}/recommendations/vaccine/{vaccineName}:
 *   delete:
 *     summary: Disables a specific vaccine recommendation for a pet
 *     tags: [Pets]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The pet id
 *       - in: path
 *         name: vaccineName
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the vaccine
 *     responses:
 *       204:
 *         description: The vaccine recommendation was successfully disabled.
 *       404:
 *         description: The pet was not found.
 *       500:
 *         description: Some server error
 */
router.delete('/:id/recommendations/vaccine/:vaccineName', petController.disableVaccineRecommendationAsync);


module.exports = router;
