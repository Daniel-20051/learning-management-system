# Exam System API Endpoints Reference

## Quick Reference Table

| Method | Endpoint | Purpose | Frontend Method |
|--------|----------|---------|-----------------|
| GET | `/api/exams/bank/questions` | Get questions from bank | `GetBankQuestions()` |
| GET | `/api/exams/:examId/attempts` | Get all exam attempts | `GetExamAttempts()` |
| GET | `/api/exams/attempts/:attemptId/grade` | Get attempt for grading | `GetAttemptForGrading()` |
| POST | `/api/exams/answers/theory/:answerId/grade` | Grade single theory answer | `GradeTheoryAnswer()` |
| POST | `/api/exams/attempts/:attemptId/grade-bulk` | Bulk grade theory answers | `BulkGradeTheoryAnswers()` |
| GET | `/api/exams/:examId/statistics` | Get exam statistics | `GetExamStatistics()` |

---

## Detailed API Specifications

### 1️⃣ Get Bank Questions for Exam Creation

**Endpoint**: `GET /api/exams/bank/questions`

**Query Parameters**:
```
course_id: number (required) - The ID of the course
question_type: string (optional) - Filter by type: "objective" or "theory"
limit: number (optional) - Maximum questions to return (default: 50)
```

**Example Request**:
```
GET /api/exams/bank/questions?course_id=1&question_type=objective&limit=50
Authorization: Bearer <token>
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "question_text": "What is React?",
      "question_type": "multiple_choice",
      "points": 2,
      "options": [
        {
          "id": 1,
          "option_text": "A JavaScript library",
          "is_correct": true
        },
        {
          "id": 2,
          "option_text": "A programming language",
          "is_correct": false
        }
      ]
    }
  ]
}
```

**Frontend Usage**:
```typescript
const questions = await api.GetBankQuestions(courseId, "objective", 50);
```

---

### 2️⃣ Get All Attempts for Exam

**Endpoint**: `GET /api/exams/:examId/attempts`

**Path Parameters**:
- `examId` (number) - The exam ID

**Query Parameters**:
```
status: string (optional) - Filter by status: "submitted", "graded", "in_progress"
```

**Example Request**:
```
GET /api/exams/1/attempts?status=submitted
Authorization: Bearer <token>
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "exam_id": 1,
      "student_id": 50,
      "student_name": "John Doe",
      "student_email": "john@example.com",
      "status": "submitted",
      "score": 85,
      "max_score": 100,
      "started_at": "2024-01-15T10:00:00Z",
      "submitted_at": "2024-01-15T11:30:00Z",
      "graded_at": null
    }
  ]
}
```

**Frontend Usage**:
```typescript
const attempts = await api.GetExamAttempts(examId, "submitted");
```

---

### 3️⃣ Get Attempt for Grading

**Endpoint**: `GET /api/exams/attempts/:attemptId/grade`

**Path Parameters**:
- `attemptId` (number) - The attempt ID

**Example Request**:
```
GET /api/exams/attempts/101/grade
Authorization: Bearer <token>
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": 101,
    "student_name": "John Doe",
    "answers": [
      {
        "id": 1001,
        "question_id": 1,
        "question_text": "What is React?",
        "question_type": "multiple_choice",
        "points": 2,
        "selected_options": [
          {
            "id": 1,
            "option_text": "A JavaScript library",
            "is_correct": true
          }
        ],
        "is_correct": true,
        "score": 2
      },
      {
        "id": 1002,
        "question_id": 2,
        "question_text": "Explain hooks in React",
        "question_type": "essay",
        "points": 10,
        "student_answer": "Hooks are functions that let you use state...",
        "score": null,
        "feedback": null
      }
    ]
  }
}
```

**Frontend Usage**:
```typescript
const attemptData = await api.GetAttemptForGrading(attemptId);
```

---

### 4️⃣ Grade Single Theory Answer

**Endpoint**: `POST /api/exams/answers/theory/:answerId/grade`

**Path Parameters**:
- `answerId` (number) - The answer ID to grade

**Request Body**:
```json
{
  "score": 8,
  "feedback": "Good answer, but could include more details about useEffect"
}
```

**Example Request**:
```
POST /api/exams/answers/theory/1002/grade
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 8,
  "feedback": "Good answer"
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "Answer graded successfully",
  "data": {
    "answer_id": 1002,
    "score": 8,
    "feedback": "Good answer"
  }
}
```

**Frontend Usage**:
```typescript
await api.GradeTheoryAnswer(answerId, 8, "Good answer");
```

---

### 5️⃣ Bulk Grade Theory Answers

**Endpoint**: `POST /api/exams/attempts/:attemptId/grade-bulk`

**Path Parameters**:
- `attemptId` (number) - The attempt ID

**Request Body**:
```json
{
  "grades": [
    {
      "answer_id": 1002,
      "score": 8,
      "feedback": "Good answer, but could include more details"
    },
    {
      "answer_id": 1003,
      "score": 7,
      "feedback": "Nice explanation"
    }
  ]
}
```

**Example Request**:
```
POST /api/exams/attempts/101/grade-bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "grades": [...]
}
```

**Example Response**:
```json
{
  "success": true,
  "message": "All answers graded successfully",
  "data": {
    "graded_count": 2,
    "total_score": 15,
    "max_score": 20
  }
}
```

**Frontend Usage**:
```typescript
const grades = [
  { answer_id: 1, score: 8, feedback: "Good" },
  { answer_id: 2, score: 7, feedback: "Nice" }
];
await api.BulkGradeTheoryAnswers(attemptId, grades);
```

---

### 6️⃣ Get Exam Statistics

**Endpoint**: `GET /api/exams/:examId/statistics`

**Path Parameters**:
- `examId` (number) - The exam ID

**Example Request**:
```
GET /api/exams/1/statistics
Authorization: Bearer <token>
```

**Example Response**:
```json
{
  "exam_id": 1,
  "total_attempts": 0,
  "average_score": "0.00",
  "highest_score": 0,
  "lowest_score": 0
}
```

**With Data Example**:
```json
{
  "exam_id": 1,
  "total_attempts": 50,
  "average_score": "78.50",
  "highest_score": 95,
  "lowest_score": 45
}
```

**Frontend Usage**:
```typescript
const stats = await api.GetExamStatistics(examId);
console.log(`Average: ${stats.average_score}%`);
```

---

## 📊 Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/expired token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🔐 Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer <access_token>
```

The token is automatically included by the API class from cookies.

---

## 🧪 Testing with cURL

### Get Bank Questions
```bash
curl -X GET "https://lms-work.onrender.com/api/exams/bank/questions?course_id=1&limit=50" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Exam Attempts
```bash
curl -X GET "https://lms-work.onrender.com/api/exams/1/attempts?status=submitted" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Grade Bulk Answers
```bash
curl -X POST "https://lms-work.onrender.com/api/exams/attempts/101/grade-bulk" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "grades": [
      {"answer_id": 1, "score": 8, "feedback": "Good"},
      {"answer_id": 2, "score": 7, "feedback": "Nice"}
    ]
  }'
```

### Get Statistics
```bash
curl -X GET "https://lms-work.onrender.com/api/exams/1/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔄 Workflow Integration

### Complete Grading Workflow:
```typescript
// 1. Get all submitted attempts
const attempts = await api.GetExamAttempts(examId, "submitted");

// 2. Load specific attempt for grading
const attemptData = await api.GetAttemptForGrading(attempts[0].id);

// 3. Prepare grades for theory questions
const grades = attemptData.answers
  .filter(a => a.question_type === "essay" || a.question_type === "short_answer")
  .map(a => ({
    answer_id: a.id,
    score: calculateScore(a.student_answer), // Your logic
    feedback: generateFeedback(a.student_answer) // Your logic
  }));

// 4. Submit bulk grades
await api.BulkGradeTheoryAnswers(attempts[0].id, grades);

// 5. Get updated statistics
const stats = await api.GetExamStatistics(examId);
```

---

## 💡 Tips & Best Practices

1. **Pagination**: For large question banks, use the `limit` parameter
2. **Error Handling**: Always wrap API calls in try-catch blocks
3. **Loading States**: Show loading indicators during async operations
4. **Optimistic Updates**: Update UI optimistically before API response
5. **Caching**: Consider caching statistics that don't change frequently
6. **Validation**: Validate scores on frontend before submission (0 ≤ score ≤ max_points)
7. **Feedback**: Always provide helpful error messages to users

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Token expired, user needs to re-login

### Issue: 404 Not Found
**Solution**: Check if exam/attempt ID exists

### Issue: Validation Error
**Solution**: Ensure score is within valid range (0 to max points)

### Issue: Empty Response
**Solution**: Check if there are any questions/attempts in the database

---

## 📞 Support

For backend API issues, contact the backend team.
For frontend integration help, refer to the implementation in:
- `src/api/index.ts`
- `src/pages/admin/exams/AdminExamDetailsPage.tsx`
- `src/pages/admin/exams/components/GradingDialog.tsx`

