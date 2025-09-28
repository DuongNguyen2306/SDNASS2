const axios = require('axios');
const Question = require('../models/Question');

const api = axios.create({ baseURL: process.env.API_BASE_URL || 'http://localhost:3000' });

async function list(req, res, next) {
    try {
        console.log('🔍 Fetching questions from API...');
        const { data } = await api.get('/questions');
        console.log('📡 API response data:', JSON.stringify(data, null, 2));
        
        // Xử lý response format từ backend
        const questions = data.success ? data.data : data;
        console.log('📋 Processed questions for rendering:', JSON.stringify(questions, null, 2));
        console.log('📊 Questions count:', Array.isArray(questions) ? questions.length : 'Not an array');
        
        res.render('questions/list', { title: 'Questions', questions: questions });
    } catch (err) {
        console.error('❌ Error fetching questions:', err);
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
        // Xử lý response format từ backend
        const question = data.success ? data.data : data;
        res.render('questions/details', { title: 'Question Detail', question: question });
    } catch (err) {
        next(err);
    }
}

async function showEditForm(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/questions/${id}`);
        // Xử lý response format từ backend
        const question = data.success ? data.data : data;
        res.render('questions/edit', { title: 'Edit Question', question: question });
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
