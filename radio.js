document.addEventListener('DOMContentLoaded', () => {
    // Ausgewählten Radiosender aus dem Session Storage abrufen
    const selectedRadio = JSON.parse(sessionStorage.getItem('selectedRadio')); // Abrufen des ausgewählten Radiosenders aus dem Session Storage
    const selectedRadioName = document.getElementById('selected-radio-name'); // Element für den Namen des ausgewählten Radiosenders
    const selectedRadioIcon = document.getElementById('selected-radio-icon'); // Element für das Icon des ausgewählten Radiosenders
    const selectedRadioCountry = document.getElementById('selected-radio-country'); // Element für das Land des ausgewählten Radiosenders
    const selectedRadioGenre = document.getElementById('selected-radio-genre'); // Element für das Genre des ausgewählten Radiosenders
    const backButton = document.getElementById('back-button'); // Zurück-Button
    const playButton = document.getElementById('play-button'); // Play-Button
    const volumeIcon = document.getElementById('volume-icon'); // Lautstärke-Icon
    const volumeSlider = document.getElementById('volume-slider'); // Lautstärkeregler
    const volumeLevelSpan = document.getElementById('volume-level'); // Element für die Lautstärkeanzeige
    const modeToggle = document.getElementById('mode-toggle'); // Button zum Umschalten zwischen Hell- und Dunkelmodus
    const audioPlayer = new Audio(); // Neues Audio-Element erstellen

    // Überprüfen, ob ein Radiosender ausgewählt wurde
    if (selectedRadio) {
        // Wenn ein Radiosender ausgewählt wurde, die entsprechenden Informationen anzeigen
        selectedRadioName.textContent = selectedRadio.name; // Name des Radiosenders anzeigen
        selectedRadioIcon.src = selectedRadio.favicon || 'default-icon.png'; // Icon des Radiosenders anzeigen oder Standard-Icon verwenden
        selectedRadioCountry.textContent = `Land: ${selectedRadio.country || 'Unbekannt'}`; // Land des Radiosenders anzeigen oder 'Unbekannt' anzeigen
        selectedRadioGenre.textContent = `Genre: ${selectedRadio.genre || 'Unbekannt'}`; // Genre des Radiosenders anzeigen oder 'Unbekannt' anzeigen
        audioPlayer.src = selectedRadio.url_resolved; // URL des Radiosenders für die Audiowiedergabe setzen
    } else {
        // Wenn kein Radiosender ausgewählt wurde, eine Warnung anzeigen und zur Startseite weiterleiten
        alert('Kein ausgewählter Radiosender gefunden. Bitte wählen Sie einen Sender aus der Liste.');
        window.location.href = 'index.html'; // Zur Startseite weiterleiten
    }

    // Event-Listener für den Play-Button hinzufügen
    playButton.addEventListener('click', () => {
        if (audioPlayer.paused) {
            // Wenn die Wiedergabe pausiert ist, die Wiedergabe starten
            audioPlayer.play().catch(error => console.error('Error playing audio:', error)); // Fehlerbehandlung bei der Wiedergabe
            playButton.innerHTML = '<i class="fas fa-pause"></i>'; // Icon des Play-Buttons auf Pause ändern
        } else {
            // Wenn die Wiedergabe läuft, die Wiedergabe pausieren
            audioPlayer.pause(); // Wiedergabe pausieren
            playButton.innerHTML = '<i class="fas fa-play"></i>'; // Icon des Play-Buttons auf Play ändern
        }
    });

    // Event-Listener für den Lautstärkeregler hinzufügen
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value; // Lautstärke des Audio-Players setzen
        const volumeLevel = Math.round(audioPlayer.volume * 100); // Lautstärke in Prozent berechnen
        volumeLevelSpan.textContent = `${volumeLevel}%`; // Lautstärkeanzeige aktualisieren
        if (audioPlayer.volume === 0) {
            // Wenn die Lautstärke 0 ist, das Lautstärke-Icon auf stumm schalten ändern
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            // Wenn die Lautstärke größer als 0 ist, das Lautstärke-Icon auf laut ändern
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    });

    // Event-Listener für das Lautstärke-Icon hinzufügen
    volumeIcon.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            // Wenn die Lautstärke größer als 0 ist, die Lautstärke auf 0 setzen (stumm schalten)
            audioPlayer.volume = 0;
            volumeSlider.value = 0; // Lautstärkeregler auf 0 setzen
            volumeLevelSpan.textContent = '0%'; // Lautstärkeanzeige auf 0% setzen
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            // Wenn die Lautstärke 0 ist, die Lautstärke auf 100% setzen
            audioPlayer.volume = 1;
            volumeSlider.value = 1; // Lautstärkeregler auf 100% setzen
            volumeLevelSpan.textContent = '100%'; // Lautstärkeanzeige auf 100% setzen
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    });

    // Event-Listener für den Zurück-Button hinzufügen
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html'; // Zur Startseite weiterleiten
    });

    // Modus aus dem Session Storage abrufen und setzen
    const currentMode = sessionStorage.getItem('mode') || 'dark'; // Gespeicherten Modus aus dem Session Storage abrufen oder 'dark' als Standard setzen
    setMode(currentMode); // Den Modus setzen
    updateModeIcon(currentMode); // Das Icon für den Modus aktualisieren

    // Event-Listener für den Modus-Button hinzufügen
    modeToggle.addEventListener('click', () => {
        const currentMode = document.body.classList.contains('light-mode') ? 'light' : 'dark'; // Aktuellen Modus ermitteln
        const newMode = currentMode === 'light' ? 'dark' : 'light'; // Neuen Modus setzen
        setMode(newMode); // Den Modus setzen
        sessionStorage.setItem('mode', newMode); // Neuen Modus im Session Storage speichern
        updateModeIcon(newMode); // Das Icon für den Modus aktualisieren
    });

    // Funktion zum Setzen des Modus
    function setMode(mode) {
        if (mode === 'light') {
            document.body.classList.add('light-mode'); // Hellmodus aktivieren
            document.body.classList.remove('dark-mode'); // Dunkelmodus deaktivieren
        } else {
            document.body.classList.add('dark-mode'); // Dunkelmodus aktivieren
            document.body.classList.remove('light-mode'); // Hellmodus deaktivieren
        }
    }

    // Funktion zum Aktualisieren des Modus-Icons
    function updateModeIcon(mode) {
        modeToggle.innerHTML = mode === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>'; // Icon für den Modus aktualisieren
    }
});
