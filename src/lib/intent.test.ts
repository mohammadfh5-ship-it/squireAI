import { describe, expect, it } from 'vitest'
import { parseIntent } from './intent'

describe('parseIntent', () => {
  it('maps oil / hair / movie language to verticals and default zip', () => {
    expect(parseIntent('oil change this weekend near 94107').vertical).toBe('auto')
    expect(parseIntent('haircut near me').vertical).toBe('style')
    expect(parseIntent('movies tonight').vertical).toBe('night')
    expect(parseIntent('haircut near me').zip).toBe('94107')
  })

  it('pulls an explicit zip out of the ask', () => {
    expect(parseIntent('oil change near 94110', '94107').zip).toBe('94110')
  })
})
