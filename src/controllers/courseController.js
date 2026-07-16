import { db } from "../config/firebase.js";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { validateCourse } from "../models/courseSchema.js";

const coursesCollection = collection(db, "courses");

/**
 * Helper to automatically recalculate completed and total modules for each subject.
 */
export function recalculateCourseProgress(course) {
  if (!course.subjects || !Array.isArray(course.subjects)) {
    return course;
  }

  const updatedSubjects = course.subjects.map(subject => {
    const modules = subject.modules || [];
    const totalModules = modules.length;
    const completedModules = modules.filter(
      mod => mod.status && (mod.status.toLowerCase() === "done" || mod.status.toLowerCase() === "completed")
    ).length;

    let status = "Not Started";
    if (totalModules > 0) {
      if (completedModules === totalModules) {
        status = "Completed";
      } else if (completedModules > 0) {
        status = "In Progress";
      }
    } else {
      status = subject.status || "Not Started";
    }

    return {
      ...subject,
      totalModules,
      completedModules,
      status
    };
  });

  return {
    ...course,
    subjects: updatedSubjects
  };
}

/**
 * GET /api/courses
 * Retrieves all courses from Firestore.
 */
export async function getAllCourses(req, res, next) {
  try {
    const querySnapshot = await getDocs(coursesCollection);
    const courses = [];
    querySnapshot.forEach(docSnapshot => {
      courses.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });

    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/courses/:id
 * Retrieves a single course by its ID.
 */
export async function getCourseById(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "courses", id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    res.status(200).json({ id: docSnapshot.id, ...docSnapshot.data() });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/courses
 * Submits data to create a new course.
 */
export async function createCourse(req, res, next) {
  try {
    const errors = validateCourse(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    // Process and calculate counts/progress
    const courseData = recalculateCourseProgress(req.body);

    const docRef = await addDoc(coursesCollection, courseData);
    res.status(201).json({ id: docRef.id, ...courseData });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/courses/:id
 * Replaces the entire resource representation of a course.
 */
export async function updateCourse(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "courses", id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    const errors = validateCourse(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const courseData = recalculateCourseProgress(req.body);
    
    // setDoc overwrites the full document
    await setDoc(docRef, courseData);

    res.status(200).json({ id, ...courseData });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/courses/:id
 * Partially updates a course's fields.
 */
export async function patchCourse(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "courses", id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    const existingData = docSnapshot.data();
    const updatePayload = req.body;

    // Build the final merged object to validate
    const mergedCourse = { ...existingData, ...updatePayload };

    const errors = validateCourse(mergedCourse);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const courseData = recalculateCourseProgress(mergedCourse);

    await updateDoc(docRef, courseData);

    res.status(200).json({ id, ...courseData });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/courses/:id
 * Deletes a course from Firestore.
 */
export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "courses", id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Course with ID ${id} not found.` });
    }

    await deleteDoc(docRef);
    res.status(200).json({ message: `Course with ID ${id} deleted successfully.` });
  } catch (error) {
    next(error);
  }
}
