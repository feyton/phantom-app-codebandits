import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Layout } from "@ui-kitten/components";
import React from "react";
import DrawerNavigator from "./screens/DrawerNavigator";

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Layout style={{ flex: 1, justifyContent: "center" }}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="drawer" component={DrawerNavigator} />
        </Stack.Navigator>
      </Layout>
    </NavigationContainer>
  );
}

export default AppNavigator;
