declare var woyzeck : [{ speaker: string, lines: string }]
declare function key(key : string, cb : () => void) : void

function randomInArray<T>(arr : T[]) : T { return arr[Math.floor(Math.random() * arr.length)] }

let allVoices : SpeechSynthesisVoice[]
let candidateVoices : SpeechSynthesisVoice[]
let usedVoices : SpeechSynthesisVoice[]

const charactersToVoices : { [character : string] : SpeechSynthesisVoice } = {}

const speakerContainer = document.querySelector('#speaker')
const lineContainer = document.querySelector('#line')

let i = 0
function doLine() : void {
  const { speaker, lines } = woyzeck[i]

  speakerContainer.textContent = speaker
  lineContainer.textContent = lines

  let voice : SpeechSynthesisVoice
  if(speaker in charactersToVoices) {
    voice = charactersToVoices[speaker]
  }
  else {
    if(candidateVoices.length > 0) {
      voice = candidateVoices.pop()
      usedVoices.push(voice)
    }
    else {
      voice = randomInArray(usedVoices)
    }
    charactersToVoices[speaker] = voice
  }

  const utterance = new SpeechSynthesisUtterance(lines)
  utterance.voice = voice
  // utterance.pitch = pitch.value
  // utterance.rate = rate.value
  utterance.onend = () => setTimeout(() => {
    i += 1
    doLine()
  }, 300)

  speechSynthesis.speak(utterance)
}

key('right', () => { i += 1; if(i === woyzeck.length) { i = 0 } doLine() })
key('left', () => { i -= 1; if(i < 0) { i = woyzeck.length - 1 } doLine() })

function populateVoiceList() {
  allVoices = speechSynthesis.getVoices()
  candidateVoices = allVoices.filter(v => v.name.startsWith('english'))
  usedVoices = []
  if(candidateVoices.length > 0) {
    doLine()
  }
}

populateVoiceList()
if(speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => { console.log('changed!'); populateVoiceList() }
}
