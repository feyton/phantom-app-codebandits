import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import Toast from "react-native-toast-message";
import { LoadingIndicator } from "../Icons";
import axiosBase from "../utils/Api";
import socket from "../utils/Socket";

const LATITUDE = -1.7073612;
const LONGITUDE = 29.9526;
const LATITUDE_DELTA = 0.009;
const LONGITUDE_DELTA = 0.009;

const LOCATION_GETTER = "LOCATION_GETTER";
let setStateFn = () => {
  console.log("State not ready");
};

TaskManager.defineTask(LOCATION_GETTER, async ({ data, error }) => {
  if (error) {
    console.log(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      setStateFn(location?.coords);
    }
    return;
  }
});
function BusManagement({ bus }) {
  const [loading, setloading] = useState(false);
  const [ongoing, setOngoing] = useState(false);
  const [id, setId] = useState();
  const [position, setPosition] = useState();
  setStateFn = setPosition;

  const bgTrackStart = async () => {
    const { granted } = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      console.log("Location is not granted in bg");
      return;
    }
    if (ongoing) {
      console.log("Alredy sending location");
      return;
    }

    const isTaskDefined = TaskManager.isTaskDefined(LOCATION_GETTER);
    if (!isTaskDefined) {
      console.log("You forgot to register a task");
      return;
    }
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_GETTER
    );
    try {
      setloading(true);
      const res = await axiosBase.post("/simulate", { passengers: 5 });
      setId(res?.data?.data?.bus?.entityId);
      setOngoing(true);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `The trip successfully started ⚡`,
      });
    } catch (error) {
      console.log("Server error");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${error?.message} ⚡`,
      });
      return;
    } finally {
      setloading(false);
    }

    if (hasStarted) {
      console.log("Already ongoing");
      return;
    }

    await Location.startLocationUpdatesAsync(LOCATION_GETTER, {
      accuracy: Location.Accuracy.BestForNavigation,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Location",
        notificationBody:
          "You have a trip underway. We are using location in background",
        notificationColor: "#fff",
      },
    });
  };
  useEffect(() => {
    if (position && id) {
      const loc = {
        lat: position?.latitude,
        lng: position?.longitude,
      };
      socket.emit("location_update", {
        bus,
        id,
        num: 3,
        location: loc,
      });
    }
  }, [position, id]);

  const bgTrackStop = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_GETTER
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
      console.log("Location stopped");
    }
    if (id && ongoing) {
      socket.emit("finished", {
        id: id,
        bus,
        code: bus.route.code,
        history: [],
      });
      setId(null);
      setOngoing(false);
      setPosition(null);
    }
    Toast.show({
      type: "success",
      text1: "Success",
      text2: `The trip stopped ⚡`,
    });
  };
  const handleAlight = async () => {
    if (id && ongoing) {
      socket.emit("bus_alert", {
        bus,
        boarded: 2,
        alighted: 1,
        code: bus.route.code,
        id,
        passengers: 3,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Bus info updated ⚡`,
      });
    }
  };
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestBackgroundPermissionsAsync();
      if (foreground.granted) {
        await Location.requestForegroundPermissionsAsync();
      }
    };
    const clearWatch = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_GETTER
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
        setPosition(null);
        console.log("Location stopped on start");
      }
    };
    clearWatch();
    requestPermissions();
  }, []);
  return (
    <Layout>
      <Text category={"h2"} style={{ textAlign: "center" }}>
        Real time updates
      </Text>
      <Divider />
      <Text style={{ fontFamily: "Lexend" }}>
        Longitude: {position?.longitude}
      </Text>
      <Text style={{ fontFamily: "Lexend" }}>
        Latitude: {position?.latitude}
      </Text>
      <Divider />
      <Layout
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 2,
          marginTop: 5,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={"primary"}
          onPress={bgTrackStart}
          disabled={ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>START</Text>
        </Button>
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={"warning"}
          onPress={handleAlight}
          disabled={!ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>ALIGHT</Text>
        </Button>
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={"danger"}
          onPress={bgTrackStop}
          disabled={!ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>FINISH</Text>
        </Button>
      </Layout>
    </Layout>
  );
}

export default BusManagement;

const styles = StyleSheet.create({
  indicator: {
    justifyContent: "center",
    alignItems: "center",
  },
});
