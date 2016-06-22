function randomInArray(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
var allVoices;
var candidateVoices;
var usedVoices;
var charactersToVoices = {};
var characters = new Set();
woyzeck.forEach(function (scene) {
    var ds = scene.outline.filter(function (el) { return typeof el !== 'string'; });
    ds.forEach(function (el) { return characters.add(el.speaker); });
});
var preferredVoices = {
    'Woyzeck': [{ voice: 'english-us', pitch: 1, rate: 1 }],
    'Marie': [{ voice: 'english', pitch: 1.25, rate: 1 }],
    'Doctor': [{ voice: 'english_rp', pitch: 0.9, rate: 0.95 }],
    'Captain': [{ voice: 'en-scottish', pitch: 1, rate: 1 }],
    'Andres': [{ voice: 'english-north', pitch: 1, rate: 1 }],
    'Margaret': [{ voice: 'en-westindies', pitch: 1, rate: 1 }],
    'Drum Major': [{ voice: 'english_wmids', pitch: 1, rate: 1 }]
};
var sceneTitleContainer = document.querySelector('#scene-title');
var speakerContainer = document.querySelector('#speaker');
var lineContainer = document.querySelector('#line');
sceneTitleContainer.style.display = 'none';
speakerContainer.style.display = 'none';
lineContainer.style.display = 'none';
var sceneIndex = 0;
var sceneInitialized = false;
var outlineIndex = 0;
var lineIndex = 0;
function doPlay() {
    renderCurrent();
    // let voice : SpeechSynthesisVoice
    // if(speaker in charactersToVoices) {
    //   voice = charactersToVoices[speaker]
    // }
    // else {
    //   if(candidateVoices.length > 0) {
    //     voice = candidateVoices.pop()
    //     usedVoices.push(voice)
    //   }
    //   else {
    //     voice = randomInArray(usedVoices)
    //   }
    //   charactersToVoices[speaker] = voice
    // }
    // const utterance = new SpeechSynthesisUtterance(lines)
    // utterance.voice = voice
    // // utterance.pitch = pitch.value
    // // utterance.rate = rate.value
    // utterance.onend = () => setTimeout(() => {
    //   i += 1
    //   doLine()
    // }, 300)
    // speechSynthesis.speak(utterance)
}
function advanceLine() {
    if (!sceneInitialized) {
        sceneInitialized = true;
    }
    else if (typeof woyzeck[sceneIndex].outline[outlineIndex] === 'string') {
        advanceOutline();
    }
    else {
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
    sceneInitialized = false;
    sceneIndex = 0;
    outlineIndex = 0;
    lineIndex = 0;
}
function renderCurrent() {
    if (!sceneInitialized) {
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'none';
        sceneTitleContainer.style.display = 'inherit';
        var _a = woyzeck[sceneIndex].name.split(' '), sceneTitleName = _a[0], sceneTitleNumeral = _a[1];
        sceneTitleContainer.querySelector('.scene-title-name-word').textContent = sceneTitleName;
        sceneTitleContainer.querySelector('.scene-title-name-numeral').textContent = sceneTitleNumeral;
        return;
    }
    sceneTitleContainer.style.display = 'none';
    var outline = woyzeck[sceneIndex].outline;
    var currentEl = outline[outlineIndex];
    if (typeof currentEl === 'string') {
        // If we have a stage direction, hide the speaker  
        speakerContainer.style.display = 'none';
        lineContainer.style.display = 'inherit';
        lineContainer.textContent = currentEl;
        return;
    }
    var _b = currentEl, speaker = _b.speaker, linesAndDirections = _b.linesAndDirections;
    speakerContainer.style.display = 'inherit';
    lineContainer.style.display = 'inherit';
    speakerContainer.textContent = speaker;
    lineContainer.textContent = linesAndDirections[lineIndex];
}
key('right', function () { advanceLine(); renderCurrent(); });
function populateVoiceList() {
    allVoices = speechSynthesis.getVoices();
    // candidateVoices = allVoices.filter(v => v.name.startsWith('english'))
    candidateVoices = allVoices.filter(function (v) { return v.lang.startsWith('en') || v.lang.startsWith('de'); });
    // console.log(allVoices.map(v => v.name).sort().join(', '))
    console.log(candidateVoices.map(function (v) { return v.name; }).sort().join(', '));
    usedVoices = [];
    if (candidateVoices.length > 0) {
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
