import { View, FlatList, Text, ActivityIndicator } from "react-native";
import { useState, useEffect, useCallback, useContext } from "react";
import { Link } from "expo-router";
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

export default function SideTab() {
  // const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const chatContext = useContext(ChatContext);
  if (!chatContext) {
    throw new Error("SideTab must be rendered inside ChatContext.Provider");
  }
  const { chatHistory, setChatHistory } = chatContext;
  const [loader, setLoader] = useState(true);

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
      const normalizeResponse: ChatHistoryItem[] = response.data.conversations.map(
        (c: ChatHistoryItem) => ({
          title: c.title,
          id: c.id,
        }),
      );
      const reverseResponse = [...normalizeResponse].reverse();
      setChatHistory(reverseResponse);
      storeChatHistory(reverseResponse);
    }catch (error) {
      console.error("Error fetching chat history:", error);
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
      <View className="text-lg flex-row justify-center items-center h-auto p-4 bg-gray-200">
        <Link href="/chatTab">
          <Icon name="plus" size={20} color="black" />
          <Text className="ml-2 text-lg color-black">New Chat</Text>
        </Link>
      </View>
      <View className="text-lg flex-column justify-center items-center h-full">
        {loader ? (
          <ActivityIndicator size={"large"} color={"black"} />
        ) : (
          <FlatList
            data={chatHistory}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 65}}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
