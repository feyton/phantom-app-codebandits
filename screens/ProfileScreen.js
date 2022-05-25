import { Layout, Text } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import BusManagement from "../components/BusManagement";
import axiosBase from "../utils/Api";

export default function ProfileScreen({ navigation, route }) {
  let res_data = null;
  if (route?.params) {
    res_data = route?.params?.res_data;
  }
  console.log(res_data);
  const [loading, setloading] = useState(false);
  const [data, setData] = useState(res_data);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setloading(true);
        const res = await axiosBase.get("/accounts/profile");
        setData(res.data.data);
      } catch (error) {
        console.log(error?.response);
      } finally {
        setloading(false);
      }
    };
    if (!data) {
      fetchProfile();
    }
  }, []);
  return (
    <Layout style={{ flex: 1 }}>
      {data ? (
        <Layout style={{ padding: 10 }}>
          <Layout>
            <Text style={{ borderBottomWidth: 2 }}>BUS INFO</Text>
            <Text style={{ fontFamily: "Lexend" }}>
              Plate: {data?.bus?.plateNumber}
            </Text>
            <Text style={{ fontFamily: "Lexend" }}>
              Seats: {data?.bus?.seats}
            </Text>
          </Layout>
          <Layout>
            <Text category={"h2"}>ROUTE INFO</Text>
            <Text>Origin: {data?.bus?.route.origin}</Text>
            <Text>Destination: {data?.bus?.route.destination}</Text>
          </Layout>

          <ScrollView>
            {data?.bus?.route ? (
              <BusManagement bus={data.bus} />
            ) : (
              <Text></Text>
            )}
          </ScrollView>
        </Layout>
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Loading</Text>
      )}
    </Layout>
  );
}
