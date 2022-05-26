import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";
import BusManagement from "../components/BusManagement";
import { LoadingIndicator } from "../Icons";
import axiosBase from "../utils/Api";

export default function ProfileScreen({ navigation, route }) {
  let res_data = null;
  if (route?.params?.res_data) {
    res_data = route.params.res_data;
  }

  const [loading, setloading] = useState(false);
  const [data, setData] = useState(res_data);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setloading(true);
        const res = await axiosBase.get("/accounts/profile");
        setData(res.data.data);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: `${error?.response?.data?.data?.message || error?.message} ⚡`,
        });
      } finally {
        setloading(false);
      }
    };

    if (!data) {
      fetchProfile();
    }
  }, []);
  return (
    <Layout style={{ flex: 1, padding: 10 }}>
      {data ? (
        <Layout style={{ paddingTop: 30 }}>
          <Text category={"h1"} style={{ textAlign: "center" }}>
            BUS MANAGEMENT
          </Text>
          <Divider/>
          <Layout style={{marginBottom:10}}>
            <Text style={{ borderBottomWidth: 2 }}>BUS INFO</Text>
            <Divider />
            <Text style={{ fontFamily: "Lexend" }}>
              Plate: {data?.bus?.plateNumber}
            </Text>
            <Text style={{ fontFamily: "Lexend" }}>
              Seats: {data?.bus?.seats}
            </Text>
          </Layout>
          <Layout style={{marginBottom:5}}>
            <Text category={"h2"}>ROUTE INFO</Text>
            <Divider />
            <Text style={{ fontFamily: "Lexend" }}>
              Origin: {data?.bus?.route.origin}
            </Text>
            <Text style={{ fontFamily: "Lexend" }}>
              Destination: {data?.bus?.route.destination}
            </Text>
          </Layout>
          <Layout>
            {data?.bus?.route ? (
              <BusManagement bus={data.bus} />
            ) : (
              <Text>You don't have a bus or route assigned to you</Text>
            )}
          </Layout>
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
            accessoryLeft={LoadingIndicator}
            appearance="filled"
            status={"success"}
          >
            LOADING
          </Button>
        </Layout>
      )}
    </Layout>
  );
}
