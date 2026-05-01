import React from "react";
import styles from "./UnitPreview.module.css";

export default function UnitPreview({ unit, onClose }) {
  if (!unit) return null;

  function handleCopy() {
    const topicList = unit.topics
      .map((t, i) => `${i + 1}. ${t.title}`)
      .join("\n");

    const textToCopy = `You are a Computer Science Engineering Specialist in teaching "${unit.title}".

I want you to act like a practical teacher who explains concepts using real-life, daily examples so I can truly understand and remember them.

Here are the topics:

${topicList}

---

Instructions:

- Divide the topics into multiple parts, covering 3–5 topics per part
- Do NOT explain everything at once — wait for me to say "next" before continuing
- For each topic:
  - Start with a simple definition (1–2 lines)
  - Explain using a clear daily life example (very important)
  - Show a basic Java code example
  - Explain why it matters in real programming
- Use simple language (no heavy jargon)
- Build connections between topics where relevant
- Highlight common beginner mistakes
- Keep explanations clear, structured, and not overwhelming

---

Goal:

I want to understand these topics so well that:
- I can explain them in my own words
- I can write basic programs
- I can answer exam questions confidently

Start with Part 1 (first 3–5 topics).
`;

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
