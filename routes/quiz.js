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

// GET /quizzes - List all quizzes
router.get('/', async (req, res) => {
  try {
    const response = await axiosInstance.get('/quizzes');
    res.render('quiz/list', { 
      title: 'Quizzes',
      quizzes: response.data 
    });
  } catch (err) {
    console.error('Error fetching quizzes:', err);
    res.render('quiz/list', { 
      title: 'Quizzes',
      quizzes: [],
      error: 'Failed to load quizzes'
    });
  }
});

// GET /quizzes/new - Show create quiz form
router.get('/new', (req, res) => {
  res.render('quiz/create', { 
    title: 'Create New Quiz',
    quiz: { title: '', description: '' }
  });
});

// POST /quizzes - Create new quiz
router.post('/', async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    console.log('🔍 Creating quiz with data:', { title, description, questions });
    
    // Parse questions if they exist
    let questionsArray = [];
    if (questions && Array.isArray(questions)) {
      // Get full question data for each selected question
      for (const questionData of questions) {
        if (questionData.id) {
          try {
            console.log('🔍 Fetching question details for:', questionData.id);
            const questionResponse = await axiosInstance.get(`/questions/${questionData.id}`);
            const question = questionResponse.data.success ? questionResponse.data.data : questionResponse.data;
            questionsArray.push(question);
            console.log('✅ Added question to quiz:', question.text);
          } catch (questionErr) {
            console.error('❌ Error fetching question:', questionData.id, questionErr.message);
          }
        }
      }
    }
    
    console.log('📋 Final questions array:', questionsArray);
    
    // Create quiz with questions
    const quizData = { 
      title, 
      description, 
      questions: questionsArray 
    };
    
    const response = await axiosInstance.post('/quizzes', quizData);
    const quiz = response.data.success ? response.data.data : response.data;
    console.log('✅ Quiz created successfully:', quiz);
    
    res.redirect(`/quiz/${quiz._id}/edit?success=Quiz created successfully with ${questionsArray.length} questions`);
  } catch (err) {
    console.error('❌ Error creating quiz:', err);
    res.render('quiz/create', { 
      title: 'Create New Quiz',
      quiz: req.body,
      error: 'Failed to create quiz: ' + err.message
    });
  }
});

// GET /quizzes/:id - Show quiz details
router.get('/:id', async (req, res) => {
  try {
    const response = await axiosInstance.get(`/quizzes/${req.params.id}`);
    res.render('quiz/details', { 
      title: 'Quiz Details',
      quiz: response.data 
    });
  } catch (err) {
    console.error('Error fetching quiz:', err);
    res.status(404).render('error', { 
      title: 'Quiz Not Found',
      message: 'The requested quiz could not be found'
    });
  }
});

// GET /quizzes/:id/edit - Show edit quiz form
router.get('/:id/edit', async (req, res) => {
  try {
    console.log('🔍 Fetching quiz for edit, ID:', req.params.id);
    const response = await axiosInstance.get(`/quizzes/${req.params.id}`);
    console.log('📡 Quiz edit response:', JSON.stringify(response.data, null, 2));
    
    // Xử lý response format từ backend
    const quiz = response.data.success ? response.data.data : response.data;
    console.log('📋 Processed quiz for edit:', JSON.stringify(quiz, null, 2));
    
    res.render('quiz/edit', { 
      title: 'Edit Quiz',
      quiz: quiz,
      error: req.query.error,
      success: req.query.success
    });
  } catch (err) {
    console.error('❌ Error fetching quiz for edit:', err);
    res.status(404).render('error', { 
      title: 'Quiz Not Found',
      message: 'The requested quiz could not be found'
    });
  }
});

// PUT /quizzes/:id - Update quiz
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    await axiosInstance.put(`/quizzes/${req.params.id}`, { title, description });
    res.redirect('/quizzes');
  } catch (err) {
    console.error('Error updating quiz:', err);
    res.render('quiz/edit', { 
      title: 'Edit Quiz',
      quiz: { _id: req.params.id, ...req.body },
      error: 'Failed to update quiz'
    });
  }
});

// DELETE /quizzes/:id - Delete quiz
router.delete('/:id', async (req, res) => {
  try {
    await axiosInstance.delete(`/quizzes/${req.params.id}`);
    res.redirect('/quizzes');
  } catch (err) {
    console.error('Error deleting quiz:', err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});

// POST /quizzes/:id/question - Add existing question to quiz
router.post('/:id/question', async (req, res) => {
  try {
    console.log('🔍 POST /quiz/:id/question route hit');
    console.log('🔍 Request params:', req.params);
    console.log('🔍 Request body:', req.body);
    
    const { questionId } = req.body;
    console.log('🔍 Adding question to quiz:', { quizId: req.params.id, questionId });
    
    if (!questionId) {
      throw new Error('Question ID is required');
    }
    
    // Get the question first to validate it exists
    console.log('🔍 Fetching question from API...');
    const questionResponse = await axiosInstance.get(`/questions/${questionId}`);
    console.log('📡 Question response:', questionResponse.data);
    
    const question = questionResponse.data.success ? questionResponse.data.data : questionResponse.data;
    console.log('📋 Processed question:', question);
    
    // Add question to quiz by updating the quiz's questions array
    console.log('🔍 Adding question to quiz via API...');
    
    // Get current quiz first
    const quizResponse = await axiosInstance.get(`/quizzes/${req.params.id}`);
    const currentQuiz = quizResponse.data.success ? quizResponse.data.data : quizResponse.data;
    console.log('📋 Current quiz:', currentQuiz);
    
    // Add question to quiz's questions array
    const updatedQuestions = [...(currentQuiz.questions || []), question];
    console.log('📋 Updated questions array:', updatedQuestions);
    
    // Update quiz with new questions array
    await axiosInstance.put(`/quizzes/${req.params.id}`, {
      title: currentQuiz.title,
      description: currentQuiz.description,
      questions: updatedQuestions
    });
    console.log('✅ Question added to quiz successfully');
    
    res.redirect(`/quiz/${req.params.id}/edit?success=Question added successfully`);
  } catch (err) {
    console.error('❌ Error adding question to quiz:', err);
    res.redirect(`/quiz/${req.params.id}/edit?error=Failed to add question: ${err.message}`);
  }
});

// DELETE /quizzes/:id/question/:questionId - Remove question from quiz
router.delete('/:id/question/:questionId', async (req, res) => {
  try {
    const { id, questionId } = req.params;
    console.log('🔍 Removing question from quiz:', { quizId: id, questionId });
    
    // Get current quiz
    const quizResponse = await axiosInstance.get(`/quizzes/${id}`);
    const quiz = quizResponse.data.success ? quizResponse.data.data : quizResponse.data;
    
    // Remove question from quiz's questions array
    const updatedQuestions = quiz.questions.filter(q => q._id !== questionId);
    
    // Update quiz
    await axiosInstance.put(`/quizzes/${id}`, {
      title: quiz.title,
      description: quiz.description,
      questions: updatedQuestions
    });
    
    res.redirect(`/quiz/${id}/edit`);
  } catch (err) {
    console.error('❌ Error removing question from quiz:', err);
    res.redirect(`/quiz/${id}/edit?error=Failed to remove question`);
  }
});

module.exports = router;
