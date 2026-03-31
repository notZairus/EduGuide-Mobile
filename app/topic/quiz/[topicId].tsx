import {
  normalizeQuizQuestions,
  type NormalizedQuestion,
} from "@/app/topic/quiz/helpers";
import Header from "@/components/Header";
import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const TopicQuiz = () => {
  const { topicId } = useLocalSearchParams<{ topicId: string }>();
  const { handbook } = useHandbook();
  const { authenticatedUser } = useAuthenticatedUser();

  const topic = handbook?.topics.find((entry) => entry._id === topicId);
  const activeQuiz = topic?.active_quiz;

  const topicLevelQuestions = useMemo<QuizQuestion[]>(() => {
    if (!topic) return [];

    const topicLike = topic as unknown as Record<string, unknown>;
    const candidates: unknown[] = [
      topicLike.quizQuestions,
      topicLike.quiz_questions,
      topicLike.questions,
      topicLike.items,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate as QuizQuestion[];
      }
    }

    return [];
  }, [topic]);

  const questions = useMemo<NormalizedQuestion[]>(
    () => normalizeQuizQuestions(activeQuiz, topicLevelQuestions),
    [activeQuiz, topicLevelQuestions],
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [typedAnswers, setTypedAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasRecordedResultRef = useRef(false);

  const clearCountdown = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  const beginQuizWithCountdown = () => {
    if (countdownRef.current) return;

    setCountdown(5);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return prev;

        if (prev <= 1) {
          clearCountdown();
          setHasStarted(true);
          return null;
        }

        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    clearCountdown();
    hasRecordedResultRef.current = false;
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setTypedAnswers([]);
    setSubmitted(false);
    setHasStarted(false);
    setCountdown(null);
  }, [activeQuiz?._id]);

  useEffect(() => {
    return () => {
      clearCountdown();
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const selectedForCurrent = selectedAnswers[currentIndex];

  const isQuestionAnswered = (question: NormalizedQuestion, index: number) => {
    if (question.type === "identification") {
      return (typedAnswers[index] || "").trim().length > 0;
    }

    return selectedAnswers[index] !== undefined;
  };

  const answeredCount = questions.filter((question, index) => {
    return isQuestionAnswered(question, index);
  }).length;

  const isQuestionCorrect = useCallback(
    (question: NormalizedQuestion, index: number) => {
      if (question.type === "identification") {
        return (
          (typedAnswers[index] || "").trim().toLowerCase() ===
          (question.correctText || "").trim().toLowerCase()
        );
      }

      return selectedAnswers[index] === question.correctIndex;
    },
    [selectedAnswers, typedAnswers],
  );

  const score = useMemo(() => {
    return questions.reduce((total, question, index) => {
      const isCorrect =
        question.type === "identification"
          ? (typedAnswers[index] || "").trim().toLowerCase() ===
            (question.correctText || "").trim().toLowerCase()
          : selectedAnswers[index] === question.correctIndex;

      if (isCorrect) {
        return total + 1;
      }
      return total;
    }, 0);
  }, [questions, selectedAnswers, typedAnswers]);

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const logQuizResult = () => {
    const questionResults = questions.map((question, questionIndex) => {
      const selectedIndex = selectedAnswers[questionIndex];
      const isCorrect = isQuestionCorrect(question, questionIndex);
      const userAnswer =
        question.type === "identification"
          ? typedAnswers[questionIndex] || "No answer"
          : selectedIndex !== undefined
            ? question.options[selectedIndex]
            : "No answer";
      const correctAnswer =
        question.type === "identification"
          ? question.correctText || "N/A"
          : question.correctIndex !== undefined
            ? question.options[question.correctIndex]
            : "N/A";

      return {
        questionNumber: questionIndex + 1,
        questionId: question.id,
        prompt: question.prompt,
        userAnswer,
        correctAnswer,
        isCorrect,
      };
    });

    const resultData = {
      quizTitle: activeQuiz?.title || `${topic?.title || "Topic"} Quiz`,
      score,
      totalQuestions: questions.length,
      percentage,
      percentageText: `${percentage}% over 100%`,
      questions: questionResults,
    };

    console.log("[QUIZ RESULT]", resultData);
  };

  const buildQuestionResults = useCallback(() => {
    return questions.map((question, questionIndex) => {
      const selectedIndex = selectedAnswers[questionIndex];
      const isCorrect = isQuestionCorrect(question, questionIndex);
      const userAnswer =
        question.type === "identification"
          ? typedAnswers[questionIndex] || "No answer"
          : selectedIndex !== undefined
            ? question.options[selectedIndex]
            : "No answer";
      const correctAnswer =
        question.type === "identification"
          ? question.correctText || "N/A"
          : question.correctIndex !== undefined
            ? question.options[question.correctIndex]
            : "N/A";

      return {
        questionId: question.id,
        prompt: question.prompt,
        userAnswer,
        correctAnswer,
        isCorrect,
      };
    });
  }, [questions, selectedAnswers, typedAnswers, isQuestionCorrect]);

  const recordQuizResult = useCallback(async () => {
    if (
      !submitted ||
      !authenticatedUser ||
      !activeQuiz?._id ||
      !topic?._id ||
      hasRecordedResultRef.current
    ) {
      return;
    }

    try {
      await api.post(`/quizzes/${activeQuiz._id}/records`, {
        topicId: topic._id,
        score,
        totalQuestions: questions.length,
        percentage,
        questionResults: buildQuestionResults(),
      });

      hasRecordedResultRef.current = true;
    } catch (error) {
      console.error("Failed to record quiz result:", error);
    }
  }, [
    submitted,
    authenticatedUser,
    activeQuiz?._id,
    topic?._id,
    score,
    questions.length,
    percentage,
    buildQuestionResults,
  ]);

  useEffect(() => {
    recordQuizResult();
  }, [recordQuizResult]);

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;

    setSelectedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  const handleTypeAnswer = (value: string) => {
    if (submitted) return;

    setTypedAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    setSubmitted(true);
  };

  const resetQuiz = () => {
    clearCountdown();
    hasRecordedResultRef.current = false;
    setCurrentIndex(0);
    setSelectedAnswers([]);
    setTypedAnswers([]);
    setSubmitted(false);
    setHasStarted(false);
    setCountdown(null);
  };

  const currentTextAnswer = typedAnswers[currentIndex] || "";
  const isCurrentAnswered = currentQuestion
    ? isQuestionAnswered(currentQuestion, currentIndex)
    : false;

  return (
    <View className="flex-1 bg-white">
      <Header text={activeQuiz?.title || `${topic?.title || "Topic"} Quiz`} />

      {!activeQuiz && (
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-lg text-gray-700 text-center">
            This topic has no active quiz.
          </Text>
        </View>
      )}

      {activeQuiz && questions.length === 0 && (
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-lg text-gray-700 text-center">
            Quiz questions are not ready yet.
          </Text>
          <Text className="text-sm text-gray-500 mt-2 text-center">
            Please check your quiz data and make sure each question has options
            and a correct answer.
          </Text>
        </View>
      )}

      {activeQuiz && questions.length > 0 && !authenticatedUser && (
        <View className="flex-1 px-6 items-center justify-center">
          <Text className="text-xl font-semibold text-gray-900 text-center">
            Login Required
          </Text>
          <Text className="text-sm text-gray-600 mt-2 text-center">
            Please login first before taking this quiz.
          </Text>

          <Pressable
            onPress={() => router.push("/login")}
            className="mt-6 w-full"
          >
            {({ pressed }) => (
              <View
                className="rounded-xl px-4 py-3"
                style={{
                  backgroundColor: handbook?.color || "#111",
                  opacity: pressed ? 0.85 : 1,
                }}
              >
                <Text className="text-center text-white font-semibold">
                  Go to Login
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      )}

      {activeQuiz && questions.length > 0 && authenticatedUser && (
        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {!hasStarted && !submitted && (
            <View
              className="mb-5 rounded-2xl p-5"
              style={{
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
                backgroundColor: "#fff",
              }}
            >
              <Text className="text-2xl font-semibold text-gray-900">
                Ready to Start?
              </Text>
              <Text className="text-base text-gray-600 mt-2">
                You have {questions.length} questions in this quiz.
              </Text>

              {countdown !== null ? (
                <View className="mt-6 items-center">
                  <Text
                    className="text-6xl font-bold"
                    style={{ color: handbook?.color || "#111" }}
                  >
                    {countdown}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-2">
                    Starting in...
                  </Text>
                </View>
              ) : (
                <Pressable onPress={beginQuizWithCountdown} className="mt-6">
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: handbook?.color || "#111",
                        opacity: pressed ? 0.85 : 1,
                      }}
                    >
                      <Text className="text-center text-white font-semibold">
                        Start Quiz
                      </Text>
                    </View>
                  )}
                </Pressable>
              )}
            </View>
          )}

          {(hasStarted || submitted) && (
            <View
              className="mb-5 rounded-xl px-4 py-3"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: handbook?.color || "#111" }}
              >
                {submitted
                  ? "Quiz Results"
                  : `Question ${currentIndex + 1} of ${questions.length}`}
              </Text>
              {!submitted && (
                <Text className="text-xs text-gray-600 mt-1">
                  Answered {answeredCount} / {questions.length}
                </Text>
              )}
            </View>
          )}

          {hasStarted && !submitted && currentQuestion && (
            <>
              <View
                className="rounded-2xl p-5 mb-5"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 4,
                  backgroundColor: "#fff",
                }}
              >
                <Text className="text-xl font-semibold text-gray-900 leading-8">
                  {currentQuestion.prompt}
                </Text>

                {currentQuestion.media?.url && (
                  <Image
                    source={{ uri: currentQuestion.media.url }}
                    className="w-full h-48 mt-4 rounded-xl"
                    resizeMode="cover"
                  />
                )}
              </View>

              {currentQuestion.type === "identification" ? (
                <View>
                  <TextInput
                    value={currentTextAnswer}
                    onChangeText={handleTypeAnswer}
                    placeholder="Type your answer"
                    className="rounded-xl border px-4 py-3 text-base"
                    style={{
                      borderColor:
                        currentTextAnswer.trim().length > 0
                          ? handbook?.color || "#111"
                          : "#D1D5DB",
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              ) : (
                <View className="gap-3">
                  {currentQuestion.options.map((option, optionIndex) => {
                    const isSelected = selectedForCurrent === optionIndex;

                    return (
                      <Pressable
                        key={`${currentQuestion.id}-${optionIndex}`}
                        onPress={() => handleSelect(optionIndex)}
                      >
                        {({ pressed }) => (
                          <View
                            className="rounded-xl border px-4 py-3"
                            style={{
                              borderColor: isSelected
                                ? handbook?.color || "#111"
                                : "#E5E7EB",
                              backgroundColor: isSelected
                                ? "#F3F4F6"
                                : pressed
                                  ? "#F9FAFB"
                                  : "#FFFFFF",
                            }}
                          >
                            <Text
                              className="text-base"
                              style={{
                                color: isSelected
                                  ? handbook?.color || "#111"
                                  : "#111827",
                              }}
                            >
                              {option}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <View className="flex-row gap-3 mt-6">
                <Pressable
                  disabled={currentIndex === 0}
                  onPress={() =>
                    setCurrentIndex((prev) => Math.max(prev - 1, 0))
                  }
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3 border"
                      style={{
                        borderColor: "#D1D5DB",
                        backgroundColor:
                          currentIndex === 0
                            ? "#F3F4F6"
                            : pressed
                              ? "#F9FAFB"
                              : "#FFFFFF",
                      }}
                    >
                      <Text className="text-center text-gray-700 font-medium">
                        Previous
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={goNext}
                  disabled={!isCurrentAnswered}
                  className="flex-1"
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: !isCurrentAnswered
                          ? "#9CA3AF"
                          : handbook?.color || "#111",
                        opacity: !isCurrentAnswered ? 1 : pressed ? 0.85 : 1,
                      }}
                    >
                      <Text className="text-center text-white font-semibold">
                        {currentIndex === questions.length - 1
                          ? "Submit Quiz"
                          : "Next"}
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </>
          )}

          {/* Quiz results section */}
          {submitted && (
            <>
              <View
                className="rounded-2xl bg-white p-5 mb-5"
                style={{
                  shadowColor: "#000",
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 4,
                }}
              >
                <Text className="text-lg text-gray-700">Your Score</Text>
                <Text
                  className="text-4xl font-bold mt-1"
                  style={{ color: handbook?.color || "#111" }}
                >
                  {score} / {questions.length}
                </Text>
                <Text className="text-base text-gray-600 mt-2">
                  {percentage}% correct
                </Text>
              </View>

              <View className="gap-3">
                {questions.map((question, questionIndex) => {
                  const selectedIndex = selectedAnswers[questionIndex];
                  const isCorrect = isQuestionCorrect(question, questionIndex);
                  const userAnswer =
                    question.type === "identification"
                      ? typedAnswers[questionIndex] || "No answer"
                      : selectedIndex !== undefined
                        ? question.options[selectedIndex]
                        : "No answer";
                  const expectedAnswer =
                    question.type === "identification"
                      ? question.correctText || "N/A"
                      : question.correctIndex !== undefined
                        ? question.options[question.correctIndex]
                        : "N/A";

                  return (
                    <View
                      key={question.id}
                      className="rounded-xl border border-gray-200 p-4"
                    >
                      <Text className="text-sm text-gray-500 mb-2">
                        Question {questionIndex + 1}
                      </Text>
                      <Text className="text-base font-medium text-gray-900">
                        {question.prompt}
                      </Text>
                      <Text
                        className="text-sm mt-2"
                        style={{ color: isCorrect ? "#15803D" : "#B91C1C" }}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Text>
                      <Text className="text-sm text-gray-700 mt-1">
                        Your answer: {userAnswer}
                      </Text>
                      <Text className="text-sm text-gray-700 mt-1">
                        Correct answer: {expectedAnswer}
                      </Text>
                      {question.explanation && (
                        <Text className="text-sm text-gray-600 mt-2">
                          Explanation: {question.explanation}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>

              <Pressable onPress={logQuizResult} className="mt-6">
                {({ pressed }) => (
                  <View
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      borderColor: handbook?.color || "#111",
                      backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
                    }}
                  >
                    <Text
                      className="text-center font-medium"
                      style={{ color: handbook?.color || "#111" }}
                    >
                      Log Quiz Result
                    </Text>
                  </View>
                )}
              </Pressable>

              <View className="flex-row gap-3 mt-6">
                <Pressable onPress={resetQuiz} className="flex-1">
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3 border"
                      style={{
                        borderColor: handbook?.color || "#111",
                        backgroundColor: pressed ? "#F9FAFB" : "#FFFFFF",
                      }}
                    >
                      <Text
                        className="text-center font-medium"
                        style={{ color: handbook?.color || "#111" }}
                      >
                        Retake
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable onPress={() => router.back()} className="flex-1">
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: handbook?.color || "#111",
                        opacity: pressed ? 0.85 : 1,
                      }}
                    >
                      <Text className="text-center text-white font-semibold">
                        Back to Topic
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default TopicQuiz;
