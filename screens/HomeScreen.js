import * as React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import axiosBase from "../utils/Api";

export default function HomeScreen({ navigation }) {
  const [loading, setloading] = React.useState(false);
  const [loggedIn, setAuth] = React.useState(false);

  React.useEffect(() => {
    const getProfile = async () => {
      try {
        setloading(true);
        await axiosBase.get("/accounts/profile");
        setAuth(true);
      } catch (error) {
        console.log(error?.response);
      } finally {
        setloading(false);
      }
    };
    getProfile();
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Phantom</Text>
      <Text style={styles.title}>This app is for drivers now only</Text>
      {loggedIn ? (
        <Button
          onPress={() => navigation.navigate("Profile")}
          title="Continue"
        />
      ) : (
        <Button onPress={() => navigation.navigate("Login")} title="Login" />
      )}
    </View>
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
