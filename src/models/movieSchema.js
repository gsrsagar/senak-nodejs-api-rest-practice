/**
 * Validator helpers to enforce schemas for Movie.
 */

export function validateMovie(movie) {
  const errors = [];

  if (!movie) {
    return ["Request body is empty"];
  }

  // Validate Movie Name
  if (movie.name === undefined) {
    errors.push("Movie 'name' is required.");
  } else if (typeof movie.name !== "string" || movie.name.trim() === "") {
    errors.push("Movie 'name' must be a non-empty string.");
  }

  // Validate Rating
  if (movie.rating === undefined) {
    errors.push("Movie 'rating' is required.");
  } else if (typeof movie.rating !== "number" || movie.rating < 0 || movie.rating > 10) {
    errors.push("Movie 'rating' must be a number between 0 and 10.");
  }

  // Validate Actor
  if (movie.actor === undefined) {
    errors.push("Movie 'actor' is required.");
  } else if (typeof movie.actor !== "string" || movie.actor.trim() === "") {
    errors.push("Movie 'actor' must be a non-empty string.");
  }

  // Validate Year of Debut
  if (movie.yearofdebut === undefined) {
    errors.push("Movie 'yearofdebut' is required.");
  } else if (typeof movie.yearofdebut !== "number" || !Number.isInteger(movie.yearofdebut) || movie.yearofdebut < 1888) {
    errors.push("Movie 'yearofdebut' must be a valid year integer greater than or equal to 1888.");
  }

  return errors;
}
