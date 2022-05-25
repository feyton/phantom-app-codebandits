import { Button, Layout, Spinner, Text } from "@ui-kitten/components";
import * as Location from "expo-location";
import { Platform } from "expo-modules-core";
import * as TaskManager from "expo-task-manager";
import haversine from "haversine";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import MapView, {
  AnimatedRegion,
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from "react-native-maps";
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
  const [prevLatLng, setPrev] = useState();
  const [distance, setDistance] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [marker, setMarker] = useState();
  const [region, setRegion] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
  });
  const [info, setInfo] = useState({
    latitude: LATITUDE,
    longitude: LONGITUDE,
    routeCoords: [],
    prevLatLng: {},
    distanceTravelled: 0,
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  });
  const [coordinates, setCoordinates] = useState(
    new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: 0,
      longitudeDelta: 0,
    })
  );
  setStateFn = setPosition;

  const calcDistance = (newLatLng) => {
    return haversine(info?.prevLatLng, newLatLng) || 0;
  };

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
      const { coordinate, routeCoords, distanceTravelled } = info;

      socket.emit("location_update", {
        bus,
        id,
        num: 3,
        location: loc,
      });

      if (Platform.OS === "android") {
        if (marker) {
          console.log(marker, "Exit");
          marker?._component?.animateMarkerToCoordinate(
            { latitude: loc.lat, longitude: loc.lng },
            500
          );
        }
      } else {
        coordinate.timing({ latitude: loc.lat, longitude: loc.lng }).start();
      }
      setInfo({
        latitude: loc.lat,
        longitude: loc.lng,
        routeCoords: routeCoords.concat([
          { latitude: loc.lat, longitude: loc.lng },
        ]),
        distanceTravelled:
          distanceTravelled +
          calcDistance({ latitude: loc.lat, longitude: loc.lng }),
        prevLatLng: { latitude: loc.lat, longitude: loc.lng },
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
  const getMapRegion = () => ({
    ...region,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  useEffect(() => {
    const clearWatch = async () => {
      const hasStarted = await Location.hasStartedLocationUpdatesAsync(
        LOCATION_GETTER
      );
      if (hasStarted) {
        await Location.stopLocationUpdatesAsync(LOCATION_GETTER);
        console.log("Location stopped on start");
      }
    };
    clearWatch();
  }, []);

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
          style={{ marginLeft: 3 }}
          status={"primary"}
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
          accessoryLeft={loading && LoadingIndicator}
        >
          Finish Trip
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
          region={getMapRegion()}
          style={{
            width: Dimensions.get("window").width - 60,
            height: 400,
            borderColor: "green",
            borderWidth: 3,
          }}
          provider={PROVIDER_GOOGLE}
          followsUserLocation
          loadingEnabled
          showsUserLocation
        >
          <Polyline coordinates={info?.routeCoords} strokeWidth={5} />
          <Marker.Animated
            ref={(marker) => setMarker(marker)}
            coordinate={info?.coordinate}
            image={require("../assets/activeBus.jpg")}
          />
        </MapView>
        <Layout style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.bubble, styles.button]}>
            <Text>{parseFloat(distance).toFixed(2)} km</Text>
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
