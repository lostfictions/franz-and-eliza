/*eslint strict:0*/
'use strict'

const speaker = document.querySelector('#speaker')
const line = document.querySelector('#line')

let i = 0

function doLine() {
  const dialog = window.woyzeck[i]

  speaker.textContent = line.speaker
  line.textContent = line.lines
}