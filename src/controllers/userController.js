import { db } from "../config/firebase.js";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  runTransaction
} from "firebase/firestore";
import { validateUser } from "../models/userSchema.js";

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
 * GET /api/users
 * Retrieves all users.
 */
export async function getAllUsers(req, res, next) {
  try {
    const querySnapshot = await getDocs(usersCollection);
    const users = [];
    querySnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (data.password) delete data.password;
      users.push({ ...data });
    });
    
    // Sort users by numerical ID for cleaner responses
    users.sort((a, b) => (a.id || 0) - (b.id || 0));

    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/users/:id
 * Retrieves a user by numerical ID.
 */
export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "userProfiles", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    const data = docSnapshot.data();
    if (data.password) delete data.password;
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/users
 * Creates a new user with a generated numerical ID.
 */
export async function createUser(req, res, next) {
  try {
    const errors = validateUser(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const nextId = await getNextUserId();
    const userData = {
      id: nextId,
      username: req.body.username,
      emailid: req.body.emailid,
      age: req.body.age,
      role: req.body.role.toUpperCase()
    };

    const docRef = doc(db, "userProfiles", String(nextId));
    await setDoc(docRef, userData);

    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/users/:id
 * Fully replaces a user's details.
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID", message: "User ID must be a numerical value." });
    }

    const docRef = doc(db, "userProfiles", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    const errors = validateUser(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const existingData = docSnapshot.data();
    const userData = {
      id: numericId,
      username: req.body.username,
      emailid: req.body.emailid,
      age: req.body.age,
      role: req.body.role.toUpperCase()
    };

    // Preserve existing hashed password if there is one
    if (existingData.password) {
      userData.password = existingData.password;
    }

    await setDoc(docRef, userData);

    // Omit password from response
    const { password, ...userResponse } = userData;
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/users/:id
 * Partially updates a user's details.
 */
export async function patchUser(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID", message: "User ID must be a numerical value." });
    }

    const docRef = doc(db, "userProfiles", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    const existingData = docSnapshot.data();
    const updatePayload = req.body;

    // Do not allow updating password field directly via PATCH /api/users/:id
    if (updatePayload.password !== undefined) {
      delete updatePayload.password;
    }

    // Merge payload into existing, but preserve numerical ID
    const mergedUser = { 
      ...existingData, 
      ...updatePayload,
      id: numericId // ensure ID cannot be modified by payload
    };

    const errors = validateUser(mergedUser);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    // Capitalize role if it's being updated
    if (mergedUser.role) {
      mergedUser.role = mergedUser.role.toUpperCase();
    }

    await setDoc(docRef, mergedUser);

    // Omit password from response
    const { password, ...userResponse } = mergedUser;
    res.status(200).json(userResponse);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/users/:id
 * Deletes a user.
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "userProfiles", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    await deleteDoc(docRef);

    res.status(200).json({ message: `User with ID ${id} deleted successfully.` });
  } catch (error) {
    next(error);
  }
}
