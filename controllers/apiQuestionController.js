const mongoose = require('mongoose');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');

async function list(req, res, next) {
    try {
        const items = await Question.find({}).lean();
        res.json(items);
    } catch (err) {
        next(err);
    }
}

async function create(req, res, next) {
    try {
        const { text, options, keywords, correctAnswerIndex } = req.body;
        if (!text || !Array.isArray(options) || typeof Number(correctAnswerIndex) !== 'number') {
            return res.status(400).json({ message: 'Invalid question payload' });
        }
        const question = await Question.create({ text, options, keywords, correctAnswerIndex: Number(correctAnswerIndex) });
        res.status(201).json(question);
    } catch (err) {
        next(err);
    }
}

async function getById(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
        const doc = await Question.findById(id);
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
        const { text, options, keywords, correctAnswerIndex } = req.body;
        const update = {};
        if (typeof text !== 'undefined') update.text = text;
        if (typeof options !== 'undefined') update.options = options;
        if (typeof keywords !== 'undefined') update.keywords = keywords;
        if (typeof correctAnswerIndex !== 'undefined') update.correctAnswerIndex = Number(correctAnswerIndex);
        const doc = await Question.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        if (!doc) return res.status(404).json({ message: 'Not found' });
        res.json(doc);
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid id' });
        const deleted = await Question.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Not found' });
        await Quiz.updateMany({ questions: id }, { $pull: { questions: id } });
        res.json({ success: true });
    } catch (err) {
        next(err);
    }
}

module.exports = { list, create, getById, update, remove };


