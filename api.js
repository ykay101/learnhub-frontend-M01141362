import { getToken, clearToken } from "./session.js";

const onLocalhost = location.hostname == "localhost" || location.hostname == "127.0.0.1";

const override = new URLSearchParams(location.search).get("api");

export const SERVER_URL = onLocalhost
  ? (override || "http://localhost:5000")
  : "https://m01141362-backend.onrender.com";

const PRIVATE = ["/auth/", "/me/", "/orders", "/agent/"];

async function readResponse(response) {
  let data = await response.json().catch(() => ({}));
  if (response.status == 401 && getToken()) {
    clearToken();
    window.dispatchEvent(new Event("signed-out"));
  }
  if (!response.ok) {
    let error = new Error(data.error || "HTTP " + response.status);
    error.status = response.status;
    throw error;
  }
  return data;
}

function authHeaders(path) {
  let token = getToken();
  let needed = PRIVATE.some(prefix => path.startsWith(prefix));
  return token && needed ? { Authorization: "Bearer " + token } : {};
}

export async function getJSON(path) {
  let response = await fetch(SERVER_URL + path, { headers: authHeaders(path) });
  return readResponse(response);
}

export async function sendJSON(method, path, body) {
  let response = await fetch(SERVER_URL + path, {
    method: method,
    headers: { "Content-Type": "application/json", ...authHeaders(path) },
    body: JSON.stringify(body)
  });
  return readResponse(response);
}

export async function readStream(path, body, onEvent, signal) {
  let response = await fetch(SERVER_URL + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(path) },
    body: JSON.stringify(body),
    signal: signal
  });
  if (!response.ok) {
    await readResponse(response);
  }
  let reader = response.body.getReader();
  let decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    let { done, value } = await reader.read();
    if (done) break;
    buffer = buffer + decoder.decode(value, { stream: true });
    let lines = buffer.split("\n");
    buffer = lines.pop();
    for (let line of lines) {
      if (line.trim()) onEvent(JSON.parse(line));
    }
  }
  if (buffer.trim()) onEvent(JSON.parse(buffer));
}

export function imageURL(file) {
  return SERVER_URL + "/images/" + file;
}
