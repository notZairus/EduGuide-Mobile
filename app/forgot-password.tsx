import { useHandbook } from "@/hooks/use-handbook";
import { api } from "@/utils/api";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const PASSWORD_STRENGTH_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).+$/;

const requestResetSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(8, "Email must be at least 8 characters long")
    .regex(/^\S+@\S+\.\S+$/, "Please use a valid email address"),
});

const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(6, "Enter a valid reset token"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .regex(
        PASSWORD_STRENGTH_REGEX,
        "Password must include at least one lowercase letter, one uppercase letter, and one symbol",
      ),
    confirmPassword: z.string().trim().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestForm = z.infer<typeof requestResetSchema>;
type ResetForm = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordPage = () => {
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [requestForm, setRequestForm] = useState<RequestForm>({
    email: "",
  });
  const [resetForm, setResetForm] = useState<ResetForm>({
    token: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [requestError, setRequestError] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetStep, setShowResetStep] = useState(false);

  const handbookId = handbook?._id;

  const canRequest = useMemo(() => {
    return requestForm.email.trim().length > 0 && !!handbookId;
  }, [requestForm.email, handbookId]);

  const canReset = useMemo(() => {
    return (
      resetForm.token.trim().length > 0 &&
      resetForm.newPassword.trim().length > 0 &&
      resetForm.confirmPassword.trim().length > 0 &&
      !!handbookId
    );
  }, [resetForm, handbookId]);

  const handleRequestToken = async () => {
    const parsed = requestResetSchema.safeParse(requestForm);

    if (!parsed.success) {
      setRequestError(parsed.error.issues[0]?.message || "Invalid form data");
      setRequestMessage("");
      return;
    }

    if (!handbookId) {
      setRequestError("Handbook not loaded. Please try again.");
      setRequestMessage("");
      return;
    }

    setIsRequesting(true);
    setRequestError("");
    setRequestMessage("");

    try {
      const response = await api.post("/mobile-auth/forgot-password/request", {
        email: parsed.data.email,
        handbookId,
      });

      const data = response.data as { message?: string };

      setRequestMessage(
        data.message || "If your account exists, a reset token was sent.",
      );
      setShowResetStep(true);
    } catch (error) {
      const fallbackMessage = "Failed to request reset token.";

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
          setRequestError(responseData);
        } else {
          setRequestError(responseData?.message || fallbackMessage);
        }
      } else {
        setRequestError(fallbackMessage);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleResetPassword = async () => {
    const parsed = resetPasswordSchema.safeParse(resetForm);

    if (!parsed.success) {
      setResetError(parsed.error.issues[0]?.message || "Invalid form data");
      setResetMessage("");
      return;
    }

    if (!handbookId) {
      setResetError("Handbook not loaded. Please try again.");
      setResetMessage("");
      return;
    }

    setIsResetting(true);
    setResetError("");
    setResetMessage("");

    try {
      const response = await api.post("/mobile-auth/forgot-password/reset", {
        email: requestForm.email.trim().toLowerCase(),
        handbookId,
        verificationToken: parsed.data.token,
        newPassword: parsed.data.newPassword,
      });

      const data = response.data as { message?: string };
      setResetMessage(data.message || "Password reset successfully.");

      setTimeout(() => {
        router.replace("/login");
      }, 700);
    } catch (error) {
      const fallbackMessage = "Failed to reset password.";

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
          setResetError(responseData);
        } else {
          setResetError(responseData?.message || fallbackMessage);
        }
      } else {
        setResetError(fallbackMessage);
      }
    } finally {
      setIsResetting(false);
    }
  };

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

        <Text className="text-3xl font-bold text-gray-900 mt-2">
          Forgot Password
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Request a reset token, then set your new password.
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
          <Text className="text-sm font-medium text-gray-800">Email</Text>
          <TextInput
            value={requestForm.email}
            onChangeText={(text) => {
              setRequestForm({ email: text });
              setRequestError("");
              setRequestMessage("");
            }}
            placeholder="you@example.com"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
            style={{ borderColor: requestError ? "#DC2626" : "#E5E7EB" }}
          />

          {requestError.length > 0 && (
            <Text className="mt-2 text-sm text-red-700">{requestError}</Text>
          )}

          {requestMessage.length > 0 && (
            <Text className="mt-2 text-sm text-green-700">
              {requestMessage}
            </Text>
          )}

          <Pressable
            className="mt-5"
            onPress={handleRequestToken}
            disabled={!canRequest || isRequesting}
          >
            {({ pressed }) => (
              <View
                className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                style={{
                  backgroundColor:
                    canRequest && !isRequesting ? accent : "#9CA3AF",
                  opacity:
                    canRequest && !isRequesting ? (pressed ? 0.88 : 1) : 1,
                }}
              >
                {isRequesting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Sending...
                    </Text>
                  </>
                ) : (
                  <Text className="text-center text-white font-semibold text-base">
                    Request Token
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </View>

        {showResetStep && (
          <View
            className="mt-5 rounded-3xl p-5"
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
            <Text className="text-sm font-medium text-gray-800">
              Reset Token
            </Text>
            <TextInput
              value={resetForm.token}
              onChangeText={(text) => {
                setResetForm((prev) => ({ ...prev, token: text }));
                setResetError("");
                setResetMessage("");
              }}
              placeholder="Enter the token sent to your email"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
              style={{ borderColor: resetError ? "#DC2626" : "#E5E7EB" }}
            />

            <Text className="mt-4 text-sm font-medium text-gray-800">
              New Password
            </Text>
            <TextInput
              value={resetForm.newPassword}
              onChangeText={(text) => {
                setResetForm((prev) => ({ ...prev, newPassword: text }));
                setResetError("");
                setResetMessage("");
              }}
              placeholder="Enter new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
              style={{ borderColor: resetError ? "#DC2626" : "#E5E7EB" }}
            />

            <Text className="mt-4 text-sm font-medium text-gray-800">
              Confirm Password
            </Text>
            <TextInput
              value={resetForm.confirmPassword}
              onChangeText={(text) => {
                setResetForm((prev) => ({ ...prev, confirmPassword: text }));
                setResetError("");
                setResetMessage("");
              }}
              placeholder="Confirm new password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
              style={{ borderColor: resetError ? "#DC2626" : "#E5E7EB" }}
            />

            {resetError.length > 0 && (
              <Text className="mt-2 text-sm text-red-700">{resetError}</Text>
            )}

            {resetMessage.length > 0 && (
              <Text className="mt-2 text-sm text-green-700">
                {resetMessage}
              </Text>
            )}

            <Pressable
              className="mt-5"
              onPress={handleResetPassword}
              disabled={!canReset || isResetting}
            >
              {({ pressed }) => (
                <View
                  className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                  style={{
                    backgroundColor:
                      canReset && !isResetting ? accent : "#9CA3AF",
                    opacity:
                      canReset && !isResetting ? (pressed ? 0.88 : 1) : 1,
                  }}
                >
                  {isResetting ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" />
                      <Text className="text-white font-semibold text-base ml-2">
                        Resetting...
                      </Text>
                    </>
                  ) : (
                    <Text className="text-center text-white font-semibold text-base">
                      Reset Password
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordPage;
