/*eslint strict:0*/
'use strict'

const fs = require('fs')

const text = fs.readFileSync('woyzeck.txt').toString()

const munged = text
  .split('\n')
  .reduce((p, c) => {
    const line = c.trim()
    if(line.length === 0) {
      return p
    }

    const tokens = line.split(' ')
    if(tokens[0].endsWith(':')) {
      //We have a new line of dialog.
      p.push({
        speaker: tokens[0].slice(0,-1),
        lines: tokens.slice(1).join(' ')
      })
      return p
    }
    //Append existing line.
    p[p.length - 1].lines = p[p.length - 1].lines + ' ' + line
    return p
  }, [])

fs.writeFileSync('output/munged.json', JSON.stringify(munged, undefined, 2))
