const apiKey = "ebee4040895f429d9571f8936ea65ea5";
const weatherBtn = document.getElementById('weatherBtn');
const cityInput = document.getElementById('cityInput');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastWeatherDiv = document.getElementById('forecastWeather');


weatherBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
        alert("Wprowadź nazwę miasta!");
        return;
    }

    currentWeatherDiv.innerHTML = "<p>Ładowanie bieżącej pogody...</p>";
    forecastWeatherDiv.innerHTML = "<p>Ładowanie prognozy pogody...</p>";

    const xhr = new XMLHttpRequest();
    xhr.open("GET", `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=pl`, true);
    xhr.onload = function () {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log("Current Weather Response:", response);
            currentWeatherDiv.innerHTML = `
                <h3>Bieżąca pogoda</h3>
                <p>Miasto: ${response.name}</p>
                <p>Temperatura: ${response.main.temp} °C</p>
                <p>Odczuwalna: ${response.main.feels_like} °C</p>
                <p>Opis: ${response.weather[0].description}</p>
                <p>Prędkość wiatru: ${response.wind.speed} m/s</p>
                <p>Ciśnienie: ${response.main.pressure} hPa</p>
            `;
        } else {
            currentWeatherDiv.innerHTML = "<p>Nie udało się pobrać bieżącej pogody.</p>";
        }
    };
    xhr.send();

    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=pl`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Nie udało się pobrać prognozy pogody.");
            }
            return response.json();
        })
        .then(data => {
            console.log("Forecast Weather Response:", data);

            let tableHTML = `
                <h3>Prognoza Pogody</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Temperatura (°C)</th>
                            <th>Odczuwalna (°C)</th>
                            <th>Opis</th>
                            <th>Prędkość wiatru (m/s)</th>
                            <th>Ciśnienie (hPa)</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            data.list.forEach((item, index) => {
                if (index % 8 === 0) { // Wyświetlamy dane co 8 godzin (raz na dzień)
                    tableHTML += `
                        <tr>
                            <td>${item.dt_txt}</td>
                            <td>${item.main.temp}</td>
                            <td>${item.main.feels_like}</td>
                            <td>${item.weather[0].description}</td>
                            <td>${item.wind.speed}</td>
                            <td>${item.main.pressure}</td>
                        </tr>
                    `;
                }
            });

            tableHTML += `
                    </tbody>
                </table>
            `;

            forecastWeatherDiv.innerHTML = tableHTML;
        })
        .catch(error => {
            console.error(error);
            forecastWeatherDiv.innerHTML = "<p>Wystąpił błąd podczas pobierania prognozy.</p>";
        });
});

