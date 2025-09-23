const express = require('express');
const router = express.Router();
const controller = require('../controllers/questionController');

// UI routes
router.get('/', controller.list);
router.get('/go', (req, res) => {
    const id = (req.query.id || '').trim();
    if (!id) return res.redirect('/questions');
    res.redirect(`/questions/${id}`);
});
router.get('/new', controller.showCreateForm);
router.post('/', controller.create);
router.get('/:id', controller.detail);
router.get('/:id/edit', controller.showEditForm);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
