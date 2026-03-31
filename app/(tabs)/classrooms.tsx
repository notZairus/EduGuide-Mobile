import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Classroom = {
  _id: string;
  name: string;
  description?: string;
  code: string;
  createdAt: string;
  members?: { user_id: string; role: "student" | "instructor" }[];
};

const Classrooms = () => {
  const { authenticatedUser } = useAuthenticatedUser();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoadingClassrooms, setIsLoadingClassrooms] = useState(false);
  const [classroomsError, setClassroomsError] = useState("");
  const [isCreateDialogVisible, setIsCreateDialogVisible] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinErrorMessage, setJoinErrorMessage] = useState("");
  const [joinSuccessMessage, setJoinSuccessMessage] = useState("");
  const [isJoiningClassroom, setIsJoiningClassroom] = useState(false);

  const role =
    typeof authenticatedUser?.role === "string"
      ? authenticatedUser.role.toLowerCase()
      : "";
  const isInstructor = role === "instructor";
  const isStudent = role === "student";

  const isFormFilled = useMemo(() => {
    return name.trim().length >= 2 && description.trim().length >= 5;
  }, [name, description]);

  const normalizedJoinCode = useMemo(() => {
    return joinCode.trim().toUpperCase();
  }, [joinCode]);

  const isJoinCodeValid = useMemo(() => {
    return /^[A-Z2-9]{8}$/.test(normalizedJoinCode);
  }, [normalizedJoinCode]);

  const fetchClassrooms = useCallback(async () => {
    if (!isInstructor && !isStudent) {
      setClassrooms([]);
      setClassroomsError("");
      return;
    }

    setIsLoadingClassrooms(true);
    setClassroomsError("");

    try {
      const response = await api.get<{ classrooms?: Classroom[] }>(
        "/classrooms",
      );

      setClassrooms(response.data.classrooms || []);
    } catch {
      setClassroomsError("Failed to load classrooms.");
    } finally {
      setIsLoadingClassrooms(false);
    }
  }, [isInstructor, isStudent]);

  useEffect(() => {
    fetchClassrooms();
  }, [fetchClassrooms]);

  const handleCreateClassroom = async () => {
    if (!isInstructor) {
      setErrorMessage("Only instructors can create classrooms.");
      setSuccessMessage("");
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (trimmedName.length < 2 || trimmedDescription.length < 5) {
      setErrorMessage(
        "Please provide a classroom name and a clear description.",
      );
      setSuccessMessage("");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription,
      };

      await api.post("/classrooms", payload);

      setName("");
      setDescription("");
      setSuccessMessage("Classroom created successfully.");
      setIsCreateDialogVisible(false);
      fetchClassrooms();
    } catch (error) {
      const fallbackMessage = "Failed to create classroom. Please try again.";

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

      setSuccessMessage("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!isStudent) {
      setJoinErrorMessage("Only students can join classrooms.");
      setJoinSuccessMessage("");
      return;
    }

    if (!isJoinCodeValid) {
      setJoinErrorMessage("Please enter a valid 8-character classroom code.");
      setJoinSuccessMessage("");
      return;
    }

    setIsJoiningClassroom(true);
    setJoinErrorMessage("");
    setJoinSuccessMessage("");

    try {
      await api.post(`/classrooms/${normalizedJoinCode}/join`);
      setJoinSuccessMessage("Joined classroom successfully.");
      setJoinCode("");
      fetchClassrooms();
    } catch (error) {
      const fallbackMessage = "Failed to join classroom. Please try again.";

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
          setJoinErrorMessage(responseData);
        } else {
          setJoinErrorMessage(responseData?.message || fallbackMessage);
        }
      } else {
        setJoinErrorMessage(fallbackMessage);
      }
    } finally {
      setIsJoiningClassroom(false);
    }
  };

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
        <Text className="text-3xl font-bold text-gray-900">Classrooms</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Create and manage your learning spaces.
        </Text>

        <View
          className="mt-8 rounded-3xl border p-5"
          style={{
            borderColor: "#E2E8F0",
            backgroundColor: "#FFFFFF",
            shadowColor: "#0F172A",
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          {isInstructor ? (
            <>
              <View className="flex-row items-center justify-between">
                <View className="flex-1 pr-4">
                  <Text className="text-lg font-semibold text-slate-900">
                    Your Classrooms
                  </Text>
                  <Text className="mt-1 text-sm text-slate-500">
                    Manage and monitor your classes.
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setErrorMessage("");
                    setIsCreateDialogVisible(true);
                  }}
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-2"
                      style={{
                        backgroundColor: accent,
                        opacity: pressed ? 0.88 : 1,
                      }}
                    >
                      <Text className="text-white font-semibold">Create</Text>
                    </View>
                  )}
                </Pressable>
              </View>

              {successMessage.length > 0 && (
                <Text className="mt-4 text-sm text-green-700">
                  {successMessage}
                </Text>
              )}

              <View className="mt-8">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-slate-900">
                    Your Classrooms
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {classrooms.length} total
                  </Text>
                </View>

                {isLoadingClassrooms ? (
                  <View className="mt-4 flex-row items-center">
                    <ActivityIndicator color={accent} />
                    <Text className="ml-2 text-sm text-slate-600">
                      Loading classrooms...
                    </Text>
                  </View>
                ) : classroomsError ? (
                  <Text className="mt-4 text-sm text-red-700">
                    {classroomsError}
                  </Text>
                ) : classrooms.length === 0 ? (
                  <Text className="mt-4 text-sm text-slate-600">
                    No classrooms yet. Create your first one above.
                  </Text>
                ) : (
                  <View className="mt-4 gap-3">
                    {classrooms.map((classroom) => (
                      <Pressable
                        key={classroom._id}
                        onPress={() => {
                          router.push(`/classroom/${classroom._id}`);
                        }}
                      >
                        {({ pressed }) => (
                          <View
                            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                            style={{ opacity: pressed ? 0.85 : 1 }}
                          >
                            <View className="flex-row items-start justify-between gap-3">
                              <Text
                                className="text-base font-semibold text-slate-900 flex-1"
                                numberOfLines={2}
                              >
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
                              {classroom.members?.length || 0} members
                            </Text>

                            <Text
                              className="mt-2 text-xs font-medium"
                              style={{ color: accent }}
                            >
                              Tap to view members
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : isStudent ? (
            <>
              <Text className="text-lg font-semibold text-slate-900">
                Join Classroom
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                Enter the classroom code from your instructor.
              </Text>

              <View className="mt-4">
                <Text className="text-sm font-medium text-gray-800">
                  Classroom Code
                </Text>
                <TextInput
                  value={joinCode}
                  onChangeText={(value) => {
                    setJoinCode(value.toUpperCase());
                    setJoinErrorMessage("");
                    setJoinSuccessMessage("");
                  }}
                  placeholder="e.g. AB2CD3EF"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={8}
                  className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
                  style={{ borderColor: "#E2E8F0", letterSpacing: 2 }}
                />
              </View>

              {joinErrorMessage.length > 0 && (
                <Text className="mt-4 text-sm text-red-700">
                  {joinErrorMessage}
                </Text>
              )}

              {joinSuccessMessage.length > 0 && (
                <Text className="mt-4 text-sm text-green-700">
                  {joinSuccessMessage}
                </Text>
              )}

              <Pressable
                className="mt-5"
                onPress={handleJoinClassroom}
                disabled={!isJoinCodeValid || isJoiningClassroom}
              >
                {({ pressed }) => (
                  <View
                    className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                    style={{
                      backgroundColor:
                        isJoinCodeValid && !isJoiningClassroom
                          ? accent
                          : "#94A3B8",
                      opacity:
                        isJoinCodeValid && !isJoiningClassroom
                          ? pressed
                            ? 0.88
                            : 1
                          : 1,
                    }}
                  >
                    {isJoiningClassroom ? (
                      <>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text className="ml-2 text-white font-semibold">
                          Joining...
                        </Text>
                      </>
                    ) : (
                      <Text className="text-white font-semibold">
                        Join classroom
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>

              <View className="mt-8">
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-slate-900">
                    Joined Classrooms
                  </Text>
                  <Text className="text-sm text-slate-500">
                    {classrooms.length} total
                  </Text>
                </View>

                {isLoadingClassrooms ? (
                  <View className="mt-4 flex-row items-center">
                    <ActivityIndicator color={accent} />
                    <Text className="ml-2 text-sm text-slate-600">
                      Loading classrooms...
                    </Text>
                  </View>
                ) : classroomsError ? (
                  <Text className="mt-4 text-sm text-red-700">
                    {classroomsError}
                  </Text>
                ) : classrooms.length === 0 ? (
                  <Text className="mt-4 text-sm text-slate-600">
                    You have not joined any classrooms yet.
                  </Text>
                ) : (
                  <View className="mt-4 gap-3">
                    {classrooms.map((classroom) => (
                      <View
                        key={classroom._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <Text
                            className="text-base font-semibold text-slate-900 flex-1"
                            numberOfLines={2}
                          >
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
                          {classroom.members?.length || 0} members
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          ) : (
            <View className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
              <Text className="text-sm font-semibold text-amber-900">
                Classroom access unavailable
              </Text>
              <Text className="mt-1 text-sm text-amber-800 leading-5">
                Please sign in with an instructor or student account.
              </Text>
            </View>
          )}
        </View>

        <Modal
          visible={isCreateDialogVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            if (!isSubmitting) {
              setIsCreateDialogVisible(false);
            }
          }}
        >
          <View
            className="flex-1 px-6"
            style={{ backgroundColor: "rgba(15, 23, 42, 0.45)" }}
          >
            <View className="flex-1 items-center justify-center">
              <View
                className="w-full rounded-3xl border bg-white p-5"
                style={{ borderColor: "#E2E8F0" }}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-lg font-semibold text-slate-900">
                    Create Classroom
                  </Text>
                  <Pressable
                    disabled={isSubmitting}
                    onPress={() => {
                      setIsCreateDialogVisible(false);
                    }}
                  >
                    <Text
                      className="text-sm font-semibold"
                      style={{ color: accent }}
                    >
                      Close
                    </Text>
                  </Pressable>
                </View>

                <Text className="mt-1 text-sm text-slate-500">
                  Provide a classroom name and description.
                </Text>

                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-800">
                    Name
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    placeholder="e.g. BSIT 3A"
                    placeholderTextColor="#94A3B8"
                    className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
                    style={{ borderColor: "#E2E8F0" }}
                  />
                </View>

                <View className="mt-4">
                  <Text className="text-sm font-medium text-gray-800">
                    Description
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={(value) => {
                      setDescription(value);
                      setErrorMessage("");
                      setSuccessMessage("");
                    }}
                    placeholder="e.g. Intro to networking and system administration"
                    placeholderTextColor="#94A3B8"
                    multiline
                    textAlignVertical="top"
                    className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
                    style={{
                      borderColor: "#E2E8F0",
                      minHeight: 120,
                    }}
                  />
                </View>

                {errorMessage.length > 0 && (
                  <Text className="mt-4 text-sm text-red-700">
                    {errorMessage}
                  </Text>
                )}

                <Pressable
                  className="mt-5"
                  onPress={handleCreateClassroom}
                  disabled={!isFormFilled || isSubmitting}
                >
                  {({ pressed }) => (
                    <View
                      className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                      style={{
                        backgroundColor:
                          isFormFilled && !isSubmitting ? accent : "#94A3B8",
                        opacity:
                          isFormFilled && !isSubmitting
                            ? pressed
                              ? 0.88
                              : 1
                            : 1,
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <ActivityIndicator color="#FFFFFF" />
                          <Text className="ml-2 text-white font-semibold">
                            Creating...
                          </Text>
                        </>
                      ) : (
                        <Text className="text-white font-semibold">
                          Create classroom
                        </Text>
                      )}
                    </View>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Classrooms;
