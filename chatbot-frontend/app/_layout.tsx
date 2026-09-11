import "../global.css";
import { Stack } from "expo-router";
import {chatContextProvider as ChatContextProvider} from "@/contexts/chatContext";

export default function RootLayout() {
  return (
    <ChatContextProvider>
      <Stack>
        <Stack.Screen name="index" options={{headerShown: false}} />
        <Stack.Screen name="(drawer)" options={{headerShown: false}} />
      </Stack>
    </ChatContextProvider>
  
  )
}