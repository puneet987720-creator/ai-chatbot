import {
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState, useEffect } from "react";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "@expo/vector-icons/FontAwesome";
import UserContent from "../../component/userContent";
import AssistantContent from "../../component/assistantContent";
import { useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RoboIcon from "@expo/vector-icons/FontAwesome6";
import api from "@/api/chatBot";

type ChatMessage = {
  role: "user" | "assistant"; // or string if backend sends other roles
  content: string;
};

export default function ChatTab() {
  const route = useRoute();
  const [loader, setLoader] = useState(true);
  const [loader1, setLoader1] = useState(false);
  const [content, setContent] = useState<string>("");
  const [id, setId] = useState<string>("");
  const paramsId = (route.params as { id?: string } | null)?.id;
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const fetchChatMessages = async (id: string) => {
    try {
      setLoader(false);
      setLoader1(true);
      const response = await api.get(`/chat/messages/${id}`);
      console.log("Chat messages:", response.data.messages);
      setChatMessages( response.data.messages);
      setLoader1(false);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const sendContent = async (message: string, conversation_id?: string) => {
    try {
      setLoader(false);
      setLoader1(true);
      const payload: any = { message };
      if (conversation_id) {
        payload.conversation_id = conversation_id;
      }
      const res = await api.post(`/chat/send`, payload);

      const normalizeResponse : ChatMessage[] = res.data.conversation.map((m : ChatMessage)=>({
        role: m.role ,
        content: m.content 
      }))
      if (!conversation_id && res.data.conversation[0].conversation_id) {
        console.log(res.data.conversation[0].conversation_id)
        setId(res.data.conversation.conversation_id);
      }
      // Append new message
      console.log(res.data.conversation)
      setChatMessages(prev => [...prev, ...normalizeResponse]);

      setContent(""); // clear input
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoader1(false);
    }
  };

  console.log(content);
  useEffect(() => {
    if (paramsId) {
      console.log("entered useeffect");
      setId(paramsId);
      fetchChatMessages(paramsId);
    }
    console.log("exit useeffect");
    return;
  }, [paramsId]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-col h-full">
        {/* Header */}
        {/* <View className="flex-row justify-between items-center p-4 bg-gray-200">
          <Link href="/(drawer)/sideTab" dismissTo>
            <Icon name="bars" size={20} color="black" />
          </Link>
          <RoboIcon name="robot" size={20} color="black" />
        </View> */}
        {/* User Message (right-aligned bubble) */}
        {loader ? (
          <View className="flex-row justify-center items-center h-full">
            <RoboIcon name="robot" size={100} color="white" />
          </View>
        ) : (
          
          <FlatList
            data={chatMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }): React.ReactElement | null => {
              if (item.role === "user") {
                return (
                  <View className="items-end px-4 mt-2">
                    <View className="bg-gray-600 rounded-2xl p-3 max-w-xs">
                      <UserContent text={item.content} />
                    </View>
                  </View>
                );
              } else {
                return (
                  <View className="flex-auto items-start px-4 mt-2">
                    <AssistantContent response={item.content} />
                  </View>
                );
              }
              return null;
            }}
            contentContainerStyle={{ paddingBottom: 150 }}
          />
        )}
        {loader1 && <ActivityIndicator className="mb-25" size={"large"} color={"white"}
        />}
        <View className="absolute bottom-5 left-5 right-5 rounded-lg bg-gray-800 p-3 mt-10 flex-row items-center">
          <TextInput
            className="text-white h-auto w-full p-2 rounded-lg bg-gray-700"
            placeholder="Type a message..."
            value={content}
            placeholderTextColor="#aaa"
            onChangeText={(text) => {
              setContent(text);
            }}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={() => sendContent(content, id)}
            className="ml-2 bg-blue-600 p-2 rounded-lg"
          >
            <Text className="text-white">Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
