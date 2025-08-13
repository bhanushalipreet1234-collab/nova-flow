import React, { useState } from "react";

export default function Settings() {
  const [openAIKey, setOpenAIKey] = useState("");
  const [openWeatherKey, setOpenWeatherKey] = useState("");
  const userId = "demo_user_1"; // replace with real user id from auth

  const saveKey = async (service: string, key: string) => {
    const res = await fetch("http://localhost:8000/api/settings/save-key", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-User-Id": userId },
      body: JSON.stringify({ service, key })
    });
    if (!res.ok) alert("save failed");
    else alert("saved");
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>API Keys (user: {userId})</h3>
      <div>
        <label>OpenAI Key</label>
        <input type="password" value={openAIKey} onChange={(e) => setOpenAIKey(e.target.value)} />
        <button onClick={() => saveKey("openai", openAIKey)}>Save OpenAI</button>
      </div>
      <div style={{ marginTop: 12 }}>
        <label>OpenWeather Key</label>
        <input type="password" value={openWeatherKey} onChange={(e) => setOpenWeatherKey(e.target.value)} />
        <button onClick={() => saveKey("openweather", openWeatherKey)}>Save OpenWeather</button>
      </div>
    </div>
  );
}