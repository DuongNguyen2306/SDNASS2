const express = require('express');
const router = express.Router();
const ui = require('../controllers/quizUiController');

// UI routes for quizzes
router.get('/', ui.list);
router.get('/go', (req, res) => {
    const id = (req.query.id || '').trim();
    if (!id) return res.redirect('/quizzes');
    res.redirect(`/quizzes/${id}`);
});
router.get('/new', ui.showCreateForm);
router.post('/', ui.create);
router.get('/:id', ui.detail);
router.get('/:id/edit', ui.showEditForm);
router.put('/:id', ui.update);
router.delete('/:id', ui.remove);
router.get('/:id/populate', ui.populate);
router.get('/:id/question/new', ui.showAddSingleQuestionForm);
router.post('/:id/question', ui.addSingleQuestion);
router.get('/:id/questions/new', ui.showAddMultipleQuestionsForm);
router.post('/:id/questions', ui.addMultipleQuestions);

module.exports = router;
