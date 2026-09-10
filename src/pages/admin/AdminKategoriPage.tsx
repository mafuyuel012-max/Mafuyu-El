import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit2, Trash2, Loader2, Save } from 'lucide-react';
import { api } from '../../lib/api';
import { Category } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminKategoriPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const toast = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err: any) {
      toast.error('Gagal memuat kategori: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setIsModalOpen(true);
  };

  const handleDelete = (c: Category) => {
    setCategoryToDelete(c);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteCategory(categoryToDelete.id);
      toast.success('Kategori berhasil dihapus.');
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err: any) {
      toast.error('Gagal menghapus kategori: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          description,
        });
        toast.success('Kategori berhasil diperbarui!');
      } else {
        await api.createCategory({
          name,
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          description,
        });
        toast.success('Kategori baru berhasil ditambahkan!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error('Gagal menyimpan kategori: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Kategori Berita</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola pengelompokan berita dan publikasi artikel sekolah
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat kategori...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Nama Kategori</th>
                  <th className="p-4">Slug URL</th>
                  <th className="p-4">Deskripsi</th>
                  <th className="p-4">Jumlah Berita</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 font-mono text-slate-500">{c.slug}</td>
                    <td className="p-4 text-slate-500">{c.description || '-'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 font-bold">
                        {c.post_count || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
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
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Kategori *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Prestasi Siswa"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingCategory) {
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                }
              }}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Slug URL
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-mono bg-slate-50 text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              placeholder="Penjelasan kategori..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
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
              <span>Simpan Kategori</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Kategori"
        message={
          <span>
            Apakah Anda yakin ingin menghapus kategori{' '}
            <strong className="text-slate-900 font-semibold">"{categoryToDelete?.name}"</strong>?
          </span>
        }
      />
    </div>
  );
};
