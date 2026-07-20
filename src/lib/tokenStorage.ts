import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "@agrivisionai_jwt";

/**
 * Persist the JWT token to AsyncStorage.
 */
export async function saveToken(token: string): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.warn("[TokenStorage] Failed to save token:", err);
  }
}

/**
 * Retrieve the stored JWT token, or null if absent.
 */
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    console.warn("[TokenStorage] Failed to read token:", err);
    return null;
  }
}

/**
 * Delete the stored JWT token (on sign-out).
 */
export async function removeToken(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    console.warn("[TokenStorage] Failed to remove token:", err);
  }
}
