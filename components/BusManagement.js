import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import axiosBase from "../utils/Api";
import socket from "../utils/Socket";

const LOCATION_GETTER = "LOCATION_GETTER";
let foregroundSubscription = null;
let entityID = null;
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
      setStateFn(location.coords);
    }
    return;
  }
});
function BusManagement({ bus }) {
  const [loading, setloading] = useState(false);
  const [coordinates, setCoordinates] = useState();
  const [position, setPosition] = useState();
  setStateFn = setPosition;

  const handleStart = async () => {
    const { granted } = await Location.getForegroundPermissionsAsync();
    if (!granted) {
      console.log("Permission denied");
      return;
    }
    foregroundSubscription?.remove();
    const res = await axiosBase.post("/simulate", { passengers: 5 });
    entityID = res?.data?.data?.bus?.entityId;
    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
      },
      (location) => {
        setPosition(location.coords);
        if (entityID) {
          socket.emit("location_update", {
            bus,
            id: entityID,
            num: 1,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
          });
        } else {
          console.log("Not trip assigned");
        }
      }
    );
  };

  const handleStop = async () => {
    foregroundSubscription?.remove();
    setCoordinates(null);
    if (entityID) {
      socket.emit("finished", {
        id: entityID,
        bus,
        code: bus.route.code,
        history: [],
      });
    }
  };

  const bgTrackStart = async () => {
    const { granted } = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      console.log("Location is not granted in bg");
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
    if (position && entityID) {
      console.log(entityID);
    }
  }, [position]);

  const bgTrackStop = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_GETTER
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
      console.log("Location stopped");
    }
    if (entityID) {
      socket.emit("finished", {
        id: entityID,
        bus,
        code: bus.route.code,
        history: [],
      });
    }
  };
  const handleAlight = async () => {
    if (entityID) {
      socket.emit("bus_alert", {
        bus,
        boarded: 2,
        alighted: 1,
        code: bus.route.code,
        id: entityID,
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
    <View>
      <Text>Real time updates</Text>
      <Text>Longitude: {position?.longitude}</Text>
      <Text>Latitude: {position?.latitude}</Text>
      <View>
        <Button color={"green"} onPress={handleAlight} title="Handle Alight" />
        <Button
          color={"green"}
          onPress={handleStart}
          title="Start in foreground"
        />
        <Button color={"red"} onPress={handleStop} title="Stop in foreground" />
        <Button
          color={"blue"}
          onPress={bgTrackStart}
          title="Start in background"
        />
        <Button
          color={"red"}
          onPress={bgTrackStop}
          title="Stop in background"
        />
      </View>
    </View>
  );
}

export default BusManagement;
