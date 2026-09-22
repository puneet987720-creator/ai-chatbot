import { View, Text,StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

const markdownStyles = StyleSheet.create({
  // Main text styling
  body: {
    color: '#E0E0E0',
    fontSize: 15,
    lineHeight: 22,
  },
  
  // Inline code snippet styling (`code`)
  code_inline: {
    backgroundColor: '#2D3748', // Dark grey/slate background
    color: '#6366F1',           // High contrast text color (or #4ADE80)
    borderWidth: 1,
    borderColor: '#4A5568',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 13,
    fontFamily: 'Courier',       // Or Platform.OS === 'ios' ? 'Menlo' : 'monospace'
  },

  // Multiline code blocks (```code```)
  code_block: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    fontFamily: 'monospace',
  },

  // Fenced code block container
  fence: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    color: '#F8FAFC',
    marginVertical: 8,
  },

  // Ensures text inside nodes inherits dark theme colors
  textnode: {
    color: '#E0E0E0',
  },
});

export default function AssistantContent({ response }: { response: string }) {
  return (
    <View className="text-lg flex-auto items-center h-auto">
      <Markdown style={markdownStyles}>{response}</Markdown>
    </View>
  );
}