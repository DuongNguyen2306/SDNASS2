# 🚀 Hướng dẫn sử dụng API - Question Bank Management

## 📋 Tổng quan
API này cung cấp các chức năng quản lý quiz và câu hỏi cho hệ thống Question Bank Management.

### Base URL
```
http://localhost:3000
```

## 🔧 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env` từ file `env.example`:
```bash
cp env.example .env
```

Nội dung file `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=SimpleQuiz
API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Chạy server
```bash
# Chạy production
npm start

# Chạy development (với nodemon)
npm run dev
```

## 📚 API Endpoints

### 1. Thông tin API
- **GET** `/api/info` - Lấy thông tin API và danh sách endpoints
- **GET** `/health` - Health check

### 2. Quiz Management
- **GET** `/api/quizzes` - Lấy danh sách tất cả quiz
- **POST** `/api/quizzes` - Tạo quiz mới
- **GET** `/api/quizzes/:id` - Lấy quiz theo ID
- **PUT** `/api/quizzes/:id` - Cập nhật quiz
- **DELETE** `/api/quizzes/:id` - Xóa quiz và tất cả questions liên quan

### 3. Question Management
- **GET** `/api/questions` - Lấy danh sách tất cả questions
- **POST** `/api/questions` - Tạo question mới
- **GET** `/api/questions/:id` - Lấy question theo ID
- **PUT** `/api/questions/:id` - Cập nhật question
- **DELETE** `/api/questions/:id` - Xóa question và remove khỏi quiz

### 4. Quiz-Question Operations
- **POST** `/api/quizzes/:id/question` - Thêm 1 question vào quiz
- **POST** `/api/quizzes/:id/questions` - Thêm nhiều questions vào quiz
- **GET** `/api/quizzes/:id/populate` - Lấy quiz với questions chứa keyword "capital"

## 💻 Cách sử dụng

### 1. Sử dụng api-config.js (Khuyến nghị)

```javascript
const { apiConfig, examples } = require('./api-config');

// Lấy tất cả quiz
async function getAllQuizzes() {
  try {
    const quizzes = await apiConfig.quizzes.getAll();
    console.log('Danh sách quiz:', quizzes);
    return quizzes;
  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}

// Tạo quiz mới
async function createNewQuiz() {
  try {
    const quiz = await apiConfig.quizzes.create({
      title: 'Quiz về Thủ đô các nước',
      description: 'Test kiến thức về thủ đô của các quốc gia',
      questions: []
    });
    console.log('Quiz đã tạo:', quiz);
    return quiz;
  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}

// Tạo question mới
async function createNewQuestion() {
  try {
    const question = await apiConfig.questions.create({
      text: 'Thủ đô của Việt Nam là gì?',
      options: ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Huế'],
      correctAnswerIndex: 0,
      keywords: ['capital', 'vietnam', 'hanoi']
    });
    console.log('Question đã tạo:', question);
    return question;
  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}

// Chạy ví dụ
examples.createQuizWithQuestions();
```

### 2. Sử dụng Fetch API

```javascript
// Lấy danh sách quiz
async function getQuizzes() {
  try {
    const response = await fetch('http://localhost:3000/api/quizzes');
    const data = await response.json();
    console.log('Danh sách quiz:', data);
    return data;
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Tạo quiz mới
async function createQuiz() {
  try {
    const response = await fetch('http://localhost:3000/api/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'My Quiz',
        description: 'Quiz description',
        questions: []
      })
    });
    const data = await response.json();
    console.log('Quiz đã tạo:', data);
    return data;
  } catch (error) {
    console.error('Lỗi:', error);
  }
}

// Tạo question mới
async function createQuestion() {
  try {
    const response = await fetch('http://localhost:3000/api/questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'What is the capital of France?',
        options: ['Paris', 'Lyon', 'Marseille', 'Toulouse'],
        correctAnswerIndex: 0,
        keywords: ['capital', 'france', 'paris']
      })
    });
    const data = await response.json();
    console.log('Question đã tạo:', data);
    return data;
  } catch (error) {
    console.error('Lỗi:', error);
  }
}
```

### 3. Sử dụng Axios

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Lấy danh sách quiz
const getQuizzes = () => api.get('/api/quizzes');

// Tạo quiz
const createQuiz = (quizData) => api.post('/api/quizzes', quizData);

// Tạo question
const createQuestion = (questionData) => api.post('/api/questions', questionData);

// Sử dụng
async function example() {
  try {
    const quizzes = await getQuizzes();
    console.log('Quizzes:', quizzes.data);
  } catch (error) {
    console.error('Lỗi:', error.message);
  }
}
```

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## 🎯 Ví dụ chi tiết

### 1. Tạo quiz hoàn chỉnh với questions

```javascript
const { apiConfig } = require('./api-config');

async function createCompleteQuiz() {
  try {
    // Bước 1: Tạo quiz
    const quiz = await apiConfig.quizzes.create({
      title: 'Quiz về Địa lý Thế giới',
      description: 'Test kiến thức về địa lý các quốc gia',
      questions: []
    });
    console.log('✅ Quiz đã tạo:', quiz.title);

    // Bước 2: Tạo questions
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
      },
      {
        text: 'Thủ đô của Thái Lan là gì?',
        options: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'],
        correctAnswerIndex: 0,
        keywords: ['capital', 'thailand', 'bangkok']
      }
    ];

    // Bước 3: Thêm questions vào quiz
    const result = await apiConfig.quizzes.addQuestions(quiz._id, questions);
    console.log('✅ Questions đã thêm:', result.created.length);

    // Bước 4: Lấy quiz với questions đã populate
    const finalQuiz = await apiConfig.quizzes.getById(quiz._id);
    console.log('✅ Quiz hoàn chỉnh:', finalQuiz);

    return finalQuiz;
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Chạy ví dụ
createCompleteQuiz();
```

### 2. Quản lý questions

```javascript
const { apiConfig } = require('./api-config');

async function manageQuestions() {
  try {
    // Lấy tất cả questions
    const allQuestions = await apiConfig.questions.getAll();
    console.log('📋 Tất cả questions:', allQuestions.length);

    // Tạo question mới
    const newQuestion = await apiConfig.questions.create({
      text: 'Thủ đô của Hàn Quốc là gì?',
      options: ['Seoul', 'Busan', 'Incheon', 'Daegu'],
      correctAnswerIndex: 0,
      keywords: ['capital', 'korea', 'seoul']
    });
    console.log('✅ Question mới:', newQuestion.text);

    // Cập nhật question
    const updatedQuestion = await apiConfig.questions.update(newQuestion._id, {
      text: 'Thủ đô của Hàn Quốc là thành phố nào?',
      keywords: ['capital', 'korea', 'seoul', 'south korea']
    });
    console.log('✅ Question đã cập nhật:', updatedQuestion.text);

    // Xóa question
    await apiConfig.questions.delete(newQuestion._id);
    console.log('✅ Question đã xóa');

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Chạy ví dụ
manageQuestions();
```

### 3. Tìm kiếm questions theo keyword

```javascript
const { apiConfig } = require('./api-config');

async function searchCapitalQuestions() {
  try {
    // Lấy tất cả quiz
    const quizzes = await apiConfig.quizzes.getAll();
    
    for (const quiz of quizzes) {
      // Lấy quiz với questions chứa keyword "capital"
      const quizWithCapital = await apiConfig.quizzes.getWithCapitalQuestions(quiz._id);
      
      if (quizWithCapital.data.questions.length > 0) {
        console.log(`🏛️ Quiz "${quiz.title}" có ${quizWithCapital.data.questions.length} câu hỏi về thủ đô:`);
        quizWithCapital.data.questions.forEach((q, index) => {
          console.log(`  ${index + 1}. ${q.text}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  }
}

// Chạy ví dụ
searchCapitalQuestions();
```

## 🔍 Testing API

### 1. Test với Postman
Import file `postman_collection.json` vào Postman để test các endpoints.

### 2. Test với curl

```bash
# Health check
curl http://localhost:3000/health

# Lấy thông tin API
curl http://localhost:3000/api/info

# Lấy tất cả quiz
curl http://localhost:3000/api/quizzes

# Tạo quiz mới
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Quiz","description":"Test Description","questions":[]}'
```

### 3. Test với Node.js

```javascript
const { apiConfig, examples } = require('./api-config');

async function testAPI() {
  try {
    console.log('🔍 Testing API...');
    
    // Test health check
    const health = await apiConfig.info.healthCheck();
    console.log('✅ Health check:', health.data.status);
    
    // Test API info
    const info = await apiConfig.info.getApiInfo();
    console.log('✅ API Info:', info.data.name);
    
    // Test tạo quiz với questions
    await examples.createQuizWithQuestions();
    
    console.log('✅ Tất cả tests đã hoàn thành!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
```

## 🚨 Xử lý lỗi

### Common Errors

1. **Connection Error**
   ```javascript
   // Kiểm tra server có chạy không
   const health = await apiConfig.info.healthCheck();
   ```

2. **Validation Error**
   ```javascript
   try {
     await apiConfig.questions.create({
       text: '', // Empty text sẽ gây lỗi
       options: ['A', 'B'],
       correctAnswerIndex: 0
     });
   } catch (error) {
     console.error('Validation error:', error.message);
   }
   ```

3. **Not Found Error**
   ```javascript
   try {
     await apiConfig.quizzes.getById('invalid-id');
   } catch (error) {
     console.error('Not found:', error.message);
   }
   ```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Server có đang chạy không (`http://localhost:3000/health`)
2. MongoDB có kết nối được không
3. Các dependencies đã được cài đặt chưa (`npm install`)
4. File `.env` đã được tạo chưa

## 🎉 Kết luận

API này cung cấp đầy đủ các chức năng để quản lý quiz và questions. Bạn có thể sử dụng `api-config.js` để dễ dàng tích hợp vào project của mình, hoặc sử dụng trực tiếp các HTTP requests.

Chúc bạn code vui vẻ! 🚀
Chúc bạn sử dụng API thành công! 🎉