import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { z } from "zod";

export const mobileRegisterSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(8, "Email must be at least 8 characters long")
      .regex(/^\S+@\S+\.\S+$/, "Please use a valid email address"),

    password: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/,
        "Password must include at least one lowercase letter, one uppercase letter, and one symbol",
      ),

    confirmPassword: z.string().trim().min(1, "Please confirm your password"),

    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters"),

    middleName: z.string().trim().optional(),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters"),

    role: z.enum(["student", "instructor"]),

    handbookId: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof mobileRegisterSchema>;

type RegisterFormErrors = Partial<Record<keyof RegisterFormData, string>>;

const RegisterPage = () => {
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    middleName: "",
    lastName: "",
    role: "student",
    handbookId: handbook?._id,
  });
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [submitMessage, setSubmitMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationModalVisible, setVerificationModalVisible] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifyingToken, setIsVerifyingToken] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationError, setVerificationError] = useState(false);

  const isFormFilled = useMemo(() => {
    return (
      formData.email.trim().length > 0 &&
      formData.password.trim().length > 0 &&
      formData.confirmPassword.trim().length > 0 &&
      formData.firstName.trim().length > 0 &&
      formData.lastName.trim().length > 0
    );
  }, [formData]);

  const updateField = <K extends keyof RegisterFormData>(
    key: K,
    value: RegisterFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitMessage("");
  };

  const handleRegister = async () => {
    const parsed = mobileRegisterSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors: RegisterFormErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      setSubmitMessage("Please fix the highlighted fields.");
      return;
    }

    setErrors({});
    setSubmitMessage("");
    setIsSubmitting(true);

    try {
      const { confirmPassword: _confirmPassword, ...registerPayload } =
        parsed.data;
      await api.post("/mobile-auth/validate-registration", registerPayload);

      setVerificationCode("");
      setVerificationMessage("");
      setVerificationError(false);
      setVerificationModalVisible(true);
      setSubmitMessage("Verification code sent to your email.");
    } catch (error) {
      const fallbackMessage =
        "Registration validation failed. Please try again.";

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
          | undefined;
        setSubmitMessage(responseData?.message || fallbackMessage);
      } else {
        setSubmitMessage(fallbackMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyRegistration = async () => {
    const trimmedToken = verificationCode.trim();

    if (!trimmedToken) {
      setVerificationError(true);
      setVerificationMessage("Please enter the verification code.");
      return;
    }

    setIsVerifyingToken(true);
    setVerificationMessage("");
    setVerificationError(false);

    try {
      const payload = {
        email: formData.email.trim().toLowerCase(),
        verification_token: trimmedToken,
      };

      const res = await api.post("/mobile-auth/verify-registration", payload);
      const data = res.data as { message?: string };

      setVerificationError(false);
      setVerificationMessage(data?.message || "User registered successfully.");
      setSubmitMessage(data?.message || "User registered successfully.");

      setTimeout(() => {
        setVerificationModalVisible(false);
        router.back();
      }, 700);
    } catch (error) {
      const fallbackMessage = "Invalid verification token";

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
          | undefined;
        setVerificationError(true);
        setVerificationMessage(responseData?.message || fallbackMessage);
      } else {
        setVerificationError(true);
        setVerificationMessage(fallbackMessage);
      }
    } finally {
      setIsVerifyingToken(false);
    }
  };

  const renderInput = ({
    label,
    field,
    placeholder,
    secureTextEntry,
    autoCapitalize = "none",
    keyboardType,
  }: {
    label: string;
    field: keyof RegisterFormData;
    placeholder: string;
    secureTextEntry?: boolean;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    keyboardType?: "default" | "email-address";
  }) => (
    <View className="mt-4">
      <Text className="text-sm font-medium text-gray-800">{label}</Text>
      <TextInput
        value={String(formData[field] ?? "")}
        onChangeText={(text) =>
          updateField(field, text as RegisterFormData[typeof field])
        }
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={false}
        className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
        style={{
          borderColor: errors[field] ? "#DC2626" : "#E5E7EB",
        }}
      />
      {errors[field] && (
        <Text className="text-xs text-red-600 mt-1">{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          className="self-start px-1 py-2"
        >
          <Text style={{ color: accent }} className="text-sm font-semibold">
            Back
          </Text>
        </Pressable>

        <Text className="text-3xl font-bold text-gray-900 mt-2">Register</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Create your account to start tracking your progress.
        </Text>

        <View
          className="mt-6 rounded-3xl p-5"
          style={{
            backgroundColor: "#FFFFFF",
            borderWidth: 1,
            borderColor: "#F1F5F9",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 8 },
            elevation: 5,
          }}
        >
          {renderInput({
            label: "Email",
            field: "email",
            placeholder: "you@example.com",
            keyboardType: "email-address",
          })}

          {renderInput({
            label: "Password",
            field: "password",
            placeholder: "Enter password",
            secureTextEntry: true,
          })}

          {renderInput({
            label: "Confirm Password",
            field: "confirmPassword",
            placeholder: "Re-enter password",
            secureTextEntry: true,
          })}

          {renderInput({
            label: "First Name",
            field: "firstName",
            placeholder: "Juan",
            autoCapitalize: "words",
          })}

          {renderInput({
            label: "Middle Name (Optional)",
            field: "middleName",
            placeholder: "Santos",
            autoCapitalize: "words",
          })}

          {renderInput({
            label: "Last Name",
            field: "lastName",
            placeholder: "Dela Cruz",
            autoCapitalize: "words",
          })}

          <View className="mt-5">
            <Text className="text-sm font-medium text-gray-800">Role</Text>
            <View className="flex-row gap-3 mt-2">
              {(["student", "instructor"] as const).map((role) => {
                const isSelected = formData.role === role;
                return (
                  <Pressable
                    key={role}
                    onPress={() => updateField("role", role)}
                    className="flex-1"
                  >
                    {({ pressed }) => (
                      <View
                        className="rounded-xl px-4 py-3 border"
                        style={{
                          borderColor: isSelected ? accent : "#E5E7EB",
                          backgroundColor: isSelected
                            ? accent + "12"
                            : pressed
                              ? "#F8FAFC"
                              : "#FFFFFF",
                        }}
                      >
                        <Text
                          className="text-center font-semibold capitalize"
                          style={{ color: isSelected ? accent : "#334155" }}
                        >
                          {role}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {errors.role && (
              <Text className="text-xs text-red-600 mt-1">{errors.role}</Text>
            )}
          </View>

          {submitMessage.length > 0 && (
            <Text
              className="mt-4 text-sm"
              style={{
                color: Object.keys(errors).length > 0 ? "#B91C1C" : "#15803D",
              }}
            >
              {submitMessage}
            </Text>
          )}

          <Pressable
            onPress={handleRegister}
            disabled={!isFormFilled || isSubmitting}
            className="mt-6"
          >
            {({ pressed }) => (
              <View
                className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                style={{
                  backgroundColor:
                    isFormFilled && !isSubmitting ? accent : "#9CA3AF",
                  opacity:
                    isFormFilled && !isSubmitting ? (pressed ? 0.88 : 1) : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Sending code...
                    </Text>
                  </>
                ) : (
                  <Text className="text-center text-white font-semibold text-base">
                    Create Account
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={verificationModalVisible}
        onRequestClose={() => setVerificationModalVisible(false)}
      >
        <View
          className="flex-1 px-6"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.45)",
            justifyContent: "center",
          }}
        >
          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              shadowColor: "#000",
              shadowOpacity: 0.14,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Text className="text-2xl font-bold text-gray-900">
              Verify Your Email
            </Text>
            <Text className="text-sm text-gray-600 mt-2 leading-5">
              We sent a verification code to {formData.email}. Enter it below to
              continue.
            </Text>

            <TextInput
              value={verificationCode}
              onChangeText={(text) => {
                setVerificationCode(text);
                if (verificationMessage) {
                  setVerificationMessage("");
                  setVerificationError(false);
                }
              }}
              placeholder="Enter verification code"
              placeholderTextColor="#9CA3AF"
              className="mt-5 rounded-xl border px-4 py-3 text-base"
              style={{ borderColor: "#E5E7EB" }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {verificationMessage.length > 0 && (
              <Text
                className="text-sm mt-3"
                style={{ color: verificationError ? "#B91C1C" : "#15803D" }}
              >
                {verificationMessage}
              </Text>
            )}

            <View className="mt-5 gap-3">
              <Pressable onPress={handleVerifyRegistration}>
                {({ pressed }) => (
                  <View
                    className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                    style={{
                      backgroundColor: isVerifyingToken ? "#9CA3AF" : accent,
                      opacity: isVerifyingToken ? 1 : pressed ? 0.88 : 1,
                    }}
                  >
                    {isVerifyingToken ? (
                      <>
                        <ActivityIndicator color="#FFFFFF" />
                        <Text className="text-white font-semibold ml-2">
                          Verifying...
                        </Text>
                      </>
                    ) : (
                      <Text className="text-center text-white font-semibold">
                        Submit Code
                      </Text>
                    )}
                  </View>
                )}
              </Pressable>

              <Pressable onPress={() => setVerificationModalVisible(false)}>
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
                      Close
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegisterPage;
