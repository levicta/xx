import { describe, it, expect } from 'vitest'
import { 
  unauthorized, 
  forbidden, 
  notFound, 
  validationError, 
  badRequest, 
  internalError,
  success 
} from './api-response'

describe('API Response Helpers', () => {
  describe('unauthorized', () => {
    it('returns 401 with error message', () => {
      const response = unauthorized('Must be logged in')
      expect(response.status).toBe(401)
      expect(response.headers.get('content-type')).toContain('application/json')
    })

    it('uses default message when not provided', () => {
      const response = unauthorized()
      expect(response.status).toBe(401)
    })
  })

  describe('forbidden', () => {
    it('returns 403 status', () => {
      const response = forbidden()
      expect(response.status).toBe(403)
    })
  })

  describe('notFound', () => {
    it('returns 404 status', () => {
      const response = notFound()
      expect(response.status).toBe(404)
    })
  })

  describe('validationError', () => {
    it('returns 400 with validation details', () => {
      const response = validationError('Invalid input', { email: ['Invalid email format'] })
      expect(response.status).toBe(400)
    })
  })

  describe('badRequest', () => {
    it('returns 400 status', () => {
      const response = badRequest()
      expect(response.status).toBe(400)
    })
  })

  describe('internalError', () => {
    it('returns 500 status', () => {
      const response = internalError()
      expect(response.status).toBe(500)
    })
  })

  describe('success', () => {
    it('returns 200 with data', () => {
      const response = success({ id: 1, name: 'Test' })
      expect(response.status).toBe(200)
    })

    it('includes message when provided', () => {
      const response = success({ id: 1 }, 'Created successfully')
      expect(response.status).toBe(200)
    })
  })
})