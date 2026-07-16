/**
 * Verification script to validate auth flow: signup, login, change-password, login with new password, logout.
 */
async function runTests() {
  const port = process.env.PORT || 5000;
  const baseUrl = `http://localhost:${port}/api/auth`;
  const uniqueId = Math.floor(Math.random() * 1000000);
  
  const testUser = {
    username: `testuser_${uniqueId}`,
    emailid: `test_${uniqueId}@example.com`,
    age: 30,
    role: "USER",
    password: "password123"
  };

  console.log("\n========================================");
  console.log("Starting Authentication System Tests...");
  console.log("========================================\n");

  // 1. Sign Up
  console.log(`[TEST 1] Registering user: ${testUser.username} (${testUser.emailid})...`);
  let signupResponse;
  try {
    signupResponse = await fetch(`${baseUrl}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser)
    });
  } catch (err) {
    console.error("Failed to connect to the server. Is the API server running on port 5000?", err.message);
    return;
  }

  const signupResult = await signupResponse.json();
  if (signupResponse.status !== 201) {
    console.error("FAIL: Signup failed:", signupResult);
    return;
  }
  console.log("PASS: Signup successful! Registered user profile:", signupResult);
  console.log("Checked password security: Hashed password omitted from response:", !signupResult.password);

  // 1b. Test Duplicate Sign Up (should fail)
  console.log(`\n[TEST 1b] Attempting duplicate registration (same username and emailid)...`);
  const duplicateResponse = await fetch(`${baseUrl}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser)
  });
  const duplicateResult = await duplicateResponse.json();
  if (duplicateResponse.status === 400 && duplicateResult.error === "Validation Error" && duplicateResult.details.length > 0) {
    console.log("PASS: Duplicate registration rejected correctly with Validation Error details:", duplicateResult.details);
  } else {
    console.error("FAIL: Duplicate registration should have failed with 400 but returned status:", duplicateResponse.status, duplicateResult);
    return;
  }

  // 2. Log In (First login)
  console.log(`\n[TEST 2] Logging in with email: ${testUser.emailid} and password: ${testUser.password}...`);
  const loginResponse = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailid: testUser.emailid,
      password: testUser.password
    })
  });

  const loginResult = await loginResponse.json();
  if (loginResponse.status !== 200) {
    console.error("FAIL: Login failed:", loginResult);
    return;
  }
  console.log("PASS: Login successful!");
  console.log("JWT Token generated:", loginResult.token ? "YES (present)" : "NO");
  const token = loginResult.token;

  // 3. Change Password
  const newPassword = "newpassword456";
  console.log(`\n[TEST 3] Changing password. Current: '${testUser.password}', New: '${newPassword}'...`);
  const changePasswordResponse = await fetch(`${baseUrl}/change-password`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      oldPassword: testUser.password,
      newPassword: newPassword
    })
  });

  const changePasswordResult = await changePasswordResponse.json();
  if (changePasswordResponse.status !== 200) {
    console.error("FAIL: Change password failed:", changePasswordResult);
    return;
  }
  console.log("PASS: Change password successful! Message:", changePasswordResult.message);

  // 4. Log in with old password (should fail)
  console.log(`\n[TEST 4] Trying to log in with the OLD password (should fail)...`);
  const failLoginResponse = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailid: testUser.emailid,
      password: testUser.password
    })
  });

  const failLoginResult = await failLoginResponse.json();
  if (failLoginResponse.status === 401) {
    console.log("PASS: Login rejected correctly with old password. Message:", failLoginResult.message);
  } else {
    console.error("FAIL: Login should have failed but succeeded or returned status:", failLoginResponse.status, failLoginResult);
    return;
  }

  // 5. Log in with new password (should succeed)
  console.log(`\n[TEST 5] Logging in with the NEW password: '${newPassword}' (should succeed)...`);
  const successLoginResponse = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailid: testUser.emailid,
      password: newPassword
    })
  });

  const successLoginResult = await successLoginResponse.json();
  if (successLoginResponse.status !== 200) {
    console.error("FAIL: Login failed with new password:", successLoginResult);
    return;
  }
  console.log("PASS: Login successful with new password! Returned token:", successLoginResult.token ? "YES" : "NO");

  // 6. Test Reset Password (without token)
  const resetPasswordVal = "resetpassword789";
  console.log(`\n[TEST 6] Resetting password directly for ${testUser.emailid} to '${resetPasswordVal}'...`);
  const resetResponse = await fetch(`${baseUrl}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailid: testUser.emailid,
      newPassword: resetPasswordVal
    })
  });

  const resetResult = await resetResponse.json();
  if (resetResponse.status !== 200) {
    console.error("FAIL: Reset password failed:", resetResult);
    return;
  }
  console.log("PASS: Reset password successful! Message:", resetResult.message);

  // 7. Log in with reset password (should succeed)
  console.log(`\n[TEST 7] Logging in with the RESET password: '${resetPasswordVal}' (should succeed)...`);
  const resetLoginResponse = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailid: testUser.emailid,
      password: resetPasswordVal
    })
  });

  const resetLoginResult = await resetLoginResponse.json();
  if (resetLoginResponse.status !== 200) {
    console.error("FAIL: Login failed with reset password:", resetLoginResult);
    return;
  }
  console.log("PASS: Login successful with reset password! Returned token:", resetLoginResult.token ? "YES" : "NO");

  // 8. Test Logout
  console.log("\n[TEST 8] Logging out...");
  const logoutResponse = await fetch(`${baseUrl}/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });

  const logoutResult = await logoutResponse.json();
  if (logoutResponse.status !== 200) {
    console.error("FAIL: Logout failed:", logoutResult);
    return;
  }
  console.log("PASS: Logout endpoint responded successfully:", logoutResult.message);

  console.log("\n========================================");
  console.log("ALL TESTS COMPLETED SUCCESSFULLY!");
  console.log("========================================\n");
}

runTests();
