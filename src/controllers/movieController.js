import { db } from "../config/firebase.js";
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc,
  runTransaction
} from "firebase/firestore";
import { validateMovie } from "../models/movieSchema.js";

const moviesCollection = collection(db, "movies");

/**
 * Helper to generate sequential numerical ID for movies using Firestore Transaction.
 */
async function getNextMovieId() {
  const counterRef = doc(db, "counters", "movies");
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
 * GET /api/movies
 * Retrieves all movies.
 */
export async function getAllMovies(req, res, next) {
  try {
    const querySnapshot = await getDocs(moviesCollection);
    const movies = [];
    querySnapshot.forEach(docSnapshot => {
      movies.push({ ...docSnapshot.data() });
    });
    
    // Sort movies by numerical ID
    movies.sort((a, b) => (a.id || 0) - (b.id || 0));

    res.status(200).json(movies);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/movies/:id
 * Retrieves a movie by numerical ID.
 */
export async function getMovieById(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "movies", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Movie with ID ${id} not found.` });
    }

    res.status(200).json(docSnapshot.data());
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/movies
 * Creates a new movie with a generated numerical ID.
 */
export async function createMovie(req, res, next) {
  try {
    const errors = validateMovie(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const nextId = await getNextMovieId();
    const movieData = {
      id: nextId,
      name: req.body.name.trim(),
      rating: req.body.rating,
      actor: req.body.actor.trim(),
      yearofdebut: req.body.yearofdebut
    };

    const docRef = doc(db, "movies", String(nextId));
    await setDoc(docRef, movieData);

    res.status(201).json(movieData);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/movies/:id
 * Fully replaces a movie's details.
 */
export async function updateMovie(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID", message: "Movie ID must be a numerical value." });
    }

    const docRef = doc(db, "movies", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Movie with ID ${id} not found.` });
    }

    const errors = validateMovie(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    const movieData = {
      id: numericId,
      name: req.body.name.trim(),
      rating: req.body.rating,
      actor: req.body.actor.trim(),
      yearofdebut: req.body.yearofdebut
    };

    await setDoc(docRef, movieData);

    res.status(200).json(movieData);
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/movies/:id
 * Partially updates a movie's details.
 */
export async function patchMovie(req, res, next) {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ error: "Invalid ID", message: "Movie ID must be a numerical value." });
    }

    const docRef = doc(db, "movies", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Movie with ID ${id} not found.` });
    }

    const existingData = docSnapshot.data();
    const updatePayload = req.body;

    const mergedMovie = { 
      ...existingData, 
      ...updatePayload,
      id: numericId // ensure ID cannot be modified by payload
    };

    const errors = validateMovie(mergedMovie);
    if (errors.length > 0) {
      return res.status(400).json({ error: "Validation Error", details: errors });
    }

    if (updatePayload.name) mergedMovie.name = updatePayload.name.trim();
    if (updatePayload.actor) mergedMovie.actor = updatePayload.actor.trim();

    await setDoc(docRef, mergedMovie);

    res.status(200).json(mergedMovie);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/movies/:id
 * Deletes a movie.
 */
export async function deleteMovie(req, res, next) {
  try {
    const { id } = req.params;
    const docRef = doc(db, "movies", String(id));
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      return res.status(404).json({ error: `Movie with ID ${id} not found.` });
    }

    await deleteDoc(docRef);

    res.status(200).json({ message: `Movie with ID ${id} deleted successfully.` });
  } catch (error) {
    next(error);
  }
}
