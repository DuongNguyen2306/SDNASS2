# SimpleQuiz API (Express + Mongoose)

## Setup
1. Install Node.js LTS.
2. From project root:
   - Generated app lives in `server/`.
   - Install deps:
     - `cd server`
     - `npm install`
3. Create `.env` in `server/` (see below).
4. Start dev server:
   - `npm run dev` (with nodemon) or `npm start`

## Environment (.env)
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=SimpleQuiz
# Alternative single var:
# MONGODB_URI=mongodb://localhost:27017/SimpleQuiz
```

Example base URL: `http://localhost:3000`

## NPM Scripts
Add to `package.json` if not present:
```
"dev": "nodemon ./bin/www"
```

## Endpoints
- GET `/quizzes` — list quizzes with populated questions
- POST `/quizzes` — create quiz
- GET `/quizzes/:quizId` — get quiz (populated)
- PUT `/quizzes/:quizId` — update quiz
- DELETE `/quizzes/:quizId` — delete quiz
- GET `/quizzes/:quizId/populate` — quiz with only questions containing keyword "capital" (in `keywords` or `text`)
- POST `/quizzes/:quizId/question` — create one question and add to quiz (transactional)
 - POST `/quizzes/:quizId/question` — create one question and add to quiz
- POST `/quizzes/:quizId/questions` — create multiple questions and add to quiz

Questions:
- POST `/questions` — create question
- GET `/questions/:questionId` — get question
- PUT `/questions/:questionId` — update question
- DELETE `/questions/:questionId` — delete question and remove references from quizzes

## Notes
- Uses MVC (`models/`, `controllers/`, `routes/`).
- Uses `mongoose.populate()` on quiz queries.
- Validates IDs and payloads; returns 400/404/500 accordingly.

## Postman Collection
Import `postman_collection.json` in this folder to test endpoints. Ensure your `.env` is set and server is running.

## Assignment 2 UI

The app now includes EJS views that call the existing API via axios.

Environment:
```
API_BASE_URL=http://localhost:3000
```

Run:
```
npm install
npm run dev
```
