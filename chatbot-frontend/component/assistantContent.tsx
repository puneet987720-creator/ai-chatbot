import { View, Text } from "react-native";

export default function AssistantContent({ response }: { response: string }) {
  return (
    <View className="text-lg flex-auto items-center h-auto">
      <Text className="text-lg color-white">{response}</Text>
    </View>
  );
}