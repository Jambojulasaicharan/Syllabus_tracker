import styles from './PieChart.module.css'

export default function PieChart({ completed, inProgress, notStarted }) {
  const total = completed + inProgress + notStarted
  if (total === 0) return null

  const radius = 30
  const cx = 40
  const cy = 40
  const circumference = 2 * Math.PI * radius

  const segments = [
    { value: completed, color: 'var(--success)', label: 'Done' },
    { value: inProgress, color: 'var(--warning)', label: 'Active' },
    { value: notStarted, color: 'var(--border)', label: 'Left' },
  ].filter(s => s.value > 0)

  let cumulativeAngle = -90

  const arcs = segments.map(seg => {
    const angle = (seg.value / total) * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle

    const startRad = (startAngle * Math.PI) / 180
    const endRad = ((startAngle + angle) * Math.PI) / 180

    const x1 = cx + radius * Math.cos(startRad)
    const y1 = cy + radius * Math.sin(startRad)
    const x2 = cx + radius * Math.cos(endRad)
    const y2 = cy + radius * Math.sin(endRad)

    const largeArc = angle > 180 ? 1 : 0

    const path = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { ...seg, path, angle }
  })

  return (
    <div className={styles.wrap}>
      <svg viewBox="0 0 80 80" className={styles.svg}>
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={arc.path}
            fill={arc.color}
            opacity="0.85"
            className={styles.slice}
          />
        ))}
        <circle cx={cx} cy={cy} r="14" fill="var(--bg-card)" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)" fontWeight="600">
          {total}
        </text>
        <text x={cx} y={cy + 9} textAnchor="middle" dominantBaseline="middle" fontSize="5" fill="var(--text-muted)" fontFamily="var(--font)">
          total
        </text>
      </svg>
      <div className={styles.legend}>
        {segments.map((seg, i) => (
          <div key={i} className={styles.legendItem}>
            <div className={styles.legendDot} style={{ background: seg.color }} />
            <span className={styles.legendLabel}>{seg.label}</span>
            <span className={styles.legendVal}>{Math.round((seg.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
