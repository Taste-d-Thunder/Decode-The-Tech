export function evaluateSubmission(questions, submissionAnswers) {
  let score = 0;
  let maxScore = 0;
  const evaluatedAnswers = {};

  for (const question of questions) {
    maxScore += question.marks;
    const submittedAnswer = submissionAnswers[question.id];
    
    let isCorrect = false;
    let awardedMarks = 0;

    try {
      const correctAnsParsed = JSON.parse(question.correctAnswer);
      
      if (submittedAnswer !== undefined && submittedAnswer !== null) {
        switch (question.type) {
          case 'MCQ':
            // correctAnsParsed is an array of correct options
            // submittedAnswer is an array of selected options
            if (Array.isArray(submittedAnswer) && Array.isArray(correctAnsParsed)) {
              if (submittedAnswer.length === correctAnsParsed.length && 
                  submittedAnswer.every(val => correctAnsParsed.includes(val))) {
                isCorrect = true;
              }
            }
            break;
            
          case 'TRUE_FALSE':
            // correctAnsParsed is an array with one string 'True' or 'False'
            // submittedAnswer is a string 'True' or 'False'
            if (Array.isArray(correctAnsParsed) && submittedAnswer === correctAnsParsed[0]) {
              isCorrect = true;
            }
            break;
            
          case 'SHORT_ANSWER':
            // correctAnsParsed is an array of acceptable answers
            if (Array.isArray(correctAnsParsed) && typeof submittedAnswer === 'string') {
              const lowerSub = submittedAnswer.trim().toLowerCase();
              if (correctAnsParsed.some(ans => ans.toLowerCase() === lowerSub)) {
                isCorrect = true;
              }
            }
            break;
            
          case 'MATCH':
          case 'ORDERING':
            // Exact JSON string match after sorting or comparing structures
            // For simplicity, we compare stringified versions of arrays/objects
            if (JSON.stringify(submittedAnswer) === JSON.stringify(correctAnsParsed)) {
              isCorrect = true;
            }
            break;
            
          case 'IMAGE':
             if (Array.isArray(submittedAnswer) && Array.isArray(correctAnsParsed)) {
              if (submittedAnswer.length === correctAnsParsed.length && 
                  submittedAnswer.every(val => correctAnsParsed.includes(val))) {
                isCorrect = true;
              }
            }
            break;
        }
      }

      if (isCorrect) {
        awardedMarks = question.marks;
      } else if (submittedAnswer !== undefined && submittedAnswer !== null && submittedAnswer !== "" && (!Array.isArray(submittedAnswer) || submittedAnswer.length > 0)) {
        awardedMarks = -question.negativeMarks;
      }
      
    } catch (e) {
      console.error(`Evaluation error for question ${question.id}:`, e);
    }

    score += awardedMarks;
    evaluatedAnswers[question.id] = {
      submitted: submittedAnswer,
      isCorrect,
      marks: awardedMarks
    };
  }

  return {
    score,
    maxScore,
    evaluatedAnswers
  };
}
