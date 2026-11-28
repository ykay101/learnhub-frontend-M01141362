const onLocalhost = location.hostname == "localhost" || location.hostname == "127.0.0.1";

const override = new URLSearchParams(location.search).get("api");

export const SERVER_URL = onLocalhost
  ? (override || "http://localhost:5000")
  : "https://m01141362-backend.onrender.com";

async function readResponse(response) {
  let data = await response.json().catch(() => ({}));
  if (!response.ok) {
    let error = new Error(data.error || "HTTP " + response.status);
    error.status = response.status;
    throw error;
  }
  return data;
}

export async function getJSON(path) {
  let response = await fetch(SERVER_URL + path);
  return readResponse(response);
}

export async function sendJSON(method, path, body) {
  let response = await fetch(SERVER_URL + path, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return readResponse(response);
}

export function imageURL(file) {
  return SERVER_URL + "/images/" + file;
}
