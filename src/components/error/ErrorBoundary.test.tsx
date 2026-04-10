import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary'

const error = new Error('Test error')

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>Child content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('renders error UI when error occurs', () => {
    const Throws = () => {
      throw error
    }
    
    const { container } = render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(container.querySelector('button')).toBeInTheDocument()
  })

  it('has Try Again button', () => {
    const Throws = () => {
      throw error
    }
    
    render(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>
    )
    
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })
})