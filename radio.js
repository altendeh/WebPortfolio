document.addEventListener('DOMContentLoaded', () => {
    const selectedRadio = JSON.parse(sessionStorage.getItem('selectedRadio'));
    const selectedRadioName = document.getElementById('selected-radio-name');
    const selectedRadioIcon = document.getElementById('selected-radio-icon');
    const selectedRadioCountry = document.getElementById('selected-radio-country');
    const selectedRadioGenre = document.getElementById('selected-radio-genre');
    const backButton = document.getElementById('back-button');
    const playButton = document.getElementById('play-button');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeLevelSpan = document.getElementById('volume-level');
    const modeToggle = document.getElementById('mode-toggle');
    const audioPlayer = new Audio();

    if (selectedRadio) {
        selectedRadioName.textContent = selectedRadio.name;
        selectedRadioIcon.src = selectedRadio.favicon || 'default-icon.png';
        selectedRadioCountry.textContent = `Land: ${selectedRadio.country || 'Unbekannt'}`;
        selectedRadioGenre.textContent = `Genre: ${selectedRadio.genre || 'Unbekannt'}`;
        audioPlayer.src = selectedRadio.url_resolved;
    } else {
        alert('Kein ausgewählter Radiosender gefunden. Bitte wählen Sie einen Sender aus der Liste.');
        window.location.href = 'index.html';
    }

    playButton.addEventListener('click', () => {
        if (audioPlayer.paused) {
            audioPlayer.play().catch(error => console.error('Error playing audio:', error));
            playButton.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '<i class="fas fa-play"></i>';
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
        const volumeLevel = Math.round(audioPlayer.volume * 100);
        volumeLevelSpan.textContent = `${volumeLevel}%`;
        if (audioPlayer.volume === 0) {
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    });

    volumeIcon.addEventListener('click', () => {
        if (audioPlayer.volume > 0) {
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
            volumeLevelSpan.textContent = '0%';
            volumeIcon.classList.remove('fa-volume-up');
            volumeIcon.classList.add('fa-volume-mute');
        } else {
            audioPlayer.volume = 1;
            volumeSlider.value = 1;
            volumeLevelSpan.textContent = '100%';
            volumeIcon.classList.remove('fa-volume-mute');
            volumeIcon.classList.add('fa-volume-up');
        }
    });

    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

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

