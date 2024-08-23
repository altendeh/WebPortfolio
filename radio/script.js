const radioList = document.getElementById('radio-list');
const countrySelect = document.getElementById('country-select');
const tagSelect = document.getElementById('tag-select');
const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');
const loading = document.getElementById('loading');
const modeToggle = document.getElementById('mode-toggle');

searchButton.addEventListener('click', fetchRadios);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchRadios();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedRadios = sessionStorage.getItem('radios');
    if (savedRadios) {
        displayRadios(JSON.parse(savedRadios), '');
    }
    const mode = sessionStorage.getItem('mode') || 'dark';
    setMode(mode);
});

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


async function fetchRadios() {
    // Clear session storage and displayed radio stations when a new search is started
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

    console.log('Fetching radios from URL:', url); // Log URL for debugging

    radioList.classList.add('hidden');
    loading.classList.remove('hidden'); // Show loading animation

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Fetched data:', data); // Log data for debugging

        if (data.length === 0) {
            throw new Error('No radio stations found for the given filters.');
        }

        // Store only necessary information and limit to 10 radio stations
        const minimalData = data.slice(0, 10).map(radio => ({
            name: radio.name,
            url_resolved: radio.url_resolved,
            favicon: radio.favicon || 'default-icon.png', // Use default icon if none available
            country: radio.country,
            genre: radio.tags
        }));
        sessionStorage.setItem('radios', JSON.stringify(minimalData));
        displayRadios(minimalData, searchTerm);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        radioList.textContent = 'Es gab ein Problem beim Abrufen der Radiosender. Bitte versuchen Sie es später erneut.';
    } finally {
        loading.classList.add('hidden'); // Hide loading animation
        radioList.classList.remove('hidden');
    }
}

function displayRadios(radios, searchTerm) {
    radioList.innerHTML = ''; // Clear previous list
    const filteredRadios = radios.filter(radio => radio.name.toLowerCase().includes(searchTerm));
    if (filteredRadios.length === 0) {
        radioList.textContent = 'Keine Radiosender gefunden.'; // Message if no stations found
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
