import * as monaco from 'monaco-editor'
import * as _ from 'lodash'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import typescriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'

self.MonacoEnvironment = {
  getWorker: async function (workerId, label) {
    switch (label) {
      case 'json':
        return jsonWorker()
      case 'css':
      case 'scss':
      case 'less':
        return cssWorker()
      case 'html':
      case 'handlebars':
      case 'razor':
        return htmlWorker()
      case 'typescript':
      case 'javascript':
        return typescriptWorker()
      default:
        return editorWorker()
    }
  },
}

const RIGHT = 0
const BOTTOM = 0.5 * Math.PI
const LEFT = Math.PI
const TOP = 1.5 * Math.PI

const canvas = document.getElementById('canvas')
const context = canvas.getContext('2d')

const $error = document.querySelector('.error')

let unit = null

const s = ' '
const o = 'o'
const x = 'x'

const levels = [
  {
    map: [[s, o, o]],
    unit: { row: 0, column: 0, angle: 0 },
  },
  {
    map: [
      [s, o],
      [o, o],
    ],
    unit: { row: 0, column: 0, angle: 0 },
  },
  {
    map: [
      [s, o, o],
      [o, x, o],
      [o, o, o],
    ],
    unit: { row: 0, column: 0, angle: 0 },
  },
  /*
  {
    map: [
      [s, s, s, s, s],
      [s, s, s, s, o],
      [s, s, s, s, s],
      [s, o, s, s, s],
      [s, s, s, o, s],
    ],
    unit: { row: 0, column: 0, angle: 0 },
  },
  */
]

let currentLevel = null
let currentLevelIndex = null

function changeLevel(levelIndex) {
  currentLevelIndex = levelIndex
  currentLevel = copyLevel(levels[currentLevelIndex])
  unit = { ...currentLevel.unit }
}

changeLevel(0)

function copyLevel(level) {
  return {
    map: copyMap(level.map),
    unit: { ...level.unit },
  }
}

function copyMap(map) {
  const mapCopy = Array.from(map)
  for (let rowIndex = 0; rowIndex < mapCopy.length; rowIndex++) {
    mapCopy[rowIndex] = Array.from(mapCopy[rowIndex])
  }
  return mapCopy
}

function renderLevel() {
  context.clearRect(0, 0, canvas.width, canvas.height)
  const map = currentLevel.map
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    const row = map[rowIndex]
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const cell = row[columnIndex]
      if (cell === o) {
        renderO({ row: rowIndex, column: columnIndex })
      } else if (cell === x) {
        renderX({ row: rowIndex, column: columnIndex })
      }
    }
  }
  renderUnit(unit)
}

const size = 10

function renderUnit({ row, column, angle }) {
  context.fillStyle = 'green'
  context.fillRect(column * size, row * size, size, size)
  context.fillStyle = 'white'
  let width
  let height
  switch (angle) {
    case RIGHT:
    case LEFT:
      width = size / 2
      height = 2
      break
    case TOP:
    case BOTTOM:
      width = 2
      height = size / 2
      break
  }
  let x
  let y
  switch (angle) {
    case RIGHT:
      x = column * size + 0.5 * size
      y = row * size + 0.5 * size - 1
      break
    case LEFT:
      x = column * size
      y = row * size + 0.5 * size - 1
      break
    case TOP:
      x = column * size + 0.5 * size - 1
      y = row * size
      break
    case BOTTOM:
      x = column * size + 0.5 * size - 1
      y = row * size + 0.5 * size
      break
  }
  context.fillRect(x, y, width, height)
}

function renderO({ row, column }) {
  context.fillStyle = 'brown'
  context.fillRect(column * size, row * size, size, size)
}

function renderX({ row, column }) {
  context.fillStyle = 'black'
  context.fillRect(column * size, row * size, size, size)
}

renderLevel()

const $run = document.getElementById('run')
const $reset = document.getElementById('reset')

monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
  noLib: true,
  allowNonTsExtensions: true,
})

const code = `/**
 * A node (a brown dot).
 */
interface Node {
  x: number,
  y: number
}
/**
 * Moves the unit forward.
 */
function moveForward(): void
/**
 * Turns the unit 90° to the right.
 */
function turnRight(): void
/**
 * Turns the unit 90° to the left.
 */
function turnLeft(): void
/**
 * Returns an array of all nodes (the brown dots).
 */
// function retrieveAllNodes(): Node[]
`
const url = 'ts:programming.d.ts'

monaco.languages.typescript.javascriptDefaults.addExtraLib(code, url)
monaco.editor.createModel(code, 'typescript', monaco.Uri.parse(url))

const editor = monaco.editor.create(document.getElementById('code'), {
  value: loadCode(),
  language: 'javascript',
  automaticLayout: true,
})
editor.focus()

let queue = null

function moveForward() {
  queue.push({ action: 'move forward' })
}

function turnLeft() {
  queue.push({ action: 'turn left' })
}

function turnRight() {
  queue.push({ action: 'turn right' })
}

/*
function retrieveAllNodes() {
  const nodes = []
  const map = currentLevel.map
  for (let y = 0; y < map.length; y++) {
    const row = map[y]
    for (let x = 0; x < row.length; x++) {
      const element = row[x]
      if (element === o) {
        nodes.push({ x, y })
      }
    }
  }
  return nodes
}
*/

$run.addEventListener('click', async function () {
  $error.style.display = 'none'
  $error.textContent = ''
  queue = []
  const code = editor.getValue()
  try {
    eval(code)
  } catch (error) {
    $error.textContent = 'Error: ' + error.message
    $error.style.display = 'block'
  }
  await run()
})

$reset.addEventListener('click', function () {
  currentLevel = copyLevel(levels[currentLevelIndex])
  unit = { ...currentLevel.unit }
  renderLevel()
})

editor.getModel()?.onDidChangeContent(
  _.debounce(function () {
    saveCode()
  })
)

function saveCode() {
  const code = editor.getValue()
  localStorage.setItem('code', code)
}

function loadCode() {
  return localStorage.getItem('code') || ''
}

async function run() {
  const map = currentLevel.map
  while (queue.length >= 1) {
    const action = queue.shift()
    switch (action.action) {
      case 'move forward':
        if (unit.angle === RIGHT) {
          unit.column++
        } else if (unit.angle === TOP) {
          unit.row--
        } else if (unit.angle === LEFT) {
          unit.column--
        } else if (unit.angle === BOTTOM) {
          unit.row++
        }
        if (map[unit.row][unit.column] === o) {
          map[unit.row][unit.column] = s
        }
        break
      case 'turn left':
        unit.angle = (unit.angle - 0.5 * Math.PI) % (2 * Math.PI)
        break
      case 'turn right':
        unit.angle = (unit.angle + 0.5 * Math.PI) % (2 * Math.PI)
        if (unit.angle < 0) {
          unit.angle += 2 * Math.PI
        }
        break
    }
    renderLevel()
    if (hasCompletedLevel()) {
      if (isThereANextLevel()) {
        changeToTheNextLevel()
      }
      return
    }
    await wait(1000)
  }
}

function hasCompletedLevel() {
  const map = currentLevel.map
  for (let rowIndex = 0; rowIndex < map.length; rowIndex++) {
    const row = map[rowIndex]
    for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
      const cell = row[columnIndex]
      if (cell === o) {
        return false
      }
    }
  }
  return true
}

function isThereANextLevel() {
  return currentLevelIndex < levels.length - 1
}

function changeToTheNextLevel() {
  changeLevel(calculateNextLevelIndex())
  renderLevel()
}

function calculateNextLevelIndex() {
  return currentLevelIndex + 1
}

async function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}
