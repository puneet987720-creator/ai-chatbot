import { View, Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Link} from "expo-router";
import { useContext, useState } from 'react';
import { ChatContext } from '@/contexts/chatContext';
import api from "@/api/chatBot";
import Icon from "@expo/vector-icons/FontAwesome";

export default function ChatHistory({title, id}: {title: string, id: string})
{
    const [loader1, setLoader1] = useState(false);
    const chatContext = useContext(ChatContext);
    if (!chatContext) {
      throw new Error('ChatHistory must be used within a ChatProvider');
    }
    const { chatHistory, setChatHistory } = chatContext;
    const deleteChat = async (id: string) => {
    try {
        setLoader1(true);
      const response = await api.delete(`/chat/delete/${id}`);
      setChatHistory(prevHistory => prevHistory.filter((chat) => chat.id !== id));
      setLoader1(false);
      console.log("Chat messages:", response.data.messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      setLoader1(false);
    }
  };
    return (
        <View className="flex-row justify-between items-center p-4 bg-gray-200 rounded-2xl m-2">
        <Link href={`/(drawer)/chatTab?id=${encodeURIComponent(id)}`} className="flex-auto rounded-2xl justify-center align-middle m-2 p-4">
            <Text className="text-lg">{title}</Text>       
        </Link>
        {loader1 ? (
            <ActivityIndicator
              size="small"
              color="white"
              style={{ marginLeft: 10 }}
            />
          ) : (
        <TouchableOpacity onPress={() => {
            deleteChat(id);
        }}>
            <Icon name="trash" size={20} color="red" />
        </TouchableOpacity>
          )}
        </View>
    );
}