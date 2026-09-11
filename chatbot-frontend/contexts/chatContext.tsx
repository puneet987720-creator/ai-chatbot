import {createContext, useContext, useState} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ChatHistoryItem = {
  title: string;
  id: string;
};

type ChatContextType = {
  chatHistory: ChatHistoryItem[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatHistoryItem[]>>;
  loader: boolean;
  setLoader: React.Dispatch<React.SetStateAction<boolean>>;
};
export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function chatContextProvider({children}: {children: React.ReactNode}) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [loader, setLoader] = useState(true);

  return (
    <ChatContext.Provider value={{ chatHistory, setChatHistory, loader, setLoader }}>
      {children}
    </ChatContext.Provider>
  );
}