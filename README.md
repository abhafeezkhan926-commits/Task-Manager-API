# Task Manager REST API with AI Integration (Backend Only)

Yeh project assignment ke liye **sirf backend** hai — koi frontend/UI include nahi hai. Ismein Express REST API, MongoDB Atlas + Mongoose, aur Groq Chat Completions API use hoti hai.

## 1. Technologies aur unka kaam

- **Node.js**: JavaScript backend runtime; server yahi run karta hai.
- **Express.js**: HTTP server aur routes (`GET`, `POST`, `PUT`, `DELETE`) banata hai.
- **MongoDB Atlas**: cloud database jahan tasks save hote hain.
- **Mongoose**: MongoDB se connect karne, Task schema define karne, validation aur database queries ke liye.
- **dotenv**: `.env` file se environment variables load karta hai.
- **Groq API**: user ki task description ko AI model ko bhej kar summary, priority, estimated hours aur actionable steps return karwati hai.
- **Postman**: endpoints aur successful/error responses test karne ke liye.
- **Render (optional deployment)**: backend host karne ka option; deployment ke waqt secrets platform environment variables mein set karo.

## 2. Project structure

```text
task-manager-api-backend/
├── config/
│   └── db.js                  # MongoDB connection
├── controllers/
│   ├── taskController.js     # Task CRUD logic + input validation
│   └── aiController.js       # AI request + JSON response validation
├── middleware/
│   └── errorHandler.js       # Consistent API errors
├── models/
│   └── Task.js               # Mongoose schema/model
├── routes/
│   ├── taskRoutes.js         # /api/tasks routes
│   └── aiRoutes.js           # /api/ai routes
├── utils/
│   └── asyncHandler.js       # Passes async errors to Express
├── postman/
│   └── Task-Manager-API.postman_collection.json
├── .env.example              # Example variable names/placeholders only
├── .gitignore                # Excludes .env and node_modules
├── package.json
├── server.js                 # Starts server and mounts routes
└── README.md
```

## 3. Local setup (Windows / PowerShell)

Requirements: Node.js **20 or newer**, npm, a MongoDB Atlas account, and Postman.

1. Extract the ZIP and open the extracted `task-manager-api-backend` folder in VS Code.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Create your own `.env` file from the example:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Open `.env` and replace the placeholders with your own credentials. **The example values are not real credentials and will not connect until you replace them.**
5. Start in development mode:

   ```powershell
   npm run dev
   ```

   Or start normally with `npm start`.

6. Check `http://localhost:5000/` and `http://localhost:5000/health` in your browser/Postman. The health endpoint returns `200` when MongoDB is connected.

## 4. Set up MongoDB Atlas through `.env`

1. Create a MongoDB Atlas cluster and a **database user** with a strong password.
2. In Atlas, open **Connect** and copy the Node.js connection string.
3. Put it in `MONGODB_URI` in your local `.env`. Use your actual database username, password and cluster host. Keep `/task_manager` as the database name or choose another name.
4. If the database password contains reserved URL characters (for example `@`, `:`, `/`, `#`), URL-encode the password before placing it in the connection string.
5. Configure Atlas Network Access so your development computer and, later, your host can reach the cluster. Avoid exposing database credentials or allowing access more broadly than necessary.
6. Restart the server after changing `.env`.

Mongoose connects with `mongoose.connect(process.env.MONGODB_URI)` in `config/db.js`; it fails fast with a helpful message if the URI is missing or cannot connect. Database documents are stored in the `tasks` collection.

## 5. Set up Groq AI through `.env`

1. Read Groq's official Chat Completions documentation and supported-model list (links are below).
2. Create/access your Groq Console account and create an API key according to the console's current instructions.
3. Set `GROQ_API_KEY` in `.env`; do not put the key inside JavaScript source code, frontend code, screenshots, or GitHub.
4. `GROQ_MODEL` defaults in `.env.example` to `openai/gpt-oss-20b`. Model availability, access, limits and pricing can change, so confirm the model is currently enabled for your account. Change the environment variable if needed.
5. The AI controller sends a server-to-server `POST` request to `GROQ_API_URL`, with a Bearer token and the user's description. It requests JSON output and then validates the returned fields before returning them to the API caller.

No separate AI SDK is installed: the controller uses Node.js's built-in `fetch()`. That makes the HTTP method, endpoint, headers, request body and response parsing visible for study. The API key still remains server-side.

If your Groq account/model has no quota, is not enabled, or returns an error, the AI endpoint returns a meaningful error instead of pretending a plan was generated. A real key is needed for a live AI result.

## 6. Endpoints

Base URL locally: `http://localhost:5000`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API welcome/info |
| GET | `/health` | Server + MongoDB health |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks` | Get all tasks, newest first |
| GET | `/api/tasks/:id` | Get one task by MongoDB ID |
| PUT | `/api/tasks/:id` | Update one or more task fields |
| DELETE | `/api/tasks/:id` | Delete a task |
| POST | `/api/ai/plan-task` | Generate a plan from a description |

### Create a task — POST `/api/tasks`

Set Postman body to **Body → raw → JSON**:

```json
{
  "title": "Build portfolio website",
  "description": "Create a responsive portfolio using React",
  "status": "pending",
  "dueDate": "2026-10-20"
}
```

`title` is required. `description` and `dueDate` are optional. `status` accepts only `pending`, `in-progress`, or `completed`; default is `pending`.

### Update task — PUT `/api/tasks/:id`

Replace `:id` with the `_id` returned when the task is created. This implementation accepts one or more fields in the JSON body, for example:

```json
{
  "status": "in-progress"
}
```

### AI plan — POST `/api/ai/plan-task`

```json
{
  "description": "I need to build a portfolio website within three days."
}
```

Expected successful shape (actual plan is generated by the AI):

```json
{
  "success": true,
  "plan": {
    "summary": "Build and launch a personal portfolio website.",
    "priority": "high",
    "estimatedHours": 12,
    "steps": [
      "Plan the website structure",
      "Build the responsive layout",
      "Add projects and contact information",
      "Test and deploy the website"
    ]
  }
}
```

## 7. Error handling included

- `400 Bad Request`: missing title, empty AI description, invalid status, bad date, malformed JSON, invalid MongoDB ID, or invalid request fields.
- `404 Not Found`: valid-looking task ID with no matching document, or an unknown route.
- `502 Bad Gateway`: AI provider credentials/request/network/JSON response problem.
- `503 Service Unavailable`: AI key not configured, quota/rate limit reached, or database health unavailable.
- `504 Gateway Timeout`: AI provider takes too long to respond.
- `500 Internal Server Error`: unexpected server error; details are not sent to clients in production mode.

The task schema also validates data at the Mongoose level, and updates set `runValidators: true`.

## 8. Postman tests

1. Open Postman and choose **Import**.
2. Import `postman/Task-Manager-API.postman_collection.json` from this folder.
3. The collection has `baseUrl = http://localhost:5000`; run the requests in order. The create request saves its returned ID into the collection variable `taskId`, which is used by read/update/delete requests.
4. The AI success test requires a valid `GROQ_API_KEY` and access to the configured model. The expected-error tests can be run to show validation behavior.
5. Save screenshots of: create, get all, get single, update, delete, invalid ID, missing title, AI plan, and missing AI description. The assignment requires evidence of these tests.

Important: the collection's final delete request removes the sample task that was created by the first request.

## 9. Deploying (optional assignment section)

For Render or a similar Node.js host:

- Push this backend folder to a GitHub repository without `.env` or `node_modules`.
- Create a Web Service and set the build command to `npm install` and start command to `npm start`.
- Add `MONGODB_URI`, `GROQ_API_KEY`, `GROQ_MODEL`, and (optionally) `GROQ_API_URL` as hosting environment variables. `PORT` is supplied by many hosts automatically.
- Update MongoDB Atlas Network Access as appropriate for the host, and test `/health`, all CRUD routes, and the AI route on the live URL.

Don't claim deployment succeeded until you have tested the live URL. Never paste the actual `.env` into GitHub or send API keys in assignment screenshots.

## 10. What you should research and be ready to explain

Read the listed official documentation and make sure you can explain these points in your own words:

1. **REST methods and status codes**: Why is `POST` used for create, `GET` for read, `PUT` for update, and `DELETE` for delete? Why return `201`, `400`, and `404`?
2. **Mongoose schema/model**: What does `required`, `enum`, `default`, and `timestamps` do? Why is `runValidators: true` used when updating?
3. **MongoDB Atlas connection string**: What does `MONGODB_URI` contain, why should it be in `.env`, and how does `mongoose.connect()` use it?
4. **Environment variable / secrets management**: What does `dotenv` do? Why is `.env` in `.gitignore`? Why does `.env.example` contain placeholders only?
5. **External AI API integration**: Understand the URL, `POST`, `Authorization: Bearer ...`, `Content-Type: application/json`, JSON body, messages, model ID, and `response_format`.
6. **AI response validation**: Why parse JSON and validate `summary`, `priority`, `estimatedHours`, and `steps` rather than trusting model output blindly?
7. **API failures and timeouts**: What happens when the API key is missing, a quota is reached, the response is invalid, or the request times out?
8. **Postman**: How do you configure the request method, URL, JSON body, and inspect HTTP status + response?
9. **Deployment variables**: Why must the same environment variables be added to the host instead of expecting your local `.env` to deploy with the code?

### Short explanation to adapt for your submission

> I implemented the REST API with Node.js and Express. Mongoose defines and validates the Task schema and connects to MongoDB Atlas through the `MONGODB_URI` environment variable. The CRUD endpoints create, read, update and delete tasks, with validation for required fields, status values, invalid IDs and missing records. For AI integration, the backend sends the user's description to Groq's Chat Completions API using a server-side API key from `.env`. It requests structured JSON, parses the AI response, validates all required fields, and returns a consistent plan object. AI provider errors, timeouts, missing descriptions and invalid responses are handled with meaningful HTTP errors. Postman is used to demonstrate the success and error cases.

Rewrite this explanation in your own words and make sure you understand each line before submitting it.

## Official documentation to research

- Groq Chat Completions API: https://console.groq.com/docs/api-reference
- Groq text generation and JSON output: https://console.groq.com/docs/text-chat
- Groq supported models: https://console.groq.com/docs/models
- Groq rate limits: https://console.groq.com/docs/rate-limits
- Mongoose connections: https://mongoosejs.com/docs/connections.html
- Express documentation: https://expressjs.com/
- MongoDB Atlas connection troubleshooting: https://www.mongodb.com/docs/atlas/troubleshoot-connection/
