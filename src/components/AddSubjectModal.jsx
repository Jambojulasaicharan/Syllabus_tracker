import { useState, useEffect, useRef } from 'react'
import styles from './AddSubjectModal.module.css'

const PRESET_COLORS = [
  '#7c6af7', '#60a5fa', '#4ade80', '#f87171',
  '#fbbf24', '#f472b6', '#34d399', '#a78bfa',
  '#fb923c', '#38bdf8',
]

export default function AddSubjectModal({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [deadline, setDeadline] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd({ name: trimmed, color, deadline })
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>New Subject</h3>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label className={styles.label}>Subject Name</label>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              placeholder="e.g. Mathematics, Physics..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Color</label>
            <div className={styles.colorGrid}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  className={`${styles.colorSwatch} ${color === c ? styles.selected : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>
            <div className={styles.colorPreview}>
              <div className={styles.previewDot} style={{ background: color }} />
              <span className={styles.previewHex}>{color}</span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Deadline <span className={styles.optional}>(optional)</span></label>
            <input
              className={styles.input}
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{ '--btn-color': color }}
          >
            Create Subject
          </button>
        </div>
      </div>
    </div>
  )
}
