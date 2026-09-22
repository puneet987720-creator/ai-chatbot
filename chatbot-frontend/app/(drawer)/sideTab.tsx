import { View,Alert, FlatList, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "expo-router";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';
import Icon from "@expo/vector-icons/FontAwesome";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import ChatHistory from "../../component/chatHistory";
import api from "../../api/chatBot";
import RoboIcon from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatContext } from "@/contexts/chatContext";

type ChatHistoryItem = {
  title: string;
  id: string;
};

WebBrowser.maybeCompleteAuthSession();
// REPLACE WITH YOUR LIVE LARAVEL API DOMAIN
const LARAVEL_API_URL = 'https://ai-chatbot-t5fk.onrender.com/api';

export default function SideTab() {
  // const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error("SideTab must be rendered inside ChatContext.Provider");
  }
  const { chatHistory, setChatHistory } = chatContext;
  const [loader, setLoader] = useState(true);
  const [loader1, setLoader1] = useState(false);

  const storeChatHistory = async (chatHistory: ChatHistoryItem[]) => {
    try {
      await AsyncStorage.setItem("chatHistory", JSON.stringify(chatHistory));
      console.log("Chat history stored successfully:", chatHistory);
      setLoader(false);
    } catch (error) {
      console.error("Error storing chat history:", error);
      setLoader(false);
    }
  };

  const handleGoogleLogin = async () => {
     try {
          setLoader1(true);
    
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
          setLoader1(false);
        }
  }

  const getChatHistory = async () => {
    try {
      const storedChat = await AsyncStorage.getItem("chatHistory");
      if (storedChat) {
        console.log("chat retrieved from storage:", storedChat);
        const parsedChatHistory = JSON.parse(storedChat) as ChatHistoryItem[];
        setChatHistory(parsedChatHistory);
        setLoader(false);
      } else {
        fetchChatHistory();
      }
    } catch (error) {
      console.error("Error retrieving token from storage:", error);
      setLoader(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      setLoader(true);
      const response = await api.get("/chat/conversations");
      console.log("Chat history:", response.data.conversations);
      const normalizeResponse: ChatHistoryItem[] =
        response.data.conversations.map((c: ChatHistoryItem) => ({
          title: c.title,
          id: c.id,
        }));
      const reverseResponse = [...normalizeResponse].reverse();
      setChatHistory(reverseResponse);
      storeChatHistory(reverseResponse);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setLoader(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: ChatHistoryItem }) => (
    <ChatHistory title={item.title} id={item.id} />
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     fetchChatHistory();
  //     getChatHistory();
  //   }, [])
  // );
  useEffect(() => {
    getChatHistory();
    fetchChatHistory();
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <View className="text-lg flex-row justify-between items-center h-auto p-4 bg-gray-200">
        <Link href="/chatTab">
          <Icon name="plus" size={20} color="black" />
          <Text className="ml-2 text-lg color-black">New Chat</Text>
        </Link>
        {loader1 ? (
          <ActivityIndicator size={"large"} color={"black"} />
        ) : (
        <TouchableOpacity onPress={handleGoogleLogin}>
          <Icon name="google" size={30} color="black" />
          <Text className=" ml-2 text-lg color-black">Another Account</Text>
        </TouchableOpacity>
        )}
      </View>
      <View className="text-lg flex-column justify-center items-center h-full">
        {loader ? (
          <ActivityIndicator size={"large"} color={"black"} />
        ) : (
          <FlatList
            data={chatHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 65 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
