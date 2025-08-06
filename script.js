class StationRegistration {
    constructor() {
        this.entries = [];
        this.currentFormData = null;
        this.MASTER_PASSWORD = '0815';
        this.STATION_PASSWORDS = {
            'Teams értekezlet a Pitypang zenekarral': '7535',
            'AI bemutató': '7507',
            'Munkanap szervezés (Helyszín: Kyndryl feladatok)': '0901',
            'HR felvételi (Helyszín: Kyndryl feladatok)': '2013',
            'Vöröskereszt bemutató (Helyszín: Kyndryl feladatok)': '0112',
            'Belépőkártya készítés': '7527',
            'Rendőrségi bemutató': '0104',
            'PC szétszedés és összerakás - bemutató': '7604',
            'Iroda térkép - Hol ülnek a szüleid?': '3535',
            // Budapest állomások (ugyanazok a jelszavak)
            'Teams értekezlet a Pitypang zenekarral': '7535',
            'AI bemutató': '7507',
            'Munkanap szervezés (Helyszín: Kyndryl feladatok)': '0901',
            'HR felvételi (Helyszín: Kyndryl feladatok)': '2013',
            'Vöröskereszt bemutató (Helyszín: Kyndryl feladatok)': '0112',
            'Belépőkártya készítés': '7527',
            'PC szétszedés és összerakás - bemutató': '7604',
            'Iroda térkép - Hol ülnek a szüleid?': '3535'
        };
        this.savedName = localStorage.getItem('savedName') || '';
        this.completedStations = new Set(JSON.parse(localStorage.getItem('completedStations') || '[]'));

        this.initializeEventListeners();
        this.loadSavedName();
        this.updateStationOptions();
        this.handleLocationChange(); // Initialize visibility based on current selection
    }

    initializeEventListeners() {
        const form = document.getElementById('registrationForm');
        const passwordModal = document.getElementById('passwordModal');
        const confirmBtn = document.getElementById('confirmPassword');
        const cancelBtn = document.getElementById('cancelPassword');
        const passwordInput = document.getElementById('passwordInput');
        const nameInput = document.getElementById('name');
        const locationRadios = document.querySelectorAll('input[name="location"]');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        confirmBtn.addEventListener('click', () => this.handlePasswordConfirm());
        cancelBtn.addEventListener('click', () => this.hidePasswordModal());

        // Save name when it changes
        nameInput.addEventListener('blur', () => {
            if (nameInput.value.trim()) {
                this.savedName = nameInput.value.trim();
                localStorage.setItem('savedName', this.savedName);
            }
        });

        // Handle location selection
        locationRadios.forEach(radio => {
            radio.addEventListener('change', () => this.handleLocationChange());
        });

        // Allow Enter key to confirm password
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handlePasswordConfirm();
            }
        });

        // Close modal when clicking outside
        passwordModal.addEventListener('click', (e) => {
            if (e.target === passwordModal) {
                this.hidePasswordModal();
            }
        });
    }

    loadSavedName() {
        if (this.savedName) {
            const nameInput = document.getElementById('name');
            nameInput.value = this.savedName;
        }
    }

    handleLocationChange() {
        const szekesfehrvarpGroup = document.getElementById('stationGroupSzekesfehervar');
        const budapestGroup = document.getElementById('stationGroupBudapest');
        const mapSection = document.querySelector('.map-section');
        const scheduleAiTable = document.querySelector('.schedule-table:last-child');
        const selectedLocation = document.querySelector('input[name="location"]:checked');

        if (selectedLocation) {
            if (selectedLocation.value === 'szekesfehervar') {
                szekesfehrvarpGroup.style.display = 'block';
                budapestGroup.style.display = 'none';
                document.getElementById('stationBudapest').value = '';
                
                // Show map and AI schedule table for Székesfehérvár
                if (mapSection) mapSection.style.display = 'block';
                if (scheduleAiTable) scheduleAiTable.style.display = 'table';
            } else if (selectedLocation.value === 'budapest') {
                szekesfehrvarpGroup.style.display = 'none';
                budapestGroup.style.display = 'block';
                document.getElementById('stationSzekesfehervar').value = '';
                
                // Hide map and AI schedule table for Budapest
                if (mapSection) mapSection.style.display = 'none';
                if (scheduleAiTable) scheduleAiTable.style.display = 'none';
            }
        }
    }



    updateStationOptions() {
        const stationSelectSzekesfehervar = document.getElementById('stationSzekesfehervar');
        const stationSelectBudapest = document.getElementById('stationBudapest');

        [stationSelectSzekesfehervar, stationSelectBudapest].forEach(stationSelect => {
            if (stationSelect) {
                const options = stationSelect.querySelectorAll('option');
                options.forEach(option => {
                    if (option.value && this.completedStations.has(option.value)) {
                        option.textContent = option.textContent.replace(' ✓', '') + ' ✓';
                        option.style.color = '#28a745';
                        option.style.fontWeight = 'bold';
                    }
                });
            }
        });
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get('name').trim();
        const location = formData.get('location');
        const stationSzekesfehervar = formData.get('stationSzekesfehervar');
        const stationBudapest = formData.get('stationBudapest');

        // Determine which station was selected
        let station = '';
        if (location === 'szekesfehervar') {
            station = stationSzekesfehervar;
        } else if (location === 'budapest') {
            station = stationBudapest;
        }

        if (!name || !location || !station) {
            alert('Kérlek töltsd ki az összes mezőt: név, helyszín és állomás');
            return;
        }

        // Save name for future use
        this.savedName = name;
        localStorage.setItem('savedName', this.savedName);

        // Store form data temporarily
        this.currentFormData = {
            name: name,
            station: station,
            timestamp: new Date()
        };

        // Show password modal
        this.showPasswordModal();
    }

    showPasswordModal() {
        const modal = document.getElementById('passwordModal');
        const passwordInput = document.getElementById('passwordInput');
        const errorDiv = document.getElementById('passwordError');

        modal.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
        errorDiv.style.display = 'none';
    }

    hidePasswordModal() {
        const modal = document.getElementById('passwordModal');
        modal.style.display = 'none';
        this.currentFormData = null;
    }

    handlePasswordConfirm() {
        const passwordInput = document.getElementById('passwordInput');
        const errorDiv = document.getElementById('passwordError');
        const enteredPassword = passwordInput.value;
        const currentStation = this.currentFormData.station;

        // Check both station-specific password and master password
        const stationPassword = this.STATION_PASSWORDS[currentStation];
        const isCorrectPassword = enteredPassword === this.MASTER_PASSWORD || 
                                 enteredPassword === stationPassword;

        if (isCorrectPassword) {
            // Password correct - add entry
            this.addEntry(this.currentFormData);
            this.hidePasswordModal();
            this.resetForm();
        } else {
            // Password incorrect - show error
            errorDiv.textContent = 'Incorrect password. Please try again.';
            errorDiv.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    addEntry(entryData) {
        // Add to local storage
        this.entries.push(entryData);

        // Mark station as completed
        this.completedStations.add(entryData.station);
        localStorage.setItem('completedStations', JSON.stringify([...this.completedStations]));

        // Update display
        this.updateResultsList();
        this.updateStationOptions();

        // Send to Google Sheets
        this.sendToGoogleSheets(entryData);
    }

    async sendToGoogleSheets(entryData) {
        // You need to create a Google Apps Script with the following code:
        // function doPost(e) {
        //   var sheet = SpreadsheetApp.openById('1_XrC5Yh0GdBZP02B8NtmVWGOLgJOHNpJYBF71GG513k').getSheetByName('APP');
        //   var data = JSON.parse(e.postData.contents);
        //   sheet.appendRow([data.name, data.station, data.timestamp]);
        //   return ContentService.createTextOutput('Success');
        // }
        // Then deploy it as a web app and replace the URL below with your deployment URL

        const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxVY0luN4dAi0QdeGWnZzWpHx7Tt2C6eJpARJG2NGDWuaSKlsCHE87on1XRJEY8WYBKxA/exec';

        try {
            // Create form data for better compatibility
            const formData = new FormData();
            formData.append('name', entryData.name);
            formData.append('station', entryData.station);
            formData.append('timestamp', entryData.timestamp.toISOString());

            console.log('Data ready for Google Sheets:', {
                name: entryData.name,
                station: entryData.station,
                timestamp: entryData.timestamp.toISOString()
            });

            // Alternative method using fetch with JSON
            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: entryData.name,
                    station: entryData.station,
                    timestamp: entryData.timestamp.toISOString()
                })
            });

            console.log('Data sent to Google Sheets successfully');
        } catch (error) {
            console.error('Error sending to Google Sheets:', error);
            // Still show success to user since no-cors mode doesn't return response
        }
    }

    updateResultsList() {
        const resultsList = document.getElementById('resultsList');

        if (this.entries.length === 0) {
            resultsList.innerHTML = '<p class="no-entries">No entries yet. Submit the form above to get started!</p>';
            return;
        }

        const entriesHTML = this.entries
            .map(entry => `
                <div class="entry-item">
                    <div class="entry-name">${this.escapeHtml(entry.name)}</div>
                    <div class="entry-station">${this.escapeHtml(entry.station)}</div>
                    <div class="entry-time">${this.formatTime(entry.timestamp)}</div>
                </div>
            `)
            .reverse() // Show newest first
            .join('');

        resultsList.innerHTML = entriesHTML;
    }

    resetForm() {
        const form = document.getElementById('registrationForm');
        const locationRadios = document.querySelectorAll('input[name="location"]');
        const stationSelectSzekesfehervar = document.getElementById('stationSzekesfehervar');
        const stationSelectBudapest = document.getElementById('stationBudapest');
        const szekesfehervarpGroup = document.getElementById('stationGroupSzekesfehervar');
        const budapestGroup = document.getElementById('stationGroupBudapest');

        // Reset location selection
        locationRadios.forEach(radio => radio.checked = false);

        // Reset station selections
        stationSelectSzekesfehervar.value = '';
        stationSelectBudapest.value = '';

        // Hide both station groups
        szekesfehrvarpGroup.style.display = 'none';
        budapestGroup.style.display = 'none';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        return timestamp.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StationRegistration();
    initializeHowToToggle();
    initializeCollapsibleSections();
});

function initializeHowToToggle() {
    const toggleButton = document.getElementById('howToToggle');
    const toggleIcon = document.getElementById('toggleIcon');
    const content = document.getElementById('howToContent');

    if (!toggleButton || !toggleIcon || !content) {
        return; // Elements not found, skip initialization
    }

    let isExpanded = false; // Start collapsed

    toggleButton.addEventListener('click', () => {
        isExpanded = !isExpanded;

        if (isExpanded) {
            // Show content
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.opacity = '1';
            toggleIcon.style.transform = 'rotate(0deg)';
        } else {
            // Hide content
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            toggleIcon.style.transform = 'rotate(-90deg)';
        }
    });

    // Set initial state (collapsed)
    content.style.maxHeight = '0px';
    content.style.opacity = '0';
    toggleIcon.style.transform = 'rotate(-90deg)';
}

function initializeCollapsibleSections() {
    const sections = [
        { toggle: 'scheduleToggle', icon: 'scheduleToggleIcon', content: 'scheduleContent' },
        { toggle: 'mapToggle', icon: 'mapToggleIcon', content: 'mapContent' },
        { toggle: 'resultsToggle', icon: 'resultsToggleIcon', content: 'resultsContent' }
    ];

    sections.forEach(section => {
        const toggleButton = document.getElementById(section.toggle);
        const toggleIcon = document.getElementById(section.icon);
        const content = document.getElementById(section.content);

        if (!toggleButton || !toggleIcon || !content) {
            return; // Elements not found, skip this section
        }

        let isExpanded = false; // Start collapsed

        toggleButton.addEventListener('click', () => {
            isExpanded = !isExpanded;

            if (isExpanded) {
                // Show content
                content.style.maxHeight = content.scrollHeight + 'px';
                content.style.opacity = '1';
                toggleIcon.style.transform = 'rotate(0deg)';
            } else {
                // Hide content
                content.style.maxHeight = '0px';
                content.style.opacity = '0';
                toggleIcon.style.transform = 'rotate(-90deg)';
            }
        });

        // Set initial state (collapsed)
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        toggleIcon.style.transform = 'rotate(-90deg)';
    });
}
