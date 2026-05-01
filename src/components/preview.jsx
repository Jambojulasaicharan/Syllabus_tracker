import React from "react";
import styles from "./UnitPreview.module.css";

export default function UnitPreview({ unit, onClose }) {
  if (!unit) return null;

  function handleCopy() {
    const topicList = unit.topics
      .map((t, i) => `${i + 1}. ${t.title}`)
      .join("\n");

    const textToCopy = `I am studying "${unit.title}".

Here are the topics:

${topicList}

Explain these clearly with examples.`;

    navigator.clipboard.writeText(textToCopy);
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <h2>{unit.title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* List */}
        <div className={styles.list}>
          {unit.topics.map((topic, i) => (
            <div key={topic.id} className={styles.item}>
              <span className={styles.index}>{i + 1}</span>
              <div className={styles.content}>
                <p className={styles.text}>{topic.title}</p>
                <span className={styles.status}>{topic.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Copy Button */}
        <div className={styles.copyWrapper}>
          <button className={styles.copyBtn} onClick={handleCopy}>
            Copy All Topics
          </button>
        </div>

      </div>
    </div>
  );
}