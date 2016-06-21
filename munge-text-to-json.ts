import * as fs from 'fs'

const text = fs.readFileSync('intermediate/woyzeck-cleaned.txt').toString()

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


const terminators = ['.', '!', '?', '/', ')']

const munged = text
  .split('\n')
  .reduce((p, c) => {
    const line = c.trim()

    //If line is empty, continue.
    if(line.length === 0) {
      return p
    }

    const currentScene = p[p.length - 1]

    const tokens = line.split(' ').map(t => t.trim())

    //If the first token is a '#', it's a new scene.
    if(tokens[0] === '#') {
      p.push({
        name: tokens.slice(1).join(' '),
        outline: []
      })
      return p
    }

    //If it's a '##', it's a scene setting.
    if(tokens[0] === '##') {
      currentScene.setting = tokens.slice(1).join(' ')
      return p
    }

    //If it's a '##', it's a scene note.
    if(tokens[0] === '###') {
      currentScene.note = tokens.slice(1).join(' ')
      return p
    }

    //If the first token ends with a ':', we have a new line of dialog.
    if(tokens[0].endsWith(':')) {
      //Split up by stage directions and sentences.
      const tokensMinusSpeaker = tokens.slice(1)

      const linesAndDirections = parseLine(tokensMinusSpeaker)

      currentScene.outline.push({
        speaker: tokens[0].slice(0, -1),
        linesAndDirections: linesAndDirections
      })
      return p
    }
    //HACK: if the second token ends with a ':', do the same thing. Some names are two words long, but no more.
    //Brittle, but good enough.
    if(tokens.length > 1 && tokens[1].endsWith(':')) {
      //Split up by stage directions and sentences.
      const tokensMinusSpeaker = tokens.slice(2)

      const linesAndDirections = parseLine(tokensMinusSpeaker)

      currentScene.outline.push({
        speaker: tokens.slice(0, 2).join(' ').slice(0, -1),
        linesAndDirections: linesAndDirections
      })
      return p
    }

    //If the line starts with a '(', it's a stage direction.
    if(line.startsWith('(')) {
      currentScene.outline.push(line)
      return p
    }

    //Otherwise, append the text to the existing speaker's lines or the existing stage direction.
    if(typeof currentScene.outline[currentScene.outline.length - 1] !== 'string') {
      const d = currentScene.outline[currentScene.outline.length - 1] as Dialog
      d.linesAndDirections = d.linesAndDirections.concat(parseLine(tokens))
      return p
    }
    //The last element in the outline was a stage direction! Fix manually.
    throw new Error('Uhh... ' + currentScene.outline[currentScene.outline.length - 1] + '\n->\n' + line)
  }, [] as Scene[])

fs.writeFileSync('public/munged_dialog.js', 'window.woyzeck = ' + JSON.stringify(munged, undefined, 2))

function parseLine(tokens : string[]) : string[] {
    // console.log('[[Parsing Line]] [' + tokens.join('|') + ']')
    let linesAndDirections : string[] = []

    let lineOrDirectionTokens : string[] = []
    while(tokens.length > 0) {
      const t = tokens.shift()
      if(t.length === 0) {
        continue
      }

      if(t.startsWith('(')) {
        //This is an inline direction. Put it on a new line!
        const existingLine = lineOrDirectionTokens.join(' ').trim()
        if(existingLine.length > 0) {
          linesAndDirections.push(lineOrDirectionTokens.join(' ').trim())
        }
        lineOrDirectionTokens = []
      }

      lineOrDirectionTokens.push(t)
      if(terminators.some(term => t.endsWith(term))) {
        //This is the end of a line/direction; push it to the list of lines/directions and start a new one
        linesAndDirections.push(lineOrDirectionTokens.join(' ').trim())
        lineOrDirectionTokens = []
      }
    }
    //If we have any tokens left, push them too.
    if(lineOrDirectionTokens.length > 0) {
      linesAndDirections.push(lineOrDirectionTokens.join(' ').trim())
    }

    return linesAndDirections
}
