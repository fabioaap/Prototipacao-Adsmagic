import { describe, expect, it } from 'vitest'
import {
  buildTagSnippet,
  buildDefaultTagScriptUrl,
  buildDefaultTrackingEndpoint,
} from '@/services/tagSnippet'

describe('tagSnippet', () => {
  it('builds default URLs from origin', () => {
    expect(buildDefaultTagScriptUrl('https://app.adsmagic.com.br')).toBe(
      'https://app.adsmagic.com.br/adsmagic-tag.js'
    )
    expect(buildDefaultTrackingEndpoint('https://app.adsmagic.com.br')).toBe(
      'https://app.adsmagic.com.br/api/events/track'
    )
  })

  it('builds install snippet without apiEndpoint', () => {
    const snippet = buildTagSnippet({
      projectId: 'project-123',
      scriptUrl: 'https://cdn.example.com/adsmagic-tag.js',
      debug: true,
      autoInit: true,
    })

    expect(snippet).toContain("projectId: \"project-123\"")
    expect(snippet).not.toContain('apiEndpoint')
    expect(snippet).toContain('debug: true')
    expect(snippet).toContain('autoInit: true')
    expect(snippet).toContain('<script src="https://cdn.example.com/adsmagic-tag.js"></script>')
  })

  it('escapes script-breaking content in inline config', () => {
    const snippet = buildTagSnippet({
      projectId: '</script><script>alert(1)</script>',
      scriptUrl: 'https://cdn.example.com/adsmagic-tag.js',
    })

    expect(snippet).toContain('<\\/script>')
    expect(snippet).not.toContain('</script><script>alert(1)</script>')
  })

  it('throws when required fields are missing', () => {
    expect(() =>
      buildTagSnippet({
        projectId: '',
        scriptUrl: 'https://cdn.example.com/adsmagic-tag.js',
      })
    ).toThrow('projectId is required')

    expect(() =>
      buildTagSnippet({
        projectId: 'project-1',
        scriptUrl: '',
      })
    ).toThrow('scriptUrl is required')
  })
})
