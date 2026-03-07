/**
 * QuizPlayer — interactive quiz component used within CoursePlayer
 * Renders questions by type, timer, submit, results with explanations
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useQuiz, type QuizResult } from '../../lib/education/useQuiz';

interface QuizPlayerProps {
  quizId: string;
  onComplete?: (passed: boolean, score: number) => void;
}

export default function QuizPlayer({ quizId, onComplete }: QuizPlayerProps) {
  const { quiz, loading, error, submitting, result, canRetake, submitAttempt, setResult } = useQuiz(quizId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (quiz?.time_limit_minutes && !result) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz?.time_limit_minutes, result]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || result) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, result]);

  // Auto-submit when timer runs out
  useEffect(() => {
    if (timeLeft === 0 && !result && quiz) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const handleSubmit = useCallback(async () => {
    const res = await submitAttempt(answers);
    if (res && onComplete) {
      onComplete(res.passed, res.score);
    }
  }, [answers, submitAttempt, onComplete]);

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    if (quiz?.time_limit_minutes) {
      setTimeLeft(quiz.time_limit_minutes * 60);
    }
  };

  const setAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 text-signal-warn mx-auto mb-3" />
        <p className="text-graphite/60 text-sm">{error || 'Quiz not found'}</p>
      </div>
    );
  }

  // Results view
  if (result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Score summary */}
        <div className={`p-6 rounded-xl text-center ${result.passed ? 'bg-signal-up/10' : 'bg-signal-down/10'}`}>
          <div className={`text-4xl font-bold mb-2 ${result.passed ? 'text-signal-up' : 'text-signal-down'}`}>
            {result.score}%
          </div>
          <p className={`font-semibold ${result.passed ? 'text-signal-up' : 'text-signal-down'}`}>
            {result.passed ? 'Passed' : 'Not Passed'}
          </p>
          <p className="text-sm text-graphite/60 mt-1">
            Passing score: {quiz.passing_score}%
          </p>
        </div>

        {/* Question results */}
        <div className="space-y-4">
          {result.questionResults.map((qr, i) => {
            const question = quiz.quiz_questions[i];
            return (
              <div key={qr.questionId} className="p-4 bg-mn-card rounded-xl border border-graphite/5">
                <div className="flex items-start gap-3">
                  {qr.correct ? (
                    <CheckCircle className="w-5 h-5 text-signal-up flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-signal-down flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-graphite">{question?.question_text}</p>
                    <p className="text-xs text-graphite/50 mt-1">
                      Your answer: <span className={qr.correct ? 'text-signal-up' : 'text-signal-down'}>{qr.userAnswer || '(no answer)'}</span>
                    </p>
                    {!qr.correct && (
                      <p className="text-xs text-graphite/50">Correct answer: <span className="text-signal-up">{qr.correctAnswer}</span></p>
                    )}
                    {qr.explanation && (
                      <p className="text-xs text-graphite/40 mt-2 italic">{qr.explanation}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Retake button */}
        {canRetake && (
          <div className="text-center">
            <button
              onClick={handleRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Retake Quiz
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz form
  const questions = quiz.quiz_questions || [];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-sans font-semibold text-lg text-graphite">{quiz.title}</h3>
          {quiz.description && <p className="text-sm text-graphite/60 mt-0.5">{quiz.description}</p>}
        </div>
        {timeLeft !== null && (
          <div className={`flex items-center gap-1.5 text-sm font-mono ${timeLeft < 60 ? 'text-signal-down' : 'text-graphite/60'}`}>
            <Clock className="w-4 h-4" />
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-graphite/50 mb-1">
          <span>{answeredCount} of {questions.length} answered</span>
          <span>Passing: {quiz.passing_score}%</span>
        </div>
        <div className="h-1.5 bg-graphite/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-300"
            style={{ width: `${questions.length > 0 ? (answeredCount / questions.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((q, qi) => (
          <div key={q.id} className="p-5 bg-mn-card rounded-xl border border-graphite/5">
            <p className="text-sm font-medium text-graphite mb-3">
              <span className="text-graphite/40 mr-2">{qi + 1}.</span>
              {q.question_text}
            </p>

            {q.question_type === 'multiple_choice' && q.options && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => (
                  <label
                    key={oi}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === opt
                        ? 'border-accent bg-accent/5'
                        : 'border-graphite/10 hover:border-graphite/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === opt}
                      onChange={() => setAnswer(q.id, opt)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      answers[q.id] === opt ? 'border-accent' : 'border-graphite/20'
                    }`}>
                      {answers[q.id] === opt && <div className="w-2 h-2 rounded-full bg-accent" />}
                    </div>
                    <span className="text-sm text-graphite">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'true_false' && (
              <div className="flex gap-3">
                {['True', 'False'].map(val => (
                  <label
                    key={val}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      answers[q.id] === val
                        ? 'border-accent bg-accent/5'
                        : 'border-graphite/10 hover:border-graphite/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={answers[q.id] === val}
                      onChange={() => setAnswer(q.id, val)}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium text-graphite">{val}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'short_answer' && (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={e => setAnswer(q.id, e.target.value)}
                placeholder="Type your answer..."
                className="w-full px-4 py-2.5 bg-mn-bg border border-graphite/10 rounded-lg text-sm text-graphite placeholder:text-graphite/30 focus:outline-none focus:border-accent/40"
              />
            )}
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={submitting || answeredCount === 0}
          className="inline-flex items-center gap-2 px-8 py-3 bg-mn-dark text-mn-bg text-sm font-semibold rounded-full hover:bg-graphite/80 transition-colors disabled:opacity-50"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Submit Quiz
        </button>
      </div>
    </div>
  );
}
