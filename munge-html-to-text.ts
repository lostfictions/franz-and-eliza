import * as fs from 'fs'
import * as cheerio from 'cheerio'

const text = fs.readFileSync('intermediate/woyzeck-pdf2html-mod.html').toString()

const $ = cheerio.load(text)

const munged = $('p')
  .filter((i, el) => $(el).attr('class') !== 'dialog')
  .map((i, el) => $(el).text())
  .get()
  .map(line => line.replace(/\t\r/g, '').replace(/\s+/g, ' ').trim()) //fix weird line breaks, clean up
  .filter(line => line.trim().length > 0) //remove empty lines
  .filter(line => Number.isNaN(Number.parseInt(line, 10))) //if line is just a number, it's a page number. remove.
  .join('\n')
  // .filter(line => line.startsWith('Scene'))

  // .split('\n')
  // .reduce((p, c) => {
  //   const line = c.trim()
  //   if(line.length === 0) {
  //     //If line is empty, continue
  //     return p
  //   }

  //   const tokens = line.split(' ')
  //   if(tokens[0].endsWith(':')) {
  //     //We have a new line of dialog.
  //     p.push({
  //       speaker: tokens[0].slice(0,-1),
  //       lines: tokens.slice(1).join(' ')
  //     })
  //     return p
  //   }
  //   //Append existing line.
  //   p[p.length - 1].lines = p[p.length - 1].lines + ' ' + line
  //   return p
  // }, [])

fs.writeFileSync('intermediate/woyzeck-cleaned-alt.txt', munged)
