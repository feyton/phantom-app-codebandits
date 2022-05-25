import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import axiosBase from "../utils/Api";
import socket from "../utils/Socket";

const LOCATION_GETTER = "LOCATION_GETTER";
let setStateFn = () => {
  console.log("State not ready");
};

export const LoadingIndicator = (props) => (
  <View style={[props.style, styles.indicator]}>
    <Spinner size={"small"} />
  </View>
);

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
    } catch (error) {
      console.log("Server error");
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
        notificationBody: "Phantom is getting background location",
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
    }
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
    }
  };
  useEffect(() => {
    const requestPermissions = async () => {
      const foreground = await Location.requestBackgroundPermissionsAsync();
      if (foreground.granted) {
        await Location.requestForegroundPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);
  return (
    <Layout>
      <Text category={"h2"}>Real time updates</Text>
      <Text style={{ fontFamily: "Lexend" }}>
        Longitude: {position?.longitude}
      </Text>
      <Text style={{ fontFamily: "Lexend" }}>
        Latitude: {position?.latitude}
      </Text>
      <Layout
        style={{
          display: "flex",
          flexDirection: "row",
          padding: 2,
          marginTop: 5,
        }}
      >
        <Button
          style={{ marginLeft: 3 }}
          status={"info"}
          onPress={bgTrackStart}
          disabled={ongoing}
        >
          Start Trip
        </Button>
        <Button
          style={{ marginLeft: 3 }}
          status={"warning"}
          onPress={handleAlight}
          disabled={!ongoing}
        >
          Alight
        </Button>
        <Button
          style={{ marginLeft: 3 }}
          status={"danger"}
          onPress={bgTrackStop}
          disabled={!ongoing}
          appearance="outline"
          accessoryLeft={loading && LoadingIndicator}
        >
          Finish Trip
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
