var speaker = document.querySelector('#speaker');
var line = document.querySelector('#line');
var i = 0;
function doLine() {
    var dialog = woyzeck[i];
    speaker.textContent = dialog.speaker;
    line.textContent = dialog.lines;
}
doLine();
key('right', function () { i += 1; if (i === woyzeck.length) {
    i = 0;
} doLine(); });
key('left', function () { i -= 1; if (i < 0) {
    i = woyzeck.length - 1;
} doLine(); });
var voices;
function populateVoiceList() {
    voices = speechSynthesis.getVoices();
    console.log(voices);
    for (var _i = 0, voices_1 = voices; _i < voices_1.length; _i++) {
        var v = voices_1[_i];
        console.log(v.name);
    }
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = function () { console.log('changed!'); populateVoiceList(); };
}
// inputForm.onsubmit = function(event) {
//   event.preventDefault();
//   var utterThis = new SpeechSynthesisUtterance(inputTxt.value);
//   var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
//   for(i = 0; i < voices.length ; i++) {
//     if(voices[i].name === selectedOption) {
//       utterThis.voice = voices[i];
//     }
//   }
//   utterThis.pitch = pitch.value;
//   utterThis.rate = rate.value;
//   synth.speak(utterThis);
//   inputTxt.blur();
// } 
