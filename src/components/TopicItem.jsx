import styles from './TopicItem.module.css'

const STATUSES = ['Not Started', 'In Progress', 'Completed']

export default function TopicItem({ topic, index, onStatusChange, onDelete }) {
  function cycleStatus() {
    const current = STATUSES.indexOf(topic.status)
    const next = STATUSES[(current + 1) % STATUSES.length]
    onStatusChange(next)
  }

  return (
    <div
      className={`${styles.item} ${styles[topic.status.replace(' ', '')]}`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      <button
        className={styles.statusBtn}
        onClick={cycleStatus}
        title={`Status: ${topic.status} (click to cycle)`}
        data-status={topic.status}
      >
        {topic.status === 'Completed' && <span className={styles.checkmark}>✓</span>}
        {topic.status === 'In Progress' && <span className={styles.pulse} />}
      </button>

      <div className={styles.topicContent}>
        <span className={`${styles.title} ${topic.status === 'Completed' ? styles.done : ''}`}>
          {topic.title}
        </span>
        <span className={styles.statusLabel} data-status={topic.status}>{topic.status}</span>
      </div>

      <div className={styles.actions}>
        <select
          className={styles.statusSelect}
          value={topic.status}
          onChange={e => onStatusChange(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          className={styles.deleteBtn}
          onClick={onDelete}
          title="Delete topic"
        >
          ×
        </button>
      </div>
    </div>
  )
}
