import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Text, TextInput, View } from "react-native";
import styles from "../styles";
import axiosBase from "../utils/Api";
import saveItem from "../utils/SaveItem";



export default function LoginScreen({ navigation }) {
  const [loading, setloading] = useState(false);
  const [visible, setVisible] = useState(false);
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
      console.log(res.data.data);
      await saveItem("token", res.data.data.access_token);
      navigation.navigate("Profile")
    } catch (error) {
      console.log(error);
    } finally {
      setloading(false);
    }
  };

  return (
    <View style={{ padding: 10 }}>
      <Text style={styles.title}>Login Page</Text>
      <View>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
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
            <TextInput
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
        <Text onPress={()=>setVisible(!visible)}>{visible?"Hide password": "Show password"}</Text>

        <Button
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
          title={!loading ? "Login" : "Sending"}
        />
      </View>
    </View>
  );
}
