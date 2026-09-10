import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Key, ShieldCheck, Save, Loader2, UserX } from 'lucide-react';
import { api } from '../../lib/api';
import { User, UserRole } from '../../types';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminPenggunaPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete modal state
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('editor');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error('Gagal memuat pengguna: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setEmail('');
    setPassword('admin123');
    setRole('editor');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setEmail(u.email);
    setPassword(''); // leave empty to not change
    setRole(u.role);
    setIsModalOpen(true);
  };

  const handleDelete = (u: User) => {
    if (u.id === currentUser?.id) {
      toast.warning('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }
    setUserToDelete(u);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteUser(userToDelete.id);
      toast.success('Pengguna berhasil dihapus.');
      setUserToDelete(null);
      fetchUsers();
    } catch (err: any) {
      toast.error('Gagal menghapus pengguna: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim()) {
      toast.warning('Seluruh kolom data wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name,
          username,
          email,
          role,
          ...(password ? { password } : {}),
        });
        toast.success('Data pengguna berhasil diperbarui!');
      } else {
        await api.createUser({
          name,
          username,
          email,
          password: password || 'admin123',
          role,
        });
        toast.success('Pengguna baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error('Gagal menyimpan pengguna: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Pengguna & Hak Akses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola operator website: Superadmin (Penuh), Admin (Konten), dan Editor (Berita)
          </p>
        </div>

        {currentUser?.role === 'superadmin' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Operator Baru</span>
          </button>
        )}
      </div>

      {/* Table of Users */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat pengguna...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Nama & Username</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Hak Akses (Role)</th>
                  <th className="p-4">Tanggal Dibuat</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'admin'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 text-right">
                      {currentUser?.role === 'superadmin' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                            title="Edit Operator"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(u)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Operator CMS' : 'Tambah Operator Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Lengkap *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Budi Santoso, S.Kom"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                placeholder="budi53"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hak Akses (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold capitalize"
              >
                <option value="editor">Editor (Hanya Berita)</option>
                <option value="admin">Admin (Konten & Kelulusan)</option>
                <option value="superadmin">Superadmin (Akses Penuh)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              placeholder="budi@sdn53.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {editingUser ? 'Ganti Password (Kosongkan jika tidak diubah)' : 'Password Masuk *'}
            </label>
            <input
              type="password"
              placeholder={editingUser ? 'Masukkan password baru...' : 'Password awal...'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Operator</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(userToDelete)}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Pengguna"
        message={
          <span>
            Apakah Anda yakin ingin menghapus akun pengguna{' '}
            <strong className="text-slate-900 font-semibold">"{userToDelete?.name}"</strong> (@{userToDelete?.username})?
          </span>
        }
      />
    </div>
  );
};
