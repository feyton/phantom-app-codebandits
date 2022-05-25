import * as SecureStore from "expo-secure-store";
async function getValueFor(key) {
  let result = await SecureStore.getItemAsync(key);
  return result;
}

export default getValueFor;
