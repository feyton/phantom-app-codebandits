import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { registerRootComponent } from "expo";
import AppLoading from "expo-app-loading";
import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import useFonts from "./hooks/useFonts";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ManagementScreen from "./screens/ManagementScreen";
import ProfileScreen from "./screens/ProfileScreen";
import mainStyles from "./styles.js";
const Stack = createNativeStackNavigator();

export default function App(props) {
  const [IsReady, SetIsReady] = useState(false);

  const FontLoading = async () => {
    await useFonts(); // Font is being loaded here
  };
  const navigateLogin = () => {
    console.log("Clicked");
  };

  if (!IsReady) {
    return (
      <AppLoading
        startAsync={FontLoading}
        onFinish={() => SetIsReady(true)}
        onError={() => {}}
      />
    );
  }
  return (
    <NavigationContainer>
      <SafeAreaView style={mainStyles.AndroidSafeArea} {...props}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Management" component={ManagementScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 5,
  },
  title: {
    color: "blue",
    fontFamily: "Lexend",
    fontWeight: "600",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 2,
  },
});

registerRootComponent(App);
