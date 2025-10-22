// src/components/AuthPage.jsx
import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import API_BASE from "../config/api";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from "react-icons/fi";

function ForgotPasswordModal({ onClose, darkMode }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return toast.error("Enter your email!");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || "Check your inbox!");
      toast.success(data.message || "Check your inbox!");
    } catch {
      setMessage("Something went wrong.");
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{ duration: 0.4 }}
          className={`rounded-xl p-6 w-full max-w-sm shadow-lg ${darkMode ? "bg-gray-800 text-gray-100" : "bg-white text-gray-800"
            }`}
        >
          <h2 className="text-lg font-semibold mb-4">Forgot Password</h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full mb-4 px-3 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 ${darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
              }`}
          />
          {message && (
            <p className="text-sm mb-3 text-center text-indigo-500">{message}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Link"}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 py-2 rounded-lg ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-100 hover:bg-gray-200"
                }`}
            >
              Close
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}


export default function AuthPage({ darkMode, onLogin }) {
  const [activeForm, setActiveForm] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!email || !pass || (activeForm === "signup" && !name)) {
      return toast.error("Please fill all fields");
    }

    if (pass.length < 5) {
      return toast.error("Password must be at least 5 characters");
    }

    setLoading(true);
    try {
      const url = `${API_BASE}/auth/${activeForm}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password: pass }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Auth failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.dismiss(); // clear old toasts
      toast.success(`${activeForm === "login" ? "Logged in" : "Account created"} successfully!`, { duration: 2500 });
      onLogin(data.user, data.token);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const letters = ["P", "r", "o", "-", "T", "o", "d", "o"];

  return (
    <div
      className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${darkMode ? "bg-gray-900 text-gray-100" : "bg-sky-50 text-gray-900"
        }`}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* Left Panel - Desktop only */}
      <motion.div
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`hidden md:flex flex-col justify-center items-start px-16 w-1/2 relative overflow-hidden ${darkMode ? "bg-indigo-700" : "bg-indigo-600"
          } text-white`}
      >
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500 opacity-20 blur-3xl rounded-full"
        />
        <div className="flex text-6xl font-extrabold mb-4 tracking-tight drop-shadow-lg gap-1">
          {letters.map((char, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -20] }}
              transition={{
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.15,
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
        <TypeAnimation
          sequence={[
            "Manage your daily tasks smarter, faster, and beautifully.",
            2000,
            "Stay productive. Stay organized. Stay inspired.",
            2000,
          ]}
          wrapper="p"
          speed={50}
          repeat={Infinity}
          className="text-lg opacity-90 leading-relaxed max-w-md"
        />
        <div className="mt-10 flex gap-4">
          {["login", "signup"].map((type) => (
            <motion.button
              key={type}
              onClick={() => setActiveForm(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-5 py-2 rounded-xl font-semibold transition ${activeForm === type
                  ? "bg-white text-indigo-600"
                  : "bg-white/30 text-white hover:bg-white/50"
                }`}
            >
              {type === "login" ? "Login" : "Sign Up"}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeForm}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`w-full max-w-md rounded-2xl p-8 shadow-xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-slate-200"
              }`}
          >
            <h2 className="text-2xl font-bold mb-6">
              {activeForm === "login" ? "Login" : "Sign Up"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeForm === "signup" && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3 text-gray-400" />
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Your name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 text-sm font-medium">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 rounded-xl border bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-xl text-gray-500 hover:text-indigo-500"
                  >
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {activeForm === "login" && (
                  <div className="text-right mt-1">
                    <button
                      type="button"
                      onClick={() => setShowForgot(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-500"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60"
              >
                {loading ? "Processing..." : activeForm === "login" ? "Login" : "Create Account"}
              </button>
            </form>

            {/* Mobile buttons to switch form */}
            <div className="mt-4 flex justify-center gap-4 md:hidden">
              {["login", "signup"].map((type) => (
                <motion.button
                  key={type}
                  onClick={() => setActiveForm(type)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${activeForm === type
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {type === "login" ? "Login" : "Sign Up"}
                </motion.button>
              ))}
            </div>import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit2, FiLogOut, FiArchive } from "react-icons/fi";
import { API } from "../config/api";
import useOutsideClick from "../hooks/useOutsideClick";

/* -------------------------------------------------
   ✅ Custom Alert (auto close + click outside close)
-------------------------------------------------- */
function CustomAlert({ message, onClose }) {
  const alertRef = useRef();
  useOutsideClick(alertRef, onClose);

  useEffect(() => {
    if (message) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div
      ref={alertRef}
      className="fixed top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg z-50 text-sm"
    >
      {message}
    </div>
  );
}

/* -------------------------------------------------
   ✅ Edit Profile Modal (close on outside click)
-------------------------------------------------- */
function EditProfileModal({ user, onSave, onClose, darkMode }) {
  const [name, setName] = useState(user.name || "");
  const [avatar, setAvatar] = useState(user.avatar || "");
  const modalRef = useRef();

  useOutsideClick(modalRef, onClose);

  useEffect(() => {
    setName(user.name || "");
    setAvatar(user.avatar || "");
  }, [user]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => setAvatar(ev.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) return alert("Name cannot be empty");
    onSave({ ...user, name, avatar });
    onClose(); // ✅ close modal after save
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className={`rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl ring-1 ${
          darkMode
            ? "bg-gray-800 text-gray-200 ring-gray-700"
            : "bg-white text-gray-700 ring-gray-200"
        }`}
      >
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>

        <label className="block mb-4">
          <span className="text-sm">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full mt-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-800"
            }`}
          />
        </label>

        <div className="mb-4">
          <span className="text-sm">Avatar</span>
          <div className="flex items-center gap-4 mt-2">
            {avatar ? (
              <img
                src={avatar}
                alt="preview"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle
                className={`w-16 h-16 p-4 rounded-full ${
                  darkMode
                    ? "bg-gray-700 text-gray-300"
                    : "bg-gray-100 text-gray-400"
                }`}
              />
            )}
            <label className="cursor-pointer px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 transition">
              <input type="file" accept="image/*" hidden onChange={handleFile} />
              Change
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className={`flex-1 py-2 rounded-lg transition ${
              darkMode
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------
   ✅ Profile Menu (dropdown close on outside click)
-------------------------------------------------- */
export default function ProfileMenu({
  darkMode = false,
  onLogout,
  user,
  setUser,
  archivedCount = 0,
  onShowArchive = () => {},
}) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [localUser, setLocalUser] = useState(user);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef();

  useOutsideClick(menuRef, () => setOpen(false));

  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  const handleSaveProfile = async (updatedUser) => {
    setIsLoading(true);
    try {
      const { data } = await API.put("/auth/profile", updatedUser);
      setLocalUser(data.user);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      setShowEdit(false);
      setAlertMessage("Profile updated successfully!");
    } catch (err) {
      setAlertMessage(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItem = (icon, label, onClick, danger, extraClasses = "") => (
    <button
      onClick={() => {
        onClick();
        setOpen(false);
      }}
      className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded transition ${extraClasses} ${
        danger
          ? "text-red-600"
          : darkMode
          ? "hover:bg-gray-700"
          : "hover:bg-gray-100"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-2 py-1 transition ${
            darkMode
              ? "hover:bg-gray-700 text-gray-200"
              : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {localUser?.avatar ? (
            <img
              src={localUser.avatar}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-8 h-8 text-indigo-500" />
          )}
          <span className="text-sm truncate max-w-[8rem]">
            {localUser?.name?.split(" ")[0]}
          </span>
        </button>

        {/* dropdown */}
        {open && (
          <div
            className={`absolute right-0 mt-2 w-56 rounded-xl shadow-lg ring-1 ${
              darkMode
                ? "bg-gray-800 text-gray-200 ring-gray-700"
                : "bg-white text-gray-700 ring-gray-200"
            } z-30`}
          >
            <div className="p-2">
              <p className="px-3 py-2 text-sm font-semibold truncate border-b border-gray-200 dark:border-gray-700">
                {localUser?.name}
              </p>

              {/* ✅ Archive only visible on mobile */}
              {menuItem(
                <FiArchive className="shrink-0" />,
                `Archive (${archivedCount})`,
                onShowArchive,
                false,
                "md:hidden"
              )}

              {menuItem(
                <FiEdit2 className="shrink-0" />,
                "Edit Profile",
                () => setShowEdit(true)
              )}
              {menuItem(
                <FiLogOut className="shrink-0" />,
                "Logout",
                onLogout,
                true
              )}
            </div>
          </div>
        )}
      </div>

      {showEdit && (
        <EditProfileModal
          user={localUser}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
          darkMode={darkMode}
        />
      )}

      <CustomAlert message={alertMessage} onClose={() => setAlertMessage("")} />

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="w-16 h-16 border-t-4 border-indigo-500 border-solid rounded-full animate-spin" />
        </div>
      )}
    </>
  );
}

          </motion.div>
        </AnimatePresence>
      </div>

      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}
