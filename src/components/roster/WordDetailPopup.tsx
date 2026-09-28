import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { useWordEntries } from './useWordEntries'

interface ParsedSection { heading: string; items: string[] }

function parseInline(raw: string): { word: string; sections: ParsedSection[] } {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  const word = lines[0] ?? ''
  const sections: ParsedSection[] = []
  let current: ParsedSection | null = null
  for (const line of lines.slice(1)) {
    if (line.endsWith(':')) {
      current = { heading: line.slice(0, -1), items: [] }
      sections.push(current)
    } else if (current) {
      current.items.push(line.replace(/^\d+\.\s*/, ''))
    }
  }
  return { word, sections }
}

function serialiseInline(word: string, sections: ParsedSection[]): string {
  const parts: string[] = [word]
  for (const sec of sections) {
    if (sec.items.filter(Boolean).length === 0) continue
    parts.push(`${sec.heading}:`)
    sec.items.filter(Boolean).forEach((item, i) => parts.push(`${i + 1}. ${item}`))
  }
  return parts.join('\n')
}

interface WordDetailPopupProps {
  rosterId: string
  field: 'wod' | 'pod' | 'theme'
  word: string
  label: string
  rawValue?: string
  currentUid?: string
  isAdmin?: boolean
  onSave?: (newRaw: string) => Promise<void>
  onClose: () => void
}

export function WordDetailPopup({ rosterId, field, word: _word, label, rawValue, currentUid, isAdmin, onSave, onClose }: WordDetailPopupProps) {
  const { entries, loading, addEntry } = useWordEntries(rosterId, field)
  const parsed = parseInline(rawValue ?? '')

  const [editWord, setEditWord] = useState(parsed.word)
  const [editSections, setEditSections] = useState<ParsedSection[]>(parsed.sections.map(s => ({ ...s, items: [...s.items] })))
  const [editingItem, setEditingItem] = useState<{ si: number; ii: number } | null>(null)
  const [editingItemVal, setEditingItemVal] = useState('')
  const [editingWord, setEditingWord] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [entries.length])

  const handleAddEntry = async () => {
    if (!meaning.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await addEntry(meaning, example)
      setMeaning('')
      setExample('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add entry')
    } finally {
      setSubmitting(false)
    }
  }

  const startEditItem = (si: number, ii: number) => {
    setEditingItem({ si, ii })
    setEditingItemVal(editSections[si].items[ii])
  }

  const commitEditItem = () => {
    if (!editingItem) return
    const { si, ii } = editingItem
    setEditSections(prev => prev.map((sec, s) =>
      s !== si ? sec : { ...sec, items: sec.items.map((item, i) => i === ii ? editingItemVal : item) }
    ))
    setEditingItem(null)
    setDirty(true)
  }

  const cancelEditItem = () => setEditingItem(null)

  const handleSave = async () => {
    if (!onSave) return
    setSaving(true)
    setSaveError(null)
    try {
      const newRaw = serialiseInline(editWord, editSections)
      await onSave(newRaw)
      setDirty(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '6px 9px', borderRadius: 7,
    border: '1px solid #C89A14', fontSize: 12,
    fontFamily: 'inherit', outline: 'none',
    boxSizing: 'border-box', color: '#111827', background: '#fff',
  }

  const taStyle: React.CSSProperties = {
    width: '100%', padding: '9px 11px', borderRadius: 9,
    border: '1px solid #E6E2DE', fontSize: 13,
    fontFamily: 'inherit', resize: 'vertical', outline: 'none',
    boxSizing: 'border-box', minHeight: 60, lineHeight: 1.5,
    transition: 'border-color 0.15s',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16,
          width: '100%', maxWidth: 480, maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)', overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#772432', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>
                {label}
              </div>
              {isAdmin && editingWord ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    autoFocus
                    value={editWord}
                    onChange={e => { setEditWord(e.target.value); setDirty(true) }}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingWord(false) }}
                    style={{ ...inputStyle, fontSize: 18, fontWeight: 800, flex: 1 }}
                  />
                  <button onClick={() => setEditingWord(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Check size={16} color="#1A9E60" />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', lineHeight: 1.2 }}>
                    {editWord || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not set</span>}
                  </div>
                  {isAdmin && (
                    <button onClick={() => setEditingWord(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                      <Pencil size={13} color="#9CA3AF" />
                    </button>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: '#F3F4F6', border: 'none', cursor: 'pointer',
                fontSize: 15, fontWeight: 700, color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >✕</button>
          </div>
        </div>

        {/* Body */}
        <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Grammarian's Notes — editable for admin */}
          {(editSections.length > 0 || (isAdmin && parsed.sections.length > 0)) && (
            <div style={{ background: '#FFF8E6', border: '1px solid #F3D24F40', borderRadius: 10, padding: '10px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#C89A14', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>
                Grammarian's Notes
              </div>
              {editSections.map((sec, si) => (
                <div key={si} style={{ marginBottom: si < editSections.length - 1 ? 10 : 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                    {sec.heading}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {sec.items.map((item, ii) => {
                      const isEditing = editingItem?.si === si && editingItem?.ii === ii
                      return (
                        <div key={ii} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#C89A1422', color: '#C89A14',
                            fontSize: 9, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>{ii + 1}</span>
                          {isAdmin && isEditing ? (
                            <>
                              <input
                                autoFocus
                                value={editingItemVal}
                                onChange={e => setEditingItemVal(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEditItem(); if (e.key === 'Escape') cancelEditItem() }}
                                style={inputStyle}
                              />
                              <button onClick={commitEditItem} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <Check size={14} color="#1A9E60" />
                              </button>
                              <button onClick={cancelEditItem} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                <X size={14} color="#9CA3AF" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span style={{ fontSize: 12, color: '#374151', lineHeight: 1.5, flex: 1 }}>{item}</span>
                              {isAdmin && (
                                <button onClick={() => startEditItem(si, ii)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                  <Pencil size={11} color="#9CA3AF" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Save button — only shown when dirty */}
              {isAdmin && dirty && (
                <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: '7px 16px', borderRadius: 8,
                      background: saving ? '#D1D5DB' : '#772432',
                      color: '#fff', border: 'none',
                      fontSize: 12, fontWeight: 700,
                      cursor: saving ? 'not-allowed' : 'pointer',
                    }}
                  >{saving ? 'Saving…' : 'Save changes'}</button>
                  <button
                    onClick={() => {
                      setEditWord(parsed.word)
                      setEditSections(parsed.sections.map(s => ({ ...s, items: [...s.items] })))
                      setDirty(false)
                      setEditingItem(null)
                    }}
                    style={{
                      padding: '7px 12px', borderRadius: 8,
                      background: 'none', border: '1px solid #E6E2DE',
                      fontSize: 12, fontWeight: 700, color: '#6B7280', cursor: 'pointer',
                    }}
                  >Discard</button>
                  {saveError && <span style={{ fontSize: 11, color: '#B3261E' }}>{saveError}</span>}
                </div>
              )}
            </div>
          )}

          {/* Community entries */}
          <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 2 }}>
            Community Meanings &amp; Examples
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#9CA3AF', fontSize: 13 }}>Loading…</div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9CA3AF', fontSize: 13, fontStyle: 'italic' }}>
              Be the first to add a meaning!
            </div>
          ) : (
            entries.map(entry => (
              <div key={entry.id} style={{ background: '#F9FAFB', border: '1px solid #E6E2DE', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: entry.example ? 4 : 0 }}>
                  {entry.meaning}
                </div>
                {entry.example && (
                  <div style={{ fontSize: 12, color: '#4B5563', fontStyle: 'italic', marginBottom: 6, lineHeight: 1.4 }}>
                    "{entry.example}"
                  </div>
                )}
                <div style={{ fontSize: 10, color: '#9CA3AF', textAlign: 'right', letterSpacing: 0.2 }}>
                  Added by {entry.displayName}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add meaning form — non-admin signed-in users */}
        {currentUid && !isAdmin && (
          <div style={{ padding: '12px 20px 18px', borderTop: '1px solid #F3F4F6', flexShrink: 0, background: '#FAFAFA' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6B6470', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>
              Add your meaning
            </div>
            <textarea
              value={meaning}
              onChange={e => setMeaning(e.target.value)}
              placeholder="What does this word/phrase mean?"
              style={taStyle}
              onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
            <textarea
              value={example}
              onChange={e => setExample(e.target.value)}
              placeholder="Example usage (optional)"
              style={{ ...taStyle, marginTop: 8, minHeight: 50 }}
              onFocus={e => (e.currentTarget.style.borderColor = '#772432')}
              onBlur={e => (e.currentTarget.style.borderColor = '#E6E2DE')}
            />
            {error && <div style={{ fontSize: 12, color: '#B3261E', marginTop: 6, fontWeight: 600 }}>{error}</div>}
            <button
              onClick={handleAddEntry}
              disabled={submitting || !meaning.trim()}
              style={{
                marginTop: 10, padding: '9px 20px', borderRadius: 9,
                background: '#772432', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none',
                cursor: submitting || !meaning.trim() ? 'not-allowed' : 'pointer',
                opacity: submitting || !meaning.trim() ? 0.55 : 1, transition: 'opacity 0.15s',
              }}
            >{submitting ? 'Adding…' : 'Add'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
