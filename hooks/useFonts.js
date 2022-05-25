import { LexendDeca_400Regular } from "@expo-google-fonts/lexend-deca";
import { Raleway_400Regular } from "@expo-google-fonts/raleway";
import * as Font from "expo-font";

export default useFonts = async () => {
  await Font.loadAsync({
    Raleway: Raleway_400Regular,
    Lexend: LexendDeca_400Regular,
  });
};
