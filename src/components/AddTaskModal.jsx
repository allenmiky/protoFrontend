// AddTaskModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiPlus, FiTrash2, FiClock, FiChevronDown, FiChevronUp,
  FiMaximize2, FiCheckCircle, FiEye, FiAlertCircle, FiPause, FiCalendar,
  FiSmile, FiFlag, FiClock as FiClock2,
} from 'react-icons/fi';
import { FaClipboardList, FaCog, FaCheckCircle as FaCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';
const ICONS_MAP = { FaClipboardList, FaCog, FaCheck, FiClock2, FiEye, FiAlertCircle, FiPause, FiSmile, FiCheckCircle, FiFlag };
const ICON_KEYS = Object.keys(ICONS_MAP);
const ICON_COLORS = {
  FaClipboardList: "#4F46E5", // Indigo
  FaCog: "#6B7280", // Gray
  FaCheck: "#10B981", // Green
  FiClock2: "#F59E0B", // Amber
  FiEye: "#3B82F6", // Blue
  FiAlertCircle: "#EF4444", // Red
  FiPause: "#A855F7", // Purple
  FiSmile: "#FBBF24", // Yellow
  FiCheckCircle: "#22C55E", // Emerald
  FiFlag: "#E11D48", // Rose
};
const STATUS_LIST = ['todo', 'inprogress', 'done'];
const LANGUAGES = [
  { code: 'en', name: 'EN' }, { code: 'es', name: 'ES' }, { code: 'fr', name: 'FR' },
  { code: 'de', name: 'DE' }, { code: 'it', name: 'IT' }, { code: 'pt', name: 'PT' },
  { code: 'ru', name: 'RU' }, { code: 'zh', name: 'ZH' }, { code: 'ar', name: 'AR' },
  { code: 'hi', name: 'HI' },
];



/* ---------- hooks ---------- */
const useBoardStatuses = (boardId) => {
  const [list, setList] = useState([]);
  useEffect(() => {
    if (!boardId) return;
    const raw = localStorage.getItem(`customStatuses_${boardId}`);
    setList(raw ? JSON.parse(raw) : []);
  }, [boardId]);
  const save = (next) => {
    localStorage.setItem(`customStatuses_${boardId}`, JSON.stringify(next));
    setList(next);
  };
  return [list, save];
};

const useStatusHistory = () => {
  const [h, setH] = useState([]);
  useEffect(() => { const r = localStorage.getItem('statusHistory'); if (r) setH(JSON.parse(r)); }, []);
  const push = (e) => { const n = [...h, e]; setH(n); localStorage.setItem('statusHistory', JSON.stringify(n)); };
  return [h, push];
};

/* ---------- components ---------- */
const Icon = ({ k, size = 16 }) => {
  const Comp = ICONS_MAP[k];
  return Comp ? <Comp size={size} /> : null;
};

const StatusSelect = ({ value, onChange, darkMode, customStatuses, onDelete }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const all = [
    ...STATUS_LIST.map(s => ({ name: s, builtIn: true })),
    ...customStatuses.map(s => ({ ...s, builtIn: false })),
  ];

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm
          bg-gradient-to-r transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400 focus:ring-offset-gray-900 hover:border-indigo-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-300 focus:ring-offset-gray-50 hover:border-indigo-400'
          }`}
      >
        <span>{t(value) || value}</span>
        <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-20 mt-2 w-full rounded-xl border shadow-lg
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            {all.map((s, i) => (
              <motion.li
                key={s.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between px-4 py-2 text-sm
                  hover:bg-indigo-500/10 cursor-pointer
                  ${value === s.name ? 'text-indigo-400' : darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                onClick={() => { onChange(s.name); setOpen(false); }}
              >
                <span>{t(s.name) || s.name}</span>
                {!s.builtIn && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(s.name); }}
                    className="ml-2 p-1 rounded-full hover:bg-rose-500/20 text-rose-500"
                  >
                    <FiTrash2 size={12} />
                  </button>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const LanguageSelect = ({ value, onChange, darkMode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        className={`w-24 flex items-center justify-between px-3 py-2 rounded-xl border-2 text-sm
          bg-gradient-to-r transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400 focus:ring-offset-gray-900 hover:border-indigo-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-300 focus:ring-offset-gray-50 hover:border-indigo-400'
          }`}
      >
        <span>{value.toUpperCase()}</span>
        <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-20 mt-2 w-24 rounded-xl border shadow-lg
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            {LANGUAGES.map((l, i) => (
              <motion.li
                key={l.code}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-indigo-500/10
                  ${value === l.code ? 'text-indigo-400' : darkMode ? 'text-gray-200' : 'text-gray-700'}`}
                onClick={() => { onChange(l.code); setOpen(false); }}
              >
                {l.name}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

const DueDateTimePicker = ({ value, onChange, darkMode }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const clear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border-2 text-sm
          bg-gradient-to-r transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 focus:ring-indigo-400 focus:ring-offset-gray-900 hover:border-indigo-500'
            : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-300 focus:ring-offset-gray-50 hover:border-indigo-400'
          }`}
      >
        <span className="flex items-center gap-2">
          <FiClock size={16} className="text-indigo-400" />
          {value
            ? `${new Date(value).toLocaleDateString()} • ${new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : t('selectDateTime')}
        </span>
        <FiChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute z-30 mt-2 w-full rounded-xl border shadow-lg p-3
              ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex flex-col gap-3">
              {/* Glassy Date Input */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`relative w-full px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300
      ${darkMode
                    ? 'bg-gray-800/40 border-gray-700/60 shadow-black/20'
                    : 'bg-white/60 border-gray-200/70 shadow-gray-200/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FiCalendar size={18} className="text-indigo-400" />
                  <input
                    type="date"
                    value={value ? value.split('T')[0] : ''}
                    onChange={e => {
                      const time = value ? value.split('T')[1] || '00:00' : '00:00';
                      onChange(`${e.target.value}T${time}`);
                    }}
                    className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
                    style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  />
                </div>
              </motion.div>

              {/* Glassy Time Input */}
              <motion.div
                whileTap={{ scale: 0.98 }}
                className={`relative w-full px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm transition-all duration-300
      ${darkMode
                    ? 'bg-gray-800/40 border-gray-700/60 shadow-black/20'
                    : 'bg-white/60 border-gray-200/70 shadow-gray-200/40'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <FiClock size={18} className="text-indigo-400" />
                  <input
                    type="time"
                    value={value ? value.split('T')[1] || '00:00' : ''}
                    onChange={e => {
                      const date = value ? value.split('T')[0] : '';
                      onChange(`${date}T${e.target.value}`);
                    }}
                    className="bg-transparent outline-none flex-1 text-sm placeholder-gray-400"
                    style={{ colorScheme: darkMode ? 'dark' : 'light' }}
                  />
                </div>
              </motion.div>
            </div>
            <div className="flex justify-end mt-2 gap-2">
              <button
                type="button"
                onClick={clear}
                className="text-xs px-2 py-1 rounded-md bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
              >
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
/* ---------- main component ---------- */
export default function AddTaskModal({
  isOpen, onClose, onSave, onUpdate, column, task, darkMode, boardId,
}) {
  const { t, i18n } = useTranslation();
  const isEdit = task && Object.keys(task).length;

  /* ---------- state ---------- */
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState(task?.desc || task?.description || '');
  const [dateTime, setDateTime] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [status, setStatus] = useState(column || 'todo');
  const [newStatus, setNewStatus] = useState('');
  const [iconKey, setIconKey] = useState('FiSmile');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [rows, setRows] = useState(4);
  const [full, setFull] = useState(false);
  const [makeUnique, setMakeUnique] = useState(false);
  const descRef = useRef(null);
  const [tempCustomStatuses, setTempCustomStatuses] = useState([]);

  const [customStatuses, setCustomStatuses] = useBoardStatuses(boardId);
  const [history, pushHistory] = useStatusHistory();
  const allCustomStatuses = [...customStatuses, ...tempCustomStatuses];

  /* ---------- effects ---------- */
  useEffect(() => {
    if (!isOpen) return;
    if (isEdit) {
      setTitle(task.title || '');
      setDesc(task.desc || task.description || '');
      setDateTime(task.dateTime || '');
      setStatus(task.status || task.column || column || 'todo');
      setSubtasks((task.subtasks || []).map(st => ({
        id: st._id || st.id || Date.now() + Math.random(),
        title: st.title,
        done: st.completed || false,
        subtasks: st.subtasks || [],
      })));
      if (task.history) pushHistory(task.history);
      if (task.userLang && task.userLang !== i18n.language) i18n.changeLanguage(task.userLang);
    } else {
      setTitle(''); setDesc(''); setDateTime(''); setSubtasks([]);
      setStatus(column || 'todo');
    }
  }, [isOpen, task, column]);

  if (!isOpen) return null;

  /* ---------- handlers ---------- */
  const changeStatus = (st) => {
    if (status === st) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    pushHistory({ from: status, to: st, time: new Date().toLocaleString('en-US', { timeZone: tz }), tz });
    setStatus(st);
  };

  const addCustom = () => {
    const name = newStatus.trim();
    if (!name) return;
    setTempCustomStatuses(prev => [...prev, { name, icon: iconKey }]);
    if (makeUnique) {
      const key = `customStatuses_${boardId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      if (!existing.some(s => s.name === name)) {
        const updated = [...existing, { name, icon: iconKey }];
        localStorage.setItem(key, JSON.stringify(updated));
        setCustomStatuses(updated);
      }
    }
    setNewStatus('');
    setIconKey('FiSmile');
    setMakeUnique(false);
  };

  const delCustom = (name) => {
    const key = `customStatuses_${boardId}`;
    const next = customStatuses.filter(s => s.name !== name);
    localStorage.setItem(key, JSON.stringify(next));
    setCustomStatuses(next);
    if (status === name) setStatus('todo');
    toast.success(`"${name}" deleted from board.`);
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      desc: desc.trim(),
      date: dateTime ? new Date(dateTime).toISOString() : null,
      status,
      column: status,
      subtasks: subtasks.map(st => ({ title: st.title, completed: st.done, subtasks: st.subtasks })),
      history,
      userLang: i18n.language,
    };
    if (!isEdit) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      payload.history = [...history, { from: 'created', to: status, time: new Date().toLocaleString('en-US', { timeZone: tz }), tz }];
    }
    isEdit ? onUpdate({ ...task, ...payload }) : onSave(payload, status);
    onClose();
  };

  const addSub = (parentIdx = null) => {
    const blank = { id: Date.now().toString(), title: '', done: false, subtasks: [] };
    if (parentIdx === null) return setSubtasks([...subtasks, blank]);
    const copy = [...subtasks];
    copy[parentIdx].subtasks.push(blank);
    setSubtasks(copy);
  };

  const toggle = (idx) => setExpanded(p => ({ ...p, [idx]: !p[idx] }));

  /* ---------- UI ---------- */
  const wrapper = full ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex p-4'
    : 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  const panel = `${full ? 'w-[98vw] h-[96vh]' : 'w-full max-w-2xl max-h-[90vh]'} overflow-y-auto rounded-2xl border shadow-xl p-6 thin-scroll ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className={wrapper} onClick={onClose}>
      <motion.div onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} className={panel}>
        {/* header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className={`text-2xl font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>{isEdit ? t('editTask') : t('addTask')}</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setFull(v => !v)} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-indigo-500" title={full ? 'Exit full screen' : 'Full screen'}><FiMaximize2 size={20} /></button>
            <LanguageSelect value={i18n.language} onChange={i18n.changeLanguage} darkMode={darkMode} />
            <button onClick={onClose}><FiX size={22} className="text-gray-400 hover:text-red-500" /></button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block mb-1 text-sm font-medium">{t('title')}</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className={`w-full px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`} placeholder={t('enterTitle')} />
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm font-medium">{t('desc')}</label>
            <div className="relative">
              <textarea
                ref={descRef}
                rows={rows}
                value={desc}
                onChange={e => setDesc(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border resize-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                  }`}
                placeholder={t('enterDetails')}
              />
              <div onMouseDown={(e) => { const start = e.clientY; const startRows = rows; const move = mv => { const d = Math.round((mv.clientY - start) / 10); setRows(Math.max(4, Math.min(30, startRows + d))); }; const up = () => { document.removeEventListener('mousemove', move); document.removeEventListener('mouseup', up); }; document.addEventListener('mousemove', move); document.addEventListener('mouseup', up); }} className="absolute bottom-2 right-2 cursor-ns-resize text-gray-400 hover:text-indigo-500"><FiChevronDown size={16} /></div>
            </div>
          </div>

{/* Due + Status */}
<div
  className="flex flex-col sm:flex-row sm:items-end gap-4 p-3 rounded-xl border
  dark:border-gray-700 border-gray-300 bg-white dark:bg-gray-900/50 shadow-sm"
>
  {/* Due Date Picker */}
  <div className="flex-1">
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {t('due')}
    </label>
    <DueDateTimePicker
      value={dateTime}
      onChange={setDateTime}
      darkMode={darkMode}
    />
  </div>

  {/* Status Dropdown */}
  <div className="flex-1">
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
      {t('status')}
    </label>
    <StatusSelect
      value={status}
      onChange={changeStatus}
      darkMode={darkMode}
      customStatuses={allCustomStatuses}
      onDelete={delCustom}
    />
  </div>

  {/* Icon Picker Button */}
  {(() => {
    const SelectedIcon = ICONS_MAP[iconKey];
    return (
      <button
        type="button"
        onClick={() => setShowIconPicker(true)}
        className={`flex items-center justify-center gap-2 
          h-[38px] px-3 rounded-xl border transition-all 
          hover:bg-indigo-500/10 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
          }`}
      >
        <SelectedIcon size={18} color={ICON_COLORS[iconKey]} />
      </button>
    );
  })()}
</div>


          {/* Quick status buttons */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_LIST.map(st => <button type="button" key={st} onClick={() => changeStatus(st)} className={`px-3 py-1 rounded-full text-xs border ${status === st ? 'ring-2 ring-indigo-500' : ''} ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}>{t(st)}</button>)}
            {customStatuses.map(s => (
              <div key={s.name} className="flex items-center gap-1">
                <button type="button" onClick={() => changeStatus(s.name)} className={`px-3 py-1 rounded-full text-xs border flex items-center gap-1 ${status === s.name ? 'ring-2 ring-indigo-500' : ''} ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-gray-100 border-gray-300'}`}><Icon k={s.icon} size={14} /> {s.name}</button>
                <button type="button" onClick={() => delCustom(s.name)} className="p-1 rounded-full hover:bg-rose-500/20 text-rose-500"><FiTrash2 size={12} /></button>
              </div>
            ))}
          </div>

          {/* Add custom status */}
          <div className="flex items-center gap-2 mt-3">
            <input
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              placeholder={t('addCustom')}
              className={`flex-1 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`}
            />

            <button
              type="button"
              onClick={addCustom}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm flex items-center"
            >
              <FiPlus />Add
            </button>
          </div>


          {/* Unique toggle */}
          <label
            className="flex items-center justify-between mt-1 p-1.5 rounded-lg cursor-pointer text-sm
  hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <span>Make this status unique</span>

            {/* Small Toggle */}
            <div
              onClick={() => setMakeUnique(!makeUnique)}
              className={`w-8 h-4 flex items-center rounded-full p-[2px] transition ${makeUnique ? "bg-indigo-600" : "bg-gray-400"
                }`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-sm transform transition ${makeUnique ? "translate-x-4" : ""
                  }`}
              ></div>
            </div>
          </label>

          {/* Icon Picker Modal */}
          <AnimatePresence>
            {showIconPicker && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowIconPicker(false)}>
                <motion.div onClick={e => e.stopPropagation()} className={`w-full max-w-md rounded-2xl border shadow-xl p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className="flex justify-between items-center mb-3"><h3 className="text-lg font-semibold">Pick an icon</h3><button type="button" onClick={() => setShowIconPicker(false)}><FiX size={20} className="text-gray-400 hover:text-red-500" /></button></div>
                  <div className="grid grid-cols-5 gap-3">
                    {ICON_KEYS.map(k => {
                      const IconComponent = ICONS_MAP[k];
                      return (
                        <button
                          type="button"  // 🧠 ADD THIS LINE
                          key={k}
                          onClick={() => { setIconKey(k); setShowIconPicker(false); }}
                          className={`p-3 rounded-xl border hover:bg-indigo-500/10 flex items-center justify-center 
                          ${iconKey === k ? 'ring-2 ring-indigo-500' : ''} 
                          ${darkMode ? 'border-gray-600' : 'border-gray-300'}
                           `}
                        >
                          <IconComponent size={20} color={ICON_COLORS[k]} />
                        </button>
                      );
                    })}

                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtasks */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('addSub')}</label>
            {subtasks.map((sub, idx) => (
              <div
                key={sub.id}
                className={`mb-2 rounded-xl p-2 transition ${sub.done ? 'bg-red-100 border border-red-300' : ''
                  }`}
              >
                <div className="flex items-center gap-2">
                  <input value={sub.title} onChange={e => { const c = [...subtasks]; c[idx].title = e.target.value; setSubtasks(c); }} className={`flex-1 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`} placeholder={`${t('subtask')} ${idx + 1}`} />
                  {/* Stylish Check Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = [...subtasks];
                      c[idx].done = !c[idx].done;
                      setSubtasks(c);
                    }}
                    className={`p-2 rounded-lg transition ${sub.done ? 'bg-red-600 text-white' : 'text-green-500 hover:text-green-600'
                      }`}
                  >
                    <FiCheckCircle size={18} />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const c = [...subtasks];
                      c.splice(idx, 1);
                      setSubtasks(c);
                    }}
                    className="p-2 rounded-lg text-red-500 hover:text-red-600"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                <AnimatePresence>
                  {expanded[idx] && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="ml-6 mt-2 space-y-2">
                      {sub.subtasks?.map((child, i) => (
                        <div key={i} className="flex items-center gap-2">

                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={child.done}
                            onChange={(e) => {
                              const c = [...subtasks];
                              c[idx].subtasks[i].done = e.target.checked;
                              setSubtasks(c);
                            }}
                          />

                          {/* Input */}
                          <input
                            className={`flex-1 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                              } ${sub.done ? 'line-through text-red-600 font-semibold' : ''}`}
                            value={child.title}
                            onChange={(e) => {
                              const c = [...subtasks];
                              c[idx].subtasks[i].title = e.target.value;
                              setSubtasks(c);
                            }}
                            className={`flex-1 px-3 py-2 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'
                              }`}
                            placeholder={`${t('nestedSubtask')} ${i + 1}`}
                          />

                          {/* Delete nested */}
                          <button
                            type="button"
                            onClick={() => {
                              const c = [...subtasks];
                              c[idx].subtasks.splice(i, 1);
                              setSubtasks(c);
                            }}
                            className="text-red-500"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            <button type="button" onClick={() => addSub(null)} className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mt-2"><FiPlus />{t('addSub')}</button>
          </div>

          {/* Status history */}
          <div>
            <button type="button" onClick={() => setShowHistory(v => !v)} className="text-indigo-500 text-sm hover:underline">{t('history')}</button>
            <AnimatePresence>
              {showHistory && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className={`mt-2 text-sm rounded-lg p-3 border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                  {history.length ? <ul className="space-y-1">{history.map((h, i) => <li key={i}><span className="font-medium">{h.from}</span> → <span className="font-medium">{h.to}</span> | <span className="text-xs text-gray-500">{h.time} ({h.tz})</span></li>)}</ul> : <p className="text-gray-500">{t('noHistory')}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lang badge */}
          <div className={`text-xs text-gray-400 mb-2 ${['ar', 'hi'].includes(i18n.language) ? 'text-right' : ''}`}>{t('taskLang')}: {task?.userLang || i18n.language}</div>

          {/* Submit */}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl font-semibold transition-all">{isEdit ? t('update') : t('add')}</button>
        </form>
      </motion.div>
    </div>
  );
}

