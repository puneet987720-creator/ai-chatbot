import {TouchableOpacity, Text, View, ActivityIndicator, Alert } from "react-native";
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

      // 1. Generate deep link target: "myapp://auth-callback"
      const redirectUrl = Linking.createURL('auth-callback');

      // 2. Build full Laravel endpoint URL passing target deep link as parameter
      const authUrl = `${LARAVEL_API_URL}/auth/google?redirect_url=${encodeURIComponent(redirectUrl)}`;

      // 3. Open in-app browser session and await user login
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      // 4. Process returning deep-link URL
      if (result.type === 'success' && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const Token = queryParams?.token;
        const tokenValue = Array.isArray(Token) ? Token[0] : Token;

        if (tokenValue) {
          // 5. Store API token securely on device
          await SecureStore.setItemAsync('userToken', tokenValue);
          
          Alert.alert('Success', 'Logged in with Google successfully!');
          
          // Navigate to main app screen (e.g., Home)
          // navigation.navigate('Home');
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
