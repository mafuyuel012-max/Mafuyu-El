import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Film, Plus, Trash2, Edit2, Save, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';
import { GalleryItem, MediaItem } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { MediaPickerModal } from '../../components/common/MediaPickerModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AdminGaleriPage: React.FC = () => {
  const toast = useToast();

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState<GalleryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [albumName, setAlbumName] = useState('Kegiatan Siswa');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const data = await api.getGallery();
      setItems(data);
    } catch (err: any) {
      toast.error('Gagal memuat galeri: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleOpenAdd = () => {
    setTitle('');
    setType('photo');
    setMediaUrl('https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80');
    setAlbumName('Kegiatan Siswa');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleDelete = (item: GalleryItem) => {
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteGalleryItem(itemToDelete.id);
      toast.success('Item dokumentasi berhasil dihapus.');
      setItemToDelete(null);
      fetchGallery();
    } catch (err: any) {
      toast.error('Gagal menghapus item: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) {
      toast.warning('Judul dan berkas media wajib diisi.');
      return;
    }

    setIsSaving(true);
    try {
      await api.createGalleryItem({
        title,
        type,
        media_url: mediaUrl,
        album: albumName,
        description,
      });
      toast.success('Dokumentasi galeri berhasil ditambahkan!');
      setIsModalOpen(false);
      fetchGallery();
    } catch (err: any) {
      toast.error('Gagal menyimpan galeri: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dokumentasi Galeri</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola album foto dan video kegiatan, sarana, serta ekstrakurikuler sekolah
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Foto / Video</span>
        </button>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat galeri...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Belum ada item galeri</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-xs flex flex-col"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-900">
                  {item.type === 'video' ? (
                    <video src={item.media_url} className="w-full h-full object-cover" />
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-900/80 text-white">
                    {item.album_name}
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 capitalize">{item.type}</span>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
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

      {/* Modal Add Gallery */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Item Dokumentasi Baru"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Judul Kegiatan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Upacara Bendera Hari Guru Nasional"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipe Media
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
              >
                <option value="photo">Foto</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Album
              </label>
              <input
                type="text"
                value={albumName}
                onChange={(e) => setAlbumName(e.target.value)}
                placeholder="Kegiatan Siswa, Sarana, Prestasi..."
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Berkas Media (URL / Media Library) *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold text-slate-700 whitespace-nowrap"
              >
                Pilih Media
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
              placeholder="Keterangan waktu, tempat, atau peserta..."
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan ke Galeri</span>
            </button>
          </div>
        </form>
      </Modal>

      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(media: MediaItem) => setMediaUrl(media.url)}
        allowedCategory={type === 'photo' ? 'image' : 'video'}
        title="Pilih Media untuk Galeri"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Item Dokumentasi"
        message={
          <span>
            Apakah Anda yakin ingin menghapus item dokumentasi{' '}
            <strong className="text-slate-900 font-semibold">"{itemToDelete?.title}"</strong>?
          </span>
        }
      />
    </div>
  );
};
