const KEY = "2learn-token";

export function getToken() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch (error) {
    return "";
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch (error) {
    return;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY);
  } catch (error) {
    return;
  }
}
