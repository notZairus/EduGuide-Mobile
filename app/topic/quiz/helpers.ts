export type NormalizedQuestion = {
  id: string;
  prompt: string;
  type: "multiple-choice" | "true-or-false" | "identification";
  options: string[];
  correctIndex?: number;
  correctText?: string;
  media?: Media;
  explanation?: string;
};

type QuizLike = Quiz & Record<string, unknown>;
type QuizQuestionLike = QuizQuestion & Record<string, unknown>;

const normalizeOption = (option: unknown) => {
  if (typeof option !== "string") return "";
  return option.trim();
};

const normalizeText = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  return "";
};

const getQuestionPrompt = (question: QuizQuestion, index: number) => {
  const prompt = question.question || question.prompt || question.title || "";

  return prompt.trim() || `Question ${index + 1}`;
};

const getQuestionOptions = (question: QuizQuestion) => {
  const rawOptions =
    (Array.isArray(question.options) && question.options) ||
    (Array.isArray(question.choices) && question.choices) ||
    (Array.isArray(question.answers) && question.answers) ||
    [];

  return rawOptions
    .map((option) => normalizeOption(option))
    .filter((option) => option.length > 0);
};

const getRawAnswer = (question: QuizQuestion) => {
  return (
    question.correctAnswer ??
    question.correct_answer ??
    (question as QuizQuestion & { answer?: string | number | boolean }).answer
  );
};

const getCorrectIndex = (question: QuizQuestion, options: string[]) => {
  if (typeof question.correctIndex === "number") return question.correctIndex;
  if (typeof question.answerIndex === "number") return question.answerIndex;

  const explicitAnswer = getRawAnswer(question);

  if (typeof explicitAnswer === "number") {
    return explicitAnswer;
  }

  if (typeof explicitAnswer === "string") {
    const normalizedAnswer = explicitAnswer.trim().toLowerCase();

    const byValue = options.findIndex(
      (option) => option.trim().toLowerCase() === normalizedAnswer,
    );
    if (byValue >= 0) return byValue;

    const byNumeric = Number(normalizedAnswer);
    if (
      !Number.isNaN(byNumeric) &&
      byNumeric >= 0 &&
      byNumeric < options.length
    ) {
      return byNumeric;
    }

    if (/^[a-z]$/i.test(normalizedAnswer)) {
      const alphaIndex = normalizedAnswer.charCodeAt(0) - 97;
      if (alphaIndex >= 0 && alphaIndex < options.length) return alphaIndex;
    }
  }

  return -1;
};

const normalizeType = (rawType: unknown) => {
  if (typeof rawType !== "string") return "";
  return rawType.trim().toLowerCase();
};

const resolveQuestionType = (question: QuizQuestion) => {
  const questionType = normalizeType((question as QuizQuestionLike).type);

  if (
    questionType === "multiple-choice" ||
    questionType === "multiple_choice" ||
    questionType === "multiple choice" ||
    questionType === "mcq"
  ) {
    return "multiple-choice" as const;
  }

  if (
    questionType === "true-or-false" ||
    questionType === "true_false" ||
    questionType === "true or false" ||
    questionType === "boolean"
  ) {
    return "true-or-false" as const;
  }

  if (
    questionType === "identification" ||
    questionType === "short-answer" ||
    questionType === "short answer" ||
    questionType === "text"
  ) {
    return "identification" as const;
  }

  const inferredOptions = getQuestionOptions(question);
  if (inferredOptions.length >= 2) return "multiple-choice" as const;

  const rawAnswer = normalizeText(getRawAnswer(question)).toLowerCase();
  if (["true", "false", "t", "f", "yes", "no", "1", "0"].includes(rawAnswer)) {
    return "true-or-false" as const;
  }

  if (rawAnswer.length > 0) return "identification" as const;

  return null;
};

const getOptionsForType = (
  question: QuizQuestion,
  type: "multiple-choice" | "true-or-false" | "identification",
) => {
  if (type === "true-or-false") {
    return ["True", "False"];
  }

  if (type === "identification") {
    return [];
  }

  return getQuestionOptions(question);
};

const getCorrectText = (question: QuizQuestion) => {
  return normalizeText(getRawAnswer(question));
};

const getQuestionsFromUnknownArray = (value: unknown): QuizQuestion[] => {
  if (!Array.isArray(value)) return [];
  return value as QuizQuestion[];
};

const getSourceQuestions = (quiz?: Quiz): QuizQuestion[] => {
  if (!quiz) return [];

  const quizLike = quiz as QuizLike;

  const listCandidates: unknown[] = [
    quizLike.questions,
    quizLike.items,
    quizLike.quizQuestions,
    quizLike.quiz_questions,
    quizLike.questionList,
    quizLike.question_list,
  ];

  for (const candidate of listCandidates) {
    const extracted = getQuestionsFromUnknownArray(candidate);
    if (extracted.length > 0) return extracted;
  }

  const singleQuestion = quiz as QuizQuestion;
  const hasQuestionPayload =
    Boolean(
      singleQuestion.question || singleQuestion.prompt || singleQuestion.title,
    ) &&
    (Array.isArray(singleQuestion.options) ||
      Array.isArray(singleQuestion.choices) ||
      Array.isArray(singleQuestion.answers));

  return hasQuestionPayload ? [singleQuestion] : [];
};

export const normalizeQuizQuestions = (
  quiz?: Quiz,
  extraQuestions: QuizQuestion[] = [],
): NormalizedQuestion[] => {
  const sourceQuestions = [...getSourceQuestions(quiz), ...extraQuestions];
  const seenQuestionIds = new Set<string>();

  return sourceQuestions.reduce<NormalizedQuestion[]>(
    (acc, question, index) => {
      const type = resolveQuestionType(question);
      if (!type) {
        return acc;
      }

      const options = getOptionsForType(question, type);
      const correctIndex = getCorrectIndex(question, options);
      const correctText = getCorrectText(question);
      const prompt = getQuestionPrompt(question, index);
      const dedupeKey = `${question._id || prompt}-${type}-${options.join("|")}`;

      const invalidChoiceQuestion =
        (type === "multiple-choice" || type === "true-or-false") &&
        (options.length < 2 ||
          correctIndex < 0 ||
          correctIndex >= options.length);

      const invalidIdentificationQuestion =
        type === "identification" && correctText.length === 0;

      if (
        invalidChoiceQuestion ||
        invalidIdentificationQuestion ||
        seenQuestionIds.has(dedupeKey)
      ) {
        return acc;
      }

      seenQuestionIds.add(dedupeKey);

      acc.push({
        id: question._id || `${index}-${acc.length}`,
        prompt,
        type,
        options,
        correctIndex: type === "identification" ? undefined : correctIndex,
        correctText: type === "identification" ? correctText : undefined,
        media: question.media,
        explanation: question.explanation,
      });

      return acc;
    },
    [],
  );
};
