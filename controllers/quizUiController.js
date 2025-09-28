const axios = require('axios');

const api = axios.create({ baseURL: process.env.API_BASE_URL });

async function list(req, res, next) {
    try {
        const { data } = await api.get('/quizzes');
        // Xử lý response format từ backend
        const quizzes = data.success ? data.data : data;
        res.render('quiz/list', { title: 'Quizzes', quizzes: quizzes });
    } catch (err) {
        res.render('quiz/list', { title: 'Quizzes', quizzes: [], error: parseAxiosError(err) });
    }
}

async function showCreateForm(req, res) {
    res.render('quiz/create', { title: 'Create Quiz', quiz: { title: '', description: '', questions: [] } });
}

async function create(req, res, next) {
    try {
        const payload = buildQuizPayloadFromForm(req.body);
        await api.post('/quizzes', payload);
        res.redirect('/quizzes');
    } catch (err) {
        res.render('quizzes/form', { title: 'Create Quiz', mode: 'create', quiz: req.body, error: parseAxiosError(err) });
    }
}

async function detail(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/quizzes/${id}`);
        res.render('quizzes/detail', { title: 'Quiz Detail', quiz: data });
    } catch (err) {
        res.render('quizzes/detail', { title: 'Quiz Detail', quiz: null, error: parseAxiosError(err) });
    }
}

async function showEditForm(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/quizzes/${id}`);
        res.render('quizzes/form', { title: 'Edit Quiz', mode: 'edit', quiz: data });
    } catch (err) {
        res.render('quizzes/form', { title: 'Edit Quiz', mode: 'edit', quiz: { _id: id, ...req.body }, error: parseAxiosError(err) });
    }
}

async function update(req, res, next) {
    const quizId = req.params.id;
    try {
        const payload = buildQuizPayloadFromForm(req.body);
        await api.put(`/quizzes/${quizId}`, payload);
        res.redirect('/quizzes');
    } catch (err) {
        res.render('quizzes/form', { title: 'Edit Quiz', mode: 'edit', quiz: { _id: quizId, ...req.body }, error: parseAxiosError(err) });
    }
}

async function remove(req, res, next) {
    try {
        const { id } = req.params;
        await api.delete(`/quizzes/${id}`);
        res.redirect('/quizzes');
    } catch (err) {
        res.render('quizzes/detail', { title: 'Quiz (capital questions)', quiz: null, error: parseAxiosError(err) });
    }
}

async function showAddSingleQuestionForm(req, res) {
    const { id } = req.params;
    res.render('quizzes/add-question', {
        title: 'Add Question to Quiz',
        quizId: id,
        question: { text: '', options: ['Paris', 'London', 'Rome', 'Berlin'], keywords: ['capital'], correctAnswerIndex: 0 }
    });
}

async function addSingleQuestion(req, res) {
    const { id } = req.params;
    try {
        const payload = normalizeQuestionPayload(req.body);
        await api.post(`/quizzes/${id}/question`, payload);
        res.redirect(`/quizzes/${id}`);
    } catch (err) {
        res.render('quizzes/add-question', {
            title: 'Add Question to Quiz',
            quizId: id,
            question: req.body,
            error: parseAxiosError(err)
        });
    }
}

async function showAddMultipleQuestionsForm(req, res) {
    const { id } = req.params;
    const example = JSON.stringify([
        { text: 'What is the capital of France?', options: ['Paris','Rome','Berlin','Madrid'], keywords: ['capital','France'], correctAnswerIndex: 0 },
        { text: 'What is the capital of Italy?', options: ['Milan','Rome','Venice','Turin'], keywords: ['capital','Italy'], correctAnswerIndex: 1 }
    ], null, 2);
    res.render('quizzes/add-questions', { title: 'Add Multiple Questions', quizId: id, jsonText: example });
}

async function addMultipleQuestions(req, res) {
    const { id } = req.params;
    const jsonText = req.body.jsonText || '[]';
    try {
        const parsed = JSON.parse(jsonText);
        await api.post(`/quizzes/${id}/questions`, parsed);
        res.redirect(`/quizzes/${id}`);
    } catch (err) {
        const error = err instanceof SyntaxError ? 'JSON không hợp lệ. Hãy kiểm tra lại.' : parseAxiosError(err);
        res.render('quizzes/add-questions', { title: 'Add Multiple Questions', quizId: id, jsonText, error });
    }
}

function normalizeQuestionPayload(body) {
    const text = body.text || '';
    let options = body.options;
    if (typeof options === 'string') {
        options = body.options.split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(options)) options = [];
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

async function populate(req, res, next) {
    try {
        const { id } = req.params;
        const { data } = await api.get(`/quizzes/${id}/populate`);
        res.render('quizzes/detail', { title: 'Quiz (capital questions)', quiz: data.data || data });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    list,
    showCreateForm,
    create,
    detail,
    showEditForm,
    update,
    remove,
    populate,
    showAddSingleQuestionForm,
    addSingleQuestion,
    showAddMultipleQuestionsForm,
    addMultipleQuestions,
};

function buildQuizPayloadFromForm(body) {
    const title = body.title || '';
    const description = body.description || '';
    let questionIds = [];
    if (body.questionIds && typeof body.questionIds === 'string') {
        // Keep only valid 24-hex ObjectIds; ignore pasted JSON or invalid tokens
        questionIds = body.questionIds
            .split(',')
            .map(s => s.trim())
            .filter(s => /^[a-fA-F0-9]{24}$/.test(s));
    }
    return { title, description, questions: questionIds };
}


