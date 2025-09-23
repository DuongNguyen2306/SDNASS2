const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const Question = require('../models/Question');

async function list(req, res, next) {
    try {
        const quizzes = await Quiz.find().populate('questions');
        res.json(quizzes);
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const { title, description = '', questions = [] } = req.body;
        const quiz = await Quiz.create({ title, description, questions });
        const populated = await Quiz.findById(quiz._id).populate('questions');
        res.status(201).json(populated);
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
        const quiz = await Quiz.findById(id).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Not found' });
        res.json(quiz);
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
        const { title, description, questions } = req.body;
        const update = {};
        if (typeof title !== 'undefined') update.title = title;
        if (typeof description !== 'undefined') update.description = description;
        if (Array.isArray(questions)) update.questions = questions;
        const quiz = await Quiz.findByIdAndUpdate(id, update, { new: true, runValidators: true }).populate('questions');
        if (!quiz) return res.status(404).json({ message: 'Not found' });
        res.json(quiz);
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ message: 'Not found' });
        const questionIds = (quiz.questions || []).map(q => q.toString());
        await Quiz.findByIdAndDelete(id);
        if (questionIds.length > 0) await Question.deleteMany({ _id: { $in: questionIds } });
        res.json({ success: true, removedQuestions: questionIds });
    } catch (err) {
        next(err);
    }
}

async function populateCapital(req, res, next) {
    try {
        const { id } = req.params;
        const quiz = await Quiz.findById(id).populate({
            path: 'questions',
            match: { $or: [{ keywords: { $in: ['capital'] } }, { text: /capital/i }] },
        });
        if (!quiz) return res.status(404).json({ message: 'Not found' });
        res.json({ success: true, data: quiz });
    } catch (err) {
        next(err);
    }
}

async function addSingleQuestion(req, res, next) {
    try {
        const { id } = req.params;
        const created = await Question.create(req.body);
        const quiz = await Quiz.findByIdAndUpdate(
            id,
            { $push: { questions: created._id } },
            { new: true }
        ).populate('questions');
        if (!quiz) {
            await Question.findByIdAndDelete(created._id);
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(201).json({ success: true, question: created, quiz });
    } catch (err) {
        next(err);
    }
}

async function addMultipleQuestions(req, res, next) {
    try {
        const { id } = req.params;
        const items = req.body;
        if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Body must be non-empty array' });
        const created = await Question.insertMany(items);
        const ids = created.map(q => q._id);
        const quiz = await Quiz.findByIdAndUpdate(
            id,
            { $push: { questions: { $each: ids } } },
            { new: true }
        ).populate('questions');
        if (!quiz) {
            await Question.deleteMany({ _id: { $in: ids } });
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(201).json({ success: true, created, quiz });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    list,
    create,
    getById,
    update,
    remove,
    populateCapital,
    addSingleQuestion,
    addMultipleQuestions,
};


