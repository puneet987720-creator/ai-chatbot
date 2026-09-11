import { View, Text } from "react-native";
import Markdown from "react-native-markdown-display";

export default function AssistantContent({ response }: { response: string }) {
  return (
    <View className="text-lg flex-auto items-center h-auto">
      <Markdown style={{body: { color: "white", fontSize: 20 }}}>{response}</Markdown>
    </View>
  );
}