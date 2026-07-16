import { Router } from "express";
import {
  addSubject,
  updateSubject,
  deleteSubject,
  addModule,
  updateModule,
  deleteModule
} from "../controllers/subResourceController.js";

const router = Router();

/**
 * @swagger
 * /api/courses/{courseId}/subjects:
 *   post:
 *     summary: Add a subject to a course
 *     description: Appends a new subject to the course's subjects list.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       201:
 *         description: Subject added. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course not found.
 *       409:
 *         description: Subject already exists.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/courses/{courseId}/subjects/{subjectName}:
 *   put:
 *     summary: Update a subject in a course
 *     description: Replaces subject details (except modules array, which is merged/preserved unless provided).
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Subject'
 *     responses:
 *       200:
 *         description: Subject updated. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course or subject not found.
 *       500:
 *         description: Server error.
 * 
 *   delete:
 *     summary: Delete a subject from a course
 *     description: Removes a subject and all of its modules from a course.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subject deleted. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course or subject not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/courses/{courseId}/subjects/{subjectName}/modules:
 *   post:
 *     summary: Add a module to a subject
 *     description: Appends a module to the specified subject. Recalculates subject progress automatically.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       201:
 *         description: Module added. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course or subject not found.
 *       409:
 *         description: Module already exists.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/courses/{courseId}/subjects/{subjectName}/modules/{moduleTitle}:
 *   put:
 *     summary: Update a module inside a subject
 *     description: Updates properties of a specific module. Re-calculates progress metrics.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleTitle
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Module'
 *     responses:
 *       200:
 *         description: Module updated. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course, subject or module not found.
 *       500:
 *         description: Server error.
 * 
 *   delete:
 *     summary: Delete a module from a subject
 *     description: Removes a module and re-calculates progress metrics.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: subjectName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: moduleTitle
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Module deleted. Returns the full updated course structure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course, subject or module not found.
 *       500:
 *         description: Server error.
 */

// Subject nested paths
router.post("/:courseId/subjects", addSubject);
router.route("/:courseId/subjects/:subjectName")
  .put(updateSubject)
  .delete(deleteSubject);

// Module nested paths
router.post("/:courseId/subjects/:subjectName/modules", addModule);
router.route("/:courseId/subjects/:subjectName/modules/:moduleTitle")
  .put(updateModule)
  .delete(deleteModule);

export default router;
