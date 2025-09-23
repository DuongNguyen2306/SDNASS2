const express = require('express');
const router = express.Router();
const c = require('../controllers/apiQuizController');

router.get('/', c.list);
router.post('/', c.create);
router.get('/:id', c.getById);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.get('/:id/populate', c.populateCapital);
router.post('/:id/question', c.addSingleQuestion);
router.post('/:id/questions', c.addMultipleQuestions);

module.exports = router;


