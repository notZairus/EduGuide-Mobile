import Header from "@/components/Header";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type ClassroomMemberUser = {
  _id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  role: "student" | "instructor";
};

type ClassroomMember = {
  user_id: ClassroomMemberUser;
  role: "student" | "instructor";
};

type ClassroomDetails = {
  _id: string;
  name: string;
  description?: string;
  code: string;
  members: ClassroomMember[];
};

const ClassroomDetailsPage = () => {
  const { classroomId } = useLocalSearchParams<{ classroomId: string }>();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [classroom, setClassroom] = useState<ClassroomDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchClassroomMembers = useCallback(async () => {
    if (!classroomId) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await api.get<{ classroom?: ClassroomDetails }>(
        `/classrooms/${classroomId}/members`,
      );

      setClassroom(response.data.classroom || null);
    } catch (error) {
      const fallbackMessage = "Failed to load classroom members.";

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
  }, [classroomId]);

  useEffect(() => {
    fetchClassroomMembers();
  }, [fetchClassroomMembers]);

  return (
    <View className="flex-1 bg-white">
      <Header text="Classroom Members" />

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="flex-row items-center">
            <ActivityIndicator color={accent} />
            <Text className="ml-2 text-sm text-slate-600">
              Loading members...
            </Text>
          </View>
        ) : errorMessage ? (
          <Text className="text-sm text-red-700">{errorMessage}</Text>
        ) : !classroom ? (
          <Text className="text-sm text-slate-600">Classroom not found.</Text>
        ) : (
          <>
            <View className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-slate-900 flex-1">
                  {classroom.name}
                </Text>
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: `${accent}1A` }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: accent }}
                  >
                    {classroom.code}
                  </Text>
                </View>
              </View>

              {classroom.description ? (
                <Text className="mt-2 text-sm text-slate-700 leading-5">
                  {classroom.description}
                </Text>
              ) : null}

              <Text className="mt-3 text-xs text-slate-500">
                {classroom.members.length} members
              </Text>
            </View>

            <View className="mt-6 gap-3">
              {classroom.members.map((member) => {
                const fullName = [
                  member.user_id.first_name,
                  member.user_id.middle_name,
                  member.user_id.last_name,
                ]
                  .filter(Boolean)
                  .join(" ");

                const isStudent = member.role === "student";

                return (
                  <Pressable
                    key={member.user_id._id}
                    disabled={!isStudent}
                    onPress={() => {
                      router.push(
                        `/classroom/${classroomId}/student/${member.user_id._id}`,
                      );
                    }}
                  >
                    {({ pressed }) => (
                      <View
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                        style={{ opacity: isStudent && pressed ? 0.85 : 1 }}
                      >
                        <View className="flex-row items-center justify-between">
                          <Text className="text-base font-semibold text-slate-900 flex-1">
                            {fullName}
                          </Text>
                          <View
                            className="rounded-full px-3 py-1"
                            style={{
                              backgroundColor:
                                member.role === "instructor"
                                  ? `${accent}1A`
                                  : "#E2E8F0",
                            }}
                          >
                            <Text
                              className="text-xs font-semibold"
                              style={{
                                color:
                                  member.role === "instructor"
                                    ? accent
                                    : "#334155",
                              }}
                            >
                              {member.role}
                            </Text>
                          </View>
                        </View>

                        <Text className="mt-1 text-sm text-slate-600">
                          {member.user_id.email}
                        </Text>

                        {isStudent ? (
                          <Text
                            className="mt-2 text-xs font-medium"
                            style={{ color: accent }}
                          >
                            Tap to view quiz records
                          </Text>
                        ) : null}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default ClassroomDetailsPage;
