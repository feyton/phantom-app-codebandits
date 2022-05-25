import { Button, Divider, Icon, Layout, Text } from "@ui-kitten/components";
import * as React from "react";
import { StyleSheet } from "react-native";
import { useDispatch } from "react-redux";
import { LoadingIndicator } from "../components/BusManagement";
import axiosBase from "../utils/Api";
const LoginButton = (props) => (
  <Icon name={"arrow-circle-right-outline"} {...props}></Icon>
);
const LogoutIcon = (props) => <Icon name={"power-outline"} {...props} />;
export default function HomeScreen({ navigation }) {
  const [loading, setloading] = React.useState(false);
  const [loggedIn, setAuth] = React.useState(false);
  const [data, setdata] = React.useState();
  const dispatch = useDispatch();
  const handleLogout = async () => {
    try {
      setloading(true);
      await axiosBase.get("/accounts/logout");

      setAuth(false);
    } catch (error) {
    } finally {
      setloading(false);
    }
  };

  React.useEffect(() => {
    const getProfile = async () => {
      try {
        setloading(true);
        const res = await axiosBase.get("/accounts/profile");
        setAuth(true);
        setdata(res.data?.data);
      } catch (error) {
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
                accessoryRight={LoginButton}
                onPress={() =>
                  navigation.navigate("Profile", {
                    res_data: data,
                  })
                }
              >
                CONTINUE
              </Button>
              <Button
                accessoryLeft={LogoutIcon}
                style={{ marginLeft: 3 }}
                status={"danger"}
                onPress={() => handleLogout()}
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
