declare var woyzeck : [{ speaker: string, lines: string }]
declare function key(key : string, cb : () => void) : void

const speaker = document.querySelector('#speaker')
const line = document.querySelector('#line')

let i = 0

function doLine() {
  const dialog = woyzeck[i]

  speaker.textContent = dialog.speaker
  line.textContent = dialog.lines
}

doLine()

key('right', () => { i += 1; if(i === woyzeck.length) { i = 0 } doLine() })
key('left', () => { i -= 1; if(i < 0) { i = woyzeck.length - 1 } doLine() })


let voices
function populateVoiceList() {
  voices = speechSynthesis.getVoices()

  console.log(voices)
  for(const v of voices) {
    console.log(v.name)
    // var option = document.createElement('option');
    // option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    // if(voices[i].default) {
    //   option.textContent += ' -- DEFAULT';
    // }

    // option.setAttribute('data-lang', voices[i].lang);
    // option.setAttribute('data-name', voices[i].name);
    // voiceSelect.appendChild(option);
  }
}

populateVoiceList()
if(speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => { console.log('changed!'); populateVoiceList() }
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