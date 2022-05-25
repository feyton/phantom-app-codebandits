import * as SecureStore from "expo-secure-store";
async function saveItem(key, value) {
  await SecureStore.setItemAsync(key, value);
}

export default saveItem
