const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

async function getAllQuizzes(req, res, next) {
	try {
		const quizzes = await Quiz.find().populate('questions');
		res.json(quizzes);
	} catch (err) {
		next(err);
	}
}

async function createQuiz(req, res) {
    try {
        const { title, description = '', questions = [] } = req.body;
        const quiz = await Quiz.create({ title, description, questions });
        const populated = await Quiz.findById(quiz._id).populate('questions');
        return res.status(201).json({ success: true, data: populated });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

async function getQuizById(req, res, next) {
	try {
		const { quizId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(quizId)) return res.status(400).json({ message: 'Invalid quizId' });
		const quiz = await Quiz.findById(quizId).populate('questions');
		if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
		res.json(quiz);
	} catch (err) {
		next(err);
	}
}

async function updateQuiz(req, res, next) {
	try {
		const { quizId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(quizId)) return res.status(400).json({ message: 'Invalid quizId' });
		const { title, description, questions } = req.body;
		const update = {};
		if (typeof title !== 'undefined') update.title = title;
		if (typeof description !== 'undefined') update.description = description;
		if (Array.isArray(questions)) update.questions = questions;
		const quiz = await Quiz.findByIdAndUpdate(quizId, update, { new: true, runValidators: true }).populate('questions');
		if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
		res.json(quiz);
	} catch (err) {
		next(err);
	}
}

async function deleteQuiz(req, res) {
    try {
        const { quizId } = req.params;

        // 1. Find quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

        // 2. Collect question IDs to remove
        const questionIds = (quiz.questions || []).map(id => id.toString());

        // 3. Delete the quiz document
        await Quiz.findByIdAndDelete(quizId);

        // 4. Delete all questions that were referenced by this quiz (unconditional)
        if (questionIds.length > 0) {
            await Question.deleteMany({ _id: { $in: questionIds } });
        }

        return res.json({
            success: true,
            message: 'Quiz and all its referenced questions have been deleted.',
            removedQuestions: questionIds
        });
    } catch (err) {
        console.error('deleteQuiz error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
}

async function getQuizWithCapitalQuestions(req, res) {
    try {
        const { quizId } = req.params;
        const quiz = await Quiz.findById(quizId).populate({
            path: 'questions',
            match: {
                $or: [
                    { keywords: { $in: ['capital'] } },
                    { text: /capital/i }
                ]
            }
        });
        if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
        return res.json({ success: true, data: quiz });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

async function addSingleQuestionToQuiz(req, res) {
    try {
        const { quizId } = req.params;
        const payload = req.body;

        const created = await Question.create(payload);

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { $push: { questions: created._id } },
            { new: true }
        ).populate('questions');

        if (!quiz) {
            await Question.findByIdAndDelete(created._id);
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        return res.status(201).json({ success: true, question: created, quiz });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

async function addMultipleQuestionsToQuiz(req, res) {
    try {
        const { quizId } = req.params;
        const questionsArray = req.body;

        if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
            return res.status(400).json({ success: false, message: 'Body must be a non-empty array' });
        }

        const created = await Question.insertMany(questionsArray);
        const ids = created.map(q => q._id);

        const quiz = await Quiz.findByIdAndUpdate(
            quizId,
            { $push: { questions: { $each: ids } } },
            { new: true }
        ).populate('questions');

        if (!quiz) {
            await Question.deleteMany({ _id: { $in: ids } });
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        return res.status(201).json({ success: true, created, quiz });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

module.exports = {
	getAllQuizzes,
	createQuiz,
	getQuizById,
	updateQuiz,
	deleteQuiz,
	getQuizWithCapitalQuestions,
	addSingleQuestionToQuiz,
	addMultipleQuestionsToQuiz,
};
