const domApp = document.querySelector(".app");
const domTime = document.querySelector(".time");
const domDate = document.querySelector(".date");
const domWeather = document.querySelector(".weather");

function geturl(url) {
  const arr = url.split("?");

  if (!arr[1]) {
    return {};
  }

  const res = arr[1].split("&");
  const items = {};
  for (let i = 0; i < res.length; i++) {
    const a = res[i].split("=");
    items[a[0]] = a[1];
  }
  return items;
}

function formatDate(date) {
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}/${day}`;
}

// Guangzhou Coordinates
const LAT = 23.1291;
const LON = 113.2644;

async function fetchWeather() {
    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`);
        const data = await response.json();
        
        if (data.current_weather) {
            const temp = data.current_weather.temperature;
            const code = data.current_weather.weathercode;
            
            // Map WMO Weather interpretation codes (WW)
            // https://open-meteo.com/en/docs
            // We can use a simple icon mapping or just text if icon is hard.
            // For now, let's use a very simple mapping or Emoji if font supports, 
            // or just text description? The user asked for "Icon + Temperature".
            // Since we don't have local icons, I'll attempt to use Emoji or 
            // simple text if emoji fails on Kindle.
            // Actually, Kindle might not support color emojis well, but black and white ones might work.
            // Safe bet: plain text or simple emoji.
            
            let icon = "☀️"; // default
            if (code >= 1 && code <= 3) icon = "Cx"; // Cloudy
            else if (code >= 45 && code <= 48) icon = "🌫"; // Fog
            else if (code >= 51 && code <= 67) icon = "🌧"; // Rain
            else if (code >= 71 && code <= 77) icon = "❄️"; // Snow
            else if (code >= 80 && code <= 82) icon = "🌧"; // Rain showers
            else if (code >= 95 && code <= 99) icon = "⚡️"; // Thunderstorm

            domWeather.innerHTML = `<span style="font-size: 2rem; margin-right: 10px;">${icon}</span> ${temp}°C`;
        }
    } catch (e) {
        console.error("Weather fetch failed", e);
        domWeather.innerHTML = "Weather N/A";
    }
}

function render() {
  // Ensure China timezone
  const time = new Date();
  const len = time.getTime();
  const offset = time.getTimezoneOffset() * 60000;
  const utcTime = len + offset;
  const date = new Date(utcTime + 3600000 * 8); // UTC+8

  const dateText = formatDate(date);
  
  // Format time as HH:mm
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const timeText = `${hours}:${minutes}`;

  if (domDate.innerHTML != dateText) domDate.innerHTML = dateText;
  if (domTime.innerHTML != timeText) domTime.innerHTML = timeText;
}

const urlQuery = geturl(location.href);
const config = {
  fontSize: +(urlQuery.fs || 7),
  rotate: urlQuery.r,
  lang: urlQuery.l,
};

// Adjust font adjustments based on config if needed, otherwise rely on CSS
// domTime.style.fontSize = config.fontSize + "rem"; 
// Leaving CSS to handle most, but keeping rotation logic

domApp.style.cssText = `-webkit-transform: rotate(${
  config.rotate || 0
}deg) translate3d(-50%,-50%,0)`;

render();
fetchWeather(); // Initial fetch

// Update time every second
setInterval(() => {
  render();
}, 1000);

// Update weather every 30 minutes
setInterval(() => {
    fetchWeather();
}, 30 * 60 * 1000);
