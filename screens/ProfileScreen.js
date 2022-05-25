import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import BusManagement from "../components/BusManagement";
import axiosBase from "../utils/Api";

export default function ProfileScreen() {
  const [loading, setloading] = useState(false);
  const [data, setData] = useState();
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

    fetchProfile();
  }, []);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {data ? (
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Profile</Text>
          <View>
            <Text style={{ borderBottomWidth: 2 }}>ABOUT ME</Text>
            <Text>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text>National Id: {data.nationalID}</Text>
          </View>
          <View>
            <Text style={{ borderBottomWidth: 2 }}>BUS INFO</Text>
            <Text>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text>National Id: {data.nationalID}</Text>
          </View>
          <View>
            <Text style={{ borderBottomWidth: 2 }}>ROUTE INFO</Text>
            <Text>Origin: {data?.bus?.route.origin}</Text>
            <Text>Destination: {data?.bus?.route.destination}</Text>
          </View>
          <View>
            {data?.bus?.route ? <BusManagement bus={data.bus} /> : ""}
          </View>
        </View>
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Loading</Text>
      )}
    </View>
  );
}
