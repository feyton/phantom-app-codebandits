import { Button, Divider, Icon, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { LoadingIndicator } from "../components/BusManagement";
import { logoutUser } from "../redux/reducers/authReducer";
import axiosBase from "../utils/Api";
const LoginButton = (props) => <Icon name={"facebook"} {...props}></Icon>;

export default function HomeScreen({ navigation }) {
  const [loading, setloading] = React.useState(false);
  const [loggedIn, setAuth] = React.useState(false);
  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logoutUser);
    setAuth(false);
  };

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
    <Layout style={{ flex: 1, justifyContent: "center" }}>
      <Text style={{ textAlign: "center" }} category={"h2"}>
        Welcome to Phantom
      </Text>
      <Text category={"h2"}>This app is for drivers now only</Text>
      <Divider />
      {loading ? (
        <Button
          accessoryLeft={LoadingIndicator}
          appearance="filled"
          status={"success"}
        >
          LOADING
        </Button>
      ) : (
        <>
          {loggedIn ? (
            <Layout
              style={{
                display: "flex",
                flexDirection: "row",
                padding: 2,
                marginTop: 5,
                justifyContent: "center",
              }}
            >
              <Button
                style={{ marginLeft: 3 }}
                accessoryLeft={LoginButton}
                onPress={() => navigation.navigate("Profile")}
              >
                CONTINUE
              </Button>
              <Button
                style={{ marginLeft: 3 }}
                status={"danger"}
                onPress={() => handleLogout()}
              >
                Logout
              </Button>
            </Layout>
          ) : (
            <Button
              onPress={() => navigation.navigate("Login")}
              accessoryLeft={LoginButton}
            >
              LOGIN
            </Button>
          )}
        </>
      )}
    </Layout>
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
