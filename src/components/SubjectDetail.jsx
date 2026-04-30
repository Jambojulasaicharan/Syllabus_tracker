import { useState, useEffect, useRef } from 'react'
import UnitSection from './UnitSection'
import PieChart from './PieChart'
import styles from './SubjectDetail.module.css'

export default function SubjectDetail({ 
  subject, 
  onClose, 
  onUpdate,
  onAddUnit,
  onAddTopic,
  onUpdateTopicStatus,
  onDeleteTopic,
  onDeleteUnit
}) {
  const [newUnit, setNewUnit] = useState('')
  const [showJsonImport, setShowJsonImport] = useState(false)
  const [jsonInput, setJsonInput] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [jsonSuccess, setJsonSuccess] = useState('')
  const inputRef = useRef(null)
  const jsonRef = useRef(null)

  // Calculate all topics across all units
const getAllTopics = (subject) => {
  return (subject.units || []).flatMap(unit => unit.topics || []);
};  const allTopics = getAllTopics(subject)

  const total = allTopics.length
  const completed = allTopics.filter(t => t.status === 'Completed').length
  const inProgress = allTopics.filter(t => t.status === 'In Progress').length
  const notStarted = allTopics.filter(t => t.status === 'Not Started').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const remaining = notStarted + inProgress
  const unitCount = subject.units.length

  useEffect(() => {
    inputRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (showJsonImport) {
      setTimeout(() => jsonRef.current?.focus(), 50)
    }
  }, [showJsonImport])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function addUnit() {
    const title = newUnit.trim()
    if (!title) return
    onAddUnit(subject.id, title)
    setNewUnit('')
    inputRef.current?.focus()
  }

  function importFromJson() {
    setJsonError('')
    setJsonSuccess('')
    const raw = jsonInput.trim()
    if (!raw) { setJsonError('Please paste some JSON first.'); return }

    let parsed
    try { parsed = JSON.parse(raw) } catch {
      setJsonError('Invalid JSON. Please check the format and try again.')
      return
    }

    // Accept multiple formats:
    // 1. Array of units: [{"title":"Unit A","topics":["Topic A","Topic B"]}]
    // 2. Array of strings: ["Unit A", "Unit B"]
    let rawUnits = Array.isArray(parsed) ? parsed : null

    if (!rawUnits) {
      setJsonError('Expected an array of units.')
      return
    }

    const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed']
    const newUnits = []
    const errors = []

    rawUnits.forEach((item, i) => {
      if (typeof item === 'string') {
        // Single string = unit title
        if (!item.trim()) { errors.push(`Item ${i + 1}: empty string skipped.`); return }
        newUnits.push({
          id: `u-${Date.now()}-${i}`,
          title: item.trim(),
          topics: []
        })
      } else if (item && typeof item === 'object') {
        const unitTitle = (item.title || item.name || '').trim()
        if (!unitTitle) { errors.push(`Item ${i + 1}: missing "title" field, skipped.`); return }

        // Parse topics in the unit
        const rawTopics = Array.isArray(item.topics) ? item.topics : []
        const topicsForUnit = []

        rawTopics.forEach((topicItem, j) => {
          if (typeof topicItem === 'string') {
            if (!topicItem.trim()) { errors.push(`Unit ${i + 1}, Topic ${j + 1}: empty string skipped.`); return }
            topicsForUnit.push({
              id: `t-${Date.now()}-${i}-${j}`,
              title: topicItem.trim(),
              status: 'Not Started'
            })
          } else if (topicItem && typeof topicItem === 'object') {
            const topicTitle = (topicItem.title || topicItem.name || '').trim()
            if (!topicTitle) { errors.push(`Unit ${i + 1}, Topic ${j + 1}: missing "title" field, skipped.`); return }
            const status = VALID_STATUSES.includes(topicItem.status) ? topicItem.status : 'Not Started'
            topicsForUnit.push({
              id: `t-${Date.now()}-${i}-${j}`,
              title: topicTitle,
              status
            })
          }
        })

        newUnits.push({
          id: `u-${Date.now()}-${i}`,
          title: unitTitle,
          topics: topicsForUnit
        })
      } else {
        errors.push(`Item ${i + 1}: unrecognised format, skipped.`)
      }
    })

    if (newUnits.length === 0) {
      setJsonError('No valid units found. ' + errors.join(' '))
      return
    }

    // Update subject with new units
    const updated = {
      ...subject,
      units: [...subject.units, ...newUnits]
    }
    onUpdate(updated)
    setJsonSuccess(`✓ Imported ${newUnits.length} unit${newUnits.length !== 1 ? 's' : ''} successfully!${errors.length ? ` (${errors.length} skipped)` : ''}`)
    setJsonInput('')
    setTimeout(() => { setShowJsonImport(false); setJsonSuccess('') }, 1800)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') addUnit()
  }

  const daysLeft = subject.deadline
    ? Math.ceil((new Date(subject.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.panel}>
        {/* Panel header */}
        <div className={styles.panelHeader} style={{ '--subject-color': subject.color || 'var(--accent)' }}>
          <div className={styles.headerTop}>
            <div className={styles.subjectMeta}>
              <div className={styles.colorBadge} />
              <h2 className={styles.title}>{subject.name}</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose} title="Close (Esc)">×</button>
          </div>

          {daysLeft !== null && (
            <div className={`${styles.deadlinePill} ${daysLeft < 0 ? styles.urgent : daysLeft < 7 ? styles.soon : ''}`}>
              {daysLeft < 0 ? '⚠ Overdue' : daysLeft === 0 ? '⚡ Due today' : `⏱ ${daysLeft} days left`}
            </div>
          )}
        </div>

        <div className={styles.panelBody}>
          {/* Analysis Section */}
          <div className={styles.analysisSection}>
            <div className={styles.analysisMeta}>
              {/* Progress */}
              <div className={styles.analysisCard}>
                <div className={styles.bigProgress}>
                  <div className={styles.bigProgressInner}>
                    <span className={styles.bigPct}>{progress}%</span>
                    <span className={styles.bigPctLabel}>Complete</span>
                  </div>
                  <svg className={styles.progressRing} viewBox="0 0 80 80">
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="6"
                    />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke={subject.color || 'var(--accent)'}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                      transform="rotate(-90 40 40)"
                      style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                    />
                  </svg>
                </div>
              </div>

              {/* Stats */}
              <div className={styles.analysisStats}>
                <div className={styles.statBlock}>
                  <div className={styles.statBlockIcon} style={{ background: 'var(--success-subtle)', color: 'var(--success)' }}>✓</div>
                  <div className={styles.statBlockInfo}>
                    <span className={styles.statBlockNum}>{completed}</span>
                    <span className={styles.statBlockLabel}>Completed</span>
                  </div>
                </div>
                <div className={styles.statBlock}>
                  <div className={styles.statBlockIcon} style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}>◉</div>
                  <div className={styles.statBlockInfo}>
                    <span className={styles.statBlockNum}>{inProgress}</span>
                    <span className={styles.statBlockLabel}>In Progress</span>
                  </div>
                </div>
                <div className={styles.statBlock}>
                  <div className={styles.statBlockIcon} style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>○</div>
                  <div className={styles.statBlockInfo}>
                    <span className={styles.statBlockNum}>{notStarted}</span>
                    <span className={styles.statBlockLabel}>Not Started</span>
                  </div>
                </div>
                <div className={styles.statBlock}>
                  <div className={styles.statBlockIcon} style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}>◈</div>
                  <div className={styles.statBlockInfo}>
                    <span className={styles.statBlockNum}>{total}</span>
                    <span className={styles.statBlockLabel}>Total Topics</span>
                  </div>
                </div>
              </div>

              {/* Pie chart */}
              {total > 0 && (
                <PieChart
                  completed={completed}
                  inProgress={inProgress}
                  notStarted={notStarted}
                />
              )}
            </div>

            {/* Workload message */}
            <div className={styles.workloadMsg}>
              {remaining === 0 && total > 0
                ? <><span className={styles.workloadIcon} style={{ color: 'var(--success)' }}>🎉</span> All topics completed! Great work!</>
                : remaining > 0
                ? <><span className={styles.workloadIcon}>📚</span> You have <strong>{remaining} topic{remaining !== 1 ? 's' : ''}</strong> remaining ({notStarted} not started, {inProgress} in progress)</>
                : <><span className={styles.workloadIcon}>📝</span> No topics yet. Add your first unit below!</>
              }
            </div>
          </div>

          {/* Add unit */}
          <div className={styles.addSection}>
            <div className={styles.addTabRow}>
              <button
                className={`${styles.addTab} ${!showJsonImport ? styles.addTabActive : ''}`}
                onClick={() => { setShowJsonImport(false); setJsonError(''); setJsonSuccess('') }}
              >
                ✏ New Unit
              </button>
              <button
                className={`${styles.addTab} ${showJsonImport ? styles.addTabActive : ''}`}
                onClick={() => setShowJsonImport(true)}
              >
                {'{ }'} Bulk Import JSON
              </button>
            </div>

            {!showJsonImport ? (
              <div className={styles.addTopicWrap}>
                <input
                  ref={inputRef}
                  className={styles.topicInput}
                  type="text"
                  placeholder="Unit title... (Enter to add)"
                  value={newUnit}
                  onChange={e => setNewUnit(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button
                  className={styles.addTopicBtn}
                  onClick={addUnit}
                  disabled={!newUnit.trim()}
                >
                  + Add
                </button>
              </div>
            ) : (
              <div className={styles.jsonImportWrap}>
                <div className={styles.jsonHint}>
                  Paste a JSON array of units with topics. Accepted formats:
                  <div className={styles.jsonFormats}>
                    <code>{'[{"title":"Unit 1","topics":["Topic A","Topic B"]},{"title":"Unit 2","topics":["Topic C"]}]'}</code>
                    <span className={styles.jsonOr}>or</span>
                    <code>{'[{"title":"Unit 1","topics":[{"title":"Topic A","status":"In Progress"},{"title":"Topic B"}]}]'}</code>
                  </div>
                </div>
                <textarea
                  ref={jsonRef}
                  className={styles.jsonTextarea}
                  placeholder={'[\n  {\n    "title": "Unit 1",\n    "topics": ["Topic A", "Topic B"]\n  },\n  {\n    "title": "Unit 2",\n    "topics": ["Topic C"]\n  }\n]'}
                  value={jsonInput}
                  onChange={e => { setJsonInput(e.target.value); setJsonError(''); setJsonSuccess('') }}
                  rows={8}
                  spellCheck={false}
                />
                {jsonError && <div className={styles.jsonError}>⚠ {jsonError}</div>}
                {jsonSuccess && <div className={styles.jsonSuccess}>{jsonSuccess}</div>}
                <div className={styles.jsonActions}>
                  <button
                    className={styles.jsonClear}
                    onClick={() => { setJsonInput(''); setJsonError(''); setJsonSuccess('') }}
                    disabled={!jsonInput}
                  >
                    Clear
                  </button>
                  <button
                    className={styles.jsonImportBtn}
                    onClick={importFromJson}
                    disabled={!jsonInput.trim()}
                  >
                    Import Units
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Units */}
          {unitCount === 0 ? (
            <div className={styles.noTopics}>
              No units yet. Add your first unit above to get started!
            </div>
          ) : (
            <div className={styles.topicsList}>
              {subject.units.map((unit) => (
                <UnitSection
                  key={unit.id}
                  unit={unit}
                  subjectId={subject.id}
                  onAddTopic={onAddTopic}
                  onUpdateTopicStatus={onUpdateTopicStatus}
                  onDeleteTopic={onDeleteTopic}
                  onDeleteUnit={onDeleteUnit}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}