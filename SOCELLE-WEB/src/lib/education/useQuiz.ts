/**
 * useQuiz — load quiz, submit attempt, get results
 * Data source: quizzes + quiz_questions + quiz_attempts (LIVE)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { useAuth } from '../auth';

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options: string[] | null;
  correct_answer: string;
  explanation: string | null;
  points: number;
  sort_order: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  time_limit_minutes: number | null;
  max_attempts: number | null;
  quiz_questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  passed: boolean;
  answers: Record<string, string>;
  started_at: string;
  completed_at: string | null;
}

export interface QuizResult {
  score: number;
  passed: boolean;
  totalPoints: number;
  questionResults: {
    questionId: string;
    correct: boolean;
    userAnswer: string;
    correctAnswer: string;
    explanation: string | null;
  }[];
}

export function useQuiz(quizId: string | undefined) {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pastAttempts, setPastAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (!quizId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured) {
        setQuiz(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('quizzes')
          .select(`
            id, title, description, passing_score, time_limit_minutes, max_attempts,
            quiz_questions (
              id, quiz_id, question_text, question_type, options, correct_answer, explanation, points, sort_order
            )
          `)
          .eq('id', quizId)
          .single();

        if (cancelled) return;

        if (fetchError) {
          setError(fetchError.message);
        } else {
          const q = data as Quiz;
          if (q.quiz_questions) {
            q.quiz_questions.sort((a, b) => a.sort_order - b.sort_order);
          }
          setQuiz(q);
        }

        // Load past attempts
        if (user?.id) {
          const { data: attempts } = await supabase
            .from('quiz_attempts')
            .select('*')
            .eq('quiz_id', quizId)
            .eq('user_id', user.id)
            .order('started_at', { ascending: false });

          if (!cancelled && attempts) {
            setPastAttempts(attempts as QuizAttempt[]);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load quiz');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();
    return () => { cancelled = true; };
  }, [quizId, user?.id]);

  const submitAttempt = useCallback(async (answers: Record<string, string>): Promise<QuizResult | null> => {
    if (!quiz || !user?.id || !isSupabaseConfigured) return null;

    setSubmitting(true);
    try {
      // Grade locally
      const questions = quiz.quiz_questions || [];
      let earnedPoints = 0;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const questionResults = questions.map(q => {
        const userAnswer = answers[q.id] || '';
        const correct = userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();
        if (correct) earnedPoints += q.points;
        return {
          questionId: q.id,
          correct,
          userAnswer,
          correctAnswer: q.correct_answer,
          explanation: q.explanation,
        };
      });

      const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = score >= quiz.passing_score;

      // Save attempt
      const { data: attempt } = await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          user_id: user.id,
          score,
          passed,
          answers,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (attempt) {
        setPastAttempts(prev => [attempt as QuizAttempt, ...prev]);
      }

      const res: QuizResult = { score, passed, totalPoints, questionResults };
      setResult(res);
      return res;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [quiz, user?.id]);

  const canRetake = quiz?.max_attempts ? pastAttempts.length < quiz.max_attempts : true;

  return { quiz, loading, error, submitting, result, pastAttempts, canRetake, submitAttempt, setResult };
}
