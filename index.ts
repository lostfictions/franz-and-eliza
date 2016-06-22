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

type VoicePreferences = { [character : string] : [CharacterSpeech] }
type CharacterSpeech = { voice: CandidateVoice, pitch: number, rate: number }
type CandidateVoice =
  'english' | 'english-us' | 'english_rp' | 'english-north' | 'english_wmids' |
  'en-scottish' | 'en-westindies' | 'german' | 'default'

/*
type FirefoxVoices = 'english' | 'english-us' | 'english_rp' | 'english-north' | 'english_wmids' |
  'en-scottish' | 'en-westindies' | 'german' | 'default' | 'Farsi' | 'Farsi-Pinglish' | 'Mandarin' |
  'afrikaans' | 'albanian' | 'aragonese' | 'armenian' | 'armenian-west' | 'bosnian' |
  'brazil' | 'bulgarian' | 'cantonese' | 'catalan' | 'croatian' | 'czech' | 'danish' |
  'dutch' | 'esperanto' | 'estonian' | 'finnish' | 'french' | 'french-Belgium' |
  'georgian' | 'greek' | 'greek-ancient' | 'hindi' | 'hungarian' | 'icelandic' |
  'indonesian' | 'irish-gaeilge' | 'italian' | 'kannada' | 'kurdish' | 'latin' |
  'latvian' | 'lithuanian' | 'lojban' | 'macedonian' | 'malay' | 'malayalam' |
  'nepali' | 'norwegian' | 'polish' | 'portugal' | 'punjabi' | 'romanian' | 'russian' |
  'serbian' | 'slovak' | 'spanish' | 'spanish-latin-am' | 'swahili-test' | 'swedish' |
  'tamil' | 'turkish' | 'vietnam' | 'vietnam_hue' | 'vietnam_sgn' | 'welsh'
*/

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

const preferredVoices : VoicePreferences = {
  'Woyzeck': [{ voice: 'english-us', pitch: 1, rate: 1 }],
  'Marie': [{ voice: 'english', pitch: 1.25, rate: 1 }],
  'Doctor': [{ voice: 'english_rp', pitch: 0.9, rate: 0.95 }],
  'Captain': [{ voice: 'en-scottish', pitch: 1, rate: 1 }],
  'Andres': [{ voice: 'english-north', pitch: 1, rate: 1 }],
  'Margaret': [{ voice: 'en-westindies', pitch: 1, rate: 1 }],
  'Drum Major': [{ voice: 'english_wmids', pitch: 1, rate: 1 }]
}

const sceneTitleContainer = document.querySelector('#scene-title') as HTMLElement
const speakerContainer = document.querySelector('#speaker') as HTMLElement
const lineContainer = document.querySelector('#line') as HTMLElement
sceneTitleContainer.style.display = 'none'
speakerContainer.style.display = 'none'
lineContainer.style.display = 'none'

let sceneIndex = 0
let sceneInitialized = false
let outlineIndex = 0
let lineIndex = 0
function doPlay() : void {
  renderCurrent()

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

function advanceLine() : void {
  if(!sceneInitialized) {
    sceneInitialized = true
  }
  else if(typeof woyzeck[sceneIndex].outline[outlineIndex] === 'string') {
    advanceOutline()
  }
  else {
    lineIndex++
    const d = woyzeck[sceneIndex].outline[outlineIndex] as Dialog
    if(lineIndex >= d.linesAndDirections.length) {
      advanceOutline()
    }
  }
}

function advanceOutline() : void {
  outlineIndex++
  lineIndex = 0
  if(outlineIndex >= woyzeck[sceneIndex].outline.length) {
    advanceScene()
  }
}

function advanceScene() : void {
  sceneIndex++
  if(sceneIndex >= woyzeck.length) {
    sceneIndex = 0
  }
  sceneInitialized = false
  outlineIndex = 0
  lineIndex = 0
}

function resetPlay() : void {
  sceneInitialized = false
  sceneIndex = 0
  outlineIndex = 0
  lineIndex = 0
}

function renderCurrent() : void {
  if(!sceneInitialized) {
    speakerContainer.style.display = 'none'
    lineContainer.style.display = 'none'

    sceneTitleContainer.style.display = 'inherit'
    const [sceneTitleName, sceneTitleNumeral] = woyzeck[sceneIndex].name.split(' ')
    sceneTitleContainer.querySelector('.scene-title-name-word').textContent = sceneTitleName
    sceneTitleContainer.querySelector('.scene-title-name-numeral').textContent = sceneTitleNumeral
    return
  }

  sceneTitleContainer.style.display = 'none'

  const { outline } = woyzeck[sceneIndex]
  const currentEl = outline[outlineIndex]

  if(typeof currentEl === 'string') {
    // If we have a stage direction, hide the speaker  
    speakerContainer.style.display = 'none'
    lineContainer.style.display = 'inherit'
    lineContainer.textContent = currentEl
    return
  }

  const { speaker, linesAndDirections } = currentEl as Dialog

  speakerContainer.style.display = 'inherit'
  lineContainer.style.display = 'inherit'
  speakerContainer.textContent = speaker
  lineContainer.textContent = linesAndDirections[lineIndex]
}

key('right', () => { advanceLine(); renderCurrent(); })

function populateVoiceList() : void {
  allVoices = speechSynthesis.getVoices()
  // candidateVoices = allVoices.filter(v => v.name.startsWith('english'))
  candidateVoices = allVoices.filter(v => v.lang.startsWith('en') || v.lang.startsWith('de'))
  // console.log(allVoices.map(v => v.name).sort().join(', '))
  console.log(candidateVoices.map(v => v.name).sort().join(', '))
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
