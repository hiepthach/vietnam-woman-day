import React, { useState, useEffect, useRef } from 'react';
import { Lightbulb, CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { soundManager } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

export interface QuizScreenProps {
  onComplete: () => void;
  className?: string;
}

const OPTION_PREFIXES = ['A', 'B', 'C', 'D'];

export const QuizScreen: React.FC<QuizScreenProps> = ({ onComplete, className = '' }) => {
  const { config } = useConfig();
  const questions = config.quizQuestions || [];
  const totalQuestions = questions.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [selectedWrongIndex, setSelectedWrongIndex] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const celebrationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If questions are empty, advance immediately
  useEffect(() => {
    if (totalQuestions === 0) {
      onComplete();
    }
  }, [totalQuestions, onComplete]);

  // Clean up any timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current);
      }
      if (celebrationTimerRef.current) {
        clearTimeout(celebrationTimerRef.current);
      }
    };
  }, []);

  if (totalQuestions === 0) {
    return null;
  }

  const currentQuestion = questions[currentIndex] || questions[0];

  const handleOptionClick = (idx: number) => {
    // If currently locked during transition to next question or already completed, ignore
    if (isCorrect || isCompleted) return;

    if (idx === currentQuestion.correctAnswerIndex) {
      // Correct answer selected!
      setSelectedOptionIndex(idx);
      setSelectedWrongIndex(null);
      setIsCorrect(true);
      setWrongMessage(null);

      soundManager.playSuccess();
      triggerConfetti.fireMiniBurst();

      const isLastQuestion = currentIndex + 1 >= totalQuestions;

      if (isLastQuestion) {
        setIsCompleted(true);
        celebrationTimerRef.current = setTimeout(() => {
          onComplete();
        }, 1200);
      } else {
        transitionTimerRef.current = setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setSelectedOptionIndex(null);
          setSelectedWrongIndex(null);
          setIsCorrect(false);
          setWrongMessage(null);
        }, 800);
      }
    } else {
      // Wrong answer selected!
      soundManager.playPop();
      setSelectedOptionIndex(idx);
      setSelectedWrongIndex(idx);
      setWrongMessage(currentQuestion.wrongMessage);
    }
  };

  return (
    <section
      data-testid="quiz-screen"
      className={`min-h-screen flex items-center justify-center p-4 sm:p-6 relative select-none ${className}`.trim()}
      aria-label="Thử thách 1: Hỏi xoáy đáp ngọt"
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>

      {/* Decorative ambient glowing backdrop */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-tr from-pink-300/30 to-rose-300/30 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div
        data-testid="quiz-card"
        className="relative z-10 w-full max-w-lg mx-auto backdrop-blur-md bg-white/85 border border-rose-200/60 shadow-2xl rounded-3xl p-6 sm:p-8 transition-all duration-300 hover:shadow-rose-100"
      >
        {/* Challenge Stage Badge */}
        <div className="flex justify-center mb-4">
          <span
            data-testid="challenge-badge"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs sm:text-sm font-semibold border border-amber-200/80 shadow-sm"
          >
            <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-400" aria-hidden="true" />
            <span>Thử thách 1: Người hiểu anh nhất 💡</span>
          </span>
        </div>

        {/* Progress Info & Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs sm:text-sm font-medium text-rose-500 mb-2">
            <span data-testid="quiz-progress-text">
              Câu hỏi {currentIndex + 1} / {totalQuestions}
            </span>
            <span>{Math.round(((currentIndex + (isCompleted ? 1 : 0)) / totalQuestions) * 100)}% Hoàn thành</span>
          </div>

          <div
            data-testid="quiz-progress-bar"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={totalQuestions}
            className="w-full bg-rose-100/80 rounded-full h-2.5 sm:h-3 overflow-hidden"
          >
            <div
              className="bg-gradient-to-r from-rose-500 to-pink-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Title */}
        <div className="mb-6">
          <h2
            data-testid="quiz-question-title"
            className="text-lg sm:text-xl font-bold text-gray-800 text-center leading-snug"
          >
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3" role="group" aria-label="Danh sách phương án trả lời">
          {currentQuestion.options.map((optionText, idx) => {
            const prefix = OPTION_PREFIXES[idx] || `${idx + 1}`;
            const isThisOptionWrong = selectedWrongIndex === idx;
            const isThisOptionCorrect = selectedOptionIndex === idx && isCorrect;

            let buttonStyles =
              'border-rose-100/80 bg-white/90 text-gray-700 shadow-sm hover:border-rose-300 hover:bg-rose-50/60 active:scale-[0.99]';
            let prefixStyles = 'bg-rose-50 text-rose-600 border border-rose-200';

            if (isThisOptionCorrect) {
              buttonStyles =
                'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md ring-2 ring-emerald-300 font-semibold';
              prefixStyles = 'bg-emerald-500 text-white border border-emerald-500';
            } else if (isThisOptionWrong) {
              buttonStyles =
                'border-rose-400 bg-rose-50 text-rose-800 shadow-sm ring-2 ring-rose-200 animate-shake font-medium';
              prefixStyles = 'bg-rose-500 text-white border border-rose-500';
            }

            return (
              <button
                key={`${currentQuestion.id || currentIndex}-${idx}`}
                type="button"
                data-testid={`quiz-option-${idx}`}
                onClick={() => handleOptionClick(idx)}
                disabled={isCorrect || isCompleted}
                aria-pressed={selectedOptionIndex === idx}
                className={`w-full min-h-[48px] rounded-2xl p-3.5 sm:p-4 border-2 flex items-center gap-3 text-left transition-all duration-200 cursor-pointer disabled:cursor-default focus:outline-none focus:ring-4 focus:ring-rose-200 ${buttonStyles}`}
              >
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${prefixStyles}`}
                >
                  {prefix}
                </span>

                <span className="flex-1 text-sm sm:text-base leading-snug">{optionText}</span>

                {isThisOptionCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 ml-auto" aria-hidden="true" />
                )}

                {isThisOptionWrong && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-auto" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>

        {/* Humorous Wrong Answer Tooltip/Banner */}
        {wrongMessage && !isCorrect && (
          <div
            data-testid="wrong-message"
            role="alert"
            className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-2.5 animate-shake shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold block mb-0.5">Ối zồi ôi! 😝</span>
              <span>{wrongMessage}</span>
            </div>
          </div>
        )}

        {/* Celebration Banner when completed */}
        {isCompleted && (
          <div
            data-testid="celebration-banner"
            className="mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-rose-500 text-white text-center shadow-lg animate-pulse"
          >
            <Sparkles className="w-7 h-7 mx-auto mb-2 text-amber-200" aria-hidden="true" />
            <h3 className="text-lg sm:text-xl font-bold">
              Xuất sắc! Em đã vượt qua Chặng 1! 🎉
            </h3>
            <p className="text-xs sm:text-sm opacity-90 mt-1">
              Chuẩn bị tiến vào thử thách tiếp theo nào...
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
