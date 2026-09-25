import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AuthCallback() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const rawToken = Array.isArray(token) ? token[0] : token;
        const cleanedToken = rawToken?.split("|")[1] ?? rawToken;

        if (!cleanedToken) {
          setMessage("Sign in failed. No token was returned.");
          setTimeout(() => router.replace("/"), 1500);
          return;
        }

        await AsyncStorage.setItem("token", cleanedToken);
        setMessage("Sign in successful. Redirecting...");
        setTimeout(() => router.replace("/"), 800);
      } catch (error) {
        console.error("Auth callback error:", error);
        setMessage("Sign in failed. Please try again.");
        setTimeout(() => router.replace("/"), 1500);
      }
    };

    completeAuth();
  }, [token, router]);

  return (
    <View className="flex-1 items-center justify-center bg-black px-6">
      <ActivityIndicator size="large" color="#ffffff" />
      <Text className="mt-4 text-lg text-white">{message}</Text>
    </View>
  );
}
