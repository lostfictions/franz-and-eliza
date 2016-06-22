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
    'Woyzeck': undefined,
    'Marie': undefined,
    'Doctor': undefined,
    'Captain': undefined,
    'Andres': undefined,
    'Margaret': undefined,
    'Drum Major': undefined
};
var firefoxCandidateVoices = [
    'english',
    'english-us',
    'english_rp',
    'english-north',
    'english_wmids',
    'en-scottish',
    'en-westindies',
    'german',
    'default'
];
var firefoxOtherVoices = [
    'Farsi',
    'Farsi-Pinglish',
    'Mandarin',
    'afrikaans',
    'albanian',
    'aragonese',
    'armenian',
    'armenian-west',
    'bosnian',
    'brazil',
    'bulgarian',
    'cantonese',
    'catalan',
    'croatian',
    'czech',
    'danish',
    'dutch',
    'esperanto',
    'estonian',
    'finnish',
    'french',
    'french-Belgium',
    'georgian',
    'greek',
    'greek-ancient',
    'hindi',
    'hungarian',
    'icelandic',
    'indonesian',
    'irish-gaeilge',
    'italian',
    'kannada',
    'kurdish',
    'latin',
    'latvian',
    'lithuanian',
    'lojban',
    'macedonian',
    'malay',
    'malayalam',
    'nepali',
    'norwegian',
    'polish',
    'portugal',
    'punjabi',
    'romanian',
    'russian',
    'serbian',
    'slovak',
    'spanish',
    'spanish-latin-am',
    'swahili-test',
    'swedish',
    'tamil',
    'turkish',
    'vietnam',
    'vietnam_hue',
    'vietnam_sgn',
    'welsh'
];
var speakerContainer = document.querySelector('#speaker');
var lineContainer = document.querySelector('#line');
var sceneIndex = 0;
var outlineIndex = 0;
var lineIndex = 0;
function doPlay() {
    var outline = woyzeck[sceneIndex].outline;
    var currentEl = outline[outlineIndex];
    if (typeof currentEl === 'string') {
        lineContainer.textContent = currentEl;
        return;
    }
    var _a = currentEl, speaker = _a.speaker, linesAndDirections = _a.linesAndDirections;
    speakerContainer.textContent = speaker;
    lineContainer.textContent = linesAndDirections[lineIndex];
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
// key('right', () => { i += 1; if(i === woyzeck.length) { i = 0 } doPlay() })
// key('left', () => { i -= 1; if(i < 0) { i = woyzeck.length - 1 } doPlay() })
function populateVoiceList() {
    allVoices = speechSynthesis.getVoices();
    console.log(allVoices.map(function (v) { return v.name; }).sort().join(', '));
    candidateVoices = allVoices.filter(function (v) { return v.name.startsWith('english'); });
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
