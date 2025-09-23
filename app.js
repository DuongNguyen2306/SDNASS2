var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var expressLayouts = require('express-ejs-layouts');

require('dotenv').config();
const { connectToDatabase } = require('./config/db');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var quizzesRouter = require('./routes/quizzes');
var questionsRouter = require('./routes/questions');
var apiQuestionsRouter = require('./routes/api.questions');
var apiQuizzesRouter = require('./routes/api.quizzes');

var app = express();

// Connect DB
connectToDatabase().catch((err) => {
	// eslint-disable-next-line no-console
	console.error('Failed initial DB connection:', err);
	process.exit(1);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/quizzes', quizzesRouter);
app.use('/questions', questionsRouter);
app.use('/api/questions', apiQuestionsRouter);
app.use('/api/quizzes', apiQuizzesRouter);
// Serve static assets after routes so '/' maps to EJS views
app.use(express.static(path.join(__dirname, 'public')));

// 404 handler
app.use(function (req, res, next) {
    if (req.accepts('html')) return res.status(404).render('layouts/404', { title: 'Not Found' });
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
