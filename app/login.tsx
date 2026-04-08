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

export const mobileLoginSchema = z.object({
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
    .max(32, "Password must be at most 32 characters"),
  handbookId: z.string().trim().optional(),
});

type LoginFormData = z.infer<typeof mobileLoginSchema>;
type LoginFormErrors = Partial<Record<keyof LoginFormData, string>>;

const LoginPage = () => {
  const { setAuthenticatedUser } = useAuthenticatedUser();
  const { handbook } = useHandbook();
  const accent = handbook?.color || "#111";

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    handbookId: handbook?._id,
  });
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormFilled = useMemo(() => {
    return (
      formData.email.trim().length > 0 && formData.password.trim().length > 0
    );
  }, [formData]);

  const updateField = <K extends keyof LoginFormData>(
    key: K,
    value: LoginFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitMessage("");
    setSubmitError(false);
  };

  const handleLogin = async () => {
    const parsed = mobileLoginSchema.safeParse(formData);

    if (!parsed.success) {
      const fieldErrors: LoginFormErrors = {};

      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as keyof LoginFormData;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      setSubmitMessage("Please fix the highlighted fields.");
      setSubmitError(true);
      return;
    }

    setErrors({});
    setSubmitMessage("");
    setSubmitError(false);
    setIsSubmitting(true);

    try {
      const res = await api.post("/mobile-auth/login", parsed.data);
      const data = res.data as {
        message?: string;
        accessToken?: string;
        user?: {
          id?: string;
          firstName?: string;
          middleName?: string;
          lastName?: string;
          role?: string;
        };
      };

      const formattedUser = data.user
        ? {
            ...data.user,
            accessToken: data.accessToken,
            email: parsed.data.email,
            name: [data.user.firstName, data.user.lastName]
              .filter(Boolean)
              .join(" ")
              .trim(),
          }
        : {
            accessToken: data.accessToken,
            email: parsed.data.email,
            name: parsed.data.email,
          };

      setAuthenticatedUser(formattedUser);
      setSubmitMessage(data.message || "Login successful.");
      setSubmitError(false);

      setTimeout(() => {
        router.replace("/me");
      }, 350);
    } catch (error) {
      const fallbackMessage = "Login failed. Please check your credentials.";

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
          setSubmitMessage(responseData);
        } else {
          setSubmitMessage(responseData?.message || fallbackMessage);
        }
      } else {
        setSubmitMessage(fallbackMessage);
      }

      setSubmitError(true);
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

        <Text className="text-3xl font-bold text-gray-900 mt-2">Login</Text>
        <Text className="text-sm text-gray-500 mt-1">
          Welcome back. Sign in to continue your progress.
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
          <View className="mt-1">
            <Text className="text-sm font-medium text-gray-800">Email</Text>
            <TextInput
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
              style={{ borderColor: errors.email ? "#DC2626" : "#E5E7EB" }}
            />
            {errors.email && (
              <Text className="text-xs text-red-600 mt-1">{errors.email}</Text>
            )}
          </View>

          <View className="mt-4">
            <Text className="text-sm font-medium text-gray-800">Password</Text>
            <TextInput
              value={formData.password}
              onChangeText={(text) => updateField("password", text)}
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              className="mt-2 rounded-xl border px-4 py-3 text-base bg-white"
              style={{ borderColor: errors.password ? "#DC2626" : "#E5E7EB" }}
            />
            {errors.password && (
              <Text className="text-xs text-red-600 mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          {submitMessage.length > 0 && (
            <Text
              className="mt-4 text-sm"
              style={{ color: submitError ? "#B91C1C" : "#15803D" }}
            >
              {submitMessage}
            </Text>
          )}

          <Pressable
            onPress={handleLogin}
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
                      Signing in...
                    </Text>
                  </>
                ) : (
                  <Text className="text-center text-white font-semibold text-base">
                    Login
                  </Text>
                )}
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push("/register")} className="mt-4">
            {({ pressed }) => (
              <Text
                className="text-center text-sm font-semibold"
                style={{ color: accent, opacity: pressed ? 0.8 : 1 }}
              >
                No account yet? Register
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push("/forgot-password")}
            className="mt-3"
          >
            {({ pressed }) => (
              <Text
                className="text-center text-sm font-semibold"
                style={{ color: accent, opacity: pressed ? 0.8 : 1 }}
              >
                Forgot password?
              </Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginPage;
