import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

const MePage = () => {
  const { authenticatedUser, setAuthenticatedUser } = useAuthenticatedUser();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";
  const [quizRecords, setQuizRecords] = useState<StudentQuizRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordsError, setRecordsError] = useState("");

  const displayName =
    typeof authenticatedUser?.name === "string" && authenticatedUser.name
      ? authenticatedUser.name
      : typeof authenticatedUser?.email === "string" && authenticatedUser.email
        ? authenticatedUser.email
        : "User";

  const userEmail =
    typeof authenticatedUser?.email === "string"
      ? authenticatedUser.email
      : "-";
  const userRole =
    typeof authenticatedUser?.role === "string" ? authenticatedUser.role : "-";
  const userId =
    typeof authenticatedUser?.id === "string" ? authenticatedUser.id : "-";

  const initial = displayName.charAt(0).toUpperCase();
  const normalizedRole =
    typeof authenticatedUser?.role === "string"
      ? authenticatedUser.role.toLowerCase()
      : "";
  const isStudent = normalizedRole === "student";

  const formatRecordDate = useCallback((value: string) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  }, []);

  const fetchStudentQuizRecords = useCallback(async () => {
    if (!authenticatedUser || !isStudent) {
      setQuizRecords([]);
      setRecordsError("");
      return;
    }

    setIsLoadingRecords(true);
    setRecordsError("");

    try {
      const response = await api.get<{ quizRecords?: StudentQuizRecord[] }>(
        "/quizzes/records/me-active",
      );

      setQuizRecords(response.data.quizRecords || []);
    } catch {
      setRecordsError("Failed to load quiz records.");
    } finally {
      setIsLoadingRecords(false);
    }
  }, [authenticatedUser, isStudent]);

  useFocusEffect(
    useCallback(() => {
      fetchStudentQuizRecords();
    }, [fetchStudentQuizRecords]),
  );

  const totalAttemptedActiveQuizzes = useMemo(() => {
    return quizRecords.filter((record) => record.latestRecord).length;
  }, [quizRecords]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-3xl font-bold text-gray-900">Me</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Your account and access
        </Text>

        <View
          className="mt-8 rounded-3xl p-6"
          style={{
            backgroundColor: "#FFFFFF",
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
            borderWidth: 1,
            borderColor: "#F1F5F9",
          }}
        >
          {authenticatedUser ? (
            <>
              <View className="flex-row items-center gap-4">
                <View
                  className="h-14 w-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: accent + "20" }}
                >
                  <Text
                    className="text-2xl font-semibold"
                    style={{ color: accent }}
                  >
                    {initial}
                  </Text>
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {displayName}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">Signed in</Text>
                </View>
              </View>

              <View className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-slate-500">Email</Text>
                  <Text className="text-sm font-medium text-slate-800">
                    {userEmail}
                  </Text>
                </View>

                <View className="h-px bg-slate-200" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-slate-500">Role</Text>
                  <Text
                    className="text-sm font-semibold capitalize"
                    style={{ color: userRole !== "-" ? accent : "#334155" }}
                  >
                    {userRole}
                  </Text>
                </View>

                <View className="h-px bg-slate-200" />

                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-sm text-slate-500">User ID</Text>
                  <Text className="text-sm font-medium text-slate-800">
                    {userId}
                  </Text>
                </View>
              </View>

              <Pressable
                className="mt-5"
                onPress={() => {
                  setAuthenticatedUser(null);
                }}
              >
                {({ pressed }) => (
                  <View
                    className="rounded-xl px-4 py-3 border"
                    style={{
                      borderColor: "#FCA5A5",
                      backgroundColor: pressed ? "#FEF2F2" : "#FFF1F2",
                    }}
                  >
                    <Text className="text-center font-semibold text-red-700">
                      Logout
                    </Text>
                  </View>
                )}
              </Pressable>

              {isStudent && (
                <View className="mt-8">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold text-slate-900">
                      Active Quiz Records
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {totalAttemptedActiveQuizzes}/{quizRecords.length}{" "}
                      attempted
                    </Text>
                  </View>

                  {isLoadingRecords ? (
                    <View className="mt-4 flex-row items-center">
                      <ActivityIndicator color={accent} />
                      <Text className="ml-2 text-sm text-slate-600">
                        Loading quiz records...
                      </Text>
                    </View>
                  ) : recordsError ? (
                    <Text className="mt-4 text-sm text-red-700">
                      {recordsError}
                    </Text>
                  ) : quizRecords.length === 0 ? (
                    <Text className="mt-4 text-sm text-slate-600">
                      No active quizzes are available right now.
                    </Text>
                  ) : (
                    <View className="mt-4 gap-3">
                      {quizRecords.map((record) => (
                        <View
                          key={record.quizId}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
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
                                {formatRecordDate(
                                  record.latestRecord.createdAt,
                                )}
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
                </View>
              )}
            </>
          ) : (
            <>
              <Text className="text-xl font-semibold text-gray-900">
                Welcome
              </Text>
              <Text className="text-sm text-gray-600 mt-2 leading-5">
                Sign in to sync your progress and keep your learning journey
                personalized.
              </Text>

              <View className="mt-6 gap-3">
                <Pressable
                  onPress={() => {
                    router.push("/login");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3"
                      style={{
                        backgroundColor: accent,
                        opacity: pressed ? 0.88 : 1,
                      }}
                    >
                      <Text className="text-center text-white font-semibold">
                        Login
                      </Text>
                    </View>
                  )}
                </Pressable>

                <Pressable
                  onPress={() => {
                    router.push("/register");
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3 border"
                      style={{
                        borderColor: accent,
                        backgroundColor: pressed ? "#F8FAFC" : "#FFFFFF",
                      }}
                    >
                      <Text
                        className="text-center font-semibold"
                        style={{ color: accent }}
                      >
                        Register
                      </Text>
                    </View>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MePage;
