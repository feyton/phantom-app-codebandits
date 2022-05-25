import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  Avatar,
  Drawer,
  DrawerItem,
  IndexPath,
  Layout,
  StyleService,
  Text,
  useStyleSheet,
} from "@ui-kitten/components";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import HomeScreen from "./HomeScreen";
import LoginScreen from "./LoginScreen";
import ManagementScreen from "./ManagementScreen";
import ProfileScreen from "./ProfileScreen";

const { Navigator, Screen } = createDrawerNavigator();

function DrawerNavigator({ navigation, state }) {
  const styles = useStyleSheet(themedStyles);
  const { user } = useSelector((state) => state?.auth);
  console.log(user);

  const Header = () => (
    <Layout style={{ ...styles.header }}>
      <Layout style={styles.profileContainer}>
        <Avatar
          size="giant"
          source={user?.image || require("../assets/activeBus.jpg")}
        />
        <Text style={styles.profileName} category="h6">
          Phantom
        </Text>
      </Layout>
    </Layout>
  );
  return (
    <SafeAreaView>
      <Drawer
        header={Header}
        selectedIndex={new IndexPath(state.index)}
        onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
      >
        <DrawerItem title={"Home"} />
        <DrawerItem title={"Profile"} />
        <DrawerItem title={"Management"} />
      </Drawer>
    </SafeAreaView>
  );
}

const HomeDrawerNavigator = () => (
  <Navigator drawerContent={(props) => <DrawerNavigator {...props} />}>
    <Screen name="Home" component={HomeScreen} />
    <Screen name="Profile" component={ProfileScreen} />
    <Screen name="Login" component={LoginScreen} />
    <Screen name="Management" component={ManagementScreen} />
  </Navigator>
);

export default HomeDrawerNavigator;

const themedStyles = StyleService.create({
  header: {
    height: 128,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileName: {
    marginHorizontal: 16,
  },

  icon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
});
