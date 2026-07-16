import { db } from "../config/firebase.js";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc,
  query,
  where,
  runTransaction
} from "firebase/firestore";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validateSignup, validateLogin, validateChangePassword, validateResetPassword } from "../models/userSchema.js";

const usersCollection = collection(db, "userProfiles");

/**
 * Helper to generate sequential numerical ID using Firestore Transaction.
 */
async function getNextUserId() {
  const counterRef = doc(db, "counters", "userProfiles");
  let nextId = 1;

  await runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef);
    if (!counterDoc.exists()) {
      transaction.set(counterRef, { currentId: 1 });
      nextId = 1;
    } else {
      nextId = (counterDoc.data().currentId || 0) + 1;
      transaction.update(counterRef, { currentId: nextId });
    }
  });

  return nextId;
}

/**
 * POST /api/auth/signup
 * Registers a new user with password encryption.
 */
export async function signup(req, res, next) {
  try {
    const errors = validateSignup(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const email = req.body.emailid.trim().toLowerCase();
    const username = req.body.username.trim();

    // Check if email or username already exists
    const duplicateErrors = [];

    const qEmail = query(usersCollection, where("emailid", "==", email));
    const emailSnapshot = await getDocs(qEmail);
    if (!emailSnapshot.empty) {
      duplicateErrors.push("A user with this email address already exists.");
    }

    const qUsername = query(usersCollection, where("username", "==", username));
    const usernameSnapshot = await getDocs(qUsername);
    if (!usernameSnapshot.empty) {
      duplicateErrors.push("A user with this username already exists.");
    }

    if (duplicateErrors.length > 0) {
      return res.status(400).json({ 
        error: "Validation Error", 
        details: duplicateErrors 
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Get next sequential ID
    const nextId = await getNextUserId();

    const userData = {
      id: nextId,
      username: username,
      emailid: email,
      age: req.body.age,
      role: req.body.role.toUpperCase(),
      password: hashedPassword
    };

    const docRef = doc(db, "userProfiles", String(nextId));
    await setDoc(docRef, userData);

    // Return user without password
    const { password, ...userResponse } = userData;
    res.status(201).json(userResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Authenticates user and returns JWT token.
 */
export async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const email = req.body.emailid.trim().toLowerCase();
    const inputPassword = req.body.password;

    // Find user by email
    const q = query(usersCollection, where("emailid", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Invalid email or password." 
      });
    }

    // Get user document data
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Verify password
    const isPasswordValid = await bcrypt.compare(inputPassword, userData.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Invalid email or password." 
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || "senak360_jwt_default_secret_key";
    const token = jwt.sign(
      { 
        id: userData.id, 
        username: userData.username, 
        emailid: userData.emailid, 
        role: userData.role 
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    // Exclude password from output
    const { password, ...userResponse } = userData;

    res.status(200).json({
      message: "Login successful.",
      token,
      accessToken: token,
      refreshToken: "mock_refresh_token_xyz_" + userData.id,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Statelessly signs out the user.
 */
export async function logout(req, res, next) {
  try {
    res.status(200).json({ 
      message: "Logout successful. Please delete your access token on the client." 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/change-password
 * Updates the user's password after validating the current password.
 */
export async function changePassword(req, res, next) {
  try {
    const errors = validateChangePassword(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    // Get authenticated user ID from req.user
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const docRef = doc(db, "userProfiles", String(userId));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = docSnapshot.data();

    // Verify existing password
    const isPasswordValid = await bcrypt.compare(oldPassword, userData.password);
    if (!isPasswordValid) {
      return res.status(400).json({ 
        error: "Bad Request", 
        message: "The current password you provided is incorrect." 
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in Firestore
    await updateDoc(docRef, { password: hashedNewPassword });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 * Resets the password directly using email validation without OTP.
 */
export async function resetPassword(req, res, next) {
  try {
    const errors = validateResetPassword(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const email = req.body.emailid.trim().toLowerCase();
    const { newPassword } = req.body;

    // Find user by email
    const q = query(usersCollection, where("emailid", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ 
        error: "Not Found", 
        message: "No user found with the provided email address." 
      });
    }

    // Get user document reference
    const userDoc = querySnapshot.docs[0];
    const docRef = doc(db, "userProfiles", userDoc.id);

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password in Firestore
    await updateDoc(docRef, { password: hashedNewPassword });

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Retrieves current logged-in user profile.
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const docRef = doc(db, "userProfiles", String(userId));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = docSnapshot.data();
    const { password, ...userResponse } = userData;
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Refreshes JWT token with a mock refresh token.
 */
export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || !refreshToken.startsWith("mock_refresh_token_xyz_")) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Invalid or missing refresh token." 
      });
    }

    const userId = refreshToken.replace("mock_refresh_token_xyz_", "");
    const docRef = doc(db, "userProfiles", String(userId));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "User associated with refresh token not found." 
      });
    }

    const userData = docSnapshot.data();
    
    // Generate new access token
    const secret = process.env.JWT_SECRET || "senak360_jwt_default_secret_key";
    const token = jwt.sign(
      { 
        id: userData.id, 
        username: userData.username, 
        emailid: userData.emailid, 
        role: userData.role 
      },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.status(200).json({
      message: "Token refreshed successfully.",
      token,
      accessToken: token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
}

