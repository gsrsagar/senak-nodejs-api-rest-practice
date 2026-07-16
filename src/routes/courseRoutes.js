import { Router } from "express";
import { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  patchCourse, 
  deleteCourse 
} from "../controllers/courseController.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: The title of the module.
 *           example: "Day 3- Introduction to Internet and World"
 *         description:
 *           type: string
 *           description: A detailed description of the topics covered in this module.
 *           example: "Here you learn about the internet and how the real world applications work"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Relevant keywords or categories.
 *           example: ["HTML and Browser Understanding", "how Real Applications Works"]
 *         watchUrl:
 *           type: string
 *           description: Link to watch the module's video session (e.g. YouTube).
 *           example: "https://www.youtube.com/watch?v=xyz"
 *         materialUrl:
 *           type: string
 *           description: Link to course slides, notes or resources.
 *           example: "DotNet Full Stack Developer Course - 90 Days PPT.pdf"
 *         status:
 *           type: string
 *           description: Completion status of the module.
 *           example: "Done"
 * 
 *     Subject:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the subject.
 *           example: "Html/Html5"
 *         totalModules:
 *           type: integer
 *           description: Total number of modules within this subject (calculated automatically).
 *           example: 21
 *         completedModules:
 *           type: integer
 *           description: Total number of completed modules (status is Done/Completed) within this subject (calculated automatically).
 *           example: 21
 *         status:
 *           type: string
 *           description: Completion progress state of the subject (calculated automatically).
 *           example: "Completed"
 *         modules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Module'
 * 
 *     Course:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated or specified ID of the course in Firestore.
 *           example: "course-uuid-123"
 *         title:
 *           type: string
 *           description: The name of the course.
 *           example: "90 Days Plan, Dot Net Full Stack Development"
 *         description:
 *           type: string
 *           description: An overview of the course curriculum.
 *           example: "This Course is '90 Days Software Development Training and Placement Assistance Program'..."
 *         youtubePlaylistUrl:
 *           type: string
 *           description: YouTube playlist URL for course video lessons.
 *           example: "https://www.youtube.com/playlist?list=PL..."
 *         syllabusUrl:
 *           type: string
 *           description: Reference link to the syllabus.
 *           example: "https://senak360.com/syllabus"
 *         pdfUrl:
 *           type: string
 *           description: Reference link to course materials (e.g. PDF).
 *           example: "DotNet Full Stack Developer Course - 90 Days PPT.pdf"
 *         imageUrl:
 *           type: string
 *           description: Optional banner or cover image URL.
 *           example: "https://senak360.com/images/dotnet-90days.png"
 *         subjects:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Subject'
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Retrieve all courses
 *     description: Fetches a list of all courses currently saved in Firestore.
 *     responses:
 *       200:
 *         description: A JSON array of courses.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server error.
 * 
 *   post:
 *     summary: Create a new course
 *     description: Creates a new course document. Subjects progress (total/completed modules) is auto-calculated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: The course was created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input / Validation errors.
 *       500:
 *         description: Server error.
 * 
 *   options:
 *     summary: Discover supported HTTP methods
 *     description: Returns allowed HTTP request methods for the /api/courses path.
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
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     description: Retrieves a single course object matching the given ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course document ID.
 *     responses:
 *       200:
 *         description: Course retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 * 
 *   put:
 *     summary: Replace an existing course
 *     description: Performs a full update (replacement) of the course document.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course document ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 * 
 *   patch:
 *     summary: Partially update a course
 *     description: Modifies specified fields of an existing course document.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course document ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               youtubePlaylistUrl:
 *                 type: string
 *               syllabusUrl:
 *                 type: string
 *               pdfUrl:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course partially updated.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Validation error.
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 * 
 *   delete:
 *     summary: Delete a course
 *     description: Removes the course document from Firestore.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course document ID.
 *     responses:
 *       200:
 *         description: Course deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Course with ID course-uuid-123 deleted successfully."
 *       404:
 *         description: Course not found.
 *       500:
 *         description: Server error.
 */

// Core Routes
router.route("/")
  .get(getAllCourses)
  .post(createCourse)
  .options((req, res) => {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.status(204).end();
  });

router.route("/:id")
  .get(getCourseById)
  .put(updateCourse)
  .patch(patchCourse)
  .delete(deleteCourse);

export default router;
