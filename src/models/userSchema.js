/**
 * Validator helpers to enforce schemas for User.
 */

export const ROLES = ["ADMIN", "USER", "MANAGER", "HR"];

export function validateUser(user) {
  const errors = [];

  if (!user) {
    return ["Request body is empty"];
  }

  // Validate Username
  if (user.username === undefined) {
    errors.push("User 'username' is required.");
  } else if (typeof user.username !== "string" || user.username.trim() === "") {
    errors.push("User 'username' must be a non-empty string.");
  }

  // Validate Email
  if (user.emailid === undefined) {
    errors.push("User 'emailid' is required.");
  } else if (typeof user.emailid !== "string" || user.emailid.trim() === "") {
    errors.push("User 'emailid' must be a non-empty string.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.emailid)) {
      errors.push("User 'emailid' must be a valid email address.");
    }
  }

  // Validate Age
  if (user.age === undefined) {
    errors.push("User 'age' is required.");
  } else if (typeof user.age !== "number" || !Number.isInteger(user.age) || user.age <= 0) {
    errors.push("User 'age' must be a positive integer.");
  }

  // Validate Role
  if (user.role === undefined) {
    errors.push("User 'role' is required.");
  } else if (typeof user.role !== "string" || !ROLES.includes(user.role.toUpperCase())) {
    errors.push(`User 'role' must be one of the following enums: ${ROLES.join(", ")}`);
  }

  return errors;
}

export function validateSignup(user) {
  const errors = [];

  if (!user) {
    return ["Request body is empty"];
  }

  // Reuse validateUser for standard fields
  const baseErrors = validateUser(user);
  errors.push(...baseErrors);

  // Validate Password
  if (user.password === undefined) {
    errors.push("User 'password' is required.");
  } else if (typeof user.password !== "string" || user.password.length < 6) {
    errors.push("User 'password' must be a string of at least 6 characters.");
  }

  return errors;
}

export function validateLogin(credentials) {
  const errors = [];

  if (!credentials) {
    return ["Request body is empty"];
  }

  if (credentials.emailid === undefined) {
    errors.push("User 'emailid' is required.");
  } else if (typeof credentials.emailid !== "string" || credentials.emailid.trim() === "") {
    errors.push("User 'emailid' must be a non-empty string.");
  }

  if (credentials.password === undefined) {
    errors.push("User 'password' is required.");
  } else if (typeof credentials.password !== "string" || credentials.password.trim() === "") {
    errors.push("User 'password' must be a non-empty string.");
  }

  return errors;
}

export function validateChangePassword(data) {
  const errors = [];

  if (!data) {
    return ["Request body is empty"];
  }

  if (data.oldPassword === undefined) {
    errors.push("Current password 'oldPassword' is required.");
  } else if (typeof data.oldPassword !== "string" || data.oldPassword.trim() === "") {
    errors.push("Current password 'oldPassword' must be a non-empty string.");
  }

  if (data.newPassword === undefined) {
    errors.push("New password 'newPassword' is required.");
  } else if (typeof data.newPassword !== "string" || data.newPassword.length < 6) {
    errors.push("New password 'newPassword' must be a string of at least 6 characters.");
  }

  return errors;
}

export function validateResetPassword(data) {
  const errors = [];

  if (!data) {
    return ["Request body is empty"];
  }

  if (data.emailid === undefined) {
    errors.push("User 'emailid' is required.");
  } else if (typeof data.emailid !== "string" || data.emailid.trim() === "") {
    errors.push("User 'emailid' must be a non-empty string.");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.emailid)) {
      errors.push("User 'emailid' must be a valid email address.");
    }
  }

  if (data.newPassword === undefined) {
    errors.push("New password 'newPassword' is required.");
  } else if (typeof data.newPassword !== "string" || data.newPassword.length < 6) {
    errors.push("New password 'newPassword' must be a string of at least 6 characters.");
  }

  return errors;
}


