import { Button, Divider, Layout, Text } from "@ui-kitten/components";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import haversine from "haversine";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import MapView, {
  AnimatedRegion,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import Toast from "react-native-toast-message";
import { LoadingIndicator } from "../Icons";
import axiosBase from "../utils/Api";
import socket from "../utils/Socket";

let busInfo = null;
let busId = null;
const LATITUDE = -1.7073612;
const LONGITUDE = 29.9526;
const LATITUDE_DELTA = 0.002;
const LONGITUDE_DELTA = 0.002;

const LOCATION_GETTER = "LOCATION_GETTER";
let foregroundSubscription = null;
let setStateFn = () => {};

TaskManager.defineTask(LOCATION_GETTER, async ({ data, error }) => {
  if (error) {
    console.log(error);
    return;
  }
  if (data) {
    const { locations } = data;
    const location = locations[0];
    if (location) {
      setStateFn(location?.coords, busInfo, busId);
    }
    return;
  }
});

// let marker = null;

const sendInfo = (location, busInfo, busId) => {
  if (busInfo && busId) {
    socket.emit("location_update", {
      bus: busInfo,
      id: busId,
      num: 3,
      location: {
        lat: location?.latitude,
        lng: location?.longitude,
      },
    });
  }
};

function BusManagement({ bus, tripInprogress }) {
  const [loading, setloading] = useState(false);
  const [trip, setTrip] = useState(tripInprogress);
  const [ongoing, setOngoing] = useState(false);
  const [id, setId] = useState();
  const [info, setBusInfo] = useState({
    passengers: trip?.passengers || 0,
    seats: bus?.seats,
  });
  const [position, setPosition] = useState();
  const [state, setState] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    routeCoords: [],
    distanceTravelled: 0,
    prevLatLng: {},
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  });
  const [marker, setMarker] = useState();

  // setStateFn = setPosition;
  const bgTrack = async (bus, id) => {
    if (!bus || !id) {
      console.log("No trip ongoing");
      return;
    }
    const { granted } = await Location.getBackgroundPermissionsAsync();
    if (!granted) {
      Toast.show({
        type: "error",
        text1: "This app has not location access",
        text2: "Go to settings to grant permissions",
      });
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
    setStateFn = sendInfo;
    console.log("Started bg track");
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

  const bgTrackStart = async () => {
    const permission = await Location.getForegroundPermissionsAsync();
    if (!permission.granted) {
      Toast.show({
        type: "error",
        text1: "This app has not location access",
        text2: "Go to settings to grant permissions",
      });
      return;
    }

    if (ongoing) {
      Toast.show({
        type: "info",
        text1: "The trip has already started",
      });
      return;
    }

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
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${error?.message} ⚡`,
      });
      return;
    } finally {
      setloading(false);
    }
    foregroundSubscription?.remove();

    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 2,
      },
      (location) => setPosition(location?.coords)
    );
  };

  const calcDistance = (newLatLng) => {
    return haversine(state?.prevLatLng, newLatLng) || 0;
  };

  const getMapRegion = () => ({
    latitude: state.latitude,
    longitude: state.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });
  useEffect(() => {
    if (position && id && ongoing) {
      const loc = {
        lat: position?.latitude,
        lng: position?.longitude,
      };
      const { coordinate, routeCoords, distanceTravelled } = state;

      if (Platform.OS === "android") {
        if (marker) {
          marker?._component?.animateMarkerToCoordinate(
            { latitude: loc.lat, longitude: loc.lng },
            500
          );
        } else {
          coordinate.timing({ latitude: loc.lat, longitude: loc.lng }).start();
        }
      } else {
        coordinate.timing({ latitude: loc.lat, longitude: loc.lng }).start();
      }
      socket.emit("location_update", {
        bus,
        id,
        num: 3,
        location: loc,
      });
      setState({
        latitude: loc.lat,
        longitude: loc.lng,
        routeCoords: routeCoords.concat([
          { latitude: loc.lat, longitude: loc.lng },
        ]),
        distanceTravelled:
          distanceTravelled +
          calcDistance({ latitude: loc.lat, longitude: loc.lng }),
        prevLatLng: { latitude: loc.lat, longitude: loc.lng },
        coordinate: new AnimatedRegion({
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }),
      });
    }
  }, [position]);

  const bgTrackStop = async () => {
    foregroundSubscription?.remove();
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_GETTER
    );
    if (hasStarted) {
      await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
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
      setTrip(null);
      setBusInfo(null);
      setState({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        routeCoords: [],
        distanceTravelled: 0,
        prevLatLng: {},
        coordinate: new AnimatedRegion({
          latitude: LATITUDE,
          longitude: LONGITUDE,
          latitudeDelta: 0,
          longitudeDelta: 0,
        }),
      });
    }
    Toast.show({
      type: "success",
      text1: "Success",
      text2: `The trip stopped ⚡`,
    });
  };
  const handleAlight = async () => {
    if (id && ongoing) {
      const { passengers } = info;
      socket.emit("bus_alert", {
        bus,
        boarded: 2,
        alighted: 1,
        code: bus.route.code,
        id,
        passengers: passengers || 0 + 1,
      });
      setBusInfo({
        passengers: passengers || 0 + 1,
      });
      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Bus info updated ⚡`,
      });
    }
  };
  useEffect(() => {
    const clearWatch = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_GETTER
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
        setPosition(null);
        setOngoing(false);
      }
      if (!ongoing) {
        foregroundSubscription?.remove();
        setPosition(null);
        setOngoing(false);
      }
    };
    clearWatch();
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
          marginTop: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={loading ? "success" : "primary"}
          onPress={bgTrackStart}
          disabled={ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>
            {trip ? "RESUME" : "START"}
          </Text>
        </Button>
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={"warning"}
          onPress={handleAlight}
          disabled={trip || !ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>ALIGHT</Text>
        </Button>
        <Button
          style={{ marginLeft: 3, marginVertical: 3 }}
          status={"danger"}
          onPress={bgTrackStop}
          disabled={trip || !ongoing}
          accessoryLeft={loading && LoadingIndicator}
        >
          <Text style={{ fontFamily: "Lexend" }}>FINISH</Text>
        </Button>
      </Layout>
      <Layout
        style={{
          flexDirection: "column",
          padding: 10,
          justifyContent: "center",
        }}
      >
        <MapView
          style={{
            width: Dimensions.get("window").width - 60,
            height: 400,
            borderColor: "green",
            borderWidth: 3,
          }}
          region={getMapRegion()}
          provider={PROVIDER_GOOGLE}
          mapType="hybrid"
          loadingEnabled
        >
          <Polyline
            strokeColor="#273ea7cc"
            coordinates={state?.routeCoords}
            strokeWidth={5}
          />
          <Marker.Animated
            ref={(marker) => setMarker(marker)}
            coordinate={state?.coordinate}
            title={"Passengers: " + info?.passengers}
            pinColor={"#000"}
          ></Marker.Animated>
        </MapView>
        <Layout style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text style={{ fontFamily: "Lexend" }}>
              {parseFloat(state?.distanceTravelled).toFixed(2)} km
            </Text>
            <Text style={{ marginHorizontal: 3 }}>🚎</Text>
            <Text style={{ marginHorizontal: 3, fontFamily: "Lexend" }}>
              {parseFloat(state?.distanceTravelled * 100).toFixed(1)} Rwf
            </Text>
          </TouchableOpacity>
        </Layout>
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
  bubble: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10,
  },

  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
  },
});
