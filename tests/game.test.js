const { test } = require('node:test')
const assert = require('node:assert/strict')
const {
  createInitialState,
  getSpeed,
  checkWallCollision,
  checkSelfCollision,
  moveSnake,
  getReward,
  GRID_SIZE,
} = require('../game.js')

// --- createInitialState ---
test('createInitialState returns snake of length 3 moving right', () => {
  const s = createInitialState()
  assert.equal(s.snake.length, 3)
  assert.deepEqual(s.direction, { x: 1, y: 0 })
  assert.deepEqual(s.nextDirection, { x: 1, y: 0 })
  assert.equal(s.score, 0)
  assert.equal(s.status, 'playing')
})

test('createInitialState food is within grid bounds', () => {
  const s = createInitialState()
  assert.ok(s.food.x >= 0 && s.food.x < GRID_SIZE)
  assert.ok(s.food.y >= 0 && s.food.y < GRID_SIZE)
})

// --- getSpeed ---
test('getSpeed returns 200 at score 0', () => {
  assert.equal(getSpeed(0), 200)
})

test('getSpeed decreases by 10 every 5 points', () => {
  assert.equal(getSpeed(5), 190)
  assert.equal(getSpeed(10), 180)
})

test('getSpeed never goes below 80', () => {
  assert.equal(getSpeed(1000), 80)
})

// --- checkWallCollision ---
test('checkWallCollision detects left wall', () => {
  assert.equal(checkWallCollision({ x: -1, y: 5 }), true)
})

test('checkWallCollision detects right wall', () => {
  assert.equal(checkWallCollision({ x: 20, y: 5 }), true)
})

test('checkWallCollision detects top wall', () => {
  assert.equal(checkWallCollision({ x: 5, y: -1 }), true)
})

test('checkWallCollision detects bottom wall', () => {
  assert.equal(checkWallCollision({ x: 5, y: 20 }), true)
})

test('checkWallCollision returns false for valid position', () => {
  assert.equal(checkWallCollision({ x: 0, y: 0 }), false)
  assert.equal(checkWallCollision({ x: 19, y: 19 }), false)
})

// --- checkSelfCollision ---
test('checkSelfCollision detects collision', () => {
  const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }]
  assert.equal(checkSelfCollision({ x: 5, y: 5 }, body), true)
})

test('checkSelfCollision returns false when no collision', () => {
  const body = [{ x: 5, y: 5 }, { x: 4, y: 5 }]
  assert.equal(checkSelfCollision({ x: 6, y: 5 }, body), false)
})

// --- moveSnake ---
test('moveSnake moves head one cell in current direction', () => {
  const state = {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    status: 'playing',
  }
  const next = moveSnake(state)
  assert.deepEqual(next.snake[0], { x: 11, y: 10 })
  assert.equal(next.snake.length, 3)
  assert.equal(next.status, 'playing')
})

test('moveSnake returns dead on wall collision', () => {
  const state = {
    snake: [{ x: 19, y: 10 }, { x: 18, y: 10 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 5, y: 5 },
    score: 0,
    status: 'playing',
  }
  assert.equal(moveSnake(state).status, 'dead')
})

test('moveSnake returns dead on self collision', () => {
  // Snake curled: head at (5,5) moves right to (6,5) which is in body after tail removal
  const state = {
    snake: [
      { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 },
      { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 6, y: 5 }, { x: 6, y: 4 },
    ],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 15, y: 15 },
    score: 0,
    status: 'playing',
  }
  assert.equal(moveSnake(state).status, 'dead')
})

test('moveSnake grows snake and increments score when eating food', () => {
  const state = {
    snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }],
    direction: { x: 1, y: 0 },
    nextDirection: { x: 1, y: 0 },
    food: { x: 11, y: 10 },
    score: 0,
    status: 'playing',
  }
  const next = moveSnake(state)
  assert.deepEqual(next.snake[0], { x: 11, y: 10 })
  assert.equal(next.snake.length, 4)
  assert.equal(next.score, 1)
})

// --- getReward ---
test('getReward returns null below minimum threshold', () => {
  const rewards = [{ minScore: 10, prize: 'A' }, { minScore: 25, prize: 'B' }]
  assert.equal(getReward(5, rewards), null)
})

test('getReward returns prize at exact threshold', () => {
  const rewards = [{ minScore: 10, prize: 'A' }, { minScore: 25, prize: 'B' }]
  assert.equal(getReward(10, rewards), 'A')
})

test('getReward returns highest matching prize', () => {
  const rewards = [{ minScore: 10, prize: 'A' }, { minScore: 25, prize: 'B' }]
  assert.equal(getReward(30, rewards), 'B')
})

test('getReward returns null for empty rewards array', () => {
  assert.equal(getReward(100, []), null)
})
