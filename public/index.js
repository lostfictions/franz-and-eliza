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
var allVoices;
var candidateVoices;
var speechEndTimeout;
var charactersToVoices = {};
var characters = new Set();
woyzeck.forEach(function (scene) {
    var ds = scene.outline.filter(function (el) { return typeof el !== 'string'; });
    ds.forEach(function (el) { return characters.add(el.speaker); });
});
var preferredVoices = {
    'Woyzeck': [{ voice: 'english-us', pitch: 1, rate: 0.9 }],
    'Eliza': [{ voice: 'english-us', pitch: 1.3, rate: 0.9 }],
    'Marie': [{ voice: 'english', pitch: 1.25, rate: 1 }],
    'Doctor': [{ voice: 'english_rp', pitch: 0.9, rate: 0.95 }],
    'Captain': [{ voice: 'en-scottish', pitch: 1, rate: 1 }],
    'Andres': [{ voice: 'english-north', pitch: 1, rate: 1 }],
    'Margaret': [{ voice: 'en-westindies', pitch: 1, rate: 1 }],
    'Drum Major': [{ voice: 'english_wmids', pitch: 1, rate: 1 }],
    'Others': [{ voice: 'default', pitch: 1, rate: 1 }]
};
var titleView = document.querySelector('#title-view');
var sceneTitleView = document.querySelector('#scene-title-view');
var speakerContainer = document.querySelector('#speaker');
var lineContainer = document.querySelector('#line');
sceneTitleView.style.display = 'none';
speakerContainer.style.display = 'none';
lineContainer.style.display = 'none';
var optionsContainer = document.querySelector('#title-view-collapse');
var optionsContainerContents = optionsContainer.querySelector('ul');
var titleSettingsExpanded = false;
var detailsToggleElement = document.querySelector('#title-view-desc-details');
detailsToggleElement.onclick = function (e) {
    e.preventDefault();
    titleSettingsExpanded = !titleSettingsExpanded;
    render();
};
var isBot = {};
Object.keys(preferredVoices)
    .forEach(function (character) {
    var li = document.createElement('li');
    optionsContainerContents.appendChild(li);
    li.textContent = character + ': ';
    isBot[character] = true;
    var a = document.createElement('a');
    a.textContent = 'Robot';
    a.setAttribute('href', '#');
    a.onclick = function (e) {
        e.preventDefault();
        isBot[character] = !isBot[character];
        a.textContent = isBot[character] ? 'Robot' : 'Human';
        var humanCount = Object.keys(isBot).reduce(function (p, c) { return p + (!isBot[c] ? 1 : 0); }, 0);
        detailsToggleElement.textContent = humanCount > 0 ? humanCount + " human" + (humanCount > 1 ? 's' : '') + ", with robots" : 'robots';
    };
    li.appendChild(a);
});
var playInitialized = false;
var isInitializing = false;
var beginButton = document.querySelector('#title-view-begin');
beginButton.onclick = function (e) {
    if (!isInitializing) {
        isInitializing = true;
        e.preventDefault();
        titleView.style.opacity = '0';
        setTimeout(function () { playInitialized = true; isInitializing = false; titleView.style.opacity = '1'; render(); }, 300);
    }
};
var eliza = new ElizaBot();
var sceneIndex = 0;
var sceneInitialized = false;
var outlineIndex = 0;
var lineIndex = 0;
var shouldDoEliza = false;
var didEliza = false;
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
        var d = woyzeck[sceneIndex].outline[outlineIndex];
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
    setTimeout(function () { return clearTimeout(speechEndTimeout); }, 50);
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
        var _a = woyzeck[sceneIndex].name.split(' '), sceneTitleName = _a[0], sceneTitleNumeral = _a[1];
        sceneTitleView.querySelector('.scene-title-name-word').textContent = sceneTitleName;
        sceneTitleView.querySelector('.scene-title-name-numeral').textContent = sceneTitleNumeral;
        sceneTitleView.querySelector('#scene-title-setting').textContent = woyzeck[sceneIndex].setting || '';
        sceneTitleView.querySelector('#scene-title-note').textContent = woyzeck[sceneIndex].note || '';
        return;
    }
    titleView.style.display = 'none';
    sceneTitleView.style.display = 'none';
    var outline = woyzeck[sceneIndex].outline;
    var currentEl = outline[outlineIndex];
    if (typeof currentEl === 'string') {
        // If we have a stage direction, hide the speaker
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'initial';
        lineContainer.textContent = currentEl;
        setTimeout(function () { return advanceLine(); }, 3000);
        return;
    }
    var _b = currentEl, speaker = _b.speaker, linesAndDirections = _b.linesAndDirections;
    var line = linesAndDirections[lineIndex];
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
        setTimeout(function () { advanceLine(); render(); }, 1000);
    }
}
function speakLine(speaker, line) {
    if (!(speaker in charactersToVoices)) {
        if (speaker in preferredVoices) {
            for (var _i = 0, _a = preferredVoices[speaker]; _i < _a.length; _i++) {
                var pref = _a[_i];
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
    var _b = charactersToVoices[speaker], voice = _b.voice, pitch = _b.pitch, rate = _b.rate;
    var utterance = new SpeechSynthesisUtterance(line);
    utterance.voice = voice;
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.onend = function () { clearTimeout(speechEndTimeout); speechEndTimeout = setTimeout(function () { advanceLine(); render(); }, 300); };
    speechSynthesis.speak(utterance);
}
var advanceAndRender = function () { if (playInitialized) {
    advanceLine();
    render();
} };
key('right', advanceAndRender);
document.onclick = advanceAndRender;
key('shift+right', function () { advanceScene(); render(); });
key('r', function () { resetPlay(); render(); });
function populateVoiceList() {
    allVoices = speechSynthesis.getVoices();
    candidateVoices = {};
    allVoices
        .filter(function (v) { return v.lang.startsWith('en') || v.lang.startsWith('de'); })
        .forEach(function (v) { return candidateVoices[v.name] = v; });
    if (Object.keys(candidateVoices).length > 0) {
        doPlay();
    }
}
// for the speech synthesis api, we have to first request the voice list,
// get back a probably-empty list, and then wait for the real list to be
// returned and call our function again. amazing, i know.
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function () { populateVoiceList(); };
}
