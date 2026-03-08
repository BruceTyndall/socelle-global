/**
 * useQuiz — load quiz, submit attempt, get results
 * Data source: quizzes + quiz_questions + quiz_attempts (LIVE)
 * Migrated to TanStack Query v5 (V2-TECH-04).
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [result, setResult] = useState<QuizResult | null>(null);

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['quiz', quizId, user?.id],
    queryFn: async () => {
      const { data: quizData, error } = await supabase
        .from('quizzes')
        .select(`
          id, title, description, passing_score, time_limit_minutes, max_attempts,
          quiz_questions (
            id, quiz_id, question_text, question_type, options, correct_answer, explanation, points, sort_order
          )
        `)
        .eq('id', quizId!)
        .single();

      if (error) throw new Error(error.message);

      const q = quizData as Quiz;
      if (q.quiz_questions) {
        q.quiz_questions.sort((a, b) => a.sort_order - b.sort_order);
      }

      // Load past attempts
      let pastAttempts: QuizAttempt[] = [];
      if (user?.id) {
        const { data: attempts } = await supabase
          .from('quiz_attempts')
          .select('*')
          .eq('quiz_id', quizId!)
          .eq('user_id', user.id)
          .order('started_at', { ascending: false });
        pastAttempts = (attempts as QuizAttempt[]) ?? [];
      }

      return { quiz: q, pastAttempts };
    },
    enabled: isSupabaseConfigured && !!quizId,
  });

  const quiz = data?.quiz ?? null;
  const pastAttempts = data?.pastAttempts ?? [];

  const submitMut = useMutation({
    mutationFn: async (answers: Record<string, string>) => {
      if (!quiz || !user?.id) throw new Error('Quiz or user not available');

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
      await supabase
        .from('quiz_attempts')
        .insert({
          quiz_id: quiz.id,
          user_id: user.id,
          score,
          passed,
          answers,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

      return { score, passed, totalPoints, questionResults } satisfies QuizResult;
    },
    onSuccess: (res) => {
      setResult(res);
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId, user?.id] });
    },
  });

  const submitAttempt = useCallback(async (answers: Record<string, string>): Promise<QuizResult | null> => {
    if (!quiz || !user?.id || !isSupabaseConfigured) return null;
    try {
      return await submitMut.mutateAsync(answers);
    } catch {
      return null;
    }
  }, [quiz, user?.id, submitMut]);

  const submitting = submitMut.isPending;
  const canRetake = quiz?.max_attempts ? pastAttempts.length < quiz.max_attempts : true;
  const error = queryError instanceof Error ? queryError.message
    : submitMut.error instanceof Error ? submitMut.error.message
    : null;

  return { quiz, loading, error, submitting, result, pastAttempts, canRetake, submitAttempt, setResult };
}
