import {TouchableOpacity, Text, View, ActivityIndicator, Alert, Platform } from "react-native";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import Icon from "@expo/vector-icons/FontAwesome";
import RoboIcon from '@expo/vector-icons/FontAwesome6';
import api from ".././api/chatBot";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import {useRoute} from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const saveAuthToken = async (value: string) => {
  try {
    if (typeof SecureStore?.setItemAsync === 'function') {
      await SecureStore.setItemAsync('userToken', value);
      return;
    }
  } catch (error) {
    console.warn('SecureStore failed, falling back to localStorage', error);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('userToken', value);
  }
};

WebBrowser.maybeCompleteAuthSession();
// REPLACE WITH YOUR LIVE LARAVEL API DOMAIN
const LARAVEL_API_URL = 'https://ai-chatbot-t5fk.onrender.com/api';

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
  const handleGoogleLogin = async () => {
    try {
      setLoader(true);

      const redirectUrl =
        Platform.OS === 'web'
          ? `${window.location.origin}/auth-callback`
          : 'chatbotfrontend://auth-callback';

      const authUrl = `${LARAVEL_API_URL}/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;

      if (Platform.OS === 'web') {
        window.location.href = authUrl;
        return;
      }

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const tokenParam = queryParams?.token;
        const tokenValue = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

        if (tokenValue) {
          await saveAuthToken(tokenValue);
          Alert.alert('Success', 'Logged in with Google successfully!');
        } else {
          Alert.alert('Error', 'Token not found in login callback response.');
        }
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      Alert.alert('Authentication Failed', 'An error occurred during Google Sign-In.');
    } finally {
      setLoader(false);
    }
  };

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
        <TouchableOpacity
          onPress={handleGoogleLogin}
        >
          <View className="flex-row bg-blue-400 justify-center rounded-lg items-center h-auto w-auto p-4">
            <Icon name="google" size={30} color="white" />
            <Text className=" ml-2 text-lg color-white">
              Sign in with Google
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
