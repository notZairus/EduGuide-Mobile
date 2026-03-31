import Header from "@/components/Header";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

type Student = {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
};

type StudentQuizRecord = {
  topicId: string;
  topicTitle: string;
  quizId: string;
  quizTitle: string;
  attemptCount: number;
  bestPercentage: number;
  latestRecord: {
    score: number;
    totalQuestions: number;
    percentage: number;
    createdAt: string;
  } | null;
};

type StudentRecordsResponse = {
  student?: Student;
  classroom?: {
    _id: string;
    name: string;
    code: string;
  };
  quizRecords?: StudentQuizRecord[];
};

const StudentRecordsPage = () => {
  const { classroomId, studentId } = useLocalSearchParams<{
    classroomId: string;
    studentId: string;
  }>();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [student, setStudent] = useState<Student | null>(null);
  const [quizRecords, setQuizRecords] = useState<StudentQuizRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fullName = useMemo(() => {
    if (!student) return "Student Quiz Records";

    return [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(" ");
  }, [student]);

  const formatRecordDate = useCallback((value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  }, []);

  const fetchStudentRecords = useCallback(async () => {
    if (!classroomId || !studentId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<StudentRecordsResponse>(
        `/quizzes/records/classrooms/${classroomId}/students/${studentId}/active`,
      );

      setStudent(response.data.student || null);
      setQuizRecords(response.data.quizRecords || []);
    } catch (error) {
      const fallbackMessage = "Failed to load student quiz records.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response
      ) {
        const responseData = error.response.data as
          | { message?: string }
          | string
          | undefined;

        if (typeof responseData === "string") {
          setErrorMessage(responseData);
        } else {
          setErrorMessage(responseData?.message || fallbackMessage);
        }
      } else {
        setErrorMessage(fallbackMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [classroomId, studentId]);

  useFocusEffect(
    useCallback(() => {
      fetchStudentRecords();
    }, [fetchStudentRecords]),
  );

  const attemptedCount = useMemo(() => {
    return quizRecords.filter((record) => record.latestRecord).length;
  }, [quizRecords]);

  return (
    <View className="flex-1 bg-white">
      <Header text="Student Quiz Records" />

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color={accent} />
            <Text className="ml-2 text-sm text-slate-600">
              Loading records...
            </Text>
          </View>
        ) : errorMessage ? (
          <Text className="text-sm text-red-700">{errorMessage}</Text>
        ) : (
          <>
            <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Text className="text-lg font-semibold text-slate-900">
                {fullName}
              </Text>
              <Text className="mt-1 text-sm text-slate-600">
                {student?.email || "-"}
              </Text>
              <Text className="mt-3 text-xs text-slate-500">
                {attemptedCount}/{quizRecords.length} active quizzes attempted
              </Text>
            </View>

            {quizRecords.length === 0 ? (
              <Text className="mt-5 text-sm text-slate-600">
                No active quizzes available for this student right now.
              </Text>
            ) : (
              <View className="mt-5 gap-3">
                {quizRecords.map((record) => (
                  <View
                    key={record.quizId}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <Text className="text-base font-semibold text-slate-900">
                      {record.quizTitle}
                    </Text>
                    <Text className="mt-1 text-xs text-slate-500">
                      Topic: {record.topicTitle}
                    </Text>

                    {record.latestRecord ? (
                      <>
                        <Text className="mt-3 text-sm text-slate-700">
                          Latest Score: {record.latestRecord.score}/
                          {record.latestRecord.totalQuestions} (
                          {record.latestRecord.percentage}%)
                        </Text>
                        <Text className="mt-1 text-sm text-slate-700">
                          Best Score: {record.bestPercentage}%
                        </Text>
                        <Text className="mt-1 text-xs text-slate-500">
                          Attempts: {record.attemptCount}
                        </Text>
                        <Text className="mt-1 text-xs text-slate-500">
                          Last Attempt:{" "}
                          {formatRecordDate(record.latestRecord.createdAt)}
                        </Text>
                      </>
                    ) : (
                      <Text className="mt-3 text-sm text-amber-700">
                        Not attempted yet.
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default StudentRecordsPage;
