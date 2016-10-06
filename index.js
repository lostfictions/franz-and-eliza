/*
 *
 * Type definitions and extra declarations
 *
 */
/*
 *
 * The Actual Thing
 *
 */
function randomInArray(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
let allVoices;
let candidateVoices;
let speechEndTimeout;
const charactersToVoices = {};
const characters = new Set();
woyzeck.forEach(scene => {
    const ds = scene.outline.filter(el => typeof el !== 'string');
    ds.forEach(el => characters.add(el.speaker));
});
const preferredVoices = {
    'Woyzeck': [
        { voice: 'Google Deutsch', pitch: 0.9, rate: 0.9 },
        { voice: 'english-us', pitch: 1, rate: 0.9 }
    ],
    'Eliza': [
        { voice: 'Google UK English Female', pitch: 1.3, rate: 0.9 },
        { voice: 'english-us', pitch: 1.3, rate: 0.9 }
    ],
    'Marie': [
        { voice: 'Google français', pitch: 1.25, rate: 1 },
        { voice: 'english', pitch: 1.25, rate: 1 }
    ],
    'Doctor': [
        { voice: 'Google Deutsch', pitch: 0.9, rate: 0.95 },
        { voice: 'english_rp', pitch: 0.9, rate: 0.95 }
    ],
    'Captain': [
        { voice: 'Google UK English Male', pitch: 0.9, rate: 0.95 },
        { voice: 'en-scottish', pitch: 1, rate: 1 }
    ],
    'Andres': [
        { voice: 'Google UK English Male', pitch: 1.04, rate: 1.02 },
        { voice: 'english-north', pitch: 1, rate: 1 }
    ],
    'Margaret': [
        { voice: 'en-westindies', pitch: 1, rate: 1 },
        { voice: 'en-westindies', pitch: 1, rate: 1 }
    ],
    'Drum Major': [
        { voice: 'Google Deutsch', pitch: 0.92, rate: 0.96 },
        { voice: 'english_wmids', pitch: 1, rate: 1 }
    ],
    'Others': [
        { voice: 'native', pitch: 1, rate: 1 },
        { voice: 'default', pitch: 1, rate: 1 }
    ]
};
const titleView = document.querySelector('#title-view');
const sceneTitleView = document.querySelector('#scene-title-view');
const speakerContainer = document.querySelector('#speaker');
const lineContainer = document.querySelector('#line');
sceneTitleView.style.display = 'none';
speakerContainer.style.display = 'none';
lineContainer.style.display = 'none';
const optionsContainer = document.querySelector('#title-view-collapse');
const optionsContainerContents = optionsContainer.querySelector('ul');
let titleSettingsExpanded = false;
const detailsToggleElement = document.querySelector('#title-view-desc-details');
detailsToggleElement.onclick = e => {
    e.preventDefault();
    titleSettingsExpanded = !titleSettingsExpanded;
    render();
};
const isBot = {};
Object.keys(preferredVoices)
    .forEach(character => {
    const li = document.createElement('li');
    optionsContainerContents.appendChild(li);
    li.textContent = character + ': ';
    isBot[character] = true;
    const a = document.createElement('a');
    a.textContent = 'Robot';
    a.setAttribute('href', '#');
    a.onclick = e => {
        e.preventDefault();
        isBot[character] = !isBot[character];
        a.textContent = isBot[character] ? 'Robot' : 'Human';
        const humanCount = Object.keys(isBot).reduce((p, c) => p + (!isBot[c] ? 1 : 0), 0);
        detailsToggleElement.textContent = humanCount > 0 ? `${humanCount} human${humanCount > 1 ? 's' : ''}, with robots` : 'robots';
    };
    li.appendChild(a);
});
let playInitialized = false;
let isInitializing = false;
const beginButton = document.querySelector('#title-view-begin');
beginButton.onclick = e => {
    if (!isInitializing) {
        isInitializing = true;
        e.preventDefault();
        titleView.style.opacity = '0';
        setTimeout(() => { playInitialized = true; isInitializing = false; titleView.style.opacity = '1'; render(); }, 300);
    }
};
const eliza = new ElizaBot();
let sceneIndex = 0;
let sceneInitialized = false;
let outlineIndex = 0;
let lineIndex = 0;
let shouldDoEliza = false;
let didEliza = false;
function doPlay() {
    render();
}
function advanceLine() {
    if (!sceneInitialized) {
        sceneInitialized = true;
    }
    else if (typeof woyzeck[sceneIndex].outline[outlineIndex] === 'string') {
        advanceOutline();
    }
    else if (woyzeck[sceneIndex].outline[outlineIndex].speaker === 'Woyzeck' &&
        woyzeck[sceneIndex].outline[outlineIndex].linesAndDirections.length - 1 === lineIndex &&
        !didEliza) {
        shouldDoEliza = true;
    }
    else {
        didEliza = false;
        shouldDoEliza = false;
        lineIndex++;
        const d = woyzeck[sceneIndex].outline[outlineIndex];
        if (lineIndex >= d.linesAndDirections.length) {
            advanceOutline();
        }
    }
}
function advanceOutline() {
    outlineIndex++;
    lineIndex = 0;
    if (outlineIndex >= woyzeck[sceneIndex].outline.length) {
        advanceScene();
    }
}
function advanceScene() {
    sceneIndex++;
    if (sceneIndex >= woyzeck.length) {
        sceneIndex = 0;
    }
    sceneInitialized = false;
    outlineIndex = 0;
    lineIndex = 0;
}
function resetPlay() {
    titleSettingsExpanded = false;
    playInitialized = false;
    sceneInitialized = false;
    shouldDoEliza = false;
    didEliza = false;
    sceneIndex = 0;
    outlineIndex = 0;
    lineIndex = 0;
}
function render() {
    clearTimeout(speechEndTimeout);
    speechSynthesis.cancel();
    setTimeout(() => clearTimeout(speechEndTimeout), 50);
    if (!playInitialized) {
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'none';
        sceneTitleView.style.display = 'none';
        optionsContainer.style.display = titleSettingsExpanded ? 'initial' : 'none';
        titleView.style.display = 'initial';
        return;
    }
    if (!sceneInitialized) {
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'none';
        titleView.style.display = 'none';
        sceneTitleView.style.display = 'initial';
        const [sceneTitleName, sceneTitleNumeral] = woyzeck[sceneIndex].name.split(' ');
        sceneTitleView.querySelector('.scene-title-name-word').textContent = sceneTitleName;
        sceneTitleView.querySelector('.scene-title-name-numeral').textContent = sceneTitleNumeral;
        sceneTitleView.querySelector('#scene-title-setting').textContent = woyzeck[sceneIndex].setting || '';
        sceneTitleView.querySelector('#scene-title-note').textContent = woyzeck[sceneIndex].note || '';
        return;
    }
    titleView.style.display = 'none';
    sceneTitleView.style.display = 'none';
    const { outline } = woyzeck[sceneIndex];
    const currentEl = outline[outlineIndex];
    if (typeof currentEl === 'string') {
        // If we have a stage direction, hide the speaker
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'initial';
        lineContainer.textContent = currentEl;
        setTimeout(() => advanceLine(), 3000);
        return;
    }
    let { speaker, linesAndDirections } = currentEl;
    let line = linesAndDirections[lineIndex];
    if (!didEliza && shouldDoEliza) {
        speaker = 'Eliza';
        line = eliza.transform(line);
        didEliza = true;
        shouldDoEliza = false;
    }
    speakerContainer.style.display = 'initial';
    lineContainer.style.display = 'initial';
    speakerContainer.textContent = speaker;
    lineContainer.textContent = line;
    if (!line.startsWith('(')) {
        if (isBot[speaker]) {
            speakLine(speaker, line);
        }
    }
    else {
        setTimeout(() => { advanceLine(); render(); }, 1000);
    }
}
function speakLine(speaker, line) {
    if (!(speaker in charactersToVoices)) {
        if (speaker in preferredVoices) {
            for (const pref of preferredVoices[speaker]) {
                if (pref.voice in candidateVoices) {
                    charactersToVoices[speaker] = {
                        voice: candidateVoices[pref.voice],
                        pitch: pref.pitch,
                        rate: pref.rate
                    };
                    break;
                }
            }
        }
        if (!(speaker in charactersToVoices)) {
            charactersToVoices[speaker] = {
                voice: candidateVoices[randomInArray(Object.keys(candidateVoices))],
                pitch: 1,
                rate: 1
            };
        }
    }
    const { voice, pitch, rate } = charactersToVoices[speaker];
    const utterance = new SpeechSynthesisUtterance(line);
    utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onend = () => { clearTimeout(speechEndTimeout); speechEndTimeout = setTimeout(() => { advanceLine(); render(); }, 300); };
    speechSynthesis.speak(utterance);
}
const advanceAndRender = () => { if (playInitialized) {
    advanceLine();
    render();
} };
key('right', advanceAndRender);
document.onclick = advanceAndRender;
key('shift+right', () => { advanceScene(); render(); });
key('r', () => { resetPlay(); render(); });
function populateVoiceList() {
    allVoices = speechSynthesis.getVoices();
    candidateVoices = {};
    allVoices
        .filter(v => v.lang.startsWith('en') || v.lang.startsWith('de'))
        .forEach(v => candidateVoices[v.name] = v);
    if (Object.keys(candidateVoices).length > 0) {
        doPlay();
    }
}
// for the speech synthesis api, we have to first request the voice list,
// get back a probably-empty list, and then wait for the real list to be
// returned and call our function again. amazing, i know.
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => { populateVoiceList(); };
}
