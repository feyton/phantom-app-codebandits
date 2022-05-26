import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import { StyleSheet, ToastAndroid } from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { LoadingIndicator, LoginButton, LogoutIcon } from "../Icons";
import { logoutUser } from "../redux/reducers/authReducer";
import axiosBase from "../utils/Api";

export default function HomeScreen({ navigation }) {
  const [loading, setloading] = React.useState(false);
  const [loggedIn, setAuth] = React.useState(false);
  const [data, setData] = React.useState();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      setloading(true);
      await axiosBase.get("/accounts/logout");
      dispatch(logoutUser());
      setAuth(false);
    } catch (error) {
      ToastAndroid.show(error?.message, ToastAndroid.SHORT);
    } finally {
      setloading(false);
    }
  };

  React.useEffect(() => {
    const getProfile = async () => {
      try {
        setloading(true);
        const res = await axiosBase.get("/accounts/profile");
        setData(res.data?.data);
        setAuth(true);
        Toast.show({
          type: "success",
          text1: "welcome",
          text2: "A session was found 👋",
        });
      } catch (error) {
        setAuth(false);
      } finally {
        setloading(false);
      }
    };
    getProfile();
  }, []);
  return (
    <Layout style={{ flex: 1, justifyContent: "center" }}>
      <Text style={{ textAlign: "center" }} category={"h1"}>
        Welcome to Phantom
      </Text>
      <Text style={{ textAlign: "center", marginBottom: 5 }} category={"h2"}>
        This app is for drivers now only
      </Text>
      <Divider />
      {loading ? (
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
            accessoryLeft={LoadingIndicator}
            appearance="filled"
            status={"success"}
          >
            LOADING
          </Button>
        </Layout>
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
                onPress={() =>
                  navigation.navigate("Profile", {
                    res_data: data,
                  })
                }
              >
                CONTINUE
              </Button>
              <Button
                style={{ marginLeft: 3 }}
                status={"danger"}
                onPress={() => handleLogout()}
                accessoryLeft={loading ? LoadingIndicator : LogoutIcon}
              >
                Logout
              </Button>
            </Layout>
          ) : (
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
                onPress={() => navigation.navigate("Login")}
                accessoryLeft={LoginButton}
              >
                LOGIN
              </Button>
            </Layout>
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
