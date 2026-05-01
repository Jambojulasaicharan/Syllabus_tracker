import { useState, useRef, useEffect } from "react";
import TopicItem from "./TopicItem";
import styles from "./UnitSection.module.css";
import UnitPreview from "./preview";

export default function UnitSection({
  unit,
  subjectId,
  onAddTopic,
  onUpdateTopicStatus,
  onDeleteTopic,
  onDeleteUnit,
}) {
  const [newTopic, setNewTopic] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);
  const inputRef = useRef(null);
  const [previewUnit, setPreviewUnit] = useState(null);
  const topics = unit.topics || [];
  const completed = topics.filter((t) => t.status === "Completed").length;
  const inProgress = topics.filter((t) => t.status === "In Progress").length;
  const notStarted = topics.filter((t) => t.status === "Not Started").length;
  const total = topics.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  const [showTopicJson, setShowTopicJson] = useState(false);
  const [topicJsonInput, setTopicJsonInput] = useState("");
  const [topicJsonError, setTopicJsonError] = useState("");
  const [topicJsonSuccess, setTopicJsonSuccess] = useState("");

  function addTopic() {
    const title = newTopic.trim();
    if (!title) return;
    onAddTopic(subjectId, unit.id, title);
    setNewTopic("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addTopic();
  }
  function importTopicsFromJson() {
    setTopicJsonError("");
    setTopicJsonSuccess("");

    let parsed;
    try {
      parsed = JSON.parse(topicJsonInput);
    } catch {
      setTopicJsonError("Invalid JSON");
      return;
    }

    if (!Array.isArray(parsed)) {
      setTopicJsonError("Expected an array");
      return;
    }

    const VALID = ["Not Started", "In Progress", "Completed"];
    const topics = [];
    const errors = [];

    parsed.forEach((item, i) => {
      if (typeof item === "string") {
        if (!item.trim()) {
          errors.push(`Item ${i + 1} empty`);
          return;
        }

        topics.push({
          id: `t-${Date.now()}-${i}`,
          title: item.trim(),
          status: "Not Started",
        });
      } else if (typeof item === "object" && item !== null) {
        const title = (item.title || "").trim();

        if (!title) {
          errors.push(`Item ${i + 1} missing title`);
          return;
        }

        topics.push({
          id: `t-${Date.now()}-${i}`,
          title,
          status: VALID.includes(item.status) ? item.status : "Not Started",
        });
      }
    });

    if (topics.length === 0) {
      setTopicJsonError("No valid topics found");
      return;
    }

    // 🔥 Add topics to THIS unit
    topics.forEach((t) => {
      onAddTopic(subjectId, unit.id, t);
    });

    setTopicJsonSuccess(`Added ${topics.length} topics`);
    setTopicJsonInput("");
  }
  return (
    <div className={styles.unitSection}>
      {/* Unit Header */}
      <div className={styles.unitHeader}>
        <button
          className={styles.expandBtn}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? "Collapse unit" : "Expand unit"}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
        <h3 className={styles.unitTitle}>{unit.title}</h3>
        <div className={styles.unitStats}>
          {total > 0 && (
            <>
              <span className={styles.stat} title="Completed topics">
                <span
                  className={styles.statColor}
                  style={{ background: "var(--success)" }}
                />
                {completed}
              </span>
              <span className={styles.stat} title="In Progress topics">
                <span
                  className={styles.statColor}
                  style={{ background: "var(--warning)" }}
                />
                {inProgress}
              </span>
              <span className={styles.stat} title="Not Started topics">
                <span
                  className={styles.statColor}
                  style={{ background: "var(--border)" }}
                />
                {notStarted}
              </span>
              <span className={styles.progressLabel}>{progress}%</span>
            </>
          )}
        </div>
        {total > 0 && (
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        <button
          className={styles.deleteUnitBtn}
          onClick={() => onDeleteUnit(subjectId, unit.id)}
          title="Delete unit"
        >
          ×
        </button>
        <button
          className={styles.jsonToggleBtn}
          onClick={() => setPreviewUnit(unit)}
        >
          Preview
        </button>
        {previewUnit && (
          <UnitPreview
            unit={previewUnit}
            onClose={() => setPreviewUnit(null)}
          />
        )}
      </div>

      {/* Unit Content */}
      {isExpanded && (
        <div className={styles.unitContent}>
          {/* Add Topic Input */}
          <div className={styles.addTopicWrap}>
            <input
              ref={inputRef}
              className={styles.addTopicInput}
              type="text"
              placeholder="Add a new topic..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.addTopicBtn}
              onClick={addTopic}
              disabled={!newTopic.trim()}
              title="Add topic"
            >
              +
            </button>
            <button
              className={styles.jsonToggleBtn}
              onClick={() => setShowTopicJson((prev) => !prev)}
            >
              {showTopicJson ? "✖ Close JSON" : "{ } Import Topics"}
            </button>

            {showTopicJson && (
              <div className={styles.jsonImportBox}>
                <textarea
                  className={styles.jsonTextarea}
                  value={topicJsonInput}
                  onChange={(e) => {
                    setTopicJsonInput(e.target.value);
                    setTopicJsonError("");
                    setTopicJsonSuccess("");
                  }}
                  placeholder='["Topic A", {"title":"Topic B","status":"Completed"}]'
                  spellCheck={false}
                />

                {topicJsonError && (
                  <div className={styles.jsonError}>⚠ {topicJsonError}</div>
                )}

                {topicJsonSuccess && (
                  <div className={styles.jsonSuccess}>✓ {topicJsonSuccess}</div>
                )}

                <div className={styles.jsonActions}>
                  <button
                    className={styles.jsonClearBtn}
                    onClick={() => {
                      setTopicJsonInput("");
                      setTopicJsonError("");
                      setTopicJsonSuccess("");
                    }}
                    disabled={!topicJsonInput}
                  >
                    Clear
                  </button>

                  <button
                    className={styles.jsonImportBtn}
                    onClick={importTopicsFromJson}
                    disabled={!topicJsonInput.trim()}
                  >
                    Import Topics
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Topics List */}
          {topics.length === 0 ? (
            <div className={styles.emptyUnit}>
              <p>No topics yet. Add one above to get started!</p>
            </div>
          ) : (
            <div className={styles.topicsList}>
              {topics.map((topic, idx) => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  index={idx}
                  onStatusChange={(newStatus) =>
                    onUpdateTopicStatus(subjectId, unit.id, topic.id, newStatus)
                  }
                  onDelete={() => onDeleteTopic(subjectId, unit.id, topic.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
