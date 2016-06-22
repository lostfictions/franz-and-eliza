type Scene = {
  name: string
  setting?: string
  note?: string
  outline: OutlineElement[]
}

type OutlineElement = Dialog | StageDirection

type Dialog = {
  speaker: string
  linesAndDirections: string[]
}

type StageDirection = string

declare var woyzeck : Scene[]
declare function key(key : string, cb : () => void) : void

function randomInArray<T>(arr : T[]) : T { return arr[Math.floor(Math.random() * arr.length)] }

let allVoices : SpeechSynthesisVoice[]
let candidateVoices : SpeechSynthesisVoice[]
let usedVoices : SpeechSynthesisVoice[]

const charactersToVoices : { [character : string] : SpeechSynthesisVoice } = {}

const characters = new Set<string>()
woyzeck.forEach(scene => {
  const ds = scene.outline.filter(el => typeof el !== 'string') as Dialog[]
  ds.forEach(el => characters.add(el.speaker))
})

const preferredVoices = {
  'Woyzeck': undefined,
  'Marie': undefined,
  'Doctor': undefined,
  'Captain': undefined,
  'Andres': undefined,
  'Margaret': undefined,
  'Drum Major': undefined
}

const firefoxCandidateVoices = [
  'english',
  'english-us',
  'english_rp',
  'english-north',
  'english_wmids',
  'en-scottish',
  'en-westindies',
  'german',
  'default'
]

const firefoxOtherVoices = [
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
]


const speakerContainer = document.querySelector('#speaker')
const lineContainer = document.querySelector('#line')

let sceneIndex = 0
let outlineIndex = 0
let lineIndex = 0
function doPlay() : void {
  const { outline } = woyzeck[sceneIndex]

  const currentEl = outline[outlineIndex]
  if(typeof currentEl === 'string') {
    lineContainer.textContent = currentEl
    return
  }

  const { speaker, linesAndDirections } = currentEl as Dialog

  speakerContainer.textContent = speaker
  lineContainer.textContent = linesAndDirections[lineIndex]

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

function populateVoiceList() : void {
  allVoices = speechSynthesis.getVoices()
  console.log(allVoices.map(v => v.name).sort().join(', '))
  candidateVoices = allVoices.filter(v => v.name.startsWith('english'))
  usedVoices = []
  if(candidateVoices.length > 0) {
    doPlay()
  }
}

// for the speech synthesis api, we have to first request the voice list,
// get back a probably-empty list, and then wait for the real list to be
// returned and call our function again. amazing, i know. 
populateVoiceList()
if(speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => { populateVoiceList() }
}
