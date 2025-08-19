
class KeyraApp {
    constructor() {
        this.currentSection = 'typing';
        this.typingTest = null;
        this.codeTypingTest = null;
        this.settings = this.loadSettings();
        
        this.initializeApp();
        this.bindEvents();
    }

    initializeApp() {
        this.typingTest = new TypingTest();
        this.codeTypingTest = new CodeTypingTest();
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
        } else if (section === 'code') {
            this.codeTypingTest.textInput.focus();
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
            const saved = localStorage.getItem('keyra-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return defaultSettings;
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('keyra-settings', JSON.stringify(this.settings));
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
            a.download = `keyra-data-${new Date().toISOString().split('T')[0]}.json`;
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
        document.execCommand('copy');
        this.showToast('Content copied to clipboard', 'success');
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
        this.includeNumbers = false;
        this.soundEnabled = true;
        this.randomMode = false;
        this.apiMode = true;

        this.typingSessions = [];
        this.lastTypingTime = null;
        this.currentWpm = 0;
        this.wpmDecayRate = 0.95;
        this.typingTimeout = 2000;
        this.consistencyData = [];

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
        this.consistencyDisplay = document.getElementById('consistency');
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

        document.getElementById('numbers-toggle').addEventListener('change', (e) => {
            this.includeNumbers = e.target.checked;
            this.loadNewText();
        });

        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        document.getElementById('random-toggle').addEventListener('change', (e) => {
            this.randomMode = e.target.checked;
            this.loadNewText();
        });

        document.getElementById('api-toggle').addEventListener('change', (e) => {
            this.apiMode = e.target.checked;
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
                url += `type=code&code_language=${codeLanguage}&random=${this.randomMode}`;
            } else {
                url += `type=text&language=${language}&category=${category}&random=${this.randomMode}&api=${this.apiMode}`;
            }

            const response = await fetch(url);
            const data = await response.json();

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
            this.textDisplay.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><span>Error loading content. Please try again.</span></div>';
        }
    }

    formatText(text) {
        if (this.currentContentType === 'code') {
            return text;
        }

        if (!this.includeNumbers) {
            text = text.replace(/\d/g, '');
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
        this.consistencyData = [];
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

        this.updateStats(0, 100, 0, 0, 0, 100);
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
        const currentChar = this.currentText[inputValue.length - 1];
        const expectedChar = this.currentText[inputValue.length - 1];

        if (inputValue.length === 1 && !this.isTestActive) {
            this.startTest();
        }

        if (inputValue.length > this.currentText.length) {
            e.target.value = inputValue.slice(0, this.currentText.length);
            return;
        }

        if (currentChar !== expectedChar) {
            this.errors++;
            this.playSound('error');
        } else {
            this.playSound('keypress');
        }

        this.currentIndex = inputValue.length;
        this.totalChars = inputValue.length;
        this.updateTypingStats();

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

        if (this.testMode === 'time') {
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
        
        if (this.testMode === 'time') {
            this.timer = setInterval(() => {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                const remaining = this.testDuration - elapsed;
                
                if (remaining <= 0) {
                    this.completeTest();
                } else {
                    this.timerDisplay.textContent = remaining + 's';
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

        const timeTaken = (this.endTime - this.startTime) / 1000;
        const wpm = this.calculateWPM(timeTaken);
        const accuracy = this.calculateAccuracy();
        
        this.showResults(wpm, accuracy, timeTaken);
    }

    calculateWPM(timeTaken) {
        const words = this.currentText.split(' ').length;
        const minutes = timeTaken / 60;
        return Math.round(words / minutes);
    }

    calculateAccuracy() {
        const totalChars = this.currentText.length;
        const correctChars = totalChars - this.errors;
        return Math.round((correctChars / totalChars) * 100);
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
            const words = this.currentText.split(' ').length;
            this.currentWpm = Math.round(words / elapsed);
        }
        
        this.updateStats(this.currentWpm, this.calculateAccuracy(), Math.floor((now - this.startTime) / 1000), this.totalChars, this.errors, this.calculateConsistency());
    }

    calculateConsistency() {
        if (this.typingSessions.length < 2) return 100;
        
        const avg = this.typingSessions.reduce((a, b) => a + b, 0) / this.typingSessions.length;
        const variance = this.typingSessions.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / this.typingSessions.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, Math.round(100 - (stdDev / avg) * 100));
    }

    updateStats(wpm, accuracy, time, chars, errors, consistency) {
        this.wpmDisplay.textContent = wpm;
        this.accuracyDisplay.textContent = accuracy + '%';
        this.timerDisplay.textContent = time + 's';
        this.charactersDisplay.textContent = chars;
        this.errorsDisplay.textContent = errors;
        this.consistencyDisplay.textContent = consistency + '%';
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
        document.getElementById('finalConsistency').textContent = this.calculateConsistency() + '%';
        document.getElementById('finalTestType').textContent = this.testMode.charAt(0).toUpperCase() + this.testMode.slice(1);
        
        this.resultsModal.classList.add('show');
    }

    closeResultsModal() {
        this.resultsModal.classList.remove('show');
    }

    shareResult() {
        const wpm = document.getElementById('finalWpm').textContent;
        const accuracy = document.getElementById('finalAccuracy').textContent;
        const text = `I just achieved ${wpm} WPM with ${accuracy} accuracy on Keyra! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'My Keyra Typing Test Result',
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text);
            this.showToast('Result copied to clipboard!', 'success');
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
    }

    playSound(type) {
        if (!this.soundEnabled) return;
    }
}

class CodeTypingTest {
    constructor() {
        this.currentText = '';
        this.currentIndex = 0;
        this.startTime = null;
        this.endTime = null;
        this.isTestActive = false;
        this.errors = 0;
        this.totalChars = 0;
        this.timer = null;
        this.soundEnabled = true;
        this.autoIndent = true;
        this.currentIndentLevel = 0;
        this.randomMode = false;

        this.typingSessions = [];
        this.lastTypingTime = null;
        this.currentWpm = 0;
        this.wpmDecayRate = 0.95;
        this.typingTimeout = 2000;
        this.consistencyData = [];

        this.renderTimeout = null;
        this.lastRenderTime = 0;

        this.scrollTimeout = null;
        this.lastScrollTime = 0;

        this.initializeElements();
        this.bindEvents();
        this.loadNewCode();
        this.initializeSounds();
    }

    initializeElements() {
        this.textDisplay = document.getElementById('codeTextDisplay');
        this.textInput = document.getElementById('codeTextInput');
        this.wpmDisplay = document.getElementById('code-wpm');
        this.accuracyDisplay = document.getElementById('code-accuracy');
        this.timerDisplay = document.getElementById('code-timer');
        this.charactersDisplay = document.getElementById('code-characters');
        this.errorsDisplay = document.getElementById('code-errors');
        this.consistencyDisplay = document.getElementById('code-consistency');
        this.progressFill = document.getElementById('codeProgressFill');
        this.progressText = document.getElementById('codeProgressText');
        this.resultsModal = document.getElementById('resultsModal');
    }

    bindEvents() {
        this.bindInputEvents();
        this.bindConfigurationEvents();
        this.bindControlEvents();
    }

    bindInputEvents() {
        this.textInput.addEventListener('input', (e) => this.handleInput(e));
        this.textInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    bindConfigurationEvents() {
        document.querySelectorAll('[data-code-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCodeLanguageClick(e));
        });

        document.getElementById('code-sound-toggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
        });

        document.getElementById('code-cursor-toggle').addEventListener('change', (e) => {
            this.applyCursorSetting(e.target.checked);
        });

        document.getElementById('code-indent-toggle').addEventListener('change', (e) => {
            this.autoIndent = e.target.checked;
        });

        document.getElementById('code-random-toggle').addEventListener('change', (e) => {
            this.randomMode = e.target.checked;
            this.loadNewCode();
        });
    }

    bindControlEvents() {
        document.getElementById('codeRestartBtn').addEventListener('click', () => this.restartTest());
        document.getElementById('codeNewTextBtn').addEventListener('click', () => this.loadNewCode());

        this.textDisplay.addEventListener('click', () => {
            if (!this.isTestComplete()) {
                this.textInput.focus();
            }
        });
    }

    handleCodeLanguageClick(e) {
        const btn = e.target.closest('.config-btn');
        const parent = btn.parentElement;
        
        parent.querySelectorAll('.config-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        this.loadNewCode();
    }

    async loadNewCode() {
        try {
            const codeLanguage = document.querySelector('[data-code-lang].active').dataset.codeLang;
            const response = await fetch(`/api/text?type=code&code_language=${codeLanguage}&random=${this.randomMode}`);
            const data = await response.json();

            this.currentText = data.text;
            this.resetTest();
            this.renderText();
        } catch (error) {
            console.error('Error loading code:', error);
            this.textDisplay.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><span>Error loading code. Please try again.</span></div>';
        }
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
        this.consistencyData = [];
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

        this.updateStats(0, 100, 0, 0, 0, 100);
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
        const currentChar = this.currentText[inputValue.length - 1];
        const expectedChar = this.currentText[inputValue.length - 1];

        if (inputValue.length === 1 && !this.isTestActive) {
            this.startTest();
        }

        if (inputValue.length > this.currentText.length) {
            e.target.value = inputValue.slice(0, this.currentText.length);
            return;
        }

        if (currentChar !== expectedChar) {
            this.errors++;
            this.playSound('error');
        } else {
            this.playSound('keypress');
        }

        this.currentIndex = inputValue.length;
        this.totalChars = inputValue.length;
        this.updateTypingStats();

        if (inputValue.length === this.currentText.length) {
            this.completeTest();
        }

        this.renderText();
    }

    handleKeyDown(e) {
        if (this.isTestComplete()) return;

        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                this.removeIndent();
            } else {
                this.insertTab();
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            this.insertNewLine();
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

    removeIndent() {
        const start = this.textInput.selectionStart;
        const end = this.textInput.selectionEnd;
        const value = this.textInput.value;
        
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);
        
        const lines = beforeCursor.split('\n');
        const lastLine = lines[lines.length - 1];
        
        if (lastLine.startsWith('    ')) {
            const newLastLine = lastLine.substring(4);
            lines[lines.length - 1] = newLastLine;
            const newValue = lines.join('\n') + afterCursor;
            
            this.textInput.value = newValue;
            this.textInput.selectionStart = this.textInput.selectionEnd = start - 4;
            
            this.handleInput({ target: { value: this.textInput.value } });
        }
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

    startTest() {
        this.isTestActive = true;
        this.startTime = Date.now();
    }

    completeTest() {
        this.isTestActive = false;
        this.endTime = Date.now();
        this.textInput.disabled = true;
        
        const timeTaken = (this.endTime - this.startTime) / 1000;
        const wpm = this.calculateWPM(timeTaken);
        const accuracy = this.calculateAccuracy();
        
        this.showResults(wpm, accuracy, timeTaken);
    }

    calculateWPM(timeTaken) {
        const words = this.currentText.split(' ').length;
        const minutes = timeTaken / 60;
        return Math.round(words / minutes);
    }

    calculateAccuracy() {
        const totalChars = this.currentText.length;
        const correctChars = totalChars - this.errors;
        return Math.round((correctChars / totalChars) * 100);
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
            const elapsed = (now - this.startTime) / 1000 / 60; // minutes
            const words = this.currentText.split(' ').length;
            this.currentWpm = Math.round(words / elapsed);
        }
        
        this.updateStats(this.currentWpm, this.calculateAccuracy(), Math.floor((now - this.startTime) / 1000), this.totalChars, this.errors, this.calculateConsistency());
    }

    calculateConsistency() {
        if (this.typingSessions.length < 2) return 100;
        
        const avg = this.typingSessions.reduce((a, b) => a + b, 0) / this.typingSessions.length;
        const variance = this.typingSessions.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / this.typingSessions.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, Math.round(100 - (stdDev / avg) * 100));
    }

    updateStats(wpm, accuracy, time, chars, errors, consistency) {
        this.wpmDisplay.textContent = wpm;
        this.accuracyDisplay.textContent = accuracy + '%';
        this.timerDisplay.textContent = time + 's';
        this.charactersDisplay.textContent = chars;
        this.errorsDisplay.textContent = errors;
        this.consistencyDisplay.textContent = consistency + '%';
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

    showResults(wpm, accuracy, timeTaken) {
        document.getElementById('finalWpm').textContent = wpm;
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        document.getElementById('finalTime').textContent = timeTaken.toFixed(1) + 's';
        document.getElementById('finalChars').textContent = this.totalChars;
        document.getElementById('finalErrors').textContent = this.errors;
        document.getElementById('finalConsistency').textContent = this.calculateConsistency() + '%';
        document.getElementById('finalTestType').textContent = 'Code';
        
        this.resultsModal.classList.add('show');
    }

    isTestComplete() {
        return this.endTime !== null;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    applyCursorSetting(show) {
    }

    initializeSounds() {
    }

    playSound(type) {
        if (!this.soundEnabled) return;
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new KeyraApp();
});