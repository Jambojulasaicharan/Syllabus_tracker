import { useState, useEffect } from "react";
import SubjectCard from "./components/SubjectCard";
import SubjectDetail from "./components/SubjectDetail";
import AddSubjectModal from "./components/AddSubjectModal";
import styles from "./App.module.css";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import LoginPage from "./loginpage";
import { logout } from "./auth";

const STORAGE_KEY = "syllabus-tracker-data";

const defaultData = {
  subjects: [
    {
      id: "demo-1",
      name: "Mathematics",
      color: "#7c6af7",
      deadline: "2025-06-30",
      units: [
        {
          id: "u1",
          title: "Calculus & Transforms",
          topics: [
            { id: "t1", title: "Laplace Transforms", status: "Completed" },
            { id: "t2", title: "Fourier Series", status: "In Progress" },
            { id: "t3", title: "Vector Calculus", status: "Not Started" },
          ],
        },
        {
          id: "u2",
          title: "Linear Algebra & Equations",
          topics: [
            { id: "t4", title: "Differential Equations", status: "Completed" },
            { id: "t5", title: "Linear Algebra", status: "Not Started" },
          ],
        },
      ],
    },
    {
      id: "demo-2",
      name: "Physics",
      color: "#60a5fa",
      deadline: "2025-07-15",
      units: [
        {
          id: "u3",
          title: "Modern Physics",
          topics: [
            { id: "t6", title: "Quantum Mechanics", status: "In Progress" },
            { id: "t7", title: "Thermodynamics", status: "Completed" },
          ],
        },
        {
          id: "u4",
          title: "Classical Physics",
          topics: [
            { id: "t8", title: "Electromagnetism", status: "Not Started" },
          ],
        },
      ],
    },
    {
      id: "demo-3",
      name: "Data Structures",
      color: "#4ade80",
      deadline: "",
      units: [
        {
          id: "u5",
          title: "Fundamentals",
          topics: [
            { id: "t9", title: "Arrays & Strings", status: "Completed" },
            { id: "t10", title: "Trees & Graphs", status: "Completed" },
          ],
        },
        {
          id: "u6",
          title: "Advanced Topics",
          topics: [
            { id: "t11", title: "Dynamic Programming", status: "In Progress" },
            { id: "t12", title: "Sorting Algorithms", status: "Completed" },
          ],
        },
      ],
    },
  ],
};

export default function App() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        console.log("SNAP:", snap.exists(), snap.data());

        if (snap.exists()) {
          setData(snap.data());
        } else {
          await setDoc(ref, defaultData);
          setData(defaultData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);
  useEffect(() => {
    if (loading || !user) return;

    async function saveData() {
      try {
        const ref = doc(db, "users", user.uid);
        await setDoc(ref, data, { merge: true });
      } catch (err) {
        console.error(err);
      }
    }

    saveData();
  }, [data, user, loading]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      darkMode ? "dark" : "light",
    );
  }, [darkMode]);

  const filteredSubjects = data.subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Calculate all topics across all units
  const getAllTopics = (subject) => subject.units.flatMap((u) => u.topics);

  const totalTopics = data.subjects.reduce(
    (a, s) => a + getAllTopics(s).length,
    0,
  );
  const completedTopics = data.subjects.reduce(
    (a, s) =>
      a + getAllTopics(s).filter((t) => t.status === "Completed").length,
    0,
  );
  const overallProgress =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  function addSubject(subjectData) {
    const newSubject = {
      id: `subj-${Date.now()}`,
      name: subjectData.name,
      color: subjectData.color,
      deadline: subjectData.deadline || "",
      units: [],
    };
    setData((prev) => ({ ...prev, subjects: [...prev.subjects, newSubject] }));
  }

  function deleteSubject(id) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
    }));
    if (selectedSubject?.id === id) setSelectedSubject(null);
  }

  function updateSubject(updated) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === updated.id ? updated : s)),
    }));
    setSelectedSubject(updated);
  }

  function addUnit(subjectId, unitTitle) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: [
            ...s.units,
            {
              id: `u-${Date.now()}`,
              title: unitTitle,
              topics: [],
            },
          ],
        };
      }),
    }));
  }

  function addTopic(subjectId, unitId, topicData) {
  setData((prev) => ({
    ...prev,
    subjects: prev.subjects.map((s) => {
      if (s.id !== subjectId) return s;

      return {
        ...s,
        units: s.units.map((u) => {
          if (u.id !== unitId) return u;

          const newTopic =
  typeof topicData === "string"
    ? {
        id: crypto.randomUUID(),
        title: topicData,
        status: "Not Started",
      }
    : {
        id: crypto.randomUUID(),
        title: topicData.title,
        status: topicData.status || "Not Started",
      };

          return {
            ...u,
            topics: [...u.topics, newTopic],
          };
        }),
      };
    }),
  }));
}
  function updateTopicStatus(subjectId, unitId, topicId, newStatus) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.map((t) =>
                t.id === topicId ? { ...t, status: newStatus } : t,
              ),
            };
          }),
        };
      }),
    }));
  }

  function deleteTopic(subjectId, unitId, topicId) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.map((u) => {
            if (u.id !== unitId) return u;
            return {
              ...u,
              topics: u.topics.filter((t) => t.id !== topicId),
            };
          }),
        };
      }),
    }));
  }

  function deleteUnit(subjectId, unitId) {
    setData((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          units: s.units.filter((u) => u.id !== unitId),
        };
      }),
    }));
  }

  const selectedSubjectData = selectedSubject
    ? data.subjects.find((s) => s.id === selectedSubject.id)
    : null;
  if (authLoading) return <div>Loading...</div>;

  if (!user) return <LoginPage />;

  if (loading) return <div>Loading data...</div>;

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <div>
              <h1 className={styles.logoText}>SyllabusTracker</h1>
              <p className={styles.logoSub}>Your academic progress hub</p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.overallStats}>
              <div className={styles.statPill}>
                <span className={styles.statNum}>{data.subjects.length}</span>
                <span className={styles.statLabel}>Subjects</span>
              </div>
              <div className={styles.statPill}>
                <span
                  className={styles.statNum}
                  style={{ color: "var(--success)" }}
                >
                  {overallProgress}%
                </span>
                <span className={styles.statLabel}>Complete</span>
              </div>
            </div>
            <button
              className={styles.themeToggle}
              onClick={() => setDarkMode((d) => !d)}
              title="Toggle theme"
            >
              {darkMode ? "☀" : "◑"}
            </button>
          </div>
        </div>
      </header>
      {/* Main */}
      <main className={styles.main}>
        {/* Controls */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>⌕</span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className={styles.clearSearch}
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>
          <button
            className={styles.addBtn}
            onClick={() => setShowAddModal(true)}
          >
            <span>+</span> New Subject
          </button>
        </div>

        {/* Overall progress banner */}
        {data.subjects.length > 0 && (
          <div className={styles.overallBanner}>
            <div className={styles.bannerLeft}>
              <span className={styles.bannerLabel}>Overall Progress</span>
              <span className={styles.bannerDetail}>
                {completedTopics} of {totalTopics} topics done
              </span>
            </div>
            <div className={styles.bannerRight}>
              <div className={styles.bannerBar}>
                <div
                  className={styles.bannerFill}
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <span className={styles.bannerPercent}>{overallProgress}%</span>
            </div>
          </div>
        )}

        {/* Subject Grid */}
        {filteredSubjects.length === 0 ? (
          <div className={styles.emptyState}>
            {data.subjects.length === 0 ? (
              <>
                <div className={styles.emptyIcon}>◈</div>
                <h2>No subjects yet</h2>
                <p>
                  Add your first subject to start tracking your syllabus
                  progress.
                </p>
                <button
                  className={styles.addBtn}
                  onClick={() => setShowAddModal(true)}
                >
                  + Add Subject
                </button>
              </>
            ) : (
              <>
                <div className={styles.emptyIcon}>⌕</div>
                <h2>No results found</h2>
                <p>No subjects match "{search}"</p>
              </>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredSubjects.map((subject, i) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                index={i}
                onClick={() => setSelectedSubject(subject)}
                onDelete={() => deleteSubject(subject.id)}
              />
            ))}
          </div>
        )}
      </main>
      {/* Subject Detail Modal */}
      {selectedSubjectData && (
        <SubjectDetail
          subject={selectedSubjectData}
          onClose={() => setSelectedSubject(null)}
          onUpdate={updateSubject}
          onAddUnit={(subjectId, unitTitle) => addUnit(subjectId, unitTitle)}
          onAddTopic={(subjectId, unitId, topicTitle) =>
            addTopic(subjectId, unitId, topicTitle)
          }
          onUpdateTopicStatus={(subjectId, unitId, topicId, newStatus) =>
            updateTopicStatus(subjectId, unitId, topicId, newStatus)
          }
          onDeleteTopic={(subjectId, unitId, topicId) =>
            deleteTopic(subjectId, unitId, topicId)
          }
          onDeleteUnit={(subjectId, unitId) => deleteUnit(subjectId, unitId)}
        />
      )}
      {/* Add Subject Modal */}
      {showAddModal && (
        <AddSubjectModal
          onAdd={addSubject}
          onClose={() => setShowAddModal(false)}
        />
      )}

<div className={styles.header}>
  <button className={styles.logoutBtn} onClick={logout}>
    Logout
  </button>
</div>
      
    </div>
  );
}
