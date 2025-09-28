var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var expressHandlebars = require('express-handlebars');
var cors = require('cors');

require('dotenv').config();
const { connectToDatabase } = require('./config/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizRouter = require('./routes/quiz'); // New quiz routes
var questionRouter = require('./routes/question'); // New question routes
var apiQuestionsRouter = require('./routes/api.questions');
var apiQuizzesRouter = require('./routes/api.quizzes');

var app = express();

// Connect DB
connectToDatabase().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Failed initial DB connection:', err);
	process.exit(1);
});

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// Configure Handlebars as main view engine
app.engine('hbs', expressHandlebars.engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: {
    eq: function(a, b) {
      return a === b;
    },
    and: function(a, b) {
      return a && b;
    }
  }
}));

// Configure EJS for specific pages
app.engine('ejs', require('ejs').renderFile);

// Set view engine and views directory
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
// Method override to support PUT/DELETE from forms via hidden field or ?_method= query
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        var method = req.body._method;
        delete req.body._method;
        return method;
    }
    if (req.query && req.query._method) {
        return req.query._method;
    }
}));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/question', questionRouter); // Question routes with Handlebars
app.use('/questions', questionRouter); // Alias for question routes
app.use('/quiz', quizRouter); // Quiz routes with Handlebars
app.use('/quizzes', quizRouter); // Alias for quiz routes
app.use('/api/questions', apiQuestionsRouter);
app.use('/api/quizzes', apiQuizzesRouter);

// API Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Question Bank Management API',
      version: '1.0.0',
      description: 'API for managing quizzes and questions',
      endpoints: {
        quizzes: {
          'GET /api/quizzes': 'Get all quizzes',
          'POST /api/quizzes': 'Create new quiz',
          'GET /api/quizzes/:id': 'Get quiz by ID',
          'PUT /api/quizzes/:id': 'Update quiz',
          'DELETE /api/quizzes/:id': 'Delete quiz',
          'POST /api/quizzes/:id/question': 'Add single question to quiz',
          'POST /api/quizzes/:id/questions': 'Add multiple questions to quiz',
          'GET /api/quizzes/:id/populate': 'Get quiz with questions containing "capital" keyword'
        },
        questions: {
          'GET /api/questions': 'Get all questions',
          'POST /api/questions': 'Create new question',
          'GET /api/questions/:id': 'Get question by ID',
          'PUT /api/questions/:id': 'Update question',
          'DELETE /api/questions/:id': 'Delete question'
        },
        info: {
          'GET /api/info': 'Get API information',
          'GET /health': 'Health check'
        }
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }
  });
});
// Serve static assets after routes so '/' maps to EJS views
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler
app.use(function (req, res, next) {
    if (req.accepts('html')) return res.status(404).render('error', { 
        title: 'Not Found',
        message: 'The page you are looking for could not be found.'
    });
    res.status(404).json({ message: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
	// eslint-disable-next-line no-console
	console.error(err);
	if (res.headersSent) return;
	const status = err.name === 'ValidationError' ? 400 : (err.status || 500);
	res.status(status).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
