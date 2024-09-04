// Elemente aus dem DOM abrufen
const radioList = document.getElementById('radio-list');
const countrySelect = document.getElementById('country-select');
const tagSelect = document.getElementById('tag-select');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const loading = document.getElementById('loading');
const modeToggle = document.getElementById('mode-toggle');

// Event-Listener für den Suchbutton hinzufügen
searchButton.addEventListener('click', fetchRadios);

// Event-Listener für die Eingabetaste im Suchfeld hinzufügen
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchRadios();
    }
});

// Event-Listener für das Laden des Dokuments hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const savedRadios = sessionStorage.getItem('radios');
    if (savedRadios) {
        displayRadios(JSON.parse(savedRadios), '');
    }
    const mode = sessionStorage.getItem('mode') || 'dark';
    setMode(mode);
});

// Event-Listener für das Laden des Dokuments hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const modeToggle = document.getElementById('mode-toggle');
    const currentMode = sessionStorage.getItem('mode') || 'dark';
    setMode(currentMode);
    updateModeIcon(currentMode);

    modeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        setMode(newMode);
        sessionStorage.setItem('mode', newMode);
        updateModeIcon(newMode);
    });

    function setMode(mode) {
        if (mode === 'light') {
            document.body.classList.add('light-mode');
            document.body.classList.remove('dark-mode');
        } else {
            document.body.classList.add('dark-mode');
            document.body.classList.remove('light-mode');
        }
    }

    function updateModeIcon(mode) {
        modeToggle.innerHTML = mode === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
    }
});

// Funktion zum Abrufen der Radiosender
async function fetchRadios() {
    // Session Storage und angezeigte Radiosender löschen, wenn eine neue Suche gestartet wird
    sessionStorage.removeItem('radios');
    sessionStorage.removeItem('selectedRadio');
    radioList.innerHTML = '';

    const country = countrySelect.value;
    const tag = tagSelect.value;
    const searchTerm = searchInput.value.trim().toLowerCase();
    let url = 'https://de1.api.radio-browser.info/json/stations/topvote';

    if (searchTerm) {
        url = `https://de1.api.radio-browser.info/json/stations/search?name=${searchTerm}`;
    } else if (country && tag) {
        url = `https://de1.api.radio-browser.info/json/stations/search?country=${country}&tag=${tag}`;
    } else if (country) {
        url = `https://de1.api.radio-browser.info/json/stations/bycountry/${country}`;
    } else if (tag) {
        url = `https://de1.api.radio-browser.info/json/stations/bytag/${tag}`;
    }

    console.log('Fetching radios from URL:', url); // URL zur Fehlersuche protokollieren

    radioList.classList.add('hidden');
    loading.classList.remove('hidden'); // Ladeanimation anzeigen

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Daten zur Fehlersuche protokollieren

        if (data.length === 0) {
            throw new Error('No radio stations found for the given filters.');
        }

        // Nur notwendige Informationen speichern und auf 10 Radiosender begrenzen
        const minimalData = data.slice(0, 10).map(radio => ({
            name: radio.name,
            url_resolved: radio.url_resolved,
            favicon: radio.favicon || 'default-icon.png', // Standard-Icon verwenden, falls keines verfügbar ist
            country: radio.country,
            genre: radio.tags
        }));
        sessionStorage.setItem('radios', JSON.stringify(minimalData));
        displayRadios(minimalData, searchTerm);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        radioList.textContent = 'Es gab ein Problem beim Abrufen der Radiosender. Bitte versuchen Sie es später erneut.';
    } finally {
        loading.classList.add('hidden'); // Ladeanimation ausblenden
        radioList.classList.remove('hidden');
    }
}

// Funktion zum Anzeigen der Radiosender
function displayRadios(radios, searchTerm) {
    radioList.innerHTML = ''; // Vorherige Liste löschen
    const filteredRadios = radios.filter(radio => radio.name.toLowerCase().includes(searchTerm));
    if (filteredRadios.length === 0) {
        radioList.textContent = 'Keine Radiosender gefunden.'; // Nachricht, wenn keine Sender gefunden wurden
        return;
    }
    filteredRadios.forEach(radio => {
        const radioItem = document.createElement('div');
        radioItem.className = 'radio-item';
        radioItem.innerHTML = `
            <img src="${radio.favicon}" alt="${radio.name} Icon" class="radio-icon">
            ${radio.name}
        `;
        radioItem.addEventListener('click', () => {
            sessionStorage.setItem('selectedRadio', JSON.stringify(radio));
            window.location.href = 'radio.html';
        });
        radioList.appendChild(radioItem);
    });
}
