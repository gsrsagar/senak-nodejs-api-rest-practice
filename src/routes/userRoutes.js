import { Router } from "express";
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  patchUser, 
  deleteUser 
} from "../controllers/userController.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - emailid
 *         - age
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated sequential numerical ID of the user.
 *           example: 1
 *         username:
 *           type: string
 *           description: The unique username of the user.
 *           example: "johndoe"
 *         emailid:
 *           type: string
 *           description: The email address of the user.
 *           example: "johndoe@example.com"
 *         age:
 *           type: integer
 *           description: The age of the user.
 *           example: 25
 *         role:
 *           type: string
 *           enum: [ADMIN, USER, MANAGER, HR]
 *           description: The role assigned to the user.
 *           example: "USER"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches a list of all users from Firestore, sorted by numerical ID.
 *     responses:
 *       200:
 *         description: A JSON array of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error.
 * 
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with an auto-generated numerical ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - emailid
 *               - age
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               emailid:
 *                 type: string
 *                 example: "johndoe@example.com"
 *               age:
 *                 type: integer
 *                 example: 25
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, MANAGER, HR]
 *                 example: "USER"
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or bad request payload.
 *       500:
 *         description: Server error.
 * 
 *   options:
 *     summary: Discover supported HTTP methods for users collection
 *     description: Returns allowed HTTP request methods for the /api/users path.
 *     responses:
 *       204:
 *         description: Successful options discovery.
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: "GET, POST, OPTIONS"
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Retrieves a single user matching the specified numerical ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's numerical ID.
 *     responses:
 *       200:
 *         description: User retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 * 
 *   put:
 *     summary: Replace an existing user
 *     description: Performs a full update/replacement of the user document.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's numerical ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - emailid
 *               - age
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               emailid:
 *                 type: string
 *                 example: "johndoe_new@example.com"
 *               age:
 *                 type: integer
 *                 example: 26
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, MANAGER, HR]
 *                 example: "MANAGER"
 *     responses:
 *       200:
 *         description: User replaced successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 * 
 *   patch:
 *     summary: Partially update a user
 *     description: Modifies specified fields of an existing user document.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's numerical ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               emailid:
 *                 type: string
 *               age:
 *                 type: integer
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER, MANAGER, HR]
 *     responses:
 *       200:
 *         description: User partially updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 * 
 *   delete:
 *     summary: Delete a user
 *     description: Removes the user document from Firestore.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user's numerical ID.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User with ID 1 deleted successfully."
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 * 
 *   options:
 *     summary: Discover supported HTTP methods for user item
 *     description: Returns allowed HTTP request methods for the /api/users/{id} path.
 *     responses:
 *       204:
 *         description: Successful options discovery.
 *         headers:
 *           Allow:
 *             schema:
 *               type: string
 *               example: "GET, PUT, PATCH, DELETE, OPTIONS"
 */

// Define routes
router.route("/")
  .get(getAllUsers)
  .post(createUser)
  .options((req, res) => {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.status(204).end();
  });

router.route("/:id")
  .get(getUserById)
  .put(updateUser)
  .patch(patchUser)
  .delete(deleteUser)
  .options((req, res) => {
    res.setHeader("Allow", "GET, PUT, PATCH, DELETE, OPTIONS");
    res.status(204).end();
  });

export default router;
