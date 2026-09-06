import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, UserCheck, Users, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function AdminStaffModal({ isOpen, onClose, currentUserId }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getUsers();
      if (res.success) {
        setUsers(res.users);
      }
    } catch (err) {
      setError(err.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRoleChange = async (targetUser, newRole) => {
    if (targetUser.role === newRole) return;
    setUpdatingId(targetUser.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await api.updateUserRole(targetUser.id, newRole);
      if (res.success) {
        setSuccessMsg(`Updated ${targetUser.name}'s role to ${newRole.toUpperCase()}.`);
        setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setUpdatingId(null);
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#16191F] rounded-3xl shadow-2xl border border-[#E6E1D8] dark:border-[#262C36] overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#ECE7DE] dark:border-[#242A34] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#193B2D] text-white flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-snug">
                Staff & Access Directory
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage roles and system permissions for library personnel
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Metrics */}
        <div className="px-6 py-3 bg-[#FAF8F5] dark:bg-[#1A1E26] border-b border-[#ECE7DE] dark:border-[#242A34] flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-600 dark:text-slate-400 font-medium">
              Total Personnel: <strong className="text-slate-900 dark:text-white font-bold">{users.length}</strong>
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              {adminCount} Chief Admin{adminCount !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <UserCheck className="w-3.5 h-3.5" />
              {staffCount} Desk Staff
            </span>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-[#193B2D] dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Users List */}
        <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-[#193B2D]" />
              <p className="text-xs">Loading staff accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No staff accounts found.
            </div>
          ) : (
            users.map((user) => {
              const isAdmin = user.role === 'admin';
              const isSelf = user.id === currentUserId;
              const isUpdating = updatingId === user.id;

              return (
                <div 
                  key={user.id}
                  className="p-4 rounded-2xl border border-[#ECE7DE] dark:border-[#262C36] bg-[#FCFBF9] dark:bg-[#1C2028] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isAdmin 
                        ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' 
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700'
                    }`}>
                      {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {user.name}
                        </h4>
                        {isSelf && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono">
                        @{user.username} • <span className="font-sans">{user.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Role badge & Toggle */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      isAdmin
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                    }`}>
                      {isAdmin ? 'Chief Admin' : 'Desk Staff'}
                    </span>

                    <select
                      value={user.role}
                      disabled={isUpdating || (isAdmin && adminCount <= 1)}
                      onChange={(e) => handleRoleChange(user, e.target.value)}
                      className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-white dark:bg-[#14171D] border border-[#DDD6CB] dark:border-[#2D333F] text-slate-800 dark:text-white focus:outline-none focus:border-[#193B2D] cursor-pointer disabled:opacity-50"
                    >
                      <option value="staff">Desk Staff</option>
                      <option value="admin">Chief Admin</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 bg-[#FAF8F5] dark:bg-[#1A1E26] border-t border-[#ECE7DE] dark:border-[#242A34] flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            Privilege Separation: Chief Admins can delete catalog records & adjust staff permissions.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
