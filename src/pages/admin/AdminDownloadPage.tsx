import React, { useState, useEffect } from 'react';
import { Download, Plus, Trash2, Edit2, FileText, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { DownloadItem, MediaItem } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminDownloadPage: React.FC = () => {
  const toast = useToast();

  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<DownloadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Formulir');
  const [fileUrl, setFileUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(256000);
  const [fileType, setFileType] = useState('application/pdf');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchDownloads = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDownloads();
      setDownloads(data);
    } catch (err: any) {
      toast.error('Gagal memuat unduhan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDownloads();
  }, []);

  const handleOpenAdd = () => {
    setTitle('');
    setCategory('Formulir');
    setFileUrl('');
    setFileName('');
    setFileSize(150000);
    setFileType('application/pdf');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleDelete = (item: DownloadItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteDownload(itemToDelete.id);
      toast.success('Berkas berhasil dihapus.');
      setItemToDelete(null);
      fetchDownloads();
    } catch (err: any) {
      toast.error('Gagal menghapus berkas: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectMedia = (media: MediaItem) => {
    setFileUrl(media.url);
    setFileName(media.original_name);
    setFileSize(media.size);
    setFileType(media.mime_type);
    if (!title) {
      setTitle(media.original_name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fileUrl.trim()) {
      toast.warning('Judul dokumen dan berkas wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await api.createDownload({
        title,
        category,
        file_url: fileUrl,
        file_name: fileName || title + '.pdf',
        file_size: fileSize,
        file_ext: fileType,
        description,
      });
      toast.success('Dokumen unduhan baru berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchDownloads();
    } catch (err: any) {
      toast.error('Gagal menyimpan berkas unduhan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Pusat Unduhan & Berkas Sekolah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola formulir pendaftaran, kurikulum, RPP, silabus, dan surat edaran resmi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Dokumen Unduhan</span>
        </button>
      </div>

      {/* Table of Downloads */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs">Memuat daftar berkas...</p>
          </div>
        ) : downloads.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada dokumen unduhan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Nama Dokumen</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Ukuran</th>
                  <th className="p-4">Total Diunduh</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {downloads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.file_name}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {(item.file_size / 1024).toFixed(0)} KB
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {item.downloads_count} kali
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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

      {/* Modal Add Download */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Dokumen Unduhan Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Dokumen *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Formulir Pendaftaran Siswa Baru 2025/2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori Berkas
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="Formulir">Formulir</option>
                <option value="Silabus">Silabus</option>
                <option value="RPP">RPP</option>
                <option value="Panduan">Panduan</option>
                <option value="Surat Edaran">Surat Edaran</option>
                <option value="Materi">Materi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama File Fisik
              </label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="formulir-ppdb-2025.pdf"
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Berkas / URL Dokumen *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://... atau pilih dari Media Library"
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 whitespace-nowrap"
              >
                Pilih Berkas
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Petunjuk pengisian atau sasaran formulir..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Dokumen</span>
            </button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={handleSelectMedia}
        title="Pilih Berkas untuk Pusat Unduhan"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Berkas Unduhan"
        message={
          <span>
            Apakah Anda yakin ingin menghapus dokumen{' '}
            <strong className="text-slate-900 font-semibold">"{itemToDelete?.title}"</strong>?
          </span>
        }
      />
    </div>
  );
};
