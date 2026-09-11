import { Stack } from "expo-router";
import { Drawer } from 'expo-router/drawer';
import {Tabs} from 'expo-router/tabs';
import Icon from "@expo/vector-icons/FontAwesome";

export default function RootLayout() {
return (
    <Tabs>
      <Tabs.Screen name="chatTab" options={{ headerShown: false, title: 'chatTab', tabBarIcon:()=>
        <Icon name="comments" size={24} color="black" />
      }}/>
      <Tabs.Screen name="sideTab" options={{ headerShown: false, title: 'chatHistory',
        tabBarIcon:()=><Icon name="history" size={24} color="black" />
       }} />
    </Tabs>
    )
}