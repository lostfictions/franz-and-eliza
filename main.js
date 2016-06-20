/*eslint strict:0*/
'use strict'

const cheerio = require('cheerio')
const fs = require('fs')
const nn = require('normalize-newline')

const text = fs.readFileSync('woyzeck-mod.html').toString()

const $ = cheerio.load(text)

const t = nn($('.dialog').text())
  // .split('\n')
  // .map(line => {
    
  //   if(line.trim().length === 0) {
  //     return '\n'
  //   }
  //   return line.trim()
  // })
  // .join(' ')



fs.writeFileSync('text.txt', t)

console.log(t.length)
