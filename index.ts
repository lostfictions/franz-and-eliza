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

interface Eliza {
  memsize: number
  transform(input : string) : string
  getInitial() : string
  getFinal() : string
  reset() : void
}
declare var ElizaBot : { new (deterministic? : boolean): Eliza }


function randomInArray<T>(arr : T[]) : T { return arr[Math.floor(Math.random() * arr.length)] }

let allVoices : SpeechSynthesisVoice[]
let candidateVoices : { [voiceName : string] : SpeechSynthesisVoice }

let speechEndTimeout : NodeJS.Timer

const charactersToVoices : { [character : string] : { voice: SpeechSynthesisVoice, pitch: number, rate: number } } = {}

const characters = new Set<string>()
woyzeck.forEach(scene => {
  const ds = scene.outline.filter(el => typeof el !== 'string') as Dialog[]
  ds.forEach(el => characters.add(el.speaker))
})

const preferredVoices : VoicePreferences = {
  'Woyzeck': [{ voice: 'english-us', pitch: 1, rate: 0.9 }],
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

const eliza = new ElizaBot()

let sceneIndex = 0
let sceneInitialized = false
let outlineIndex = 0
let lineIndex = 0
function doPlay() : void {
  renderCurrent()
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
  clearTimeout(speechEndTimeout)
  speechSynthesis.cancel()
  setTimeout(() => clearTimeout(speechEndTimeout), 50)

  if(!sceneInitialized) {
    speakerContainer.style.display = 'none'
    lineContainer.style.display = 'none'

    sceneTitleContainer.style.display = 'initial'
    const [sceneTitleName, sceneTitleNumeral] = woyzeck[sceneIndex].name.split(' ')
    sceneTitleContainer.querySelector('.scene-title-name-word').textContent = sceneTitleName
    sceneTitleContainer.querySelector('.scene-title-name-numeral').textContent = sceneTitleNumeral
    sceneTitleContainer.querySelector('#scene-title-setting').textContent = woyzeck[sceneIndex].setting || ''
    sceneTitleContainer.querySelector('#scene-title-note').textContent = woyzeck[sceneIndex].note || ''
    return
  }

  sceneTitleContainer.style.display = 'none'

  const { outline } = woyzeck[sceneIndex]
  const currentEl = outline[outlineIndex]

  if(typeof currentEl === 'string') {
    // If we have a stage direction, hide the speaker
    speakerContainer.style.display = 'none'
    lineContainer.style.display = 'initial'
    lineContainer.textContent = currentEl
    return
  }

  const { speaker, linesAndDirections } = currentEl as Dialog
  const line = linesAndDirections[lineIndex]

  speakerContainer.style.display = 'initial'
  lineContainer.style.display = 'initial'
  speakerContainer.textContent = speaker
  lineContainer.textContent = line

  if(!line.startsWith('(')) {
    speakLine(speaker, line)
    if(speaker === 'Woyzeck') {
      setTimeout(() => console.log(eliza.transform(line)))
    }
  }
}

function speakLine(speaker : string, line : string) : void {
  if(!(speaker in charactersToVoices)) {
    if(speaker in preferredVoices) {
      for(const pref of preferredVoices[speaker]) {
        if(pref.voice in candidateVoices) {
          charactersToVoices[speaker] = {
            voice: candidateVoices[pref.voice],
            pitch: pref.pitch,
            rate: pref.rate
          }
          break
        }
      }
    }
    if(!(speaker in charactersToVoices)) {
      charactersToVoices[speaker] = {
        voice: candidateVoices[randomInArray(Object.keys(candidateVoices))],
        pitch: 1,
        rate: 1
      }
    }
  }

  const { voice, pitch, rate } = charactersToVoices[speaker]

  const utterance = new SpeechSynthesisUtterance(line)
  utterance.voice = voice
  utterance.pitch = pitch
  utterance.rate = rate
  utterance.onend = () => { clearTimeout(speechEndTimeout); speechEndTimeout = setTimeout(() => { advanceLine(); renderCurrent() }, 300) }

  speechSynthesis.speak(utterance)
}

key('right', () => { advanceLine(); renderCurrent() })
key('shift+right', () => { advanceScene(); renderCurrent() })
key('r', () => { resetPlay(); renderCurrent() })

function populateVoiceList() : void {
  allVoices = speechSynthesis.getVoices()
  candidateVoices = {}

  allVoices
    .filter(v => v.lang.startsWith('en') || v.lang.startsWith('de'))
    .forEach(v => candidateVoices[v.name] = v)

  if(Object.keys(candidateVoices).length > 0) {
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
