/**
 * Validator helpers to enforce schemas for Course, Subject, and Module.
 */

export function validateCourse(course) {
  const errors = [];

  if (!course) {
    return ["Request body is empty"];
  }

  // Validate Title
  if (!course.title || typeof course.title !== "string" || course.title.trim() === "") {
    errors.push("Course 'title' is required and must be a non-empty string.");
  }

  // Validate Description
  if (course.description !== undefined && typeof course.description !== "string") {
    errors.push("Course 'description' must be a string.");
  }

  // Validate URL fields
  const urlFields = ["youtubePlaylistUrl", "syllabusUrl", "pdfUrl", "imageUrl"];
  for (const field of urlFields) {
    if (course[field] !== undefined && course[field] !== null && typeof course[field] !== "string") {
      errors.push(`Course '${field}' must be a string.`);
    }
  }

  // Validate Subjects if present
  if (course.subjects !== undefined) {
    if (!Array.isArray(course.subjects)) {
      errors.push("Course 'subjects' must be an array.");
    } else {
      course.subjects.forEach((subject, sIdx) => {
        const subjectErrors = validateSubject(subject);
        subjectErrors.forEach(err => errors.push(`Subject[${sIdx}]: ${err}`));
      });
    }
  }

  return errors;
}

export function validateSubject(subject) {
  const errors = [];

  if (!subject) {
    return ["Subject data is empty"];
  }

  // Validate Name
  if (!subject.name || typeof subject.name !== "string" || subject.name.trim() === "") {
    errors.push("'name' is required and must be a non-empty string.");
  }

  // Validate status
  if (subject.status !== undefined && typeof subject.status !== "string") {
    errors.push("'status' must be a string.");
  }

  // Validate module counts
  if (subject.totalModules !== undefined && typeof subject.totalModules !== "number") {
    errors.push("'totalModules' must be a number.");
  }
  if (subject.completedModules !== undefined && typeof subject.completedModules !== "number") {
    errors.push("'completedModules' must be a number.");
  }

  // Validate Modules if present
  if (subject.modules !== undefined) {
    if (!Array.isArray(subject.modules)) {
      errors.push("'modules' must be an array.");
    } else {
      subject.modules.forEach((module, mIdx) => {
        const moduleErrors = validateModule(module);
        moduleErrors.forEach(err => errors.push(`Module[${mIdx}]: ${err}`));
      });
    }
  }

  return errors;
}

export function validateModule(module) {
  const errors = [];

  if (!module) {
    return ["Module data is empty"];
  }

  // Validate Title
  if (!module.title || typeof module.title !== "string" || module.title.trim() === "") {
    errors.push("'title' is required and must be a non-empty string.");
  }

  // Validate Description
  if (module.description !== undefined && typeof module.description !== "string") {
    errors.push("'description' must be a string.");
  }

  // Validate tags
  if (module.tags !== undefined) {
    if (!Array.isArray(module.tags)) {
      errors.push("'tags' must be an array of strings.");
    } else {
      module.tags.forEach((tag, tIdx) => {
        if (typeof tag !== "string") {
          errors.push(`tag[${tIdx}] must be a string.`);
        }
      });
    }
  }

  // Validate URL fields
  const urlFields = ["watchUrl", "materialUrl"];
  for (const field of urlFields) {
    if (module[field] !== undefined && module[field] !== null && typeof module[field] !== "string") {
      errors.push(`'${field}' must be a string.`);
    }
  }

  // Validate Status
  if (module.status !== undefined && typeof module.status !== "string") {
    errors.push("'status' must be a string.");
  }

  return errors;
}
