
class StationRegistration {
    constructor() {
        this.entries = [];
        this.currentFormData = null;
        this.STATION_PASSWORD = '0815';
        this.savedName = localStorage.getItem('savedName') || '';
        this.completedStations = new Set(JSON.parse(localStorage.getItem('completedStations') || '[]'));
        
        this.initializeEventListeners();
        this.loadSavedName();
        this.updateStationOptions();
    }
    
    initializeEventListeners() {
        const form = document.getElementById('registrationForm');
        const passwordModal = document.getElementById('passwordModal');
        const confirmBtn = document.getElementById('confirmPassword');
        const cancelBtn = document.getElementById('cancelPassword');
        const passwordInput = document.getElementById('passwordInput');
        const nameInput = document.getElementById('name');
        
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
    
    updateStationOptions() {
        const stationSelect = document.getElementById('station');
        const options = stationSelect.querySelectorAll('option');
        
        options.forEach(option => {
            if (option.value && this.completedStations.has(option.value)) {
                option.textContent = option.textContent.replace(' ✓', '') + ' ✓';
                option.style.color = '#28a745';
                option.style.fontWeight = 'bold';
            }
        });
    }
    
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const name = formData.get('name').trim();
        const station = formData.get('station');
        
        if (!name || !station) {
            alert('Please fill in all fields');
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
        
        if (enteredPassword === this.STATION_PASSWORD) {
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
        const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbxT8K4H7Zg3Y5U2V1W9X0Q6P7M8N4L5J1K2H3G9F8E7D6C5B4A3Z2Y1X0W9V8U7T6S5R4Q3P2O1N0M9L8K7J6I5H4G3F2E1D0C9B8A7Z6Y5X4W3V2U1T0/exec';
        
        try {
            const response = await fetch(GOOGLE_SHEETS_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: entryData.name,
                    station: entryData.station,
                    timestamp: entryData.timestamp.toISOString(),
                    sheet: 'APP'
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
        const stationSelect = document.getElementById('station');
        
        // Only reset station, keep the saved name
        stationSelect.value = '';
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
});
