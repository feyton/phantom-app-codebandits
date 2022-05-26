import {
  Button,
  CheckBox,
  Divider,
  Input,
  Layout,
  Text,
} from "@ui-kitten/components";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import {
  InvalidIcon,
  LoadingIndicator,
  LoginButton,
  ValidIcon,
} from "../Icons";
import { loginUser } from "../redux/reducers/authReducer";
import styles from "../styles";
import axiosBase from "../utils/Api";

export default function LoginScreen({ navigation }) {
  const [loading, setloading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [err, seterr] = useState(false);
  const dispatch = useDispatch();
  const {
    register,
    setValue,
    handleSubmit,
    control,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const onSubmit = async (data) => {
    console.log(data);
    try {
      setloading(true);
      seterr(null);
      const res = await axiosBase.post("/accounts/login", data);
      dispatch(loginUser(res.data.data));
      navigation.navigate("Profile");
    } catch (error) {
      seterr(error?.response?.data?.data?.message || error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${error?.response?.data?.data?.message || error.message} 🚦`,
      });
    } finally {
      setloading(false);
    }
  };

  return (
    <Layout style={{ padding: 10, flex: 1, justifyContent: "center" }}>
      <Text category={"h1"} style={{ textAlign: "center" }}>
        Login Page
      </Text>
      <Divider />
      <Layout>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={(evaProps) => (
                <Text {...evaProps}>
                  <Text style={{ fontSize: 16, margin: 10, marginLeft: 15 }}>
                    Email:
                  </Text>
                </Text>
              )}
              style={styles.textInput}
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              placeholder="Email"
              keyboardType="email-address"
              autoFocus={true}
              textContentType="emailAddress"
              autoCapitalize="none"
              accessoryRight={errors?.email ? InvalidIcon : ValidIcon}
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Email is required",
            },
            pattern: {
              value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
              message: "Enter a valid email",
            },
          }}
        ></Controller>
        <Controller
          control={control}
          name="password"
          rules={{
            required: {
              value: true,
              message: "Email is required",
            },
          }}
          render={({ field: { onChange, value, onBlur } }) => (
            <Input
              label={(evaProps) => (
                <Text {...evaProps}>
                  <Text style={{ fontSize: 16, margin: 10, marginLeft: 15 }}>
                    Password:
                  </Text>
                </Text>
              )}
              style={styles.textInput}
              placeholder="Password"
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              textContentType="password"
              secureTextEntry={!visible}
              autoCapitalize="none"
              accessoryRight={errors?.password ? InvalidIcon : ValidIcon}
            />
          )}
        ></Controller>
        <Text style={{ fontWeight: "700" }} status={"danger"}>
          {err}
        </Text>
        <CheckBox
          style={{ ...mainStyles.checkbox, marginBottom: 10 }}
          checked={visible}
          onChange={() => setVisible(!visible)}
        >
          {"Show password"}
        </CheckBox>

        <Layout style={{ flexDirection: "row", justifyContent: "center" }}>
          <Button
            style={{ paddingHorizontal: 20 }}
            disabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            accessoryLeft={loading ? LoadingIndicator : LoginButton}
          >
            <Text> {!loading ? "Login" : "Sending"}</Text>
          </Button>
        </Layout>
      </Layout>
    </Layout>
  );
}

const mainStyles = StyleSheet.create({
  checkbox: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    margin: 3,
  },
});
