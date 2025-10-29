const express = require('express');
const router = express.Router();

const tutorController = require('../controllers/tutor.controller');
const { validateTutor, validateTutorList, validateDeleteTutorList } = require('../validators/tutor.validator');
const { validatePagination } = require('../validators/pagination.validator');
const { authenticateApiKeyAsync } = require('../middleware/auth');

router.use(authenticateApiKeyAsync);


/**
 * @swagger
 * tags:
 *   name: Tutors
 *   description: The tutors managing API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tutor:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - phone
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the tutor.
 *         name:
 *           type: string
 *           description: The name of the tutor.
 *         email:
 *           type: string
 *           description: The email of the tutor.
 *         phone:
 *           type: string
 *           description: The phone number of the tutor.
 *       example:
 *         name: "João da Silva"
 *         email: "joao.silva@example.com"
 *         phone: "11999999999"
 *
 */

/**
 * @swagger
 * /tutor:
 *   get:
 *     summary: Returns the list of all the tutors
 *     tags: [Tutors]
 *     parameters:
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
 *         description: The list of the tutors
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       items:
 *                         $ref: '#/components/schemas/Tutor'
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
router.get('/', validatePagination, tutorController.getAllAsync);

/**
 * @swagger
 * /tutor/{id}:
 *   get:
 *     summary: Get the tutor by id
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
 *     responses:
 *       200:
 *         description: The tutor description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: The tutor was not found
 */
router.get('/:id', tutorController.getByIdAsync);

/**
 * @swagger
 * /tutor:
 *   post:
 *     summary: Create a new tutor
 *     tags: [Tutors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tutor'
 *     responses:
 *       201:
 *         description: The tutor was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       500:
 *         description: Some server error
 */
router.post('/', validateTutor, tutorController.createAsync);

/**
 * @swagger
 * /tutor/createWithList:
 *   post:
 *     summary: Creates list of tutors with given input array
 *     tags: [Tutors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Tutor'
 *     responses:
 *       201:
 *         description: The list of tutors was successfully created.
 *       500:
 *         description: Some server error
 */
router.post('/createWithList', validateTutorList, tutorController.createWithListAsync);

/**
 * @swagger
 * /tutor/updateWithList:
 *   put:
 *     summary: Updates list of tutors with given input array
 *     tags: [Tutors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               allOf:
 *                 - $ref: '#/components/schemas/Tutor'
 *                 - type: object
 *                   required: ['id']
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The ID of the tutor to update
 *           example:
 *             - id: 1
 *               name: "João da Silva"
 *               email: "joao.silva@example.com"
 *               phone: "11999999999"
 *     responses:
 *       200:
 *         description: The list of tutors was successfully updated.
 *       404:
 *         description: One or more tutors were not found
 *       500:
 *         description: Some server error
 */
router.put('/updateWithList', validateTutorList, tutorController.updateWithListAsync);

/**
 * @swagger
 * /tutor/deleteWithList:
 *   delete:
 *     summary: Deletes a list of tutors
 *     tags: [Tutors]
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
 *         description: The tutors were successfully deleted.
 *       500:
 *         description: Some server error
 */
router.delete('/deleteWithList', validateDeleteTutorList, tutorController.deleteWithListAsync);

/**
 * @swagger
 * /tutor/{id}:
 *   put:
 *     summary: Update the tutor by the id
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tutor'
 *     responses:
 *       200:
 *         description: The tutor was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tutor'
 *       404:
 *         description: The tutor was not found
 *       500:
 *         description: Some error happened
 */
router.put('/:id', validateTutor, tutorController.updateAsync);

/**
 * @swagger
 * /tutor/{id}:
 *   delete:
 *     summary: Remove the tutor by id
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
 *     responses:
 *       204:
 *         description: The tutor was deleted
 *       404:
 *         description: The tutor was not found
 */
router.delete('/:id', tutorController.removeAsync);

/**
 * @swagger
 * /tutor/notify-all:
 *   post:
 *     summary: Notifica todos os tutores sobre as recomendações pendentes de seus pets
 *     tags: [Tutors]
 *     description: Inicia um processo em background para enviar notificações (Email, SMS, Push) para todos os tutores que possuem recomendações ativas para seus pets.
 *     responses:
 *       202:
 *         description: Processo de notificação iniciado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Processo de notificação para todos os tutores foi iniciado."
 */
router.post('/notify-all', tutorController.notifyAllTutorsAsync);

/**
 * @swagger
 * /tutor/{id}/booking-recommendations:
 *   get:
 *     summary: Get booking recommendations for all pets of a tutor
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
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
 *         description: A list of booking recommendations
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
 *                       pet:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           species:
 *                             type: string
 *                           breed:
 *                             type: string
 *                       recommendations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             service_name:
 *                               type: string
 *                             service_description:
 *                               type: string
 *                             price:
 *                               type: number
 *                               format: float
 *                             recommended_date:
 *                               type: string
 *                               format: date-time
 *                             reason:
 *                               type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *               example:
 *                 data:
 *                   - pet:
 *                       id: "1"
 *                       name: "Rex"
 *                       species: "Cachorro"
 *                       breed: "Labrador"
 *                     recommendations:
 *                       - service_name: "Banho e Tosa"
 *                         service_description: "Banho completo com tosa higiênica."
 *                         price: 80.00
 *                         recommended_date: "2025-11-10T10:00:00.000Z"
 *                         reason: "Última visita há 30 dias."
 *                 pagination:
 *                   totalItems: 1
 *                   totalPages: 1
 *                   currentPage: 1
 *                   pageSize: 10
 *       400:
 *         description: Bad request
 */
router.get('/:id/booking-recommendations', validatePagination, tutorController.getBookingRecommendationsAsync);

/**
 * @swagger
 * /tutor/{id}/vaccine-recommendations:
 *   get:
 *     summary: Get vaccine recommendations for all pets of a tutor
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
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
 *         description: A list of vaccine recommendations
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
 *                       pet:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           species:
 *                             type: string
 *                           breed:
 *                             type: string
 *                       recommendations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             vaccineName:
 *                               type: string
 *                             recommendedDate:
 *                               type: string
 *                               format: date-time
 *                             status:
 *                               type: string
 *                             reason:
 *                               type: string
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginatedResponse'
 *               example:
 *                 data:
 *                   - pet:
 *                       id: "1"
 *                       name: "Rex"
 *                       species: "Cachorro"
 *                       breed: "Labrador"
 *                     recommendations:
 *                       - vaccineName: "Raiva (Antirrábica)"
 *                         recommendedDate: "2025-11-15T00:00:00.000Z"
 *                         status: "Recomendada"
 *                         reason: "Reforço anual obrigatório."
 *                       - vaccineName: "V10 (Polivalente)"
 *                         recommendedDate: "2025-12-01T00:00:00.000Z"
 *                         status: "Atrasada"
 *                         reason: "O último reforço foi há mais de 12 meses."
 *                   - pet:
 *                       id: "2"
 *                       name: "Mimi"
 *                       species: "Gato"
 *                       breed: "Siamês"
 *                     recommendations:
 *                       - vaccineName: "V4 (Quádrupla Felina)"
 *                         recommendedDate: "2025-11-20T00:00:00.000Z"
 *                         status: "Recomendada"
 *                         reason: "Reforço anual."
 *                 pagination:
 *                   totalItems: 2
 *                   totalPages: 1
 *                   currentPage: 1
 *                   pageSize: 10
 *       400:
 *         description: Bad request
 */
router.get('/:id/vaccine-recommendations', validatePagination, tutorController.getVaccineRecommendationsAsync);

/**
 * @swagger
 * /tutor/{id}/update-recommendation:
 *   post:
 *     summary: Update recommendations for all pets of a tutor
 *     tags: [Tutors]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The tutor id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ignore:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: The pets were updated
 *       404:
 *         description: Tutor not found or no pets to update.
 *       400:
 *         description: Bad request
 */
router.post('/:id/update-recommendation', tutorController.updateRecommendationAsync);

module.exports = router;