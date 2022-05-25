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
import { useDispatch } from "react-redux";
import { LoadingIndicator } from "../components/BusManagement";
import { loginUser } from "../redux/reducers/authReducer";
import styles from "../styles";
import axiosBase from "../utils/Api";

export default function LoginScreen({ navigation }) {
  const [loading, setloading] = useState(false);
  const [visible, setVisible] = useState(false);
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
      const res = await axiosBase.post("/accounts/login", data);
      dispatch(loginUser(res.data.data));
      navigation.navigate("Profile");
    } catch (error) {
      console.log(error);
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
              label={"Email: "}
              style={styles.textInput}
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              placeholder="Email"
              keyboardType="email-address"
              autoFocus={true}
              textContentType="emailAddress"
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Email is required",
            },
            pattern: {
              value:
                /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
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
              label={"Password: "}
              style={styles.textInput}
              placeholder="Password"
              value={value}
              onBlur={onBlur}
              onChangeText={(value) => onChange(value)}
              textContentType="password"
              secureTextEntry={!visible}
            />
          )}
        ></Controller>
        <CheckBox
          style={mainStyles.checkbox}
          checked={visible}
          onChange={() => setVisible(!visible)}
        >
          {"Show password"}
        </CheckBox>

        <Button
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
          accessoryLeft={loading ? LoadingIndicator : ""}
        >
          {!loading ? "Login" : "Sending"}
        </Button>
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
