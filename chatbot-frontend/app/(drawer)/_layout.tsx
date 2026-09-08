import { Stack } from "expo-router";
import { Drawer } from 'expo-router/drawer';

export default function RootLayout() {
return (
    <Drawer>
      <Drawer.Screen name="chatTab" options={{ title: 'chatTab' }} />
      <Drawer.Screen name="sideTab" options={{ title: 'chatHistory' }} />
    </Drawer>
    )
}