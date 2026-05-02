import React from "react";
import styles from "./UnitPreview.module.css";

export default function UnitPreview({ unit, onClose }) {
  if (!unit) return null;

  function handleCopy() {
  const topicList = unit.topics
    .filter(t => t.status !== "Completed") // 🔥 filter first
    .map((t, i) => `${i + 1}. ${t.title}`)
    .join("\n");

    const textToCopy = `You are an expert teacher in "${unit.title}".

I want you to teach in a way that ensures COMPLETE UNDERSTANDING, not just surface-level explanation.

Here are the topics:

${topicList}

---

Instructions:

- Divide the topics into multiple parts
- Cover ONLY 2–3 topics per part to maintain depth and clarity
- Do NOT explain everything at once — wait for me to say "next" before continuing

For EACH topic, follow this exact structure:

1. What is it?
   - Simple definition in 1–2 lines (in your own words)

2. Why does it exist?
   - What problem does it solve?

3. Where is it used?
   - Real-life or practical applications

4. How does it work?
   - Step-by-step explanation of the core logic

5. Structure / Types / Key Components
   - Break the topic into parts if applicable

6. Examples
   - One simple example
   - One slightly harder example

7. Application
   - Solve a problem / show usage (code, formula, or case depending on subject)

8. Common mistakes
   - Highlight typical beginner errors

9. Connections
   - Link with related or previously learned topics

---

Rules:

- Use very simple language (avoid heavy jargon)
- Focus on depth, not speed
- Do not skip any step
- Do not overload with unnecessary theory
- Make it feel like a real teacher explaining patiently

---

Goal:

I want to:
- Fully understand the topic
- Be able to explain it in my own words
- Apply it in problems or real situations
- Handle exam questions confidently

Start with Part 1 (only 2–3 topics).
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
