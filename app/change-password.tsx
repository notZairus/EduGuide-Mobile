import { useAuthenticatedUser } from "@/hooks/use-authenticated-user";
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

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, "Current password must be at least 8 characters")
      .max(32, "Current password must be at most 32 characters"),
    newPassword: z
      .string()
      .trim()
      .min(8, "Password must be at least 8 characters")
      .max(32, "Password must be at most 32 characters")
      .regex(
        PASSWORD_STRENGTH_REGEX,
        "Password must include at least one lowercase letter, one uppercase letter, and one symbol",
      ),
    confirmPassword: z
      .string()
      .trim()
      .min(8, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

const ChangePasswordPage = () => {
  const { authenticatedUser } = useAuthenticatedUser();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [form, setForm] = useState<ChangePasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.currentPassword.trim().length > 0 &&
      form.newPassword.trim().length > 0 &&
      form.confirmPassword.trim().length > 0
    );
  }, [form]);

  const updateField = (key: keyof ChangePasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async () => {
    if (!authenticatedUser?.accessToken) {
      setErrorMessage(
        "You need to log in again before changing your password.",
      );
      setSuccessMessage("");
      return;
    }

    const parsed = changePasswordSchema.safeParse(form);

    if (!parsed.success) {
      setErrorMessage(parsed.error.issues[0]?.message || "Invalid form data");
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await api.post("/mobile-auth/change-password", {
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
      });

      const data = response.data as { message?: string };

      setSuccessMessage(data.message || "Password updated successfully.");
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const fallbackMessage = "Failed to update password.";

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
          Change Password
        </Text>
        <Text className="text-sm text-gray-500 mt-1">
          Update your account password while signed in.
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
          <Text className="text-sm font-medium text-gray-800">
            Current Password
          </Text>
          <TextInput
            value={form.currentPassword}
            onChangeText={(text) => updateField("currentPassword", text)}
            placeholder="Enter your current password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
            style={{ borderColor: errorMessage ? "#DC2626" : "#E5E7EB" }}
          />

          <Text className="mt-4 text-sm font-medium text-gray-800">
            New Password
          </Text>
          <TextInput
            value={form.newPassword}
            onChangeText={(text) => updateField("newPassword", text)}
            placeholder="Enter your new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
            style={{ borderColor: errorMessage ? "#DC2626" : "#E5E7EB" }}
          />

          <Text className="mt-4 text-sm font-medium text-gray-800">
            Confirm New Password
          </Text>
          <TextInput
            value={form.confirmPassword}
            onChangeText={(text) => updateField("confirmPassword", text)}
            placeholder="Re-enter your new password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
            style={{ borderColor: errorMessage ? "#DC2626" : "#E5E7EB" }}
          />

          <Text className="mt-3 text-xs text-slate-500">
            Use 8-32 characters with at least one uppercase letter, one
            lowercase letter, and one symbol.
          </Text>

          {errorMessage.length > 0 && (
            <Text className="mt-3 text-sm text-red-700">{errorMessage}</Text>
          )}

          {successMessage.length > 0 && (
            <Text className="mt-3 text-sm text-green-700">
              {successMessage}
            </Text>
          )}

          <Pressable
            className="mt-5"
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {({ pressed }) => (
              <View
                className="rounded-xl px-4 py-3 flex-row items-center justify-center"
                style={{
                  backgroundColor:
                    canSubmit && !isSubmitting ? accent : "#9CA3AF",
                  opacity:
                    canSubmit && !isSubmitting ? (pressed ? 0.88 : 1) : 1,
                }}
              >
                {isSubmitting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Updating...
                    </Text>
                  </>
                ) : (
                  <Text className="text-center text-white font-semibold text-base">
                    Save New Password
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ChangePasswordPage;
