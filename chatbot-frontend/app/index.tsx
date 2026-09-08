import { Text, View, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/FontAwesome";
import RoboIcon from '@expo/vector-icons/FontAwesome6';
import api from ".././api/chatBot";
import {useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const [loader, setLoader] = useState(false);
  const [appLoad, setAppLoad] = useState(false);
  const route = useRoute();
  const rawToken = (route.params as { token?: string } | undefined)?.token;
  const token = rawToken?.split("|")[1] || null;

  const storeToken = async (token: string) => {
    try {
      await AsyncStorage.setItem("token", token);
      console.log("Token stored successfully:", token);
      setAppLoad(true);      
    } catch (error) {
      console.error("Error storing token:", error);
      setLoader(false);
    }
  };

  const getTokenFromStorage = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("token");
      if (storedToken) {
        setLoader(true);
        console.log("Token retrieved from storage:", storedToken);
        setAppLoad(true);
      }
    } catch (error) {
      console.error("Error retrieving token from storage:", error);
    }
  }
  const handleGoogleSignIn = async () => {
    setLoader(true);
  }

  useEffect(() => {
    getTokenFromStorage();
    if (token) {
      storeToken(token);
    }
  }, [token]);

  return (
    <View className="text-lg flex-col bg-black justify-center items-center h-full">
      <View className="mb-4">
      <RoboIcon name="robot" size={100} color="white" />
      </View>
      { appLoad ? (
      <Link href="/(drawer)/chatTab" dismissTo>
        <View className="flex-row bg-blue-400 justify-center rounded-full items-center h-auto w-auto p-4">
          <Icon name="arrow-right" size={30} color="white" />
        </View>
      </Link>
      ) : loader ? (
        <View className="flex-row bg-gray-200 justify-center rounded-lg items-center h-auto w-auto p-4">
          <Icon name="google" size={30} color="gray" />
          <Text className=" ml-2 text-lg color-gray-500">
            Sign in with Google
          </Text>
          <ActivityIndicator size="large" color="#ffffff" className="ml-2" />
        </View>
      ) : (
        <Link
          onPress={handleGoogleSignIn}
          href="http://127.0.0.1:8000/api/auth/google"
        >
          <View className="flex-row bg-blue-400 justify-center rounded-lg items-center h-auto w-auto p-4">
            <Icon name="google" size={30} color="white" />
            <Text className=" ml-2 text-lg color-white">
              Sign in with Google
            </Text>
          </View>
        </Link>
      )}
    </View>
  );
}
