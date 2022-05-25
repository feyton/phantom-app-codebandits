import { Layout, Text } from "@ui-kitten/components";
import React, { useEffect, useState } from "react";
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
    <Layout style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {data ? (
        <Layout>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>Profile</Text>
          <Layout>
            <Text style={{ borderBottomWidth: 2 }}>ABOUT ME</Text>
            <Text>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text>National Id: {data.nationalID}</Text>
          </Layout>
          <Layout>
            <Text style={{ borderBottomWidth: 2 }}>BUS INFO</Text>
            <Text>
              {data.user.firstName} {data.user.lastName}
            </Text>
            <Text>National Id: {data.nationalID}</Text>
          </Layout>
          <Layout>
            <Text style={{ borderBottomWidth: 2 }}>ROUTE INFO</Text>
            <Text>Origin: {data?.bus?.route.origin}</Text>
            <Text>Destination: {data?.bus?.route.destination}</Text>
          </Layout>
          <Layout>
            {data?.bus?.route ? <BusManagement bus={data.bus} /> : ""}
          </Layout>
        </Layout>
      ) : (
        <Text style={{ fontSize: 16, fontWeight: "700" }}>Loading</Text>
      )}
    </Layout>
  );
}
