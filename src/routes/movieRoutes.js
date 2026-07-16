import { Router } from "express";
import { 
  getAllMovies, 
  getMovieById, 
  createMovie, 
  updateMovie, 
  patchMovie, 
  deleteMovie 
} from "../controllers/movieController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";

const router = Router();

// Apply JWT authentication middleware globally to all routes in this router
router.use(authenticateJWT);

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - name
 *         - rating
 *         - actor
 *         - yearofdebut
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated sequential numerical ID of the movie.
 *           example: 1
 *         name:
 *           type: string
 *           description: The title of the movie.
 *           example: "Inception"
 *         rating:
 *           type: number
 *           description: The rating of the movie (0 to 10).
 *           example: 8.8
 *         actor:
 *           type: string
 *           description: The main actor of the movie.
 *           example: "Leonardo DiCaprio"
 *         yearofdebut:
 *           type: integer
 *           description: The year the movie or actor debuted.
 *           example: 2010
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Retrieve all movies
 *     description: Fetches a list of all movies from Firestore. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A JSON array of movies.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Movie'
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Server error.
 * 
 *   post:
 *     summary: Create a new movie
 *     description: Creates a new movie entry with an auto-generated numerical ID. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rating
 *               - actor
 *               - yearofdebut
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Inception"
 *               rating:
 *                 type: number
 *                 example: 8.8
 *               actor:
 *                 type: string
 *                 example: "Leonardo DiCaprio"
 *               yearofdebut:
 *                 type: integer
 *                 example: 2010
 *     responses:
 *       201:
 *         description: Movie created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Server error.
 */
router.route("/")
  .get(getAllMovies)
  .post(createMovie);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Get a movie by ID
 *     description: Retrieves a single movie by its numerical ID. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie's numerical ID.
 *     responses:
 *       200:
 *         description: Movie retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       404:
 *         description: Movie not found.
 *       500:
 *         description: Server error.
 * 
 *   put:
 *     summary: Replace an existing movie
 *     description: Performs a full update/replacement of the movie document. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie's numerical ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - rating
 *               - actor
 *               - yearofdebut
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Inception"
 *               rating:
 *                 type: number
 *                 example: 9.0
 *               actor:
 *                 type: string
 *                 example: "Leonardo DiCaprio"
 *               yearofdebut:
 *                 type: integer
 *                 example: 2010
 *     responses:
 *       200:
 *         description: Movie replaced successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       404:
 *         description: Movie not found.
 *       500:
 *         description: Server error.
 * 
 *   patch:
 *     summary: Partially update a movie
 *     description: Modifies specified fields of an existing movie document. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie's numerical ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               rating:
 *                 type: number
 *               actor:
 *                 type: string
 *               yearofdebut:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Movie partially updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       404:
 *         description: Movie not found.
 *       500:
 *         description: Server error.
 * 
 *   delete:
 *     summary: Delete a movie
 *     description: Removes the movie document from Firestore. Requires JWT Bearer Token.
 *     tags:
 *       - Movies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The movie's numerical ID.
 *     responses:
 *       200:
 *         description: Movie deleted successfully.
 *       401:
 *         description: Unauthorized. Missing or invalid token.
 *       404:
 *         description: Movie not found.
 *       500:
 *         description: Server error.
 */
router.route("/:id")
  .get(getMovieById)
  .put(updateMovie)
  .patch(patchMovie)
  .delete(deleteMovie);

export default router;
