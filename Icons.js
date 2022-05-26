import { Icon, Spinner } from "@ui-kitten/components";
import { StyleSheet, View } from "react-native";

const LogoutIcon = (props) => <Icon name={"power-outline"} {...props} />;
const LoginButton = (props) => (
  <Icon name={"arrow-circle-right-outline"} {...props}></Icon>
);
const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner fill="white" size={"small"} />
  </View>
);

const styles = StyleSheet.create({
  indicator: {
    justifyContent: "center",
    alignItems: "center",
    color: "white",
  },
});

const EmailIcon = (props) => <Icon name={"email"} {...props} />;
const InvalidIcon = (props) => (
  <Icon fill={"red"} name={"close-circle-outline"} {...props} />
);
const ValidIcon = (props) => (
  <Icon fill={"green"} name={"checkmark-circle-outline"} {...props} />
);
const PasswordIcon = (props) => <Icon name={"email"} {...props} />;

export {
  LogoutIcon,
  LoginButton,
  LoadingIndicator,
  EmailIcon,
  ValidIcon,
  InvalidIcon,
  PasswordIcon,
};
