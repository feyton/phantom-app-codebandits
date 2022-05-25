import * as SecureStore from "expo-secure-store";
async function clearItem(key) {
  await SecureStore.deleteItemAsync(key);
}

export default clearItem;
