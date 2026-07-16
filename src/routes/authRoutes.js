import { Router } from "express";
import { signup, login, logout, changePassword, resetPassword, getMe, refresh } from "../controllers/authController.js";
import { authenticateJWT } from "../utils/authMiddleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     SignupRequest:
 *       type: object
 *       required:
 *         - username
 *         - emailid
 *         - age
 *         - role
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The unique username of the user.
 *           example: "johndoe"
 *         emailid:
 *           type: string
 *           description: The unique email address of the user.
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
 *         password:
 *           type: string
 *           description: The password of the user (at least 6 characters).
 *           example: "mysecurepassword123"
 *     LoginRequest:
 *       type: object
 *       required:
 *         - emailid
 *         - password
 *       properties:
 *         emailid:
 *           type: string
 *           description: The email address of the user.
 *           example: "johndoe@example.com"
 *         password:
 *           type: string
 *           description: The user's password.
 *           example: "mysecurepassword123"
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - oldPassword
 *         - newPassword
 *       properties:
 *         oldPassword:
 *           type: string
 *           description: The current password.
 *           example: "mysecurepassword123"
 *         newPassword:
 *           type: string
 *           description: The new password (at least 6 characters).
 *           example: "newsecurepassword456"
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - emailid
 *         - newPassword
 *       properties:
 *         emailid:
 *           type: string
 *           description: The user's email address.
 *           example: "johndoe@example.com"
 *         newPassword:
 *           type: string
 *           description: The new password (at least 6 characters).
 *           example: "brandnewpass123"
 *     AuthUserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: "johndoe"
 *         emailid:
 *           type: string
 *           example: "johndoe@example.com"
 *         age:
 *           type: integer
 *           example: 25
 *         role:
 *           type: string
 *           example: "USER"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login successful."
 *         token:
 *           type: string
 *           description: JWT Access Token.
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/AuthUserResponse'
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user profile with password encryption in Firestore.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *     responses:
 *       201:
 *         description: User created successfully. Returns the profile without password.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       400:
 *         description: Validation error or user already exists.
 *       500:
 *         description: Server error.
 */
router.post("/signup", signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Validates user credentials and issues a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful. Returns the JWT token and user profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Validation error.
 *       401:
 *         description: Invalid email or password.
 *       500:
 *         description: Server error.
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Stateless logout. Instructs client to discard JWT token.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Logout successful. Please delete your access token on the client."
 *       500:
 *         description: Server error.
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     summary: Change user password
 *     description: Updates the logged-in user's password after verifying the existing password. Protected by JWT.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password updated successfully."
 *       400:
 *         description: Validation error or incorrect current password.
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.post("/change-password", authenticateJWT, changePassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the password of the specified user directly using email lookup.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully."
 *       400:
 *         description: Validation error.
 *       404:
 *         description: No user found with the provided email address.
 *       500:
 *         description: Server error.
 */
router.post("/reset-password", resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     description: Returns the user profile details for the active session. Protected by JWT.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUserResponse'
 *       401:
 *         description: Unauthorized. Missing or invalid Bearer token.
 *       500:
 *         description: Server error.
 */
router.get("/me", authenticateJWT, getMe);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new JWT access token using a refresh token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "mock_refresh_token_xyz_1"
 *     responses:
 *       200:
 *         description: Token refreshed successfully.
 *       401:
 *         description: Unauthorized. Missing or invalid refresh token.
 *       500:
 *         description: Server error.
 */
router.post("/refresh", refresh);

export default router;
