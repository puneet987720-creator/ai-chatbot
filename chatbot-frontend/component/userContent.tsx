import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function UserContent({
  text,
  maxLength = 120,
}: {
  text: string;
  maxLength?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  // Convert to string safely
  const safeText = String(text || "");
  const displayText = expanded ? safeText : safeText.slice(0, maxLength);

  return (
    <View>
      <Text className="text-lg text-white">
        {displayText}
        {!expanded && safeText.length > maxLength ? "..." : ""}
      </Text>

      {safeText.length > maxLength && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text className="mt-2 text-blue-600 font-semibold">
            {expanded ? "Show Less ▲" : "Show More ▼"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
