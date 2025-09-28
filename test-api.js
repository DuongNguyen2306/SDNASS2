const { apiConfig, examples } = require('./api-config');

// Colors cho console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAPI() {
  log('\n🚀 Bắt đầu test API...', 'blue');
  
  try {
    // Test 1: Health check
    log('\n1. Testing Health Check...', 'yellow');
    const health = await apiConfig.info.healthCheck();
    log(`✅ Health check: ${health.data?.status || health.status || 'OK'}`, 'green');
    
    // Test 2: API Info
    log('\n2. Testing API Info...', 'yellow');
    const info = await apiConfig.info.getApiInfo();
    log(`✅ API Info: ${info.data?.name || info.name || 'API'} v${info.data?.version || info.version || '1.0.0'}`, 'green');
    
    // Test 3: Tạo quiz
    log('\n3. Testing Create Quiz...', 'yellow');
    const quiz = await apiConfig.quizzes.create({
      title: 'Test Quiz - ' + new Date().toISOString(),
      description: 'Quiz được tạo bởi test script',
      questions: []
    });
    log(`✅ Quiz đã tạo: ${quiz.title} (ID: ${quiz._id})`, 'green');
    
    // Test 4: Tạo questions
    log('\n4. Testing Create Questions...', 'yellow');
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
    
    const createdQuestions = await apiConfig.quizzes.addQuestions(quiz._id, questions);
    log(`✅ Đã thêm ${createdQuestions.created.length} questions vào quiz`, 'green');
    
    // Test 5: Lấy quiz với questions
    log('\n5. Testing Get Quiz with Questions...', 'yellow');
    const quizWithQuestions = await apiConfig.quizzes.getById(quiz._id);
    log(`✅ Quiz có ${quizWithQuestions.questions.length} questions`, 'green');
    
    // Test 6: Tìm questions chứa keyword "capital"
    log('\n6. Testing Search Capital Questions...', 'yellow');
    const capitalQuestions = await apiConfig.quizzes.getWithCapitalQuestions(quiz._id);
    log(`✅ Tìm thấy ${capitalQuestions.data.questions.length} questions về thủ đô`, 'green');
    
    // Test 7: Cập nhật quiz
    log('\n7. Testing Update Quiz...', 'yellow');
    const updatedQuiz = await apiConfig.quizzes.update(quiz._id, {
      title: 'Updated Test Quiz - ' + new Date().toISOString(),
      description: 'Quiz đã được cập nhật'
    });
    log(`✅ Quiz đã cập nhật: ${updatedQuiz.title}`, 'green');
    
    // Test 8: Lấy tất cả quiz
    log('\n8. Testing Get All Quizzes...', 'yellow');
    const allQuizzes = await apiConfig.quizzes.getAll();
    log(`✅ Tổng cộng có ${allQuizzes.length} quiz`, 'green');
    
    // Test 9: Lấy tất cả questions
    log('\n9. Testing Get All Questions...', 'yellow');
    const allQuestions = await apiConfig.questions.getAll();
    log(`✅ Tổng cộng có ${allQuestions.length} questions`, 'green');
    
    // Test 10: Xóa quiz (cleanup)
    log('\n10. Testing Delete Quiz (Cleanup)...', 'yellow');
    const deleteResult = await apiConfig.quizzes.delete(quiz._id);
    log(`✅ Quiz đã xóa, removed ${deleteResult.removedQuestions.length} questions`, 'green');
    
    log('\n🎉 Tất cả tests đã hoàn thành thành công!', 'green');
    
  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error('Chi tiết lỗi:', error);
  }
}

// Chạy test
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
