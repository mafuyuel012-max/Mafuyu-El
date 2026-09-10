import React, { useState, useEffect } from 'react';
import { Bell, Plus, Edit2, Trash2, Calendar, AlertTriangle, Info, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Announcement } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminPengumumanPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'biasa' | 'penting'>('biasa');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState('08:00');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (err: any) {
      toast.error('Gagal memuat pengumuman: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setPriority('biasa');
    setPublishDate(new Date().toISOString().split('T')[0]);
    setPublishTime('08:00');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setPriority(item.priority as any);
    setPublishDate(item.publish_date);
    setPublishTime(item.publish_time || '08:00');
    setIsModalOpen(true);
  };

  const handleDelete = (item: Announcement) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteAnnouncement(itemToDelete.id);
      toast.success('Pengumuman berhasil dihapus.');
      setItemToDelete(null);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error('Gagal menghapus pengumuman: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    const payload = {
      title,
      content,
      priority,
      publish_date: publishDate,
      publish_time: publishTime,
    };

    try {
      if (editingItem) {
        await api.updateAnnouncement(editingItem.id, payload);
        toast.success('Pengumuman berhasil diperbarui!');
      } else {
        await api.createAnnouncement(payload);
        toast.success('Pengumuman baru berhasil diterbitkan!');
      }
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (err: any) {
      toast.error('Gagal menyimpan pengumuman: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Pengumuman Sekolah</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pemberitahuan resmi untuk siswa, orang tua, dan masyarakat
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {/* Announcements Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            <p className="text-xs">Memuat pengumuman...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada pengumuman</p>
            <p className="text-xs text-slate-400">Klik "Buat Pengumuman Baru" untuk mempublikasikan edaran.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Judul Pengumuman</th>
                  <th className="p-4">Prioritas</th>
                  <th className="p-4">Tanggal Rilis</th>
                  <th className="p-4">Jam</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.content}</p>
                    </td>
                    <td className="p-4">
                      {item.priority === 'penting' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase">
                          Penting
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold uppercase">
                          Biasa
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-700">
                      {new Date(item.publish_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="p-4 font-mono text-slate-500">{item.publish_time || '-'} WIB</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-amber-50 hover:text-amber-700 text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Jadwal Libur Awal Ramadhan 1446 H"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Isi Pengumuman Lengkap *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Tuliskan isi pengumuman secara rinci..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tingkat Prioritas
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-hidden"
              >
                <option value="biasa">Biasa / Normal</option>
                <option value="penting">Penting / Mendesak (Banner Beranda)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Rilis
              </label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Rilis
              </label>
              <input
                type="time"
                value={publishTime}
                onChange={(e) => setPublishTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengumuman</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Pengumuman"
        message={
          <span>
            Apakah Anda yakin ingin menghapus pengumuman{' '}
            <strong className="text-slate-900 font-semibold">"{itemToDelete?.title}"</strong>?
          </span>
        }
      />
    </div>
  );
};
