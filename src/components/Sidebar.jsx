import React, { useState } from "react";
import { FiPlus, FiMoreVertical } from "react-icons/fi";
import AddBoardModal from "./AddBoardModal";
import SidebarMenu from "./SidebarMenu"; // ✅ imported new menu component

export default function Sidebar({
  boards = [],
  activeBoardId,
  setActiveBoardId,
  addBoard,
  onArchive,
  onDelete,
  darkMode,
}) {
  const [menuOpen, setMenuOpen] = useState(null);
  const [showAddBoardModal, setShowAddBoardModal] = useState(false);

  const handleAddBoard = async (name) => {
    await addBoard(name);
    setShowAddBoardModal(false);
  };

  return (
    <>
<aside
  className={`${
    darkMode
      ? "bg-gray-900 text-gray-100 border-gray-700"
      : "bg-white text-gray-800 border-slate-200"
  } w-64 border-r flex flex-col transition-colors duration-300 h-screen sticky top-0 overflow-y-auto`}
>

          <h2 className="font-bold text-lg">Boards</h2>
          <button
  onClick={() => addBoard()}  // ✅ just trigger the modal
  className={`p-1.5 rounded transition-colors duration-200 ${
    darkMode
      ? "bg-indigo-600 hover:bg-indigo-500 text-white"
      : "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm"
  }`}
  title="Add new board"
>
  <FiPlus />
</button>

        </div>

        {/* Boards List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {boards.map((board) => (
            <div
              key={board._id}
              className={`group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                board._id === activeBoardId
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "hover:bg-gray-800"
                  : "hover:bg-slate-200"
              }`}
            >
              <span
                onClick={() => setActiveBoardId(board._id)}
                className="truncate flex-1"
              >
                {board.name}
              </span>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(menuOpen === board._id ? null : board._id);
                  }}
                  className={`p-1 rounded transition-colors duration-200 ${
                    darkMode
                      ? "bg-gray-700 text-[#fff]"
                      : "bg-slate-200 text-gray-600"
                  }`}
                >
                  <FiMoreVertical />
                </button>

{menuOpen === board._id && (
  <SidebarMenu
    board={board}
    darkMode={darkMode}
    onArchive={onArchive}
    onDelete={onDelete}
    onClose={() => setMenuOpen(null)}
  />
)}

              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* 🔹 Add Board Modal */}
      <AddBoardModal
        isOpen={showAddBoardModal}
        onClose={() => setShowAddBoardModal(false)}
        onConfirm={handleAddBoard}
        darkMode={darkMode}
      />
    </>
  );
}
