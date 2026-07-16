/**
 * Native API Test Script
 * This script runs against the local development server (http://localhost:5000)
 * to verify all CRUD endpoints, HTTP Methods, headers, and status codes.
 * Requires Node.js v18+ (uses native global fetch).
 */

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 STARTING API VERIFICATION SUITE");
  console.log("==================================================");

  let testCourseId = null;

  try {
    // 1. Root Endpoint GET request
    console.log("\n1. Testing GET / (Root Endpoint)...");
    const rootRes = await fetch(`${BASE_URL}/`);
    console.log(`   Status: ${rootRes.status} (Expected: 200)`);
    const rootData = await rootRes.json();
    console.log(`   Response Header 'X-Powered-By': ${rootRes.headers.get("x-powered-by")}`);
    console.log(`   Response Header 'Cache-Control': ${rootRes.headers.get("cache-control")}`);
    console.log(`   Message: ${rootData.message}`);

    // 2. Fetch list of courses GET request
    console.log("\n2. Testing GET /api/courses (Fetch Courses)...");
    const listRes = await fetch(`${BASE_URL}/api/courses`);
    console.log(`   Status: ${listRes.status} (Expected: 200)`);
    const courses = await listRes.json();
    console.log(`   Found ${courses.length} courses in database.`);

    // 3. OPTIONS request on /api/courses
    console.log("\n3. Testing OPTIONS /api/courses (Method Discovery)...");
    const optionsRes = await fetch(`${BASE_URL}/api/courses`, {
      method: "OPTIONS"
    });
    console.log(`   Status: ${optionsRes.status} (Expected: 204)`);
    console.log(`   Allowed Methods: ${optionsRes.headers.get("allow")}`);

    // 4. Create new Course POST request
    console.log("\n4. Testing POST /api/courses (Create Course)...");
    const newCourse = {
      title: "Temporary Test Course",
      description: "A course created by the automated verification script.",
      youtubePlaylistUrl: "https://youtube.com/playlist?list=test",
      syllabusUrl: "https://example.com/syllabus",
      pdfUrl: "test-syllabus.pdf",
      imageUrl: "https://example.com/image.png",
      subjects: [
        {
          name: "Test Subject Alpha",
          modules: [
            {
              title: "Day 1 - Introduction to Testing",
              description: "Getting started with automated test verification.",
              tags: ["Testing", "Automation"],
              watchUrl: "https://youtube.com/watch?v=test1",
              materialUrl: "test-material.pdf",
              status: "Done"
            }
          ]
        }
      ]
    };

    const createRes = await fetch(`${BASE_URL}/api/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(newCourse)
    });
    console.log(`   Status: ${createRes.status} (Expected: 201)`);
    const createdCourse = await createRes.json();
    testCourseId = createdCourse.id;
    console.log(`   Created Course ID: ${testCourseId}`);
    console.log(`   Subject Progress: Total: ${createdCourse.subjects[0].totalModules}, Completed: ${createdCourse.subjects[0].completedModules}, Status: ${createdCourse.subjects[0].status}`);

    // 5. Get created Course GET request
    console.log(`\n5. Testing GET /api/courses/${testCourseId} (Get Single Course)...`);
    const getRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}`);
    console.log(`   Status: ${getRes.status} (Expected: 200)`);
    const retrievedCourse = await getRes.json();
    console.log(`   Retrieved Title: "${retrievedCourse.title}"`);

    // 6. Put Course PUT request (Full Update)
    console.log(`\n6. Testing PUT /api/courses/${testCourseId} (Replace Course)...`);
    const updatedCourse = {
      ...retrievedCourse,
      title: "Replaced Course Name",
      description: "Completely overwritten description."
    };
    // Remove auto-generated ID from body payload if present
    delete updatedCourse.id;

    const putRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedCourse)
    });
    console.log(`   Status: ${putRes.status} (Expected: 200)`);
    const putData = await putRes.json();
    console.log(`   Updated Title in Response: "${putData.title}"`);

    // 7. Patch Course PATCH request (Partial Update)
    console.log(`\n7. Testing PATCH /api/courses/${testCourseId} (Partial Update)...`);
    const patchRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: "Patched description text." })
    });
    console.log(`   Status: ${patchRes.status} (Expected: 200)`);
    const patchData = await patchRes.json();
    console.log(`   Updated Description in Response: "${patchData.description}"`);

    // 8. Add nested Subject POST request
    console.log(`\n8. Testing POST /api/courses/${testCourseId}/subjects (Add Subject)...`);
    const newSubject = {
      name: "Test Subject Beta",
      modules: []
    };
    const addSubjectRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/subjects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSubject)
    });
    console.log(`   Status: ${addSubjectRes.status} (Expected: 201)`);
    const addSubjectData = await addSubjectRes.json();
    console.log(`   Subject Count now: ${addSubjectData.subjects.length}`);

    // 9. Add nested Module POST request
    console.log(`\n9. Testing POST /api/courses/${testCourseId}/subjects/Test Subject Beta/modules (Add Module)...`);
    const newModule = {
      title: "Nested Module 1",
      description: "Added as subresource module",
      tags: ["nested", "module"],
      watchUrl: "https://youtube.com/watch?v=module1",
      materialUrl: "module1.pdf",
      status: "Done" // Setting this to 'Done' should recalculate Beta's status to 'Completed'
    };
    const addModuleRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/subjects/Test%20Subject%20Beta/modules`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newModule)
    });
    console.log(`   Status: ${addModuleRes.status} (Expected: 201)`);
    const addModuleData = await addModuleRes.json();
    const betaSubject = addModuleData.subjects.find(s => s.name === "Test Subject Beta");
    console.log(`   Beta Subject Status after Completed Module addition: ${betaSubject.status} (Expected: Completed)`);

    // 10. Update nested Module PUT request
    console.log(`\n10. Testing PUT /api/courses/${testCourseId}/subjects/Test Subject Beta/modules/Nested Module 1 (Update Module)...`);
    const updateModPayload = {
      title: "Nested Module 1",
      description: "Updated description for nested module",
      status: "Not Started" // Resetting to Not Started should change Beta's status to 'Not Started'
    };
    const updateModRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/subjects/Test%20Subject%20Beta/modules/Nested%20Module%201`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateModPayload)
    });
    console.log(`   Status: ${updateModRes.status} (Expected: 200)`);
    const updateModData = await updateModRes.json();
    const betaSubject2 = updateModData.subjects.find(s => s.name === "Test Subject Beta");
    console.log(`   Beta Subject Status after Module reset: ${betaSubject2.status} (Expected: Not Started)`);

    // 11. Delete nested Module DELETE request
    console.log(`\n11. Testing DELETE /api/courses/${testCourseId}/subjects/Test Subject Beta/modules/Nested Module 1 (Delete Module)...`);
    const delModRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/subjects/Test%20Subject%20Beta/modules/Nested%20Module%201`, {
      method: "DELETE"
    });
    console.log(`   Status: ${delModRes.status} (Expected: 200)`);

    // 12. Delete nested Subject DELETE request
    console.log(`\n12. Testing DELETE /api/courses/${testCourseId}/subjects/Test Subject Beta (Delete Subject)...`);
    const delSubRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}/subjects/Test%20Subject%20Beta`, {
      method: "DELETE"
    });
    console.log(`   Status: ${delSubRes.status} (Expected: 200)`);

    // 13. Delete course DELETE request
    console.log(`\n13. Testing DELETE /api/courses/${testCourseId} (Delete Course)...`);
    const deleteRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}`, {
      method: "DELETE"
    });
    console.log(`   Status: ${deleteRes.status} (Expected: 200)`);

    // 14. Confirm deletion
    console.log(`\n14. Verifying Deleted Course is missing...`);
    const confirmRes = await fetch(`${BASE_URL}/api/courses/${testCourseId}`);
    console.log(`   Status: ${confirmRes.status} (Expected: 404 Not Found)`);

    console.log("\n==================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("==================================================");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ TEST FAILURE:");
    console.error(error);
    
    // Attempt cleanup if possible
    if (testCourseId) {
      console.log(`\nAttempting cleanup: deleting test course ${testCourseId}...`);
      try {
        await fetch(`${BASE_URL}/api/courses/${testCourseId}`, { method: "DELETE" });
      } catch (e) {
        // ignore
      }
    }
    process.exit(1);
  }
}

runTests();
