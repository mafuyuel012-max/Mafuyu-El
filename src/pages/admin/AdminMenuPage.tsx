import React, { useState, useEffect } from 'react';
import { Menu, Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, ExternalLink, Loader2, Check } from 'lucide-react';
import { api } from '../../lib/api';
import { MenuItem } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminMenuPage: React.FC = () => {
  const toast = useToast();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  // Delete modal state
  const [menuToDelete, setMenuToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [label, setLabel] = useState('');
  const [path, setPath] = useState('/');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchMenus = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMenus(true);
      setMenus(data);
    } catch (err: any) {
      toast.error('Gagal memuat daftar menu: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const handleOpenAdd = () => {
    setEditingMenu(null);
    setLabel('');
    setPath('/');
    setTarget('_self');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: MenuItem) => {
    setEditingMenu(m);
    setLabel(m.label);
    setPath(m.path);
    setTarget(m.target);
    setIsActive(m.is_active);
    setIsModalOpen(true);
  };

  const handleDelete = (m: MenuItem) => {
    setMenuToDelete(m);
  };

  const confirmDelete = async () => {
    if (!menuToDelete) return;
    setIsDeleting(true);
    const updated = menus.filter((item) => item.id !== menuToDelete.id);
    const reindexed = updated.map((item, idx) => ({ ...item, order: idx + 1 }));
    try {
      await api.updateMenus(reindexed);
      setMenus(reindexed);
      toast.success('Menu navigasi berhasil dihapus.');
      setMenuToDelete(null);
    } catch (err: any) {
      toast.error('Gagal menghapus menu: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menus.length - 1) return;

    const newMenus = [...menus];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newMenus[index];
    newMenus[index] = newMenus[targetIndex];
    newMenus[targetIndex] = temp;

    const reindexed = newMenus.map((item, idx) => ({ ...item, order: idx + 1 }));
    setMenus(reindexed);

    try {
      await api.updateMenus(reindexed);
      toast.success('Urutan menu berhasil diperbarui.');
    } catch (err: any) {
      toast.error('Gagal menyimpan urutan: ' + err.message);
      fetchMenus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !path.trim()) {
      toast.warning('Label dan tautan path menu wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      let updated: MenuItem[];
      if (editingMenu) {
        updated = menus.map((item) =>
          item.id === editingMenu.id
            ? { ...item, label, path, target, is_active: isActive }
            : item
        );
      } else {
        const newItem: MenuItem = {
          id: `menu-${Date.now()}`,
          label,
          path,
          target,
          order: menus.length + 1,
          is_active: isActive,
        };
        updated = [...menus, newItem];
      }

      await api.updateMenus(updated);
      setMenus(updated);
      toast.success(editingMenu ? 'Menu berhasil diperbarui!' : 'Menu baru berhasil ditambahkan!');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error('Gagal menyimpan menu: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manajemen Menu Navigasi Website
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Atur urutan, visibilitas, dan tautan internal maupun eksternal navigasi portal sekolah
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Item Menu</span>
        </button>
      </div>

      {/* Menu List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat menu navigasi...</p>
          </div>
        ) : menus.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Menu className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada item menu</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {menus.map((m, idx) => (
              <div
                key={m.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, 'up')}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                      title="Naikkan Urutan"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === menus.length - 1}
                      onClick={() => handleMove(idx, 'down')}
                      className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 text-slate-600"
                      title="Turunkan Urutan"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-[10px]">
                    {m.order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{m.label}</h4>
                      {!m.is_active && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 font-semibold text-[10px]">
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[11px] text-slate-400 mt-0.5">{m.path}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {m.target === '_blank' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                      <span>Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Add / Edit Menu */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMenu ? 'Edit Menu Navigasi' : 'Tambah Menu Navigasi Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Label Menu *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pengumuman Kelulusan"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tautan Path / URL Tujuan *
            </label>
            <input
              type="text"
              required
              placeholder="/kelulusan atau https://..."
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Buka
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="_self">Tab Saat Ini (_self)</option>
                <option value="_blank">Tab Baru (_blank)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Tampil
              </label>
              <label className="flex items-center gap-2 mt-2 text-xs text-slate-700 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
                />
                <span>Aktif di Menu</span>
              </label>
            </div>
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Menu</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(menuToDelete)}
        onClose={() => setMenuToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Menu Navigasi"
        message={
          <span>
            Apakah Anda yakin ingin menghapus menu{' '}
            <strong className="text-slate-900 font-semibold">"{menuToDelete?.label}"</strong>?
          </span>
        }
      />
    </div>
  );
};
