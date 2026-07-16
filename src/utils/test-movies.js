/**
 * Verification script to validate Movie CRUD authentication and operations.
 */
async function runTests() {
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}/api`;
  const uniqueId = Math.floor(Math.random() * 1000000);
  
  const testUser = {
    username: `movie_tester_${uniqueId}`,
    emailid: `movie_tester_${uniqueId}@example.com`,
    age: 28,
    role: "ADMIN",
    password: "securepassword123"
  };

  console.log("\n========================================");
  console.log("Starting Movie CRUD Authorization Tests...");
  console.log("========================================\n");

  let token = "";

  // 1. Signup and Login to get valid JWT token
  console.log(`[PRE-TEST] Registering and logging in tester: ${testUser.username}...`);
  try {
    const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
    
    if (signupResponse.status !== 201) {
      console.error("FAIL: Tester signup failed:", await signupResponse.json());
      return;
    }

    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailid: testUser.emailid,
        password: testUser.password
      })
    });

    const loginResult = await loginResponse.json();
    token = loginResult.token;
    console.log("PRE-TEST PASS: Authentication token acquired.");
  } catch (err) {
    console.error("Connection failed. Is the API server running on port " + port + "?", err.message);
    return;
  }

  // 2. GET /api/movies without token (should fail with 401)
  console.log("\n[TEST 1] GET /api/movies without token (should fail with 401)...");
  const noTokenResponse = await fetch(`${baseUrl}/movies`, {
    method: "GET"
  });
  const noTokenResult = await noTokenResponse.json();
  if (noTokenResponse.status === 401) {
    console.log("PASS: Correctly rejected request without token with 401. Message:", noTokenResult.message);
  } else {
    console.error("FAIL: Request should have failed but returned status:", noTokenResponse.status, noTokenResult);
    return;
  }

  // 3. POST /api/movies with token (create movie)
  const newMovie = {
    name: "Interstellar",
    rating: 8.6,
    actor: "Matthew McConaughey",
    yearofdebut: 2014
  };
  console.log(`\n[TEST 2] Creating movie: "${newMovie.name}" (should succeed)...`);
  const createResponse = await fetch(`${baseUrl}/movies`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(newMovie)
  });

  const createResult = await createResponse.json();
  if (createResponse.status !== 201) {
    console.error("FAIL: Creating movie failed:", createResult);
    return;
  }
  const movieId = createResult.id;
  console.log(`PASS: Movie created successfully with sequential ID: ${movieId}! Details:`, createResult);

  // 4. GET /api/movies with token (read all)
  console.log("\n[TEST 3] Reading all movies with token (should contain Interstellar)...");
  const getAllResponse = await fetch(`${baseUrl}/movies`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const getAllResult = await getAllResponse.json();
  if (getAllResponse.status === 200 && Array.isArray(getAllResult) && getAllResult.some(m => m.id === movieId)) {
    console.log("PASS: Successfully retrieved all movies. Count:", getAllResult.length);
  } else {
    console.error("FAIL: Failed to retrieve movies:", getAllResponse.status, getAllResult);
    return;
  }

  // 5. GET /api/movies/:id with token (read by id)
  console.log(`\n[TEST 4] Retrieving movie with ID ${movieId}...`);
  const getByIdResponse = await fetch(`${baseUrl}/movies/${movieId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const getByIdResult = await getByIdResponse.json();
  if (getByIdResponse.status === 200 && getByIdResult.name === newMovie.name) {
    console.log("PASS: Successfully retrieved movie by ID! Details:", getByIdResult);
  } else {
    console.error("FAIL: Failed to retrieve movie by ID:", getByIdResponse.status, getByIdResult);
    return;
  }

  // 6. PUT /api/movies/:id with token (replace movie)
  const replaceMovie = {
    name: "Interstellar (Special Edition)",
    rating: 9.0,
    actor: "Matthew McConaughey",
    yearofdebut: 2014
  };
  console.log(`\n[TEST 5] Fully replacing movie with ID ${movieId}...`);
  const putResponse = await fetch(`${baseUrl}/movies/${movieId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(replaceMovie)
  });
  const putResult = await putResponse.json();
  if (putResponse.status === 200 && putResult.name === replaceMovie.name && putResult.rating === 9.0) {
    console.log("PASS: Successfully replaced movie document! Updated details:", putResult);
  } else {
    console.error("FAIL: Failed to replace movie document:", putResponse.status, putResult);
    return;
  }

  // 7. PATCH /api/movies/:id with token (partial update)
  console.log(`\n[TEST 6] Partially updating movie with ID ${movieId} (updating rating to 9.8)...`);
  const patchResponse = await fetch(`${baseUrl}/movies/${movieId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ rating: 9.8 })
  });
  const patchResult = await patchResponse.json();
  if (patchResponse.status === 200 && patchResult.rating === 9.8) {
    console.log("PASS: Successfully updated movie rating! Updated details:", patchResult);
  } else {
    console.error("FAIL: Failed to patch movie document:", patchResponse.status, patchResult);
    return;
  }

  // 8. DELETE /api/movies/:id with token (delete movie)
  console.log(`\n[TEST 7] Deleting movie with ID ${movieId}...`);
  const deleteResponse = await fetch(`${baseUrl}/movies/${movieId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const deleteResult = await deleteResponse.json();
  if (deleteResponse.status === 200) {
    console.log("PASS: Movie deleted successfully. Response message:", deleteResult.message);
  } else {
    console.error("FAIL: Failed to delete movie:", deleteResponse.status, deleteResult);
    return;
  }

  // 9. GET /api/movies/:id with token (should fail with 404 now)
  console.log(`\n[TEST 8] Trying to get deleted movie with ID ${movieId} (should fail with 404)...`);
  const postDeleteResponse = await fetch(`${baseUrl}/movies/${movieId}`, {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` }
  });
  const postDeleteResult = await postDeleteResponse.json();
  if (postDeleteResponse.status === 404) {
    console.log("PASS: Correctly rejected retrieval of deleted movie with 404. Message:", postDeleteResult.error);
  } else {
    console.error("FAIL: Request should have failed with 404 but returned status:", postDeleteResponse.status, postDeleteResult);
    return;
  }

  console.log("\n========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("========================================\n");
}

runTests();
