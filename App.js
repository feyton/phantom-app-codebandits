import * as eva from "@eva-design/eva";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ApplicationProvider,
  IconRegistry,
  Layout,
} from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { registerRootComponent } from "expo";
import AppLoading from "expo-app-loading";
import { useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { Provider } from "react-redux";
import { default as theme } from "./custom-theme.json";
import useFonts from "./hooks/useFonts";
import { default as mapping } from "./mapping.json";
import { store } from "./redux/store";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import ManagementScreen from "./screens/ManagementScreen";
import ProfileScreen from "./screens/ProfileScreen";
import mainStyles from "./styles.js";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from "./AppNavigator";



export default function App(props) {
  const [IsReady, SetIsReady] = useState(false);

  const FontLoading = async () => {
    await useFonts(); // Font is being loaded here
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
    <>
      <Provider store={store}>
        <IconRegistry icons={EvaIconsPack}></IconRegistry>
        <ApplicationProvider
          customMapping={mapping}
          {...eva}
          theme={{ ...eva.dark, ...theme }}
        >
          <SafeAreaProvider>
            <AppNavigator/>
          </SafeAreaProvider>
          
        </ApplicationProvider>
      </Provider>
    </>
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
