import '@testing-library/jest-dom/vitest'
import { beforeAll, afterEach, afterAll, vi } from 'vitest'

beforeAll(() => {
  globalThis.Audio = class Audio {
    play() {}
    pause() {}
    load() {}
    canPlayType() { return '' }
    src = ''
    volume = 1
    paused = true
    currentTime = 0
    duration = 0
    readyState = 0
    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() { return true }
  } as unknown as typeof Audio
})

afterEach(() => {
  vi.resetAllMocks()
})

afterAll(() => {
  vi.clearAllMocks()
})