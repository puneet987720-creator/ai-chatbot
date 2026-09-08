import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function getToken(){
  try{
    const token = await AsyncStorage.getItem("token");
    console.log("Retrieved token:", token);
    return token;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}