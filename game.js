// ============================================================
// CONFIGURAZIONE — modifica questi valori per l'evento
// ============================================================
const REWARDS = [
  { minScore: 10, prize: 'Gadget A' },
  { minScore: 25, prize: 'Gadget B' },
  { minScore: 50, prize: 'Gadget C' },
]

const GRID_SIZE = 20
const INITIAL_SPEED = 200  // ms per tick
const SPEED_STEP = 10      // ms tolti ogni 5 punti
const MIN_SPEED = 80       // ms minimo

// ============================================================
// LOGICA PURA — nessuna dipendenza browser
// ============================================================

function generateFood(snake) {
  const occupied = new Set(snake.map(seg => `${seg.x},${seg.y}`))
  const free = []
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y })
    }
  }
  if (free.length === 0) return null
  return free[Math.floor(Math.random() * free.length)]
}

function createInitialState() {
  const mid = Math.floor(GRID_SIZE / 2)
  const snake = [
    { x: mid + 2, y: mid },
    { x: mid + 1, y: mid },
    { x: mid, y: mid },
  ]
  return {
    snake,
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: generateFood(snake),
    score: 0,
    status: 'playing',
  }
}

function getSpeed(score) {
  const reduction = Math.floor(score / 5) * SPEED_STEP
  return Math.max(MIN_SPEED, INITIAL_SPEED - reduction)
}

function checkWallCollision(pos) {
  return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE
}

function checkSelfCollision(head, body) {
  return body.some(seg => seg.x === head.x && seg.y === head.y)
}

function moveSnake(state) {
  const dir = state.nextDirection
  const head = state.snake[0]
  const newHead = { x: head.x + dir.x, y: head.y + dir.y }

  if (checkWallCollision(newHead)) {
    return { ...state, status: 'dead' }
  }

  const ateFood = newHead.x === state.food.x && newHead.y === state.food.y
  const newBody = ateFood ? state.snake : state.snake.slice(0, -1)

  if (checkSelfCollision(newHead, newBody)) {
    return { ...state, status: 'dead' }
  }

  const newSnake = [newHead, ...newBody]
  const newScore = ateFood ? state.score + 1 : state.score
  const newFood = ateFood ? generateFood(newSnake) : state.food

  return {
    ...state,
    snake: newSnake,
    direction: dir,
    nextDirection: dir,
    food: newFood,
    score: newScore,
    status: 'playing',
  }
}

function getReward(score, rewards) {
  const sorted = [...rewards].sort((a, b) => b.minScore - a.minScore)
  const match = sorted.find(r => score >= r.minScore)
  return match ? match.prize : null
}

// ============================================================
// RENDERING — dipende da browser/canvas
// ============================================================

function getCellSize() {
  const reserved = 320  // score bar + D-pad + padding (approssimazione)
  const padding = 16
  const maxByWidth = window.innerWidth - padding
  const maxByHeight = window.innerHeight - reserved
  const available = Math.min(maxByWidth, maxByHeight)
  return Math.max(8, Math.floor(available / GRID_SIZE))
}

function drawGame(ctx, state, logoImage, cellSize) {
  const size = GRID_SIZE * cellSize

  ctx.clearRect(0, 0, size, size)

  // Sfondo semi-trasparente per distinguere il campo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
  ctx.fillRect(0, 0, size, size)

  // Food: logo aziendale (o cerchio bianco se logo non disponibile)
  if (state.food !== null) {
    if (logoImage) {
      ctx.drawImage(
        logoImage,
        state.food.x * cellSize + 1,
        state.food.y * cellSize + 1,
        cellSize - 2,
        cellSize - 2
      )
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(
        state.food.x * cellSize + cellSize / 2,
        state.food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0, Math.PI * 2
      )
      ctx.fill()
    }
  }

  // Serpente: rettangoli bianchi arrotondati (testa più opaca)
  state.snake.forEach((seg, i) => {
    ctx.fillStyle = i === 0 ? '#ffffff' : 'rgba(255,255,255,0.7)'
    const r = Math.max(2, Math.floor(cellSize / 6))
    const x = seg.x * cellSize + 1
    const y = seg.y * cellSize + 1
    const w = cellSize - 2
    const h = cellSize - 2
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()
  })
}

// ============================================================
// GAME LOOP
// ============================================================

let currentState = null
let loopTimer = null
let logoImage = null
let canvas = null
let ctx = null

function startGame() {
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')

  const cellSize = getCellSize()
  const canvasSize = GRID_SIZE * cellSize
  canvas.width = canvasSize
  canvas.height = canvasSize

  currentState = createInitialState()
  scheduleNextTick()
}

function scheduleNextTick() {
  const speed = getSpeed(currentState.score)
  loopTimer = setTimeout(tick, speed)
}

function tick() {
  currentState = moveSnake(currentState)
  document.getElementById('score-value').textContent = currentState.score

  const cellSize = getCellSize()
  drawGame(ctx, currentState, logoImage, cellSize)

  if (currentState.status === 'dead') {
    showGameOver()
    return
  }

  scheduleNextTick()
}

function stopGame() {
  clearTimeout(loopTimer)
  loopTimer = null
}

// ============================================================
// INPUT
// ============================================================

const DIRECTIONS = {
  up:    { x: 0, y: -1 },
  down:  { x: 0, y:  1 },
  left:  { x: -1, y: 0 },
  right: { x:  1, y: 0 },
}

function applyDirection(dir) {
  if (!currentState || currentState.status !== 'playing') return
  const isReverse =
    currentState.direction.x + dir.x === 0 &&
    currentState.direction.y + dir.y === 0
  if (!isReverse) {
    currentState = { ...currentState, nextDirection: dir }
  }
}

function setupInput() {
  document.getElementById('btn-up').addEventListener('click', () => applyDirection(DIRECTIONS.up))
  document.getElementById('btn-down').addEventListener('click', () => applyDirection(DIRECTIONS.down))
  document.getElementById('btn-left').addEventListener('click', () => applyDirection(DIRECTIONS.left))
  document.getElementById('btn-right').addEventListener('click', () => applyDirection(DIRECTIONS.right))

  document.addEventListener('keydown', e => {
    const map = {
      ArrowUp: DIRECTIONS.up,
      ArrowDown: DIRECTIONS.down,
      ArrowLeft: DIRECTIONS.left,
      ArrowRight: DIRECTIONS.right,
    }
    if (map[e.key]) {
      e.preventDefault()
      applyDirection(map[e.key])
    }
  })
}

// ============================================================
// SCHERMATE
// ============================================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(id).classList.add('active')
}

function showGameOver() {
  const reward = getReward(currentState.score, REWARDS)
  document.getElementById('gameover-score').textContent = currentState.score
  document.getElementById('gameover-reward').textContent =
    reward ? `Hai vinto: ${reward}!` : ''
  showScreen('screen-gameover')
}

// ============================================================
// INIT
// ============================================================

function loadLogo() {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = 'D.png'
  })
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', async () => {
    logoImage = await loadLogo()
    setupInput()

    document.getElementById('btn-start').addEventListener('click', () => {
      showScreen('screen-game')
      startGame()
    })

    document.getElementById('btn-replay').addEventListener('click', () => {
      stopGame()
      showScreen('screen-game')
      startGame()
    })
  })
}

// ============================================================
// EXPORT PER TEST (non eseguito nel browser)
// ============================================================
if (typeof module !== 'undefined') {
  module.exports = {
    createInitialState,
    getSpeed,
    generateFood,
    checkWallCollision,
    checkSelfCollision,
    moveSnake,
    getReward,
    GRID_SIZE,
    REWARDS,
  }
}
