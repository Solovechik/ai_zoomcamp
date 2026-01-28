import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getToday,
  getDaysInMonth,
  getFirstDayOfMonth,
  isToday,
  isSameDay,
  getMonthString
} from '../utils/dateUtils'

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T12:00:00Z')
      expect(formatDate(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should handle different dates correctly', () => {
      const date = new Date('2024-12-25T00:00:00Z')
      const result = formatDate(date)
      expect(result).toBe('2024-12-25')
    })
  })

  describe('getToday', () => {
    it('should return today in YYYY-MM-DD format', () => {
      const today = getToday()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })

    it('should return a valid date string', () => {
      const today = getToday()
      const parsed = new Date(today)
      expect(parsed).toBeInstanceOf(Date)
      expect(isNaN(parsed.getTime())).toBe(false)
    })
  })

  describe('getDaysInMonth', () => {
    it('should return 31 for January', () => {
      expect(getDaysInMonth(2024, 0)).toBe(31)
    })

    it('should return 28 for February in non-leap year', () => {
      expect(getDaysInMonth(2023, 1)).toBe(28)
    })

    it('should return 29 for February in leap year', () => {
      expect(getDaysInMonth(2024, 1)).toBe(29)
    })

    it('should return 30 for April', () => {
      expect(getDaysInMonth(2024, 3)).toBe(30)
    })
  })

  describe('getFirstDayOfMonth', () => {
    it('should return correct day of week (0-6)', () => {
      const day = getFirstDayOfMonth(2024, 0) // January 2024
      expect(day).toBeGreaterThanOrEqual(0)
      expect(day).toBeLessThanOrEqual(6)
    })

    it('should return Monday (1) for January 2024', () => {
      expect(getFirstDayOfMonth(2024, 0)).toBe(1)
    })
  })

  describe('isToday', () => {
    it('should return true for today', () => {
      const today = new Date()
      expect(isToday(today)).toBe(true)
    })

    it('should return false for yesterday', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isToday(yesterday)).toBe(false)
    })

    it('should return false for tomorrow', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isToday(tomorrow)).toBe(false)
    })
  })

  describe('isSameDay', () => {
    it('should return true for same date', () => {
      const date1 = new Date('2024-01-15T10:00:00')
      const date2 = new Date('2024-01-15T22:00:00')
      expect(isSameDay(date1, date2)).toBe(true)
    })

    it('should return false for different dates', () => {
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-01-16')
      expect(isSameDay(date1, date2)).toBe(false)
    })
  })

  describe('getMonthString', () => {
    it('should return YYYY-MM format', () => {
      const date = new Date('2024-03-15')
      expect(getMonthString(date)).toBe('2024-03')
    })

    it('should pad single digit months', () => {
      const date = new Date('2024-01-01')
      expect(getMonthString(date)).toBe('2024-01')
    })
  })
})
