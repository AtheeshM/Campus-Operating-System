import { useEffect, useMemo, useState } from "react";
import "./PandaAI.css";

import {
  getCourses,
  getStudentMaterials,
  getStudentAssignments,
  getAssignmentSubmission,
  chatWithAI,
} from "../../services/api";

const STORAGE_KEY =
  "campusos_panda_conversation_v1";

const CHATS_STORAGE_KEY =
  "campusos_panda_chats_v1";

const SETTINGS_KEY =
  "campusos_panda_settings_v1";

const NOTIFICATION_STORAGE_KEY =
  "campusos_panda_assignment_notifications_v1";

const DEFAULT_SETTINGS = {
  enabled: true,
  mode: "floating",
  position: "bottom-right",
  showMessages: true,
};

const EMOTIONS = {
  idle: {
    label: "Idle",
    message:
      "Hey! I'm here whenever you need me. 🐼",
  },

  happy: {
    label: "Happy",
    message:
      "Nice! You're making great progress! ✨",
  },

  encourage: {
    label: "Encourage",
    message:
      "You've got this. Keep going! 💪",
  },

  thinking: {
    label: "Thinking",
    message:
      "Hmm... let me think about that. 🤔",
  },

  sad: {
    label: "Sad",
    message:
      "Don't worry. One difficult moment doesn't define you. 💙",
  },

  laughing: {
    label: "Laughing",
    message:
      "Haha! That was a good one! 😂",
  },

  celebrate: {
    label: "Celebrate",
    message:
      "Let's gooo! That's worth celebrating! 🎉",
  },

  reminder: {
    label: "Reminder",
    message:
      "Psst... you have something important coming up. ⏰",
  },
};

function loadJson(key, fallback) {
  try {
    const storedValue =
      localStorage.getItem(key);

    return storedValue
      ? JSON.parse(storedValue)
      : fallback;
  } catch {
    return fallback;
  }
}

/* =====================================================
   CHAT SESSION HELPERS
   ===================================================== */

function createChatSession() {
  return {
    id: `panda-chat-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,

    title: "New conversation",

    messages: [],

    createdAt: Date.now(),

    updatedAt: Date.now(),
  };
}

function createChatTitle(text) {
  const cleanedText = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    return "New conversation";
  }

  return cleanedText.length > 42
    ? `${cleanedText.slice(0, 42)}...`
    : cleanedText;
}

function normalizeChatSessions(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (chat) =>
        chat &&
        typeof chat === "object" &&
        chat.id
    )
    .map((chat) => ({
      id: chat.id,

      title:
        chat.title ||
        "New conversation",

      messages: Array.isArray(chat.messages)
        ? chat.messages
        : [],

      createdAt:
        chat.createdAt ||
        Date.now(),

      updatedAt:
        chat.updatedAt ||
        chat.createdAt ||
        Date.now(),
    }));
}

function loadChatSessions() {
  const storedChats = loadJson(
    CHATS_STORAGE_KEY,
    null
  );

  if (Array.isArray(storedChats)) {
    return normalizeChatSessions(
      storedChats
    );
  }

  const oldHistory = loadJson(
    STORAGE_KEY,
    []
  );

  if (
    Array.isArray(oldHistory) &&
    oldHistory.length > 0
  ) {
    const chat = createChatSession();

    chat.title =
      oldHistory.find(
        (item) =>
          item.role === "user" &&
          item.text
      )?.text ||
      "Previous conversation";

    chat.messages = oldHistory;

    return [chat];
  }

  return [];
}

function formatChatDate(timestamp) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* =====================================================
   ASSIGNMENT REMINDER HELPERS
   ===================================================== */

function parsePandaDueDate(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] =
      value.split("-").map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    return Number.isNaN(date.getTime())
      ? null
      : date;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function getPandaDaysUntilDue(
  dueDateValue
) {
  const dueDate =
    parsePandaDueDate(dueDateValue);

  if (!dueDate) {
    return null;
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const dueDay = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  return Math.ceil(
    (dueDay.getTime() -
      today.getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

function getPandaAssignmentReminder(
  assignment,
  daysUntilDue
) {
  const title =
    assignment?.title ||
    assignment?.name ||
    "your assignment";

  if (daysUntilDue === 0) {
    return {
      message: `Due today daa! ⏰ "${title}" needs your attention.`,
      priority: 0,
    };
  }

  if (daysUntilDue === 1) {
    return {
      message: `Due date is near daa! ⏰ "${title}" is due tomorrow.`,
      priority: 1,
    };
  }

  if (
    daysUntilDue >= 2 &&
    daysUntilDue <= 3
  ) {
    return {
      message: `Psst daa... "${title}" is due in ${daysUntilDue} days. Better start now! 📚`,
      priority: 2,
    };
  }

  return null;
}

/* =====================================================
   PANDA CHARACTER
   ===================================================== */

function PandaCharacter({
  emotion,
  reactionKey,
}) {
  return (
    <div
      key={reactionKey}
      className={`panda-character panda-${emotion}`}
      aria-label={`panDA ${EMOTIONS[emotion].label}`}
    >
      <span className="panda-emoji">
        🐼
      </span>
    </div>
  );
}

/* =====================================================
   MAIN COMPONENT
   ===================================================== */

function PandaAI() {
  const [settings, setSettings] =
    useState(() =>
      loadJson(
        SETTINGS_KEY,
        DEFAULT_SETTINGS
      )
    );

  const [chatSessions, setChatSessions] =
    useState(() =>
      loadChatSessions()
    );

  const [activeChatId, setActiveChatId] =
    useState(() => {
      const chats =
        loadChatSessions();

      return chats[0]?.id || null;
    });

  const [chatOpen, setChatOpen] =
    useState(false);

  const [chatView, setChatView] =
    useState("mini");

  const [emotion, setEmotion] =
    useState("idle");

  const [message, setMessage] =
    useState(
      EMOTIONS.idle.message
    );

  const [settingsOpen, setSettingsOpen] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [courses, setCourses] =
    useState([]);

  const [materials, setMaterials] =
    useState([]);

  const [assignments, setAssignments] =
    useState([]);

  const [submissions, setSubmissions] =
    useState({});

  const [
    academicContextReady,
    setAcademicContextReady,
  ] = useState(false);

  const [reactionKey, setReactionKey] =
    useState(0);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =====================================================
     ACTIVE CHAT
     ===================================================== */

  const activeChat =
    chatSessions.find(
      (chat) =>
        chat.id === activeChatId
    ) || null;

  const history =
    activeChat?.messages || [];

  /* =====================================================
     PERSIST CHAT SESSIONS
     ===================================================== */

  useEffect(() => {
    const sessionsToSave =
      normalizeChatSessions(
        chatSessions
      )
        .filter(
          (chat) =>
            Array.isArray(chat.messages) &&
            chat.messages.length > 0
        )
        .slice(0, 30);

    localStorage.setItem(
      CHATS_STORAGE_KEY,
      JSON.stringify(
        sessionsToSave
      )
    );
  }, [chatSessions]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(history.slice(-40))
    );
  }, [history]);

  /* =====================================================
     PERSIST SETTINGS
     ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [settings]);

  /* =====================================================
     DASHBOARD -> PANDA

     DO NOT CHANGE THIS EVENT.
     ===================================================== */

  useEffect(() => {
    const handleOpenPanda = () => {
      const newChat =
        createChatSession();

      setChatSessions(
        (currentSessions) => [
          newChat,
          ...currentSessions,
        ]
      );

      setActiveChatId(
        newChat.id
      );

      setChatView("fullscreen");

      setChatOpen(true);

      setInput("");

      setError("");

      setEmotion("idle");

      setMessage(
        EMOTIONS.idle.message
      );

      setReactionKey(
        (currentKey) =>
          currentKey + 1
      );

      setSettingsOpen(false);
    };

    window.addEventListener(
      "campusos:open-panda",
      handleOpenPanda
    );

    return () => {
      window.removeEventListener(
        "campusos:open-panda",
        handleOpenPanda
      );
    };
  }, []);

  /* =====================================================
     LOAD STUDENT ACADEMIC CONTEXT
     ===================================================== */

  useEffect(() => {
    const role =
      localStorage.getItem(
        "campusos_role"
      );

    if (role !== "STUDENT") {
      setAcademicContextReady(
        true
      );

      return;
    }

    let cancelled = false;

    const loadAcademicContext =
      async () => {
        try {
          setAcademicContextReady(
            false
          );

          const [
            coursesData,
            materialsData,
            assignmentsData,
          ] = await Promise.all([
            getCourses(),
            getStudentMaterials(),
            getStudentAssignments(),
          ]);

          if (cancelled) {
            return;
          }

          const loadedCourses =
            coursesData?.courses ||
            [];

          const loadedMaterials =
            materialsData?.materials ||
            [];

          const loadedAssignments =
            assignmentsData?.assignments ||
            [];

          setCourses(
            loadedCourses
          );

          setMaterials(
            loadedMaterials
          );

          setAssignments(
            loadedAssignments
          );

          if (
            loadedAssignments.length ===
            0
          ) {
            setSubmissions({});
          } else {
            const submissionResults =
              await Promise.all(
                loadedAssignments.map(
                  async (assignment) => {
                    try {
                      const data =
                        await getAssignmentSubmission(
                          assignment._id
                        );

                      return {
                        assignmentId:
                          assignment._id,

                        submission:
                          data?.submission ||
                          null,
                      };
                    } catch {
                      return {
                        assignmentId:
                          assignment._id,

                        submission:
                          null,
                      };
                    }
                  }
                )
              );

            if (cancelled) {
              return;
            }

            const submissionMap =
              {};

            submissionResults.forEach(
              ({
                assignmentId,
                submission,
              }) => {
                submissionMap[
                  assignmentId
                ] = submission;
              }
            );

            setSubmissions(
              submissionMap
            );
          }
        } catch (err) {
          console.error(
            "panDA learning context error:",
            err
          );
        } finally {
          if (!cancelled) {
            setAcademicContextReady(
              true
            );
          }
        }
      };

    loadAcademicContext();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     PROACTIVE ASSIGNMENT NOTIFICATIONS
     ===================================================== */

  useEffect(() => {
    if (!academicContextReady) {
      return;
    }

    if (
      !Array.isArray(assignments) ||
      assignments.length === 0
    ) {
      return;
    }

    const pendingReminders =
      assignments
        .map((assignment) => {
          const assignmentId =
            assignment?._id;

          if (!assignmentId) {
            return null;
          }

          const submission =
            submissions[
              assignmentId
            ];

          if (submission) {
            return null;
          }

          /*
           * Support the normal dueDate field.
           * Also safely support common alternate
           * deadline field names without changing
           * the backend.
           */
          const dueDateValue =
            assignment?.dueDate ||
            assignment?.deadline ||
            assignment?.due_date ||
            null;

          if (!dueDateValue) {
            return null;
          }

          const daysUntilDue =
            getPandaDaysUntilDue(
              dueDateValue
            );

          if (
            daysUntilDue === null ||
            daysUntilDue < 0 ||
            daysUntilDue > 3
          ) {
            return null;
          }

          const reminder =
            getPandaAssignmentReminder(
              assignment,
              daysUntilDue
            );

          if (!reminder) {
            return null;
          }

          return {
            assignment,
            assignmentId,
            daysUntilDue,
            ...reminder,
          };
        })
        .filter(Boolean)
        .sort(
          (a, b) =>
            a.daysUntilDue -
            b.daysUntilDue
        );

    if (
      pendingReminders.length === 0
    ) {
      return;
    }

    const nearestReminder =
      pendingReminders[0];

    const signature =
      `${nearestReminder.assignmentId}:${nearestReminder.daysUntilDue}`;

    const shownNotifications =
      loadJson(
        NOTIFICATION_STORAGE_KEY,
        {}
      );

    if (
      shownNotifications[signature]
    ) {
      return;
    }

    shownNotifications[
      signature
    ] = Date.now();

    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(
        shownNotifications
      )
    );

    setEmotion("reminder");

    setMessage(
      nearestReminder.message
    );

    setReactionKey(
      (currentKey) =>
        currentKey + 1
    );
  }, [
    academicContextReady,
    assignments,
    submissions,
  ]);

  /* =====================================================
     PANDA STATE
     ===================================================== */

  const isMoving =
    settings.mode ===
    "floating";

  const positionClass =
    `panda-position-${settings.position}`;

  const currentMessage =
    useMemo(
      () =>
        settings.showMessages
          ? message
          : "",

      [
        message,
        settings.showMessages,
      ]
    );

  /* =====================================================
     EMOTION
     ===================================================== */

  const react = (nextEmotion) => {
    if (!EMOTIONS[nextEmotion]) {
      return;
    }

    setEmotion(nextEmotion);

    setMessage(
      EMOTIONS[nextEmotion]
        .message
    );

    setReactionKey(
      (currentKey) =>
        currentKey + 1
    );
  };

  /* =====================================================
     FLOATING CHAT
     ===================================================== */

  const startFloatingChat =
    () => {
      const newChat =
        createChatSession();

      setChatSessions(
        (currentSessions) => [
          newChat,
          ...currentSessions,
        ]
      );

      setActiveChatId(
        newChat.id
      );

      setChatView("mini");

      setChatOpen(true);

      setInput("");

      setError("");

      setEmotion("idle");

      setMessage(
        EMOTIONS.idle.message
      );

      setReactionKey(
        (currentKey) =>
          currentKey + 1
      );

      setSettingsOpen(false);
    };

  /* =====================================================
     CLOSE CHAT
     ===================================================== */

  const closeChat = () => {
    setChatOpen(false);

    setInput("");

    setError("");

    setSettingsOpen(false);

    setLoading(false);

    setEmotion("idle");

    setMessage(
      EMOTIONS.idle.message
    );

    setReactionKey(
      (currentKey) =>
        currentKey + 1
    );
  };

  /* =====================================================
     DELETE CHAT
     ===================================================== */

  const deleteChat = (
    chatId
  ) => {
    setChatSessions(
      (currentSessions) => {
        const remaining =
          currentSessions.filter(
            (chat) =>
              chat.id !== chatId
          );

        if (
          chatId ===
          activeChatId
        ) {
          if (
            remaining.length >
            0
          ) {
            setActiveChatId(
              remaining[0].id
            );
          } else {
            const newChat =
              createChatSession();

            setActiveChatId(
              newChat.id
            );

            return [
              newChat,
            ];
          }
        }

        return remaining;
      }
    );

    setInput("");

    setError("");
  };

  /* =====================================================
     OPEN HISTORY CHAT
     ===================================================== */

  const openHistoryChat =
    (chatId) => {
      const selectedChat =
        chatSessions.find(
          (chat) =>
            chat.id === chatId
        );

      if (!selectedChat) {
        return;
      }

      setActiveChatId(
        selectedChat.id
      );

      setChatView("fullscreen");

      setChatOpen(true);

      setInput("");

      setError("");

      setSettingsOpen(false);
    };

  /* =====================================================
     NEW FULLSCREEN CHAT
     ===================================================== */

  const startNewFullscreenChat =
    () => {
      const newChat =
        createChatSession();

      setChatSessions(
        (currentSessions) => [
          newChat,
          ...currentSessions,
        ]
      );

      setActiveChatId(
        newChat.id
      );

      setChatView("fullscreen");

      setChatOpen(true);

      setInput("");

      setError("");

      setEmotion("idle");

      setMessage(
        EMOTIONS.idle.message
      );

      setReactionKey(
        (currentKey) =>
          currentKey + 1
      );

      setSettingsOpen(false);
    };

  /* =====================================================
     COURSE MATCHING
     ===================================================== */

  const findMentionedCourse =
    (text) => {
      const lowerText =
        text.toLowerCase();

      return (
        courses.find((course) => {
          const code =
            course.code
              ?.toLowerCase() ||
            "";

          const name =
            course.name
              ?.toLowerCase() ||
            "";

          return (
            (code &&
              lowerText.includes(
                code
              )) ||
            (name &&
              lowerText.includes(
                name
              ))
          );
        }) || null
      );
    };

  /* =====================================================
     COURSE RESPONSE
     ===================================================== */

  const getCourseResponse =
    (course) => {
      if (!course) {
        return null;
      }

      const materialsForCourse =
        materials.filter(
          (material) => {
            const materialCourseId =
              material.course?._id ||
              material.course;

            return (
              materialCourseId
                ?.toString() ===
              course._id?.toString()
            );
          }
        );

      const assignmentsForCourse =
        assignments.filter(
          (assignment) => {
            const assignmentCourseId =
              assignment.course?._id ||
              assignment.course;

            return (
              assignmentCourseId
                ?.toString() ===
              course._id?.toString()
            );
          }
        );

      return `For ${
        course.code ||
        course.name ||
        "this course"
      }, CampusOS currently has ${
        materialsForCourse.length
      } learning resource${
        materialsForCourse.length !==
        1
          ? "s"
          : ""
      } and ${
        assignmentsForCourse.length
      } assignment${
        assignmentsForCourse.length !==
        1
          ? "s"
          : ""
      } available.`;
    };

  /* =====================================================
     FAST CAMPUSOS RESPONSE
     ===================================================== */

  const getFastCampusResponse =
    (text) => {
      const lowerText =
        text.toLowerCase();

      if (
        /submitted|submission|submit/.test(
          lowerText
        )
      ) {
        const submittedAssignments =
          assignments.filter(
            (assignment) =>
              Boolean(
                submissions[
                  assignment._id
                ]
              )
          );

        if (
          submittedAssignments.length >
          0
        ) {
          return `You have submitted ${submittedAssignments.length} assignment${
            submittedAssignments.length !==
            1
              ? "s"
              : ""
          }. Nice work! ✅`;
        }

        return "I couldn't find any submitted assignments yet.";
      }

      if (
        /pending|remaining|assignment|deadline|due/.test(
          lowerText
        )
      ) {
        const pendingAssignments =
          assignments.filter(
            (assignment) =>
              !submissions[
                assignment._id
              ]
          );

        if (
          pendingAssignments.length ===
          0
        ) {
          return "Looks like you don't have any pending assignments right now. 🎉";
        }

        const upcoming =
          pendingAssignments
            .map(
              (assignment) => {
                const dueDateValue =
                  assignment?.dueDate ||
                  assignment?.deadline ||
                  assignment?.due_date ||
                  null;

                const days =
                  getPandaDaysUntilDue(
                    dueDateValue
                  );

                return {
                  assignment,
                  days,
                };
              }
            )
            .filter(
              ({
                days,
              }) =>
                days !== null
            )
            .sort(
              (a, b) =>
                a.days - b.days
            );

        if (
          upcoming.length > 0
        ) {
          const nearest =
            upcoming[0];

          const title =
            nearest.assignment
              .title ||
            nearest.assignment
              .name ||
            "Assignment";

          if (
            nearest.days === 0
          ) {
            return `You have ${pendingAssignments.length} pending assignment${
              pendingAssignments.length !==
              1
                ? "s"
                : ""
            }. "${title}" is due today! ⏰`;
          }

          if (
            nearest.days === 1
          ) {
            return `You have ${pendingAssignments.length} pending assignment${
              pendingAssignments.length !==
              1
                ? "s"
                : ""
            }. "${title}" is due tomorrow. ⏰`;
          }

          return `You have ${pendingAssignments.length} pending assignment${
            pendingAssignments.length !==
            1
              ? "s"
              : ""
          }. The nearest deadline is "${title}" in ${nearest.days} days. 📚`;
        }

        return `You have ${pendingAssignments.length} pending assignment${
          pendingAssignments.length !==
          1
            ? "s"
            : ""
        }.`;
      }

      if (
        /mark|marks|score|grade|feedback/.test(
          lowerText
        )
      ) {
        const assignmentsWithMarks =
          assignments.filter(
            (assignment) => {
              const submission =
                submissions[
                  assignment._id
                ];

              return (
                submission &&
                (
                  submission.marks !==
                    undefined ||
                  submission.score !==
                    undefined ||
                  submission.feedback
                )
              );
            }
          );

        if (
          assignmentsWithMarks.length ===
          0
        ) {
          return "I don't have assignment marks or feedback available yet.";
        }

        const details =
          assignmentsWithMarks
            .slice(0, 5)
            .map(
              (assignment) => {
                const submission =
                  submissions[
                    assignment._id
                  ];

                const title =
                  assignment.title ||
                  assignment.name ||
                  "Assignment";

                const mark =
                  submission.marks ??
                  submission.score;

                return `${title}: ${
                  mark ??
                  "feedback available"
                }`;
              }
            )
            .join(" • ");

        return `Here's what I found: ${details}`;
      }

      return null;
    };

  /* =====================================================
     EMOTION FROM USER MESSAGE
     ===================================================== */

  const getEmotionForMessage =
    (text) => {
      const lowerMessage =
        text.toLowerCase();

      if (
        /thank|great|good|nice|awesome|happy/.test(
          lowerMessage
        )
      ) {
        return "happy";
      }

      if (
        /completed|passed|won|finished|success/.test(
          lowerMessage
        )
      ) {
        return "celebrate";
      }

      if (
        /sad|fail|failed|bad|can't|cannot|difficult|hard/.test(
          lowerMessage
        )
      ) {
        return "encourage";
      }

      if (
        /haha|lol|funny|joke/.test(
          lowerMessage
        )
      ) {
        return "laughing";
      }

      if (
        /remind|tomorrow|deadline|exam|due/.test(
          lowerMessage
        )
      ) {
        return "reminder";
      }

      return "thinking";
    };

  /* =====================================================
     BUILD LEARNING CONTEXT
     ===================================================== */

  const buildLearningContext =
    () => {
      const pendingAssignments =
        assignments.filter(
          (assignment) =>
            !submissions[
              assignment._id
            ]
        );

      const submittedAssignments =
        assignments.filter(
          (assignment) =>
            Boolean(
              submissions[
                assignment._id
              ]
            )
        );

      const assignmentSummary =
        assignments
          .slice(0, 15)
          .map(
            (assignment) => {
              const submission =
                submissions[
                  assignment._id
                ];

              const dueDateValue =
                assignment?.dueDate ||
                assignment?.deadline ||
                assignment?.due_date ||
                null;

              const daysUntilDue =
                getPandaDaysUntilDue(
                  dueDateValue
                );

              return {
                id:
                  assignment._id,

                title:
                  assignment.title ||
                  assignment.name ||
                  "",

                course:
                  assignment.course
                    ?.code ||
                  assignment.course ||
                  "",

                dueDate:
                  dueDateValue,

                daysUntilDue,

                submitted:
                  Boolean(
                    submission
                  ),

                marks:
                  submission?.marks ??
                  submission?.score ??
                  null,

                feedback:
                  submission?.feedback ||
                  "",
              };
            }
          );

      return {
        courses: courses.map(
          (course) => ({
            id: course._id,

            code:
              course.code || "",

            name:
              course.name || "",

            credits:
              course.credits || 0,

            semester:
              course.semester || "",
          })
        ),

        materials: materials
          .slice(0, 20)
          .map(
            (material) => ({
              id:
                material._id,

              title:
                material.title ||
                "",

              type:
                material.fileType ||
                "",

              course:
                material.course
                  ?.code ||
                material.course ||
                "",
            })
          ),

        assignments:
          assignmentSummary,

        pendingAssignments:
          pendingAssignments.map(
            (assignment) =>
              assignment.title ||
              assignment.name ||
              "Assignment"
          ),

        submittedAssignments:
          submittedAssignments.map(
            (assignment) =>
              assignment.title ||
              assignment.name ||
              "Assignment"
          ),
      };
    };

  /* =====================================================
     APPEND MESSAGE
     ===================================================== */

  const appendMessageToChat =
    (chatId, newMessage) => {
      setChatSessions(
        (currentSessions) =>
          currentSessions.map(
            (chat) => {
              if (
                chat.id !== chatId
              ) {
                return chat;
              }

              const updatedMessages =
                [
                  ...chat.messages,
                  newMessage,
                ];

              const firstUserMessage =
                updatedMessages.find(
                  (item) =>
                    item.role ===
                      "user" &&
                    item.text
                );

              return {
                ...chat,

                title:
                  chat.title ===
                    "New conversation" &&
                  firstUserMessage
                    ? createChatTitle(
                        firstUserMessage.text
                      )
                    : chat.title,

                messages:
                  updatedMessages,

                updatedAt:
                  Date.now(),
              };
            }
          )
      );
    };

  /* =====================================================
     SEND MESSAGE
     ===================================================== */

  const sendMessage = async (
    event
  ) => {
    event.preventDefault();

    const trimmedMessage =
      input.trim();

    if (
      !trimmedMessage ||
      loading
    ) {
      return;
    }

    let targetChatId =
      activeChatId;

    if (!targetChatId) {
      const newChat =
        createChatSession();

      targetChatId =
        newChat.id;

      setChatSessions(
        (currentSessions) => [
          newChat,
          ...currentSessions,
        ]
      );

      setActiveChatId(
        targetChatId
      );
    }

    setError("");

    const nextEmotion =
      getEmotionForMessage(
        trimmedMessage
      );

    setEmotion(
      nextEmotion
    );

    setMessage(
      EMOTIONS[nextEmotion]
        .message
    );

    setReactionKey(
      (currentKey) =>
        currentKey + 1
    );

    const userEntry = {
      role: "user",

      text: trimmedMessage,

      time: Date.now(),
    };

    appendMessageToChat(
      targetChatId,
      userEntry
    );

    setInput("");

    try {
      setLoading(true);

      const fastResponse =
        getFastCampusResponse(
          trimmedMessage
        );

      if (fastResponse) {
        appendMessageToChat(
          targetChatId,
          {
            role: "panda",

            text: fastResponse,

            time:
              Date.now() + 1,
          }
        );

        return;
      }

      const mentionedCourse =
        findMentionedCourse(
          trimmedMessage
        );

      if (
        mentionedCourse &&
        /course|subject|credits|semester|material|resource/.test(
          trimmedMessage.toLowerCase()
        )
      ) {
        const courseResponse =
          getCourseResponse(
            mentionedCourse
          );

        if (courseResponse) {
          appendMessageToChat(
            targetChatId,
            {
              role: "panda",

              text: courseResponse,

              time:
                Date.now() + 1,
            }
          );

          return;
        }
      }

      const context =
        buildLearningContext();

      const aiResponse =
        await chatWithAI(
          trimmedMessage,
          context
        );

      const responseText =
        typeof aiResponse ===
        "string"
          ? aiResponse
          : aiResponse?.response ||
            aiResponse?.message ||
            aiResponse?.text ||
            "I'm here, but I couldn't generate a response right now.";

      appendMessageToChat(
        targetChatId,
        {
          role: "panda",

          text: responseText,

          time:
            Date.now() + 1,
        }
      );
    } catch (err) {
      console.error(
        "panDA AI error:",
        err
      );

      setError(
        err?.message ||
          "panDA couldn't connect to the AI service."
      );

      appendMessageToChat(
        targetChatId,
        {
          role: "panda",

          text:
            "Sorry daa, I couldn't reach the AI service right now. Please check whether the CampusOS AI/Ollama service is running. 🐼",

          time:
            Date.now() + 1,
        }
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     SETTINGS
     ===================================================== */

  if (!settings.enabled) {
    return null;
  }

  /* =====================================================
     FULLSCREEN PANDA
     ===================================================== */

  if (
    chatOpen &&
    chatView === "fullscreen"
  ) {
    return (
      <div className="panda-fullscreen-overlay">
        <div className="panda-fullscreen-app">

          <aside className="panda-fullscreen-sidebar">

            <div className="panda-sidebar-brand">
              <span>🐼</span>

              <div>
                <strong>
                  panDA
                </strong>

                <small>
                  CampusOS AI
                </small>
              </div>
            </div>

            <button
              type="button"
              className="panda-new-chat-button"
              onClick={
                startNewFullscreenChat
              }
            >
              + New Chat
            </button>

            <div className="panda-history-heading">
              <span>
                CHAT HISTORY
              </span>
            </div>

            <div className="panda-history-list">
              {chatSessions.filter(
                (chat) =>
                  chat.messages &&
                  chat.messages.length >
                    0
              ).length === 0 ? (
                <div className="panda-history-empty">
                  No previous chats yet.
                </div>
              ) : (
                chatSessions
                  .filter(
                    (chat) =>
                      chat.messages &&
                      chat.messages.length >
                        0
                  )
                  .map(
                    (chat) => (
                      <div
                        key={chat.id}
                        className={`
                          panda-history-item
                          ${
                            chat.id ===
                            activeChatId
                              ? "active"
                              : ""
                          }
                        `}
                      >
                        <button
                          type="button"
                          className="panda-history-chat-button"
                          onClick={() =>
                            openHistoryChat(
                              chat.id
                            )
                          }
                        >
                          <strong>
                            {chat.title}
                          </strong>

                          <span>
                            {formatChatDate(
                              chat.updatedAt
                            )}
                          </span>
                        </button>

                        <button
                          type="button"
                          className="panda-delete-chat-button"
                          onClick={() =>
                            deleteChat(
                              chat.id
                            )
                          }
                          aria-label={`Delete ${chat.title}`}
                          title="Delete chat"
                        >
                          ×
                        </button>
                      </div>
                    )
                  )
              )}
            </div>
          </aside>

          <main className="panda-fullscreen-main">

            <header className="panda-fullscreen-header">

              <div className="panda-fullscreen-header-title">
                <span>🐼</span>

                <div>
                  <strong>
                    panDA
                  </strong>

                  <small>
                    Your CampusOS companion
                  </small>
                </div>
              </div>

              <button
                type="button"
                className="panda-fullscreen-close"
                onClick={
                  closeChat
                }
                aria-label="Close panDA"
              >
                ×
              </button>
            </header>

            <div className="panda-fullscreen-history">

              {history.length ===
              0 ? (
                <div className="panda-fullscreen-empty">

                  <div className="panda-fullscreen-empty-icon">
                    🐼
                  </div>

                  <h2>
                    How can I help you?
                  </h2>

                  <p>
                    Ask panDA about your
                    courses, assignments,
                    learning materials or
                    anything related to
                    CampusOS.
                  </p>

                </div>
              ) : (
                history.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={`${item.time}-${index}`}
                      className={`
                        panda-fullscreen-message-row
                        ${item.role}
                      `}
                    >
                      {item.role ===
                        "panda" && (
                        <div className="panda-message-avatar">
                          🐼
                        </div>
                      )}

                      <div className="panda-fullscreen-message">
                        {item.text}
                      </div>
                    </div>
                  )
                )
              )}

              {loading && (
                <div className="panda-fullscreen-message-row panda">
                  <div className="panda-message-avatar">
                    🐼
                  </div>

                  <div className="panda-fullscreen-message panda-thinking-message">
                    panDA is thinking... 🤔
                  </div>
                </div>
              )}

            </div>

            {error && (
              <div className="panda-fullscreen-error">
                {error}
              </div>
            )}

            <div className="panda-fullscreen-bottom">

              <div className="panda-quick-actions">

                <button
                  type="button"
                  onClick={() =>
                    react("happy")
                  }
                >
                  ✨ Progress
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "encourage"
                    )
                  }
                >
                  💪 Encourage me
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "reminder"
                    )
                  }
                >
                  ⏰ Reminders
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "celebrate"
                    )
                  }
                >
                  🎉 Celebrate
                </button>

              </div>

              <form
                className="panda-fullscreen-input-form"
                onSubmit={
                  sendMessage
                }
              >
                <input
                  value={input}
                  onChange={(
                    event
                  ) =>
                    setInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="Message panDA..."
                  disabled={
                    loading
                  }
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                >
                  {loading
                    ? "..."
                    : "Send"}
                </button>
              </form>

              <p className="panda-disclaimer">
                panDA can make mistakes.
                Verify important academic
                information with CampusOS.
              </p>

            </div>
          </main>
        </div>
      </div>
    );
  }

  /* =====================================================
     FLOATING / MINI PANDA
     ===================================================== */

  return (
    <div
      className={`
        panda-root
        ${positionClass}
        ${
          isMoving
            ? "panda-floating"
            : "panda-static"
        }
        ${
          chatOpen &&
          chatView === "mini"
            ? "panda-mini-open"
            : ""
        }
      `}
    >
      <div className="panda-message-wrap">

        {/* Reminder cloud only */}
        {currentMessage &&
          !chatOpen &&
          emotion === "reminder" && (
            <button
              className="panda-speech"
              onClick={
                startFloatingChat
              }
              type="button"
            >
              <span className="panda-speech-icon">
                ⏰
              </span>

              <span className="panda-speech-text">
                {currentMessage}
              </span>
            </button>
          )}

        {chatOpen &&
          chatView === "mini" && (
            <section className="panda-chat-window">

              <header className="panda-chat-header">

                <div>
                  <strong>
                    panDA
                  </strong>

                  <span>
                    Your CampusOS companion
                  </span>
                </div>

                <div className="panda-chat-header-actions">

                  <button
                    type="button"
                    onClick={() => {
                      setChatView(
                        "fullscreen"
                      );
                    }}
                    aria-label="Open full-screen panDA"
                    title="Open full screen"
                  >
                    ↗
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeChat
                    }
                    aria-label="Close panDA chat"
                  >
                    ×
                  </button>

                </div>
              </header>

              <div className="panda-chat-history">

                {history.length ===
                0 ? (
                  <div className="panda-chat-empty">
                    Start a conversation
                    with panDA.
                    <br />
                    I'll remember it across
                    CampusOS pages.
                  </div>
                ) : (
                  history.map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={`${item.time}-${index}`}
                        className={`
                          panda-chat-row
                          ${item.role}
                        `}
                      >
                        <div>
                          {item.text}
                        </div>
                      </div>
                    )
                  )
                )}

                {loading && (
                  <div className="panda-chat-row panda">
                    <div>
                      panDA is thinking...
                      🤔
                    </div>
                  </div>
                )}

              </div>

              {error && (
                <div className="panda-chat-error">
                  {error}
                </div>
              )}

              <div className="panda-quick-actions">

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "happy"
                    )
                  }
                >
                  ✨
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "encourage"
                    )
                  }
                >
                  💪
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "reminder"
                    )
                  }
                >
                  ⏰
                </button>

                <button
                  type="button"
                  onClick={() =>
                    react(
                      "celebrate"
                    )
                  }
                >
                  🎉
                </button>

              </div>

              <form
                className="panda-chat-input"
                onSubmit={
                  sendMessage
                }
              >
                <input
                  value={input}
                  onChange={(
                    event
                  ) =>
                    setInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="Ask panDA..."
                  disabled={
                    loading
                  }
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                >
                  {loading
                    ? "..."
                    : "→"}
                </button>
              </form>

            </section>
          )}

      </div>

      <button
        className="panda-character-button"
        onClick={() => {
          if (chatOpen) {
            closeChat();
          } else {
            startFloatingChat();
          }
        }}
        aria-label="Open panDA AI"
        type="button"
      >
        <PandaCharacter
          emotion={emotion}
          reactionKey={
            reactionKey
          }
        />
      </button>

      {settingsOpen && (
        <div className="panda-settings-card">

          <div className="panda-settings-title">
            panDA Settings
          </div>

          <label className="panda-toggle-row">
            <span>
              Enabled
            </span>

            <input
              type="checkbox"
              checked={
                settings.enabled
              }
              onChange={(event) =>
                setSettings(
                  (current) => ({
                    ...current,

                    enabled:
                      event.target
                        .checked,
                  })
                )
              }
            />
          </label>

          <label>
            <span>
              Mode
            </span>

            <select
              value={
                settings.mode
              }
              onChange={(event) =>
                setSettings(
                  (current) => ({
                    ...current,

                    mode:
                      event.target
                        .value,
                  })
                )
              }
            >
              <option value="floating">
                Floating
              </option>

              <option value="static">
                Static
              </option>
            </select>
          </label>

          <label>
            <span>
              Position
            </span>

            <select
              value={
                settings.position
              }
              onChange={(event) =>
                setSettings(
                  (current) => ({
                    ...current,

                    position:
                      event.target
                        .value,
                  })
                )
              }
            >
              <option value="bottom-right">
                Bottom Right
              </option>

              <option value="bottom-left">
                Bottom Left
              </option>

              <option value="top-right">
                Top Right
              </option>

              <option value="top-left">
                Top Left
              </option>
            </select>
          </label>

          <label className="panda-toggle-row">
            <span>
              Show Messages
            </span>

            <input
              type="checkbox"
              checked={
                settings.showMessages
              }
              onChange={(event) =>
                setSettings(
                  (current) => ({
                    ...current,

                    showMessages:
                      event.target
                        .checked,
                  })
                )
              }
            />
          </label>

          <button
            type="button"
            className="panda-history-button"
            onClick={() => {
              setChatView(
                "fullscreen"
              );

              setChatOpen(true);

              setSettingsOpen(
                false
              );
            }}
          >
            View Chat History
          </button>

        </div>
      )}
    </div>
  );
}

export default PandaAI;