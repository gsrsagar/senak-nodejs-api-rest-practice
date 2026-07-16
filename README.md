# Node.js Course Management REST API Sample

Welcome to the **Node.js REST API Sample** project! This project serves as a comprehensive, end-to-end implementation of a RESTful web service managing Course, Subject, and Module details, with a persistent Firestore database layer and full Swagger UI documentation. 

This repository was designed to showcase best practices in REST API development, demonstrating the exact behavior and characteristics of all standard HTTP methods, request/response headers, and HTTP status codes.

---

## 🏢 Training Center Context
* **Center**: Senak 360
* **Address**: Nellore, Andhra Pradesh
* **Contact Mobile**: 7680919598
* **Contact Email**: info@senak360.com
* **YouTube**: [Senak 360 Channel](https://senak360.com/@Senak360)

---

## 🚀 Tech Stack
1. **Runtime**: Node.js (ES Modules syntax)
2. **Framework**: Express.js
3. **Database**: Google Cloud Firestore (via `firebase` client SDK)
4. **Documentation**: Swagger UI & OpenAPI 3.0 (`swagger-ui-express`, `swagger-jsdoc`)
5. **Development Tools**: Nodemon, Dotenv, Cors

---

## 📖 HTTP Methods and Usage in this API

HTTP methods define actions performed on resources. Here is a mapping of the HTTP methods implemented in this project:

| Method | Endpoint | Description | Safe | Idempotent | Usage Example |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **GET** | `/api/courses` | Retrieves all courses. | ✅ Yes | ✅ Yes | Fetching the full list of course cards. |
| **GET** | `/api/courses/:id` | Retrieves details for a specific course by ID. | ✅ Yes | ✅ Yes | Fetching Dot Net course info by Firestore UUID. |
| **POST** | `/api/courses` | Submits data to create a new course. | ❌ No | ❌ No | Submitting a new course structure. |
| **PUT** | `/api/courses/:id` | Updates/overwrites the entire course representation. | ❌ No | ✅ Yes | Overwriting course details with a complete payload. |
| **PATCH** | `/api/courses/:id` | Partially updates course properties (e.g. updating description). | ❌ No | ❌/✅ * | Modifying only the `title` or `pdfUrl` field. |
| **DELETE**| `/api/courses/:id` | Deletes a course resource from Firestore. | ❌ No | ✅ Yes | Removing a retired course curriculum. |
| **OPTIONS**| `/api/courses` | Discovers allowed HTTP methods for the resource path. | ✅ Yes | ✅ Yes | CORS preflight checking allowed methods. |

*\* Note: PATCH is non-idempotent if it performs relative modifications (e.g. appending modules), but idempotent if it sets specific field values (e.g. updating course title).*

---

## 🏷️ HTTP Headers Reference

HTTP headers convey metadata between clients and servers. This API logs incoming request headers and returns standard, robust response headers.

### Common Request Headers processed/observed by this API:
1. **Accept**: Tells the server what media types the client can handle. (e.g., `Accept: application/json`)
2. **Content-Type**: Media type of the request body. (e.g., `Content-Type: application/json`)
3. **Authorization**: Credentials for authentication. (e.g., `Authorization: Bearer <token>`)
4. **User-Agent**: Details about the client software (browser, Postman, curl).
5. **Accept-Language**: Preferred language preferences of the client.
6. **Cookie**: Stored client cookies sent back to the server.
7. **Cache-Control**: Directives for client caching mechanisms (e.g., `Cache-Control: no-cache`).
8. **If-Modified-Since**: Conditional request based on modification date to support caching.

### Standard Response Headers returned by this API:
1. **Content-Type**: Media type of the response body (`application/json`).
2. **Content-Length**: Size of the response body in bytes.
3. **Location**: URL for redirection (used during new resource creation or redirect).
4. **Set-Cookie**: Cookies set by the server.
5. **Cache-Control**: Directives for client caching (`no-store, no-cache` returned on dynamic endpoints to ensure real-time data).
6. **Access-Control-Allow-Origin**: CORS policy (`*` allows cross-origin web browser consumption).
7. **X-Powered-By**: Custom signature indicating the backend engine (`NodeJS Express Firestore API`).

---

## 🚦 HTTP Status Codes Used

Our endpoints return precise HTTP status codes representing transaction outcomes:

### 2xx: Success
* **200 OK**: The request was successful, and data was retrieved or updated.
* **201 Created**: The request succeeded, and a new resource (Course, Subject, or Module) was successfully written to Firestore.
* **204 No Content**: Action succeeded, but there is no body content to return (used on OPTIONS requests).

### 3xx: Redirection
* **304 Not Modified**: The resource has not changed since the last request (client can load from local cache).

### 4xx: Client Errors
* **400 Bad Request**: Invalid JSON syntax or payload failed validation rules (e.g., missing required `title`).
* **401 Unauthorized**: Authentication required / token missing.
* **403 Forbidden**: Access refused.
* **404 Not Found**: The requested course, subject, or module does not exist in Firestore.
* **409 Conflict**: Document creation conflict (e.g. subject name or module title already exists).

### 5xx: Server Errors
* **500 Internal Server Error**: The server encountered an unexpected error connecting to Firestore or processing logic.

---

## 🔧 Installation & Setup

1. **Prerequisites**: Make sure you have Node.js (v18+) installed.
2. **Install Dependencies**:
   Navigate into the project folder and run:
   ```bash
   npm install
   ```
3. **Database Seeding**:
   Populate Firestore with the default **"90 Days Plan, Dot Net Full Stack Development"** course:
   ```bash
   npm run seed
   ```
4. **Start Development Server**:
   Start the local Express server with Nodemon auto-restart:
   ```bash
   npm run dev
   ```

---

## 📚 API Endpoints & Swagger Docs

Once the server is running, visit **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)** in your browser. This displays the interactive Swagger UI interface to test all API calls directly!

### Core Course CRUD Routes
* `GET /api/courses` - Fetch all courses
* `GET /api/courses/:id` - Fetch details for a single course
* `POST /api/courses` - Create a course
* `PUT /api/courses/:id` - Replace a course (Full update)
* `PATCH /api/courses/:id` - Partially update course meta fields
* `DELETE /api/courses/:id` - Delete a course
* `OPTIONS /api/courses` - Discovery allowed methods

### Granular Sub-Resource Routes (Subjects & Modules)
* `POST /api/courses/:courseId/subjects` - Add a subject to a course
* `PUT /api/courses/:courseId/subjects/:subjectName` - Update a subject
* `DELETE /api/courses/:courseId/subjects/:subjectName` - Delete a subject
* `POST /api/courses/:courseId/subjects/:subjectName/modules` - Add a module to a subject
* `PUT /api/courses/:courseId/subjects/:subjectName/modules/:moduleTitle` - Update a module details
* `DELETE /api/courses/:courseId/subjects/:subjectName/modules/:moduleTitle` - Delete a module
