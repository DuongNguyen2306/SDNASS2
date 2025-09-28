const express = require('express');
const router = express.Router();
const axios = require('axios');
const https = require('https');

// Configure Axios for HTTPS requests
const axiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000',
  httpsAgent: new https.Agent({ 
    rejectUnauthorized: false 
  })
});

// GET /questions - List all questions
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Fetching questions from API...');
    console.log('🔍 Query params:', req.query);
    console.log('🔍 API param:', req.query.api, 'Type:', typeof req.query.api);
    
    const response = await axiosInstance.get('/questions');
    console.log('📡 API response data:', JSON.stringify(response.data, null, 2));
    
    // Xử lý response format từ backend
    const questions = response.data.success ? response.data.data : response.data;
    console.log('📋 Processed questions for rendering:', JSON.stringify(questions, null, 2));
    console.log('📊 Questions count:', Array.isArray(questions) ? questions.length : 'Not an array');
    
    // Check if this is an API request (for modal)
    const isApiRequest = req.query.api === 'true' || 
                        req.headers.accept === 'application/json' ||
                        req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    if (isApiRequest) {
      console.log('✅ Returning JSON response for API request');
      res.json({ success: true, data: questions });
    } else {
      console.log('✅ Returning HTML response for normal request');
      res.render('questions/list', { 
        title: 'Questions',
        questions: questions 
      });
    }
  } catch (err) {
    console.error('❌ Error fetching questions:', err);
    const isApiRequest = req.query.api === 'true' || 
                        req.headers.accept === 'application/json' ||
                        req.headers['x-requested-with'] === 'XMLHttpRequest';
    
    if (isApiRequest) {
      res.status(500).json({ success: false, error: 'Failed to load questions' });
    } else {
      res.render('questions/list', { 
        title: 'Questions',
        questions: [],
        error: 'Failed to load questions'
      });
    }
  }
});

// GET /questions/new - Show create question form
router.get('/new', (req, res) => {
  res.render('questions/create', { 
    title: 'Create New Question',
    question: { 
      text: '', 
      options: [], 
      correctAnswerIndex: 0,
      keywords: []
    },
    quizId: req.query.quizId
  });
});

// POST /questions - Create new question
router.post('/', async (req, res) => {
  try {
    const { text, options, correctAnswerIndex, keywords, quizId } = req.body;
    
    // Parse options if it's a string
    const optionsArray = typeof options === 'string' 
      ? options.split(',').map(opt => opt.trim()).filter(opt => opt)
      : options;
    
    // Parse keywords if it's a string
    const keywordsArray = typeof keywords === 'string' 
      ? keywords.split(',').map(kw => kw.trim()).filter(kw => kw)
      : keywords;

    console.log('🔍 Creating question:', { text, optionsArray, correctAnswerIndex, keywordsArray, quizId });
    
    const response = await axiosInstance.post('/questions', { 
      text, 
      options: optionsArray, 
      correctAnswerIndex: parseInt(correctAnswerIndex),
      keywords: keywordsArray
    });
    
    const question = response.data.success ? response.data.data : response.data;
    console.log('✅ Question created:', question);
    
    // If quizId is provided, add question to quiz
    if (quizId) {
      console.log('🔍 Adding question to quiz:', { quizId, questionId: question._id });
      try {
        await axiosInstance.post(`/quizzes/${quizId}/question`, question);
        console.log('✅ Question added to quiz successfully');
        res.redirect(`/quiz/${quizId}/edit?success=Question created and added to quiz`);
      } catch (quizErr) {
        console.error('❌ Error adding question to quiz:', quizErr);
        res.redirect(`/quiz/${quizId}/edit?error=Question created but failed to add to quiz`);
      }
    } else {
      res.redirect('/questions');
    }
  } catch (err) {
    console.error('❌ Error creating question:', err);
    res.render('questions/create', { 
      title: 'Create New Question',
      question: req.body,
      quizId: req.body.quizId,
      error: 'Failed to create question'
    });
  }
});

// GET /questions/:id - Show question details
router.get('/:id', async (req, res) => {
  try {
    console.log('🔍 Fetching question details for ID:', req.params.id);
    const response = await axiosInstance.get(`/questions/${req.params.id}`);
    console.log('📡 Question details response:', JSON.stringify(response.data, null, 2));
    
    // Xử lý response format từ backend
    const question = response.data.success ? response.data.data : response.data;
    console.log('📋 Processed question for rendering:', JSON.stringify(question, null, 2));
    
    res.render('questions/details', { 
      title: 'Question Details',
      question: question 
    });
  } catch (err) {
    console.error('❌ Error fetching question:', err);
    res.status(404).render('error', { 
      title: 'Question Not Found',
      message: 'The requested question could not be found'
    });
  }
});

// GET /questions/:id/edit - Show edit question form
router.get('/:id/edit', async (req, res) => {
  try {
    console.log('🔍 Fetching question for edit, ID:', req.params.id);
    const response = await axiosInstance.get(`/questions/${req.params.id}`);
    console.log('📡 Question edit response:', JSON.stringify(response.data, null, 2));
    
    // Xử lý response format từ backend
    const question = response.data.success ? response.data.data : response.data;
    console.log('📋 Processed question for edit:', JSON.stringify(question, null, 2));
    
    res.render('questions/edit', { 
      title: 'Edit Question',
      question: question 
    });
  } catch (err) {
    console.error('❌ Error fetching question for edit:', err);
    res.status(404).render('error', { 
      title: 'Question Not Found',
      message: 'The requested question could not be found'
    });
  }
});

// PUT /questions/:id - Update question
router.put('/:id', async (req, res) => {
  try {
    const { text, options, correctAnswerIndex, keywords } = req.body;
    
    // Parse options if it's a string
    const optionsArray = typeof options === 'string' 
      ? options.split(',').map(opt => opt.trim()).filter(opt => opt)
      : options;
    
    // Parse keywords if it's a string
    const keywordsArray = typeof keywords === 'string' 
      ? keywords.split(',').map(kw => kw.trim()).filter(kw => kw)
      : keywords;

    await axiosInstance.put(`/questions/${req.params.id}`, { 
      text, 
      options: optionsArray, 
      correctAnswerIndex: parseInt(correctAnswerIndex),
      keywords: keywordsArray
    });
    res.redirect('/questions');
  } catch (err) {
    console.error('Error updating question:', err);
    res.render('questions/edit', { 
      title: 'Edit Question',
      question: { _id: req.params.id, ...req.body },
      error: 'Failed to update question'
    });
  }
});

// DELETE /questions/:id - Delete question
router.delete('/:id', async (req, res) => {
  try {
    await axiosInstance.delete(`/questions/${req.params.id}`);
    res.redirect('/questions');
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;
