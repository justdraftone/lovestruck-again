import { describe, it, expect } from 'vitest'
import { calculateResult, calculateCompatibility } from './resultsEngine'

describe('calculateResult', () => {
  it('returns default persona when all answers are left (no right swipes)', () => {
    const answers = { 1: 'left' as const, 2: 'left' as const, 3: 'left' as const }
    const result = calculateResult(answers)
    expect(result.name).toBe('The Vibe Checker')
    expect(result.score).toBe(0)
  })

  it('returns a valid persona with expected fields when answers include right swipes', () => {
    const answers = { 1: 'right' as const, 2: 'right' as const, 3: 'right' as const }
    const result = calculateResult(answers)
    expect(result.name).toBeTruthy()
    expect(result.emoji).toBeTruthy()
    expect(result.description).toBeTruthy()
    expect(result.score).toBeGreaterThan(0)
  })

  it('returns a result even with a single answer', () => {
    const result = calculateResult({ 5: 'right' as const })
    expect(result.name).toBeTruthy()
  })

  it('returns a result for empty answers', () => {
    const result = calculateResult({})
    expect(result.name).toBe('The Vibe Checker')
  })
})

describe('calculateCompatibility', () => {
  const sameAnswers: Record<number, 'left' | 'right'> = {
    1: 'right', 2: 'right', 3: 'left', 4: 'right', 5: 'left', 6: 'right', 7: 'left',
  }

  const oppositeAnswers: Record<number, 'left' | 'right'> = {
    1: 'left', 2: 'left', 3: 'right', 4: 'left', 5: 'right', 6: 'left', 7: 'right',
  }

  it('returns overall percentage within 65–98 range when partners answer the same', () => {
    const result = calculateCompatibility(sameAnswers, sameAnswers, 'Alice', 'Bob')
    expect(result.overallPercentage).toBeGreaterThanOrEqual(65)
    expect(result.overallPercentage).toBeLessThanOrEqual(98)
  })

  it('returns overall percentage within 65–98 range when partners answer opposite', () => {
    const result = calculateCompatibility(sameAnswers, oppositeAnswers, 'Alice', 'Bob')
    expect(result.overallPercentage).toBeGreaterThanOrEqual(65)
    expect(result.overallPercentage).toBeLessThanOrEqual(98)
  })

  it('scores higher when partners answer identically vs opposite', () => {
    const sameResult = calculateCompatibility(sameAnswers, sameAnswers, 'Alice', 'Bob')
    const oppositeResult = calculateCompatibility(sameAnswers, oppositeAnswers, 'Alice', 'Bob')
    expect(sameResult.overallPercentage).toBeGreaterThan(oppositeResult.overallPercentage)
  })

  it('returns "Soulmates" for percentage >= 90', () => {
    // Force high score by using identical answers with all-right swipes (neutral = 1.0 each, 100% clamped to 98)
    const allRight: Record<number, 'left' | 'right'> = Object.fromEntries(
      Array.from({ length: 10 }, (_, i) => [i + 1, 'right'])
    )
    const result = calculateCompatibility(allRight, allRight, 'Alice', 'Bob')
    expect(result.compatibilityLevel).toBe('Soulmates')
  })

  it('returns "Compatible" for percentage < 70', () => {
    // Opposite answers on neutral questions scores 0.5/1.0 = 50%, clamped to 65
    const result = calculateCompatibility(sameAnswers, oppositeAnswers, 'Alice', 'Bob')
    expect(result.compatibilityLevel).toBe('Compatible')
  })

  it('chemistry and romance percentages are within 70–99 range', () => {
    const result = calculateCompatibility(sameAnswers, sameAnswers, 'Alice', 'Bob')
    expect(result.chemistryPercentage).toBeGreaterThanOrEqual(70)
    expect(result.chemistryPercentage).toBeLessThanOrEqual(99)
    expect(result.romancePercentage).toBeGreaterThanOrEqual(70)
    expect(result.romancePercentage).toBeLessThanOrEqual(99)
  })

  it('includes partner names in the description', () => {
    const result = calculateCompatibility(sameAnswers, sameAnswers, 'Alice', 'Bob')
    expect(result.description).toContain('Alice')
    expect(result.description).toContain('Bob')
  })

  it('falls back to 75% when no shared questions exist', () => {
    const result = calculateCompatibility({}, {}, 'Alice', 'Bob')
    expect(result.overallPercentage).toBe(75)
  })
})
