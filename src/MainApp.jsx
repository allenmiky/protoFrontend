// ✅ src/MainApp.jsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { FiCalendar, FiChevronLeft, FiChevronRight, FiArchive, FiSun, FiMoon, FiPlus, FiTrash2 } from "react-icons/fi";
import { FaClipboardList, FaCog, FaCheckCircle, FaEye, FaPause, FaBug, FaClock } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

import API_BASE from "./config/api";
import ArchiveDrawer from "./components/ArchiveDrawer";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import AddTaskModal from "./components/AddTaskModal";
import AddBoardModal from "./components/AddBoardModal";
import TaskDescription from "./components/TaskDescription";
import TaskCardMenu from "./components/TaskCardMenu";
import ArchiveCard from "./components/ArchiveCard";

const ICONS = {
  todo: <FaClipboardList className="text-blue-500 text-xl" />,
  inprogress: <FaCog className="text-yellow-500 text-xl animate-spin-slow" />,
  done: <FaCheckCircle className="text-green-500 text-xl" />,
  review: <FaEye className="text-purple-500 text-xl" />,
  blocked: <FaPause className="text-red-500 text-xl" />,
  qa: <FaBug className="text-orange-500 text-xl" />,
};


// ✅ MainApp Component
export default function MainApp({ initialUser, token, onLogout }) {
  // 🧠 Local user state
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved && saved !== "undefined"
        ? JSON.parse(saved)
        : initialUser || null;
    } catch {
      return initialUser || null;
    }
  });

  const [boards, setBoards] = useState([]);
  const [archivedBoards, setArchivedBoards] = useState([]);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "true");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [modalColumn, setModalColumn] = useState("todo");
  const [editTask, setEditTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [archivedCards, setArchivedCards] = useState({});
  const [showArchivedCards, setShowArchivedCards] = useState(false);


  // ✅ Overdue check function
  const isOverdue = (taskDate, completed) => {
    if (!taskDate || completed) return false;
    const today = new Date();
    const dueDate = new Date(taskDate);
    return dueDate < today;
  };

  // ✅ Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  // ✅ Fetch Boards
  useEffect(() => {
    const fetchBoards = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await axios.get(`${API_BASE}/boards`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (Array.isArray(res.data)) {
          const fixedBoards = res.data.map((b) => ({
            ...b,
            lists: b.lists ?? { todo: [], inprogress: [], done: [] },
          }));

          setBoards(fixedBoards.filter((b) => !b.archived));
          setArchivedBoards(fixedBoards.filter((b) => b.archived));

          if (!activeBoardId && fixedBoards.length > 0)
            setActiveBoardId(fixedBoards[0]._id);
        }
      } catch {
        toast.error("Failed to load boards");
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
  }, [token]);

  useEffect(() => {
    if (boards.length > 0 && !activeBoardId) {
      setActiveBoardId(boards[0]._id);
    }
  }, [boards]);

  // ✅ Fetch Tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token || !activeBoardId) return;
      try {
        const res = await axios.get(`${API_BASE}/tasks/${activeBoardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched tasks:", res.data); // ✅ yeh line add karo

        const grouped = res.data.reduce((acc, task) => {
          const col = task.status || "todo";
          if (!acc[col]) acc[col] = [];
          acc[col].push({
            ...task,
            subtasks: (task.subtasks || []).map(st => ({
              id: st._id,
              title: st.title,
              done: st.completed || false,
            })),
          });
          return acc;
        }, { todo: [], inprogress: [], done: [] });

        setBoards((prev) =>
          prev.map((b) =>
            b._id === activeBoardId ? { ...b, lists: grouped } : b
          )
        );
      } catch (err) {
        console.error("❌ Error loading tasks:", err);
      }
    };
    fetchTasks();
  }, [activeBoardId, token]);

  // ✅ Add Board  
  const addBoard = async (boardName) => {
    const name =
      typeof boardName === "string"
        ? boardName.trim()
        : typeof boardName?.name === "string"
          ? boardName.name.trim()
          : "";

    if (!name) return toast.error("Please enter a valid board name");

    try {
      const res = await axios.post(
        `${API_BASE}/boards`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const boardWithLists = {
        ...res.data,
        lists: { todo: [], inprogress: [], done: [] },
      };

      setBoards(prev => {
        const newBoards = [...prev, boardWithLists];
        setActiveBoardId(res.data._id);
        return newBoards;
      });

      toast.success("Board added successfully!");
    } catch (err) {
      console.error("Add Board Error:", err);
      toast.error("Failed to add board");
    }
  };

  // ✅ Archive / Restore / Delete
  const handleArchiveBoard = async (board) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/boards/${board._id}/archive`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const archivedBoard = res.data;
      setBoards((prev) => prev.filter((b) => b._id !== board._id));
      setArchivedBoards((prev) => [...prev, archivedBoard]);

      if (activeBoardId === board._id) {
        const nextBoard = boards.find((b) => b._id !== board._id);
        setActiveBoardId(nextBoard?._id || null);
      }
    } catch {
      toast.error("Failed to archive board");
    }
  };

  const handleRestoreBoard = async (board) => {
    try {
      await axios.patch(
        `${API_BASE}/boards/${board._id}/restore`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setArchivedBoards((prev) => prev.filter((b) => b._id !== board._id));
      setBoards((prev) => [...prev, { ...board, archived: false }]);
      toast.success(`"${board.name}" restored`);
    } catch {
      toast.error("Failed to restore board");
    }
  };

  const handleDeleteClick = (board) => {
    setBoardToDelete(board);
    setShowDeleteModal(true);
  };

  const confirmDeleteBoard = async () => {
    if (!boardToDelete) return;
    try {
      await axios.delete(`${API_BASE}/boards/${boardToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setArchivedBoards((prev) => prev.filter((b) => b._id !== boardToDelete._id));
      setShowDeleteModal(false);
      toast.success("Board deleted successfully!");
    } catch {
      toast.error("Failed to delete board");
    }
  };

  // ✅ Add / Update / Delete Task
  const addTask = async (task, columnId) => {
    if (!token) return toast.error("Login required");
    try {
      const res = await axios.post(
        `${API_BASE}/tasks`,
        {
          title: task.title,
          description: task.desc,
          date: task.date,
          status: columnId,
          board: activeBoardId,
          subtasks: task.subtasks || [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBoards((prev) =>
        prev.map((b) =>
          b._id === activeBoardId
            ? {
              ...b,
              lists: {
                ...b.lists,
                [columnId]: [
                  ...(b.lists[columnId] || []),
                  {
                    ...res.data,
                    subtasks: (res.data.subtasks || []).map((st) => ({
                      id: st._id,
                      title: st.title,
                      done: st.completed || false,
                    })),
                  },
                ],
              },
            }
            : b
        )
      );

      console.log("✅ Saved task from backend:", res.data);
      toast.success("Task added successfully!");
    } catch (error) {
      console.log(error);
      toast.error("Failed to add task");
    }
  };


  const handleCompleteTask = (task) => {
    if (!task?._id) return console.error("Task has no _id:", task);

    const now = new Date();
    const isCompleted = !task.completed;

    const updatedTask = {
      ...task,
      completed: !task.completed,
      history: [
        ...(task.history || []),
        `${!task.completed ? "✅ Completed" : "↩️ Marked incomplete"} on ${new Date().toLocaleString()}`
      ],
    };


    updateTask(updatedTask); // ✅ ONLY pass updatedTask
  };


  // ✅ MainApp.jsx - updateTask function
const updateTask = async (updatedTask) => {
  if (!token) return toast.error("Login required");
  try {
    const taskId = updatedTask._id || updatedTask.id;

    // Prepare payload with subtasks
    const payload = {
      title: updatedTask.title,
      description: updatedTask.desc || updatedTask.description,
      date: updatedTask.date,
      status: modalColumn,
      board: activeBoardId,
      completed: updatedTask.completed || false,
      subtasks: (updatedTask.subtasks || []).map(st => ({
        _id: st._id,
        title: st.title,
        status: st.status || modalColumn,
        completed: st.completed || false,
      })),
    };

    const res = await axios.put(
      `${API_BASE}/tasks/${taskId}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setBoards((prev) =>
      prev.map((b) =>
        b._id === activeBoardId
          ? {
              ...b,
              lists: {
                ...b.lists,
                [modalColumn]: b.lists[modalColumn].map((t) =>
                  t._id === taskId ? res.data : t
                ),
              },
            }
          : b
      )
    );

    toast.success("Task updated successfully!");
    setEditTask(null);
  } catch (err) {
    console.error("Error updating task:", err);
    toast.error("Error updating task");
  }
};


  // ✅ Archive Task function
  const handleArchiveTask = (task) => {
    if (!task) return;

    // 1️⃣ Remove from board lists
    setBoards(prev =>
      prev.map(b => {
        if (b._id !== activeBoardId) return b;

        const newLists = Object.fromEntries(
          Object.entries(b.lists).map(([col, arr]) => [
            col,
            arr.filter(t => t._id !== task._id)
          ])
        );

        return { ...b, lists: newLists };
      })
    );

    // 2️⃣ Add to archivedCards for this board
    setArchivedCards(prev => ({
      ...prev,
      [activeBoardId]: [...(prev[activeBoardId] || []), task]
    }));

    toast.success("Task archived!");
  };

  const deleteTask = async (taskId) => {
    if (!token) return toast.error("Login required");
    try {
      await axios.delete(`${API_BASE}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBoards((prev) =>
        prev.map((b) => ({
          ...b,
          lists: Object.fromEntries(
            Object.entries(b.lists).map(([k, arr]) => [
              k,
              arr.filter((t) => t._id !== taskId),
            ])
          ),
        }))
      );
      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  // ✅ Drag & Drop
  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const board = boards.find((b) => b._id === activeBoardId);
    const startList = [...board.lists[source.droppableId]];
    const [moved] = startList.splice(source.index, 1);
    const endList = [...board.lists[destination.droppableId]];
    endList.splice(destination.index, 0, moved);

    setBoards((prev) =>
      prev.map((b) =>
        b._id === activeBoardId
          ? {
            ...b,
            lists: {
              ...b.lists,
              [source.droppableId]: startList,
              [destination.droppableId]: endList,
            },
          }
          : b
      )
    );

    try {
      await axios.put(
        `${API_BASE}/tasks/${moved._id}`,
        { status: destination.droppableId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      toast.error("Failed to update task position");
    }
  };

  const activeBoard =
    boards.find((b) => b._id === activeBoardId) || {
      lists: { todo: [], inprogress: [], done: [] },
    };

  if (loading)
    return (
      <div
        className={`h-screen flex items-center justify-center overflow-hidden ${dark ? "bg-gray-900" : "bg-sky-50"
          }`}
      >
        <div className="flex text-4xl md:text-6xl font-bold select-none">
          <span
            className="text-indigo-500 animate-slideLeft"
            style={{ animationDelay: "0s" }}
          >
            Pro
          </span>
          <span
            className="text-sky-500 animate-slideRight"
            style={{ animationDelay: "0.1s" }}
          >
            Todo
          </span>
        </div>
      </div>
    );

  return (
    <div
      className={`min-h-screen flex flex-col ${dark ? "bg-gray-900 text-gray-200" : "bg-sky-50 text-gray-800"
        }`}
    >
      <Toaster position="top-center" />

      {/* HEADER */}
      <header
        className={`h-14 px-4 md:px-6 flex items-center justify-between border-b transition-colors duration-300 ${dark
          ? "bg-gray-900 text-gray-100 border-gray-700"
          : "bg-white text-gray-800 border-slate-200"
          }`}
      >
        {/* LEFT */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-full transition-all duration-200 hover:bg-sky-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <FiChevronLeft size={20} /> : <FiChevronRight size={20} />}
          </button>

          <span className="text-lg font-bold bg-gradient-to-r from-sky-500 to-indigo-500 bg-clip-text text-transparent">
            <span className="hidden sm:inline">ProTodo</span>
            <span className="sm:hidden">ProTodo</span>
          </span>

          <button
            onClick={() => setShowArchive(true)}
            className={`px-3 py-1 rounded-lg text-sm items-center hidden md:flex transition-colors duration-200 ${dark
              ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
              : "bg-sky-100 text-gray-800 hover:bg-sky-200"
              }`}
          >
            <FiArchive className="mr-1" /> Archive ({archivedBoards.length})
          </button>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-full transition-all duration-200 transform hover:scale-110 ${dark
              ? "text-yellow-400 hover:text-yellow-300 hover:bg-gray-800"
              : "text-sky-500 hover:text-sky-600 hover:bg-sky-100"
              }`}
            title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>

          <ProfileMenu
            user={user}
            setUser={setUser}
            onLogout={onLogout}
            darkMode={dark}
            archivedCount={archivedBoards.length}
            onShowArchive={() => setShowArchive(true)}
          />
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            boards={boards}
            activeBoardId={activeBoardId}
            setActiveBoardId={setActiveBoardId}
            addBoard={() => setShowAddBoardModal(true)}
            onArchive={handleArchiveBoard}
            onDelete={handleDeleteClick}
            darkMode={dark}
          />
        )}

        {/* MAIN */}
        <main className="flex-1 p-6 overflow-auto">
          {activeBoardId && (
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold">{activeBoard.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                {/* Card Archive */}
                <button
                  onClick={() => setShowArchivedCards(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <FiArchive className="text-lg" /> Card Archive
                </button>

                {showArchivedCards && (
                  <ArchiveCard
                    archivedCards={archivedCards[activeBoardId] || []} // ✅ safe access
                    onClose={() => setShowArchivedCards(false)}
                    darkMode={dark}
                  />
                )}

                {/* Add Task */}
                <button
                  onClick={() => {
                    setEditTask(null);
                    setModalColumn("todo");
                    setShowModal(true);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  <FiPlus className="text-lg" /> Add Task
                </button>
              </div>
            </div>
          )}

          <AddTaskModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={addTask}
            onUpdate={updateTask}
            column={modalColumn}
            task={editTask}
            darkMode={dark}
            boardId={activeBoardId} // ✅ must pass
          />

          <AddBoardModal
            isOpen={showAddBoardModal}
            onClose={() => setShowAddBoardModal(false)}
            onConfirm={(name) => {
              addBoard(name);
              setShowAddBoardModal(false);
            }}
            darkMode={dark}
          />

          {/* No Board Found */}
          {boards.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center mb-8">
              <h2
                className={`text-2xl font-semibold mb-3 ${dark ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                No Board Added
              </h2>
              <p
                className={`mb-6 text-sm ${dark ? "text-gray-500" : "text-gray-400"
                  }`}
              >
                Create your first board to get started 🚀
              </p>
              <button
                onClick={() => setShowAddBoardModal(true)}
                className={`px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all ${dark
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white"
                  }`}
              >
                <FiPlus className="text-lg" /> Add Board
              </button>
            </div>
          )}

          {/* Task Columns */}
          {boards.length > 0 && (
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-5">
              <DragDropContext onDragEnd={onDragEnd}>
                {Object.entries(activeBoard.lists ?? {}).map(([colId, tasks = []]) => (
                  <Droppable key={colId} droppableId={colId}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`rounded-2xl p-4 shadow-md transition-all ${dark ? "bg-gray-800" : "bg-white"}`}
                      >
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          {ICONS[colId] || <FaClipboardList className="text-gray-500 text-xl" />}
                          <span className="capitalize">
                            {colId === "todo"
                              ? "To Do"
                              : colId === "inprogress"
                                ? "In Progress"
                                : colId === "done"
                                  ? "Done"
                                  : colId}
                          </span>
                          <span className="ml-auto text-sm text-gray-500">({tasks.length})</span>
                        </h2>

                        {tasks.map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`relative group mb-3 p-4 rounded-xl border shadow-sm cursor-pointer transition-all overflow-hidden
                        ${task.completed ? (dark ? "bg-green-700/30 border-green-500" : "bg-green-100 border-green-400") : (dark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-200 text-gray-900")}
                        ${snapshot.isDragging ? "shadow-lg scale-105 z-10" : ""}
                      `}
                                onClick={() => {
                                  setEditTask(task);
                                  setModalColumn(colId);
                                  setShowModal(true);
                                }}
                              >
                                {/* Task Menu */}
                                <div className="absolute top-2 right-2">
                                  <TaskCardMenu
                                    taskId={task._id}
                                    onDelete={() => deleteTask(task._id)}
                                    onArchive={() => handleArchiveTask(task)} // pass full task
                                    onPin={() => handlePinTask(task._id)}
                                  />
                                </div>

                                {/* Title + Overdue */}
                                <h3 className="font-semibold text-base flex items-center gap-2 mb-1">
                                  {task.title}
                                  {!task.completed && task.date && new Date(task.date) < new Date() && (
                                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">
                                      Overdue
                                    </span>
                                  )}
                                </h3>

                                {/* Description */}
                                {(task.description || task.desc) && (
                                  <TaskDescription desc={task.description || task.desc} />
                                )}

                                {/* Bottom row: priority + date */}
                                <div className="flex items-center justify-between mt-3">
                                  {task.priority && (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityClasses(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  )}
                                  {task.date && (
                                    <div className="flex items-center gap-1 text-[11px] text-green-500">
                                      <FiCalendar className="text-xs" />
                                      <span>{new Date(task.date).toLocaleDateString()}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Complete checkbox */}
                                <div className="absolute bottom-2 right-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCompleteTask(task);
                                    }}
                                    className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300 
                            ${task.completed ? "bg-green-500 border-green-600 opacity-100" : "bg-white dark:bg-gray-800 border-gray-400 dark:border-gray-500 opacity-0 group-hover:opacity-100"}
                          `}
                                  >
                                    {task.completed && <span className="text-white text-sm font-bold">✓</span>}
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                ))}
              </DragDropContext>
            </div>
          )}


          {showArchive && (
            <ArchiveDrawer
              boards={archivedBoards}
              onRestore={handleRestoreBoard}
              onDeleteClick={handleDeleteClick}
              darkMode={dark}
              onClose={() => setShowArchive(false)}
            />
          )}

          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={confirmDeleteBoard}
            title={boardToDelete?.name}
            darkMode={dark}
          />
        </main>
      </div>
    </div>
  );

}