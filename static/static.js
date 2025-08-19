
class TypeXiApp {
    constructor() {
        this.currentSection = 'typing';
        this.typingTest = null;
        this.settings = this.loadSettings();
        
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        this.typingTest = new TypingTest();
        this.applySettings();
        this.showSection('typing');
    }

    bindEvents() {
        this.bindNavigationEvents();
        this.bindSettingsEvents();
        this.bindDataManagementEvents();
        this.bindRandomGeneratorEvents();
    }

    bindNavigationEvents() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.nav-btn').dataset.section;
                this.showSection(section);
            });
        });
    }

    bindSettingsEvents() {
        document.getElementById('theme-select').addEventListener('change', (e) => {
            this.settings.theme = e.target.value;
            this.saveSettings();
            this.applyTheme();
        });

        document.getElementById('font-size-slider').addEventListener('input', (e) => {
            const size = e.target.value;
            document.getElementById('font-size-value').textContent = size + 'px';
            this.settings.fontSize = size;
            this.saveSettings();
            this.applyFontSize();
        });

        document.getElementById('cursor-toggle').addEventListener('change', (e) => {
            this.settings.showCursor = e.target.checked;
            this.saveSettings();
            this.applyCursorSetting();
        });

        document.getElementById('sound-effects-toggle').addEventListener('change', (e) => {
            this.settings.soundEffects = e.target.checked;
            this.saveSettings();
            this.applySoundSetting();
        });
    }

    bindDataManagementEvents() {
        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('clear-data').addEventListener('click', () => {
            this.clearData();
        });
    }

    bindRandomGeneratorEvents() {
        document.getElementById('generate-words').addEventListener('click', () => {
            this.generateRandomWords();
        });

        document.getElementById('generate-sentence').addEventListener('click', () => {
            this.generateRandomSentence();
        });

        document.getElementById('generate-paragraph').addEventListener('click', () => {
            this.generateRandomParagraph();
        });

        document.getElementById('copy-generated').addEventListener('click', () => {
            this.copyGeneratedContent();
        });
    }

    showSection(section) {
        //Update nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;
        
        if (section === 'typing') {
            this.typingTest.textInput.focus();
        }
    }

    loadSettings() {
        const defaultSettings = {
            theme: 'light',
            fontSize: 16,
            showCursor: true,
            soundEffects: true
        };

        try {
            const saved = localStorage.getItem('typexi-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('typexi-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    applySettings() {
        this.applyTheme();
        this.applyFontSize();
        this.applyCursorSetting();
        this.applySoundSetting();
    }

    applyTheme() {
        document.body.className = `theme-${this.settings.theme}`;
    }

    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-base', this.settings.fontSize + 'px');
    }

    applyCursorSetting() {
    }

    applySoundSetting() {
    }

    exportData() {
        try {
            const data = {
                settings: this.settings,
                timestamp: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `typexi-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showToast('Data exported successfully', 'success');
        } catch (error) {
            console.error('Error exporting data:', error);
            this.showToast('Error exporting data', 'error');
        }
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            localStorage.clear();
            this.settings = this.loadSettings();
            this.applySettings();
            this.showToast('All data cleared', 'success');
        }
    }

    async generateRandomWords() {
        try {
            const count = document.getElementById('word-count-input').value;
            const category = document.getElementById('word-category-select').value;
            
            const response = await fetch(`/api/random-words?count=${count}&category=${category}`);
            const data = await response.json();
            
            const generatedText = data.words.join(' ');
            document.getElementById('generated-text').value = generatedText;
            this.showToast('Random words generated successfully', 'success');
        } catch (error) {
            console.error('Error generating words:', error);
            this.showToast('Error generating words', 'error');
        }
    }

    async generateRandomSentence() {
        try {
            const category = document.getElementById('word-category-select').value;
            
            const response = await fetch(`/api/generate-sentence?category=${category}`);
            const data = await response.json();
            
            document.getElementById('generated-text').value = data.sentence;
            this.showToast('Random sentence generated successfully', 'success');
        } catch (error) {
            console.error('Error generating sentence:', error);
            this.showToast('Error generating sentence', 'error');
        }
    }

    async generateRandomParagraph() {
        try {
            const category = document.getElementById('word-category-select').value;
            
            const response = await fetch(`/api/generate-paragraph?category=${category}`);
            const data = await response.json();
            
            document.getElementById('generated-text').value = data.paragraph;
            this.showToast('Random paragraph generated successfully', 'success');
        } catch (error) {
            console.error('Error generating paragraph:', error);
            this.showToast('Error generating paragraph', 'error');
        }
    }

    copyGeneratedContent() {
        const textArea = document.getElementById('generated-text');
        textArea.select();
        try {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textArea.value);
            } else {
                document.execCommand('copy');
            }
            this.showToast('Content copied to clipboard', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showToast('Error copying to clipboard', 'error');
        }
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const messageEl = toast.querySelector('.toast-message');
        const iconEl = toast.querySelector('.toast-icon');

        messageEl.textContent = message;
        toast.className = `toast ${type}`;

        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        iconEl.className = `toast-icon ${icons[type] || icons.info}`;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

class TypingTest {
    constructor() {
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.errors = 0;
        this.totalChars = 0;
        this.timer = null;
        this.testMode = 'time';
        this.testDuration = 30;
        this.testWordCount = 25;
        this.soundEnabled = true;
        this.randomMode = false;

        this.typingSessions = [];
        this.lastTypingTime = null;
        this.currentWpm = 0;
        this.wpmDecayRate = 0.95;
        this.typingTimeout = 2000;

        this.renderTimeout = null;
        this.lastRenderTime = 0;

        this.autoIndent = true;
        this.currentIndentLevel = 0;

        this.scrollTimeout = null;
        this.lastScrollTime = 0;

        this.initializeElements();
        this.bindEvents();
        this.loadNewText();
        this.initializeSounds();
    }

    initializeElements() {
        this.textDisplay = document.getElementById('textDisplay');
        this.textInput = document.getElementById('textInput');
        this.wpmDisplay = document.getElementById('wpm');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.timerDisplay = document.getElementById('timer');
        this.charactersDisplay = document.getElementById('characters');
        this.errorsDisplay = document.getElementById('errors');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.resultsModal = document.getElementById('resultsModal');
    }

    bindEvents() {
        this.bindInputEvents();
        this.bindConfigurationEvents();
        this.bindControlEvents();
        this.bindModalEvents();
        this.bindGlobalEvents();
    }

    bindInputEvents() {
        this.textInput.addEventListener('input', (e) => this.handleInput(e));
        this.textInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    bindConfigurationEvents() {
        document.querySelectorAll('.config-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleConfigClick(e));
        });

        document.getElementById('language-select').addEventListener('change', () => this.loadNewText());
        document.getElementById('category-select').addEventListener('change', () => this.loadNewText());
        document.getElementById('code-language-select').addEventListener('change', () => this.loadNewText());

        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        document.getElementById('random-toggle').addEventListener('change', (e) => {
            this.randomMode = e.target.checked;
            this.loadNewText();
        });
    }

    bindControlEvents() {
        document.getElementById('restartBtn').addEventListener('click', () => this.restartTest());
        document.getElementById('newTextBtn').addEventListener('click', () => this.loadNewText());
    }

    bindModalEvents() {
        document.getElementById('closeModal').addEventListener('click', () => this.closeResultsModal());
        document.getElementById('tryAgainBtn').addEventListener('click', () => {
            this.closeResultsModal();
            this.restartTest();
        });
        document.getElementById('shareResultBtn').addEventListener('click', () => this.shareResult());
    }

    bindGlobalEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.isTestComplete() && !e.target.closest('.select-input') && !e.target.closest('.config-btn')) {
                this.textInput.focus();
            }
        });

        this.textDisplay.addEventListener('click', () => {
            if (!this.isTestComplete()) {
                this.textInput.focus();
            }
        });
    }

    async loadNewText() {
        try {
            const language = document.getElementById('language-select').value;
            const category = document.getElementById('category-select').value;
            const codeLanguage = document.getElementById('code-language-select').value;

            let url = '/api/text?';
            if (this.testMode === 'code') {
                url += `type=code&code_language=${codeLanguage}&random=${this.randomMode}&duration=${this.testDuration}`;
            } else {
                url += `type=text&language=${language}&category=${category}&random=${this.randomMode}&duration=${this.testDuration}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!data.text) {
                throw new Error('No text content received from API');
            }

            this.currentText = this.formatText(data.text);
            this.currentContentType = data.type || 'text';
            this.resetTest();
            this.renderText();

            if (this.currentContentType === 'code') {
                this.textDisplay.classList.add('code-display');
            } else {
                this.textDisplay.classList.remove('code-display');
            }
        } catch (error) {
            console.error('Error loading text:', error);
            this.textDisplay.innerHTML = '<div class="loading error"><i class="fas fa-exclamation-triangle"></i><span>Error loading content. Please try again.</span></div>';
        }
    }

    formatText(text) {
        if (this.currentContentType === 'code') {
            return text;
        }

        if (this.testMode === 'words') {
            const words = text.split(' ').filter(word => word.length > 0);
            text = words.slice(0, this.testWordCount).join(' ');
        }

        return text;
    }

    resetTest() {
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.errors = 0;
        this.totalChars = 0;
        this.textInput.value = '';
        this.textInput.disabled = false;
        this.typingSessions = [];
        this.lastTypingTime = null;
        this.currentWpm = 0;
        this.currentIndentLevel = 0;

        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
            this.renderTimeout = null;
        }

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        this.updateStats(0, 100, 0, 0, 0);
        this.updateProgress(0);
    }

    restartTest() {
        this.resetTest();
        this.renderText();
        this.textInput.focus();
    }

    renderText() {
        const now = Date.now();
        
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        
        if (now - this.lastRenderTime < 16) {
            this.renderTimeout = setTimeout(() => this.renderText(), 16);
            return;
        }
        
        this.lastRenderTime = now;
        
        const chars = this.currentText.split('');
        const inputValue = this.textInput.value;
        let html = '';

        chars.forEach((char, index) => {
            let className = 'char';

            if (index < inputValue.length) {
                className += inputValue[index] === char ? ' correct' : ' incorrect';
            } else if (index === inputValue.length) {
                className += ' current';
            }

            const escapedChar = this.escapeHtml(char);
            
            if (char === '\n') {
                html += `<span class="${className}" data-index="${index}">↵<br></span>`;
            } else if (char === '\t') {
                html += `<span class="${className} tab-char" data-index="${index}">→&nbsp;&nbsp;&nbsp;</span>`;
            } else if (char === ' ') {
                html += `<span class="${className}" data-index="${index}">&nbsp;</span>`;
            } else {
                html += `<span class="${className}" data-index="${index}">${escapedChar}</span>`;
            }
        });

        this.textDisplay.innerHTML = html;
        this.scrollToCurrentChar();
    }

    handleInput(e) {
        if (this.isTestComplete()) return;

        const inputValue = e.target.value;
        const previousLength = this.currentIndex;

        if (inputValue.length === 1 && !this.isTestActive) {
            this.startTest();
        }

        if (inputValue.length > this.currentText.length) {
            e.target.value = inputValue.slice(0, this.currentText.length);
            return;
        }

        // Reset errors and recalculate based on current input
        this.errors = 0;
        for (let i = 0; i < inputValue.length; i++) {
            if (inputValue[i] !== this.currentText[i]) {
                this.errors++;
            }
        }

        // Play sound for the last character typed
        if (inputValue.length > previousLength) {
            const lastCharIndex = inputValue.length - 1;
            if (inputValue[lastCharIndex] !== this.currentText[lastCharIndex]) {
                this.playSound('error');
            } else {
                this.playSound('keypress');
            }
        }

        this.currentIndex = inputValue.length;
        this.totalChars = inputValue.length;
        this.updateTypingStats();

        const progress = this.currentText.length > 0 ? Math.round((inputValue.length / this.currentText.length) * 100) : 0;
        this.updateProgress(progress);

        if (inputValue.length === this.currentText.length) {
            this.completeTest();
        }

        this.renderText();
    }

    handleKeyDown(e) {
        if (this.isTestComplete()) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            this.insertTab();
        } else if (e.key === 'Enter' && this.currentContentType === 'code') {
            e.preventDefault();
            this.insertNewLine();
        }
    }

    handleConfigClick(e) {
        const btn = e.target.closest('.config-btn');
        const parent = btn.parentElement;
        
        parent.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        if (btn.dataset.test) {
            this.testMode = btn.dataset.test;
            this.showHideConfigSections();
        }
        
        if (btn.dataset.duration) {
            this.testDuration = parseInt(btn.dataset.duration);
        }
        
        if (btn.dataset.words) {
            this.testWordCount = parseInt(btn.dataset.words);
        }
        
        this.loadNewText();
    }

    showHideConfigSections() {
        const durationSection = document.getElementById('duration-section');
        const wordCountSection = document.getElementById('word-count-section');
        const codeLanguageSelect = document.getElementById('code-language-select');
        const categorySelect = document.getElementById('category-select');
        const languageSelect = document.getElementById('language-select');

        if (this.testMode === 'time' || this.testMode === 'code') {
            durationSection.style.display = 'block';
            wordCountSection.style.display = 'none';
        } else if (this.testMode === 'words') {
            durationSection.style.display = 'none';
            wordCountSection.style.display = 'block';
        } else {
            durationSection.style.display = 'none';
            wordCountSection.style.display = 'none';
        }

        if (this.testMode === 'code') {
            codeLanguageSelect.style.display = 'block';
            categorySelect.style.display = 'none';
            languageSelect.style.display = 'none';
        } else {
            codeLanguageSelect.style.display = 'none';
            categorySelect.style.display = 'block';
            languageSelect.style.display = 'block';
        }
    }

    startTest() {
        this.isTestActive = true;
        this.startTime = Date.now();
        
        // Start real-time stats update
        this.statsTimer = setInterval(() => {
            if (this.startTime && this.isTestActive) {
                const now = Date.now();
                const elapsed = (now - this.startTime) / 1000 / 60; // minutes
                const wordsTyped = this.textInput.value.trim().split(/\s+/).filter(word => word.length > 0).length;
                const currentWpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
                const accuracy = this.calculateRealAccuracy();
                const timeElapsed = Math.floor((now - this.startTime) / 1000);
                
                this.updateStats(currentWpm, accuracy, timeElapsed, this.totalChars, this.errors);
            }
        }, 100);
        
        if (this.testMode === 'time' || this.testMode === 'code') {
            this.timer = setInterval(() => {
                if (this.startTime) {
                    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                    const remaining = this.testDuration - elapsed;
                    
                    if (remaining <= 0) {
                        this.completeTest();
                    } else {
                        this.timerDisplay.textContent = remaining + 's';
                    }
                }
            }, 1000);
        } else {
            // For words tests, show elapsed time
            this.timer = setInterval(() => {
                if (this.startTime) {
                    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                    this.timerDisplay.textContent = elapsed + 's';
                }
            }, 1000);
        }
    }

    completeTest() {
        this.isTestActive = false;
        this.endTime = Date.now();
        this.textInput.disabled = true;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        if (this.statsTimer) {
            clearInterval(this.statsTimer);
            this.statsTimer = null;
        }

        // Play completion sound
        this.playCompletionSound();

        const timeTaken = (this.endTime - this.startTime) / 1000;
        const wpm = this.calculateWPM(timeTaken);
        const accuracy = this.calculateAccuracy();
        
        this.showResults(wpm, accuracy, timeTaken);
    }

    calculateWPM(timeTaken) {
        const wordsTyped = this.textInput.value.trim().split(/\s+/).length;
        const minutes = timeTaken / 60;
        return minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    }

    calculateAccuracy() {
        const totalChars = this.currentText.length;
        const correctChars = totalChars - this.errors;
        return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    }

    updateTypingStats() {
        const now = Date.now();
        
        if (this.lastTypingTime) {
            const timeDiff = now - this.lastTypingTime;
            this.typingSessions.push(timeDiff);
            
            if (this.typingSessions.length > 10) {
                this.typingSessions.shift();
            }
        }
        
        this.lastTypingTime = now;
        
        if (this.startTime) {
            const elapsed = (now - this.startTime) / 1000 / 60; // mins
            const wordsTyped = this.textInput.value.trim().split(/\s+/).filter(word => word.length > 0).length;
            this.currentWpm = elapsed > 0 ? Math.round(wordsTyped / elapsed) : 0;
        }
        
        const accuracy = this.totalChars > 0 ? Math.round(((this.totalChars - this.errors) / this.totalChars) * 100) : 100;
        
        // For time-based and code tests, update stats directly without timer (timer is handled separately)
        if (this.testMode === 'time' || this.testMode === 'code') {
            this.wpmDisplay.textContent = this.currentWpm;
            this.accuracyDisplay.textContent = accuracy + '%';
            this.charactersDisplay.textContent = this.totalChars;
            this.errorsDisplay.textContent = this.errors;
        } else {
            this.updateStats(this.currentWpm, accuracy, Math.floor((now - this.startTime) / 1000), this.totalChars, this.errors);
        }
    }

    updateStats(wpm, accuracy, time, chars, errors) {
        this.wpmDisplay.textContent = wpm;
        this.accuracyDisplay.textContent = accuracy + '%';
        this.timerDisplay.textContent = time + 's';
        this.charactersDisplay.textContent = chars;
        this.errorsDisplay.textContent = errors;
    }

    updateProgress(percentage) {
        this.progressFill.style.width = percentage + '%';
        this.progressText.textContent = percentage + '%';
    }

    scrollToCurrentChar() {
        const currentChar = this.textDisplay.querySelector('.char.current');
        if (currentChar) {
            currentChar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    insertTab() {
        const start = this.textInput.selectionStart;
        const end = this.textInput.selectionEnd;
        const value = this.textInput.value;
        
        this.textInput.value = value.substring(0, start) + '    ' + value.substring(end);
        this.textInput.selectionStart = this.textInput.selectionEnd = start + 4;
        
        this.handleInput({ target: { value: this.textInput.value } });
    }

    insertNewLine() {
        const start = this.textInput.selectionStart;
        const end = this.textInput.selectionEnd;
        const value = this.textInput.value;
        
        let indent = '';
        if (this.autoIndent) {
            const currentLine = value.substring(0, start).split('\n').pop();
            const match = currentLine.match(/^(\s*)/);
            if (match) {
                indent = match[1];
            }
        }
        
        this.textInput.value = value.substring(0, start) + '\n' + indent + value.substring(end);
        this.textInput.selectionStart = this.textInput.selectionEnd = start + 1 + indent.length;
        
        this.handleInput({ target: { value: this.textInput.value } });
    }

    showResults(wpm, accuracy, timeTaken) {
        document.getElementById('finalWpm').textContent = wpm;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        document.getElementById('finalTime').textContent = timeTaken.toFixed(1) + 's';
        document.getElementById('finalChars').textContent = this.totalChars;
        document.getElementById('finalErrors').textContent = this.errors;
        document.getElementById('finalTestType').textContent = this.testMode.charAt(0).toUpperCase() + this.testMode.slice(1);
        
        this.resultsModal.classList.add('show');
    }

    closeResultsModal() {
        this.resultsModal.classList.remove('show');
    }

    shareResult() {
        const wpm = document.getElementById('finalWpm').textContent;
        const accuracy = document.getElementById('finalAccuracy').textContent;
        const text = `I just achieved ${wpm} WPM with ${accuracy} accuracy on TypeXi! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My TypeXi Typing Test Result',
                text: text,
                url: window.location.href
            });
        } else {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(text);
                } else {
                    document.execCommand('copy');
                }
                if (window.typeXiApp) {
                    window.typeXiApp.showToast('Result copied to clipboard!', 'success');
                }
            } catch (error) {
                console.error('Error copying to clipboard:', error);
                if (window.typeXiApp) {
                    window.typeXiApp.showToast('Error copying to clipboard', 'error');
                }
            }
        }
    }

    isTestComplete() {
        return this.endTime !== null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeSounds() {
        this.audioContext = null;
        this.soundEnabled = true;
        this.lastKeypressTime = 0;
        
        // Initialize audio context on first user interaction
        document.addEventListener('keydown', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        }, { once: true });
    }

    playSound(type) {
        if (!this.soundEnabled || !this.audioContext) return;
        
        try {
            if (type === 'keypress') {
                this.playKeypressSound();
            } else if (type === 'error') {
                this.playErrorSound();
            }
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    playKeypressSound() {
        const now = Date.now();
        
        // Prevent sound overlap - minimum 30ms between sounds
        if (now - this.lastKeypressTime < 30) {
            return;
        }
        this.lastKeypressTime = now;
        
        // Create multiple oscillators for realistic mechanical keyboard sound
        const clickOsc = this.audioContext.createOscillator();
        const thockOsc = this.audioContext.createOscillator();
        const noiseOsc = this.audioContext.createOscillator();
        
        const clickGain = this.audioContext.createGain();
        const thockGain = this.audioContext.createGain();
        const noiseGain = this.audioContext.createGain();
        
        const clickFilter = this.audioContext.createBiquadFilter();
        const thockFilter = this.audioContext.createBiquadFilter();
        const noiseFilter = this.audioContext.createBiquadFilter();
        
        // Create audio chains
        clickOsc.connect(clickFilter);
        clickFilter.connect(clickGain);
        clickGain.connect(this.audioContext.destination);
        
        thockOsc.connect(thockFilter);
        thockFilter.connect(thockGain);
        thockGain.connect(this.audioContext.destination);
        
        noiseOsc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        const currentTime = this.audioContext.currentTime;
        const duration = 0.06 + Math.random() * 0.02; // 60-80ms duration
        
        // Click sound (high frequency, short duration)
        clickOsc.frequency.setValueAtTime(1200 + Math.random() * 400, currentTime);
        clickFilter.type = 'bandpass';
        clickFilter.frequency.setValueAtTime(1500, currentTime);
        clickFilter.Q.setValueAtTime(3, currentTime);
        
        clickGain.gain.setValueAtTime(0, currentTime);
        clickGain.gain.linearRampToValueAtTime(0.15, currentTime + 0.002);
        clickGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.02);
        
        // Thock sound (low frequency, longer duration)
        thockOsc.frequency.setValueAtTime(80 + Math.random() * 40, currentTime);
        thockFilter.type = 'lowpass';
        thockFilter.frequency.setValueAtTime(300, currentTime);
        thockFilter.Q.setValueAtTime(1, currentTime);
        
        thockGain.gain.setValueAtTime(0, currentTime);
        thockGain.gain.linearRampToValueAtTime(0.08, currentTime + 0.005);
        thockGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);
        
        // Noise component for realism
        noiseOsc.type = 'sawtooth';
        noiseOsc.frequency.setValueAtTime(50 + Math.random() * 30, currentTime);
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, currentTime);
        noiseFilter.Q.setValueAtTime(0.5, currentTime);
        
        noiseGain.gain.setValueAtTime(0, currentTime);
        noiseGain.gain.linearRampToValueAtTime(0.03, currentTime + 0.003);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * 0.5);
        
        // Start and stop oscillators
        clickOsc.start(currentTime);
        clickOsc.stop(currentTime + 0.02);
        
        thockOsc.start(currentTime);
        thockOsc.stop(currentTime + duration);
        
        noiseOsc.start(currentTime);
        noiseOsc.stop(currentTime + duration * 0.5);
    }

    playErrorSound() {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Create audio chain
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Error sound - lower pitch with slight dissonance
        const baseFreq = 180 + Math.random() * 40; // 180-220 Hz with variation
        const duration = 0.12 + Math.random() * 0.06; // 120-180ms duration
        
        // Set up filter for error sound
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
        filter.Q.setValueAtTime(1.0, this.audioContext.currentTime);
        
        // Create the error sound
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, this.audioContext.currentTime + duration * 0.4);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.06, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playCompletionSound() {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filter = this.audioContext.createBiquadFilter();
        
        // Create audio chain
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Completion sound - ascending chord
        const baseFreq = 400;
        const duration = 0.3;
        
        // Set up filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(3000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(0.7, this.audioContext.currentTime);
        
        // Create ascending completion sound
        oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, this.audioContext.currentTime + duration);
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.typeXiApp = new TypeXiApp();
});