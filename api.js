const onLocalhost = location.hostname == "localhost" || location.hostname == "127.0.0.1";

export const SERVER_URL = onLocalhost
  ? "http://localhost:5000"
  : "https://m01141362-backend.onrender.com";

export async function getJSON(path) {
  let response = await fetch(SERVER_URL + path);
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

export async function sendJSON(method, path, body) {
  let response = await fetch(SERVER_URL + path, {
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

export function imageURL(file) {
  return SERVER_URL + "/images/" + file;
}
