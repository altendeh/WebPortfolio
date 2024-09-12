// Elemente aus dem DOM abrufen
const radioList = document.getElementById('radio-list'); // Liste der Radiosender
const countrySelect = document.getElementById('country-select'); // Dropdown zur Auswahl des Landes
const tagSelect = document.getElementById('tag-select'); // Dropdown zur Auswahl des Genres
const searchButton = document.getElementById('search-button'); // Suchbutton
const searchInput = document.getElementById('search-input'); // Suchfeld
const loading = document.getElementById('loading'); // Ladeanzeige
const modeToggle = document.getElementById('mode-toggle'); // Button zum Umschalten zwischen Hell- und Dunkelmodus

// Event-Listener für den Suchbutton hinzufügen
searchButton.addEventListener('click', fetchRadios); // Bei Klick auf den Suchbutton wird die Funktion fetchRadios aufgerufen

// Event-Listener für die Eingabetaste im Suchfeld hinzufügen
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { // Wenn die Eingabetaste gedrückt wird
        fetchRadios(); // Wird die Funktion fetchRadios aufgerufen
    }
});

// Event-Listener für das Laden des Dokuments hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const savedRadios = sessionStorage.getItem('radios'); // Gespeicherte Radiosender aus dem Session Storage abrufen
    if (savedRadios) {
        displayRadios(JSON.parse(savedRadios), ''); // Wenn Radiosender vorhanden sind, werden sie angezeigt
    }
    const mode = sessionStorage.getItem('mode') || 'dark'; // Gespeicherten Modus aus dem Session Storage abrufen oder 'dark' als Standard setzen
    setMode(mode); // Den Modus setzen
});

// Event-Listener für das Laden des Dokuments hinzufügen
document.addEventListener('DOMContentLoaded', () => {
    const modeToggle = document.getElementById('mode-toggle'); // Button zum Umschalten zwischen Hell- und Dunkelmodus abrufen
    const currentMode = sessionStorage.getItem('mode') || 'dark'; // Gespeicherten Modus aus dem Session Storage abrufen oder 'dark' als Standard setzen
    setMode(currentMode); // Den Modus setzen
    updateModeIcon(currentMode); // Das Icon für den Modus aktualisieren

    modeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark'; // Aktuellen Modus ermitteln
        const newMode = currentMode === 'light' ? 'dark' : 'light'; // Neuen Modus setzen
        setMode(newMode); // Den Modus setzen
        sessionStorage.setItem('mode', newMode); // Neuen Modus im Session Storage speichern
        updateModeIcon(newMode); // Das Icon für den Modus aktualisieren
    });

    function setMode(mode) {
        if (mode === 'light') {
            document.body.classList.add('light-mode'); // Hellmodus aktivieren
            document.body.classList.remove('dark-mode'); // Dunkelmodus deaktivieren
        } else {
            document.body.classList.add('dark-mode'); // Dunkelmodus aktivieren
            document.body.classList.remove('light-mode'); // Hellmodus deaktivieren
        }
    }

    function updateModeIcon(mode) {
        modeToggle.innerHTML = mode === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; // Icon für den Modus aktualisieren
    }
});

// Funktion zum Abrufen der Radiosender
async function fetchRadios() {
    // Session Storage und angezeigte Radiosender löschen, wenn eine neue Suche gestartet wird
    sessionStorage.removeItem('radios'); // Gespeicherte Radiosender entfernen
    sessionStorage.removeItem('selectedRadio'); // Gespeicherten ausgewählten Radiosender entfernen
    radioList.innerHTML = ''; // Liste der Radiosender leeren

    const country = countrySelect.value; // Ausgewähltes Land abrufen
    const tag = tagSelect.value; // Ausgewähltes Genre abrufen
    const searchTerm = searchInput.value.trim().toLowerCase(); // Suchbegriff abrufen und in Kleinbuchstaben umwandeln
    let url = 'https://de1.api.radio-browser.info/json/stations/topvote'; // Standard-URL für die API-Anfrage

    if (searchTerm) {
        url = `https://de1.api.radio-browser.info/json/stations/search?name=${searchTerm}`; // URL für die Suche nach dem Namen
    } else if (country && tag) {
        url = `https://de1.api.radio-browser.info/json/stations/search?country=${country}&tag=${tag}`; // URL für die Suche nach Land und Genre
    } else if (country) {
        url = `https://de1.api.radio-browser.info/json/stations/bycountry/${country}`; // URL für die Suche nach Land
    } else if (tag) {
        url = `https://de1.api.radio-browser.info/json/stations/bytag/${tag}`; // URL für die Suche nach Genre
    }

    console.log('Fetching radios from URL:', url); // URL zur Fehlersuche protokollieren

    radioList.classList.add('hidden'); // Liste der Radiosender ausblenden
    loading.classList.remove('hidden'); // Ladeanimation anzeigen

    try {
        const response = await fetch(url); // API-Anfrage senden
        if (!response.ok) {
            throw new Error('Network response was not ok'); // Fehler werfen, wenn die Antwort nicht OK ist
        }
        const data = await response.json(); // Antwort in JSON umwandeln
        console.log('Fetched data:', data); // Daten zur Fehlersuche protokollieren

        if (data.length === 0) {
            throw new Error('No radio stations found for the given filters.'); // Fehler werfen, wenn keine Radiosender gefunden wurden
        }

        // Nur notwendige Informationen speichern und auf 10 Radiosender begrenzen
        const minimalData = data.slice(0, 10).map(radio => ({
            name: radio.name, // Name des Radiosenders
            url_resolved: radio.url_resolved, // URL des Radiosenders
            favicon: radio.favicon || 'default-icon.png', // Icon des Radiosenders oder Standard-Icon
            country: radio.country, // Land des Radiosenders
            genre: radio.tags // Genre des Radiosenders
        }));
        sessionStorage.setItem('radios', JSON.stringify(minimalData)); // Radiosender im Session Storage speichern
        displayRadios(minimalData, searchTerm); // Radiosender anzeigen
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error); // Fehler protokollieren
        radioList.textContent = 'Es gab ein Problem beim Abrufen der Radiosender. Bitte versuchen Sie es später erneut.'; // Fehlermeldung anzeigen
    } finally {
        loading.classList.add('hidden'); // Ladeanimation ausblenden
        radioList.classList.remove('hidden'); // Liste der Radiosender anzeigen
    }
}

// Funktion zum Anzeigen der Radiosender
function displayRadios(radios, searchTerm) {
    radioList.innerHTML = ''; // Vorherige Liste löschen
    const filteredRadios = radios.filter(radio => radio.name.toLowerCase().includes(searchTerm)); // Radiosender nach Suchbegriff filtern
    if (filteredRadios.length === 0) {
        radioList.textContent = 'Keine Radiosender gefunden.'; // Nachricht, wenn keine Sender gefunden wurden
        return;
    }
    filteredRadios.forEach(radio => {
        const radioItem = document.createElement('div'); // Neues div-Element erstellen
        radioItem.className = 'radio-item'; // Klasse für das div-Element setzen
        radioItem.innerHTML = `
            <img src="${radio.favicon}" alt="${radio.name} Icon" class="radio-icon"> <!-- Icon des Radiosenders -->
            ${radio.name} <!-- Name des Radiosenders -->
        `;
        radioItem.addEventListener('click', () => {
            sessionStorage.setItem('selectedRadio', JSON.stringify(radio)); // Ausgewählten Radiosender im Session Storage speichern
            window.location.href = 'radio.html'; // Zur Detailseite des Radiosenders navigieren
        });
        radioList.appendChild(radioItem); // Radiosender zur Liste hinzufügen
    });
}
