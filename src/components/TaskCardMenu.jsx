// ✅ src/components/TaskCardMenu.jsx
import React from "react";
import { FiArchive, FiStar, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

const TaskCardMenu = ({ taskId, onArchive, onPin, onDelete }) => {
  // Archive click
  const handleArchive = () => {
    toast.success("Task archived!");
    onArchive?.(taskId); // Parent me handle kare
  };

  // Pin click
  const handlePin = () => {
    toast.success("Task pinned!");
    onPin?.(taskId); // Parent me handle kare
  };

  // Delete click
  const handleDelete = () => {
    toast((t) => (
      <div className="flex items-center gap-3">
        <span>Confirm delete?</span>
        <button
          onClick={() => {
            onDelete?.(taskId); // Parent me handle kare
            toast.dismiss(t.id);
          }}
          className="px-2 py-1 bg-rose-500 text-white text-sm rounded-lg hover:bg-rose-600"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-2 py-1 bg-gray-300 text-gray-800 text-sm rounded-lg hover:bg-gray-400"
        >
          No
        </button>
      </div>
    ), { duration: 4000, position: "top-center" });
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Archive Button */}
      <button
        onClick={handleArchive}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        title="Archive Task"
      >
        <FiArchive size={16} />
      </button>

      {/* Pin Button */}
      <button
        onClick={handlePin}
        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        title="Pin Task"
      >
        <FiStar size={16} />
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="p-1 rounded-full hover:bg-rose-100 dark:hover:bg-rose-700 transition-all"
        title="Delete Task"
      >
        <FiTrash2 size={16} className="text-rose-500" />
      </button>
    </div>
  );
};

export default TaskCardMenu;
