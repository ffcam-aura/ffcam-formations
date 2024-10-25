import { render, screen } from '@testing-library/react'
import Home from '@/page';
import { describe, expect, it } from 'vitest';

describe('Home', () => {
  it('renders the home page without crashing', () => {
    render(<Home />)
    expect(screen.getByText('Bienvenue')).toBe('Bienvenue')
  })
})
