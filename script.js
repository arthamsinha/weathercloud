const weatherDiv = document.getElementById('weather');
const citySelect = document.getElementById('city-select');

function fetchWeather(city) {
  weatherDiv.innerHTML = '<div class="loading">Loading weather...</div>';
  // Fetch JSON for temp/condition
  fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)
    .then(response => response.json())
    .then(data => {
      const current = data.current_condition[0];
      const tempC = current.temp_C;
      const condition = current.weatherDesc[0].value;
      // Fetch ASCII art
      fetch(`https://wttr.in/${encodeURIComponent(city)}?0&T&lang=en`)
        .then(resp => resp.text())
        .then(asciiArt => {
          // Remove ANSI color codes for better display
          const cleanArt = asciiArt.replace(/\u001b\[[0-9;]*m/g, '');
          // Extract only the last <pre>...</pre> block if present
          let artToShow = cleanArt;
          const preMatches = cleanArt.match(/<pre[\s\S]*?<\/pre>/gi);
          if (preMatches && preMatches.length > 0) {
            // Remove leading/trailing newlines for alignment
            let preContent = preMatches[preMatches.length - 1];
            preContent = preContent.replace(/<pre[^>]*>/i, '').replace(/<\/pre>/i, '');
            preContent = preContent.replace(/^\s+|\s+$/g, '');
            artToShow = `<pre class="ascii-art">${preContent}</pre>`;
          } else {
            // fallback: remove any lines before the first weather line (usually 'Weather report:')
            const lines = cleanArt.split('\n');
            const idx = lines.findIndex(l => l.trim().toLowerCase().startsWith('weather report:'));
            let artLines = lines.slice(idx >= 0 ? idx : 0);
            // Remove leading blank lines
            while (artLines.length && artLines[0].trim() === '') artLines.shift();
            artToShow = `<pre class="ascii-art">${artLines.join('\n').replace(/^\s+|\s+$/g, '')}</pre>`;
          }
          weatherDiv.innerHTML = `
            <div class="weather-main">
              ${artToShow}
              <div class="temp">${tempC}&deg;C</div>
              <div class="condition">${condition}</div>
            </div>
          `;
        })
        .catch(() => {
          weatherDiv.innerHTML = `
            <div class="weather-main">
              <div class="temp">${tempC}&deg;C</div>
              <div class="condition">${condition}</div>
            </div>
          `;
        });
    })
    .catch(() => {
      weatherDiv.innerHTML = '<div class="error">Failed to load weather data.</div>';
    });
}

if (citySelect) {
  citySelect.addEventListener('change', (e) => {
    fetchWeather(e.target.value);
  });
  // Initial load
  fetchWeather(citySelect.value);
} else {
  // fallback for no dropdown (shouldn't happen)
  fetchWeather('London');
}
