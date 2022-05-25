import {
  Button,
  CheckBox,
  Divider,
  Icon,
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

const EmailIcon = (props) => <Icon name={"email"} {...props} />;
const InvalidIcon = (props) => (
  <Icon fill={"red"} name={"close-circle-outline"} {...props} />
);
const ValidIcon = (props) => (
  <Icon fill={"green"} name={"checkmark-circle-outline"} {...props} />
);
const PasswordIcon = (props) => <Icon name={"email"} {...props} />;

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
      const res = await axiosBase.post("/accounts/login", data);
      dispatch(loginUser(res.data.data));
      navigation.navigate("Profile", {
        res_data: res?.data?.data,
      });
    } catch (error) {
      seterr(error?.response?.data?.data?.message || error.message);
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  return (
    <Layout  style={{ padding: 10, flex: 1, justifyContent: "center" }}>
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
                <Text style={{ fontSize: 20, margin: 10 }} {...evaProps}>
                  Email:
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
              label={"Password: "}
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
        <CheckBox
          style={{ ...mainStyles.checkbox, marginBottom: 10 }}
          checked={visible}
          onChange={() => setVisible(!visible)}
        >
          {"Show password"}
        </CheckBox>
        <Layout
          style={{
            flexDirection: "row",
            justifyContent: "flex-start",
            paddingLeft: 10,
            marginVertical: 10,
          }}
        >
          <Text style={{ fontWeight: "700" }} status={"danger"}>
            {err}
          </Text>
        </Layout>
        <Layout style={{ flexDirection: "row", justifyContent: "center" }}>
          <Button
            style={{ paddingHorizontal: 20 }}
            disabled={!isValid}
            onPress={handleSubmit(onSubmit)}
            accessoryLeft={loading ? LoadingIndicator : null}
          >
            {!loading ? "Login" : "Sending"}
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
