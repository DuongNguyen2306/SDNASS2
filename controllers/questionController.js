const axios = require('axios');
const Question = require('../models/Question');

const api = axios.create({ baseURL: process.env.API_BASE_URL || 'http://localhost:3000' });

async function list(req, res, next) {
    try {
        const { data } = await api.get('/questions');
        res.render('questions/list', { title: 'Questions', questions: data });
    } catch (err) {
        res.render('questions/list', { title: 'Questions', questions: [], error: 'API error: ' + parseAxiosError(err) });
    }
}

async function showCreateForm(req, res) {
    res.render('questions/form', { title: 'Create Question', mode: 'create', question: { text: '', options: ['', '', '', ''], keywords: [], correctAnswerIndex: 0 } });
}

async function create(req, res, next) {
    try {
        const payload = normalizeQuestionPayload(req.body);
        await api.post('/questions', payload);
        res.redirect('/questions');
    } catch (err) {
        next(err);
    }
}

async function detail(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/questions/${id}`);
        res.render('questions/detail', { title: 'Question Detail', question: data });
    } catch (err) {
        next(err);
    }
}

async function showEditForm(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/questions/${id}`);
        res.render('questions/form', { title: 'Edit Question', mode: 'edit', question: data });
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const { id } = req.params;
        const payload = normalizeQuestionPayload(req.body);
        await api.put(`/questions/${id}`, payload);
        res.redirect('/questions');
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;
        await api.delete(`/questions/${id}`);
        res.redirect('/questions');
    } catch (err) {
        next(err);
    }
}

function normalizeQuestionPayload(body) {
    const text = body.text || '';
    let options = body.options;
    if (typeof options === 'string') {
        options = body.options.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (Array.isArray(options)) {
        options = options.map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
    } else {
        options = [];
    }
    let keywords = body.keywords || [];
    if (typeof keywords === 'string') {
        keywords = keywords.split(',').map(s => s.trim()).filter(Boolean);
    }
    const correctAnswerIndex = Number(body.correctAnswerIndex || 0);
    return { text, options, keywords, correctAnswerIndex };
}

function parseAxiosError(err) {
    if (err && err.response && err.response.data && err.response.data.message) return err.response.data.message;
    if (err && err.message) return err.message;
    return 'Unknown error';
}

module.exports = {
    list,
    showCreateForm,
    create,
    detail,
    showEditForm,
    update,
    remove,
};
