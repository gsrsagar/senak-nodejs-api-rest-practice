import { db } from "../config/firebase.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { validateSubject, validateModule } from "../models/courseSchema.js";
import { recalculateCourseProgress } from "./courseController.js";

// Helper to find a course and throw an error response if it doesn't exist
async function getCourseDoc(courseId, res) {
  const docRef = doc(db, "courses", courseId);
  const docSnapshot = await getDoc(docRef);
  if (!docSnapshot.exists()) {
    res.status(404).json({ error: `Course with ID ${courseId} not found.` });
    return null;
  }
  return { docRef, data: docSnapshot.data() };
}

/**
 * POST /api/courses/:courseId/subjects
 * Adds a new subject to a course.
 */
export async function addSubject(req, res, next) {
  try {
    const { courseId } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const errors = validateSubject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const subjects = course.data.subjects || [];
    // Avoid duplicates
    if (subjects.some(s => s.name.toLowerCase() === req.body.name.toLowerCase())) {
      return res.status(409).json({ error: `Subject named '${req.body.name}' already exists.` });
    }

    // Default modules array if not provided
    const newSubject = {
      modules: [],
      ...req.body
    };

    subjects.push(newSubject);
    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });

    await updateDoc(course.docRef, updatedCourse);
    res.status(201).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/courses/:courseId/subjects/:subjectName
 * Updates a subject's core information.
 */
export async function updateSubject(req, res, next) {
  try {
    const { courseId, subjectName } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const errors = validateSubject(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const subjects = course.data.subjects || [];
    const index = subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: `Subject '${subjectName}' not found in this course.` });
    }

    // Update subject details, preserving existing modules if none are provided
    const existingSubject = subjects[index];
    subjects[index] = {
      ...existingSubject,
      ...req.body,
      modules: req.body.modules || existingSubject.modules || []
    };

    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });
    await updateDoc(course.docRef, updatedCourse);

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/courses/:courseId/subjects/:subjectName
 * Deletes a subject from a course.
 */
export async function deleteSubject(req, res, next) {
  try {
    const { courseId, subjectName } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const subjects = course.data.subjects || [];
    const index = subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: `Subject '${subjectName}' not found in this course.` });
    }

    subjects.splice(index, 1);
    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });

    await updateDoc(course.docRef, updatedCourse);
    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/courses/:courseId/subjects/:subjectName/modules
 * Adds a new module to a subject.
 */
export async function addModule(req, res, next) {
  try {
    const { courseId, subjectName } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const errors = validateModule(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const subjects = course.data.subjects || [];
    const subjectIndex = subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());

    if (subjectIndex === -1) {
      return res.status(404).json({ error: `Subject '${subjectName}' not found in this course.` });
    }

    const modules = subjects[subjectIndex].modules || [];
    if (modules.some(m => m.title.toLowerCase() === req.body.title.toLowerCase())) {
      return res.status(409).json({ error: `Module with title '${req.body.title}' already exists.` });
    }

    // Default status if not provided
    const newModule = {
      status: "Not Started",
      tags: [],
      ...req.body
    };

    modules.push(newModule);
    subjects[subjectIndex].modules = modules;

    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });
    await updateDoc(course.docRef, updatedCourse);

    res.status(201).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/courses/:courseId/subjects/:subjectName/modules/:moduleTitle
 * Updates a module within a subject.
 */
export async function updateModule(req, res, next) {
  try {
    const { courseId, subjectName, moduleTitle } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const errors = validateModule(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const subjects = course.data.subjects || [];
    const subjectIndex = subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());

    if (subjectIndex === -1) {
      return res.status(404).json({ error: `Subject '${subjectName}' not found in this course.` });
    }

    const modules = subjects[subjectIndex].modules || [];
    const moduleIndex = modules.findIndex(m => m.title.toLowerCase() === moduleTitle.toLowerCase());

    if (moduleIndex === -1) {
      return res.status(404).json({ error: `Module with title '${moduleTitle}' not found.` });
    }

    // Merge module details
    modules[moduleIndex] = {
      ...modules[moduleIndex],
      ...req.body
    };

    subjects[subjectIndex].modules = modules;
    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });

    await updateDoc(course.docRef, updatedCourse);
    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/courses/:courseId/subjects/:subjectName/modules/:moduleTitle
 * Deletes a module from a subject.
 */
export async function deleteModule(req, res, next) {
  try {
    const { courseId, subjectName, moduleTitle } = req.params;
    const course = await getCourseDoc(courseId, res);
    if (!course) return;

    const subjects = course.data.subjects || [];
    const subjectIndex = subjects.findIndex(s => s.name.toLowerCase() === subjectName.toLowerCase());

    if (subjectIndex === -1) {
      return res.status(404).json({ error: `Subject '${subjectName}' not found in this course.` });
    }

    const modules = subjects[subjectIndex].modules || [];
    const moduleIndex = modules.findIndex(m => m.title.toLowerCase() === moduleTitle.toLowerCase());

    if (moduleIndex === -1) {
      return res.status(404).json({ error: `Module with title '${moduleTitle}' not found.` });
    }

    modules.splice(moduleIndex, 1);
    subjects[subjectIndex].modules = modules;

    const updatedCourse = recalculateCourseProgress({ ...course.data, subjects });
    await updateDoc(course.docRef, updatedCourse);

    res.status(200).json(updatedCourse);
  } catch (error) {
    next(error);
  }
}
