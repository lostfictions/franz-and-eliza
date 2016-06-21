function randomInArray(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
var allVoices;
var candidateVoices;
var usedVoices;
var charactersToVoices = {};
var speakerContainer = document.querySelector('#speaker');
var lineContainer = document.querySelector('#line');
var i = 0;
function doLine() {
    var _a = woyzeck[i], speaker = _a.speaker, lines = _a.lines;
    speakerContainer.textContent = speaker;
    lineContainer.textContent = lines;
    var voice;
    if (speaker in charactersToVoices) {
        voice = charactersToVoices[speaker];
    }
    else {
        if (candidateVoices.length > 0) {
            voice = candidateVoices.pop();
            usedVoices.push(voice);
        }
        else {
            voice = randomInArray(usedVoices);
        }
        charactersToVoices[speaker] = voice;
    }
    var utterance = new SpeechSynthesisUtterance(lines);
    utterance.voice = voice;
    // utterance.pitch = pitch.value
    // utterance.rate = rate.value
    utterance.onend = function () { return setTimeout(function () {
        i += 1;
        doLine();
    }, 300); };
    speechSynthesis.speak(utterance);
}
key('right', function () { i += 1; if (i === woyzeck.length) {
    i = 0;
} doLine(); });
key('left', function () { i -= 1; if (i < 0) {
    i = woyzeck.length - 1;
} doLine(); });
function populateVoiceList() {
    allVoices = speechSynthesis.getVoices();
    candidateVoices = allVoices.filter(function (v) { return v.name.startsWith('english'); });
    usedVoices = [];
    if (candidateVoices.length > 0) {
        doLine();
    }
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function () { console.log('changed!'); populateVoiceList(); };
}
