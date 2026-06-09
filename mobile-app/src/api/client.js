// Change this to your computer's local IP.
// Run "ipconfig" on Windows, look for IPv4 Address.
const BASE_URL = "http://10.143.126.80:8000";

const TIMEOUT_MS = 8000;

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timer);

    if (err.name === "AbortError") {
      throw new Error(`Request timed out. Is the backend running?`);
    }

    throw err;
  }
}

export async function fetchZones() {
  return fetchWithTimeout(`${BASE_URL}/zones`);
}

export async function fetchAlerts() {
  return fetchWithTimeout(`${BASE_URL}/alerts`);
}

export async function fetchWorkers() {
  return fetchWithTimeout(`${BASE_URL}/workers`);
}