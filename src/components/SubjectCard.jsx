import styles from './SubjectCard.module.css'

const STATUS_ICONS = {
  'Completed': '✓',
  'In Progress': '◉',
  'Not Started': '○',
}

export default function SubjectCard({ subject, index, onClick, onDelete }) {
  // Get all topics from all units
  const allTopics = subject.units.flatMap(u => u.topics)
  
  const total = allTopics.length
  const completed = allTopics.filter(t => t.status === 'Completed').length
  const inProgress = allTopics.filter(t => t.status === 'In Progress').length
  const notStarted = allTopics.filter(t => t.status === 'Not Started').length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  const daysLeft = subject.deadline
    ? Math.ceil((new Date(subject.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  function handleDelete(e) {
    e.stopPropagation()
    if (confirm(`Delete "${subject.name}"?`)) onDelete()
  }

  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{
        '--subject-color': subject.color || 'var(--accent)',
        animationDelay: `${index * 0.06}s`
      }}
    >
      {/* Decorative top bar */}
      <div className={styles.topBar} />

      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.nameWrap}>
          <div className={styles.colorDot} />
          <h2 className={styles.name}>{subject.name}</h2>
        </div>
        <button className={styles.deleteBtn} onClick={handleDelete} title="Delete subject">
          ×
        </button>
      </div>

      {/* Stats row */}
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statVal}>{total}</span>
          <span className={styles.statKey}>Total</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: 'var(--success)' }}>{completed}</span>
          <span className={styles.statKey}>Done</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: 'var(--warning)' }}>{inProgress}</span>
          <span className={styles.statKey}>Active</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.stat}>
          <span className={styles.statVal} style={{ color: 'var(--text-muted)' }}>{notStarted}</span>
          <span className={styles.statKey}>Left</span>
        </div>
      </div>

      {/* Progress */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progress</span>
          <span className={styles.progressPct}>{progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Topic preview */}
      {allTopics.length > 0 && (
        <div className={styles.topicPreview}>
          {allTopics.slice(0, 3).map(topic => (
            <div key={topic.id} className={styles.topicChip} data-status={topic.status}>
              <span className={styles.chipIcon}>{STATUS_ICONS[topic.status]}</span>
              <span className={styles.chipText}>{topic.title}</span>
            </div>
          ))}
          {allTopics.length > 3 && (
            <div className={styles.moreChip}>+{allTopics.length - 3} more</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className={styles.cardFooter}>
        {daysLeft !== null ? (
          <div className={`${styles.deadline} ${daysLeft < 7 ? styles.urgent : daysLeft < 14 ? styles.soon : ''}`}>
            {daysLeft < 0
              ? '⚠ Overdue'
              : daysLeft === 0
              ? '⚡ Due today'
              : `⏱ ${daysLeft}d left`}
          </div>
        ) : (
          <div className={styles.noDeadline}>No deadline</div>
        )}
        <div className={styles.viewHint}>View details →</div>
      </div>
    </div>
  )
}
