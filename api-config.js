const axios = require('axios');

// Cấu hình base URL - Backend API
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Tạo axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// API functions
const apiConfig = {
  // Quiz Management
  quizzes: {
    // Lấy tất cả quiz
    getAll: async () => {
      try {
        const response = await api.get('/quizzes');
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách quiz: ${error.message}`);
      }
    },

    // Tạo quiz mới
    create: async (quizData) => {
      try {
        const response = await api.post('/quizzes', quizData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi tạo quiz: ${error.message}`);
      }
    },

    // Lấy quiz theo ID
    getById: async (id) => {
      try {
        const response = await api.get(`/quizzes/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy quiz: ${error.message}`);
      }
    },

    // Cập nhật quiz
    update: async (id, quizData) => {
      try {
        const response = await api.put(`/quizzes/${id}`, quizData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi cập nhật quiz: ${error.message}`);
      }
    },

    // Xóa quiz
    delete: async (id) => {
      try {
        const response = await api.delete(`/quizzes/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi xóa quiz: ${error.message}`);
      }
    },

    // Thêm 1 question vào quiz
    addQuestion: async (quizId, questionData) => {
      try {
        const response = await api.post(`/quizzes/${quizId}/question`, questionData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi thêm question vào quiz: ${error.message}`);
      }
    },

    // Thêm nhiều questions vào quiz
    addQuestions: async (quizId, questionsData) => {
      try {
        const response = await api.post(`/quizzes/${quizId}/questions`, questionsData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi thêm questions vào quiz: ${error.message}`);
      }
    },

    // Lấy quiz với questions chứa keyword "capital"
    getWithCapitalQuestions: async (quizId) => {
      try {
        const response = await api.get(`/quizzes/${quizId}/populate`);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy quiz với capital questions: ${error.message}`);
      }
    }
  },

  // Question Management
  questions: {
    // Lấy tất cả questions
    getAll: async () => {
      try {
        const response = await api.get('/questions');
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy danh sách questions: ${error.message}`);
      }
    },

    // Tạo question mới
    create: async (questionData) => {
      try {
        const response = await api.post('/questions', questionData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi tạo question: ${error.message}`);
      }
    },

    // Lấy question theo ID
    getById: async (id) => {
      try {
        const response = await api.get(`/questions/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy question: ${error.message}`);
      }
    },

    // Cập nhật question
    update: async (id, questionData) => {
      try {
        const response = await api.put(`/questions/${id}`, questionData);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi cập nhật question: ${error.message}`);
      }
    },

    // Xóa question
    delete: async (id) => {
      try {
        const response = await api.delete(`/questions/${id}`);
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi xóa question: ${error.message}`);
      }
    }
  },

  // API Info
  info: {
    // Lấy thông tin API
    getApiInfo: async () => {
      try {
        const response = await api.get('/api/info');
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi lấy thông tin API: ${error.message}`);
      }
    },

    // Health check
    healthCheck: async () => {
      try {
        const response = await api.get('/health');
        return response.data;
      } catch (error) {
        throw new Error(`Lỗi khi kiểm tra health: ${error.message}`);
      }
    }
  }
};

// Examples - Các ví dụ sử dụng
const examples = {
  // Ví dụ tạo quiz với questions
  createQuizWithQuestions: async () => {
    try {
      // Tạo quiz mới
      const quiz = await apiConfig.quizzes.create({
        title: 'Quiz về Thủ đô các nước',
        description: 'Test kiến thức về thủ đô của các quốc gia',
        questions: []
      });

      console.log('Quiz đã tạo:', quiz);

      // Thêm questions vào quiz
      const questions = [
        {
          text: 'Thủ đô của Việt Nam là gì?',
          options: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Huế'],
          correctAnswerIndex: 0,
          keywords: ['capital', 'vietnam', 'hanoi']
        },
        {
          text: 'Thủ đô của Pháp là gì?',
          options: ['Lyon', 'Paris', 'Marseille', 'Toulouse'],
          correctAnswerIndex: 1,
          keywords: ['capital', 'france', 'paris']
        },
        {
          text: 'Thủ đô của Nhật Bản là gì?',
          options: ['Osaka', 'Tokyo', 'Kyoto', 'Hiroshima'],
          correctAnswerIndex: 1,
          keywords: ['capital', 'japan', 'tokyo']
        }
      ];

      const result = await apiConfig.quizzes.addQuestions(quiz._id, questions);
      console.log('Questions đã thêm:', result);

      return result;
    } catch (error) {
      console.error('Lỗi:', error.message);
    }
  },

  // Ví dụ lấy tất cả quiz
  getAllQuizzes: async () => {
    try {
      const quizzes = await apiConfig.quizzes.getAll();
      console.log('Danh sách quiz:', quizzes);
      return quizzes;
    } catch (error) {
      console.error('Lỗi:', error.message);
    }
  },

  // Ví dụ tạo question đơn lẻ
  createQuestion: async () => {
    try {
      const question = await apiConfig.questions.create({
        text: 'Thủ đô của Thái Lan là gì?',
        options: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
        correctAnswerIndex: 0,
        keywords: ['capital', 'thailand', 'bangkok']
      });
      console.log('Question đã tạo:', question);
      return question;
    } catch (error) {
      console.error('Lỗi:', error.message);
    }
  }
};

module.exports = {
  apiConfig,
  examples,
  api, // Export axios instance để sử dụng trực tiếp nếu cần
  BASE_URL
};
