import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Printer,
  Save,
  Search,
  Users,
  ShieldCheck,
  RotateCcw,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { GraduationAnnouncement, GraduationStudent } from '../../types';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { SKLPreviewModal } from '../../components/common/SKLPreviewModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useSettings } from '../../lib/settings-context';

export const AdminKelulusanPage: React.FC = () => {
  const toast = useToast();
  const { settings } = useSettings();

  const [announcement, setAnnouncement] = useState<GraduationAnnouncement | null>(null);
  const [students, setStudents] = useState<GraduationStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Student delete state
  const [studentToDelete, setStudentToDelete] = useState<GraduationStudent | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState(false);

  // Announcement edit form
  const [annTitle, setAnnTitle] = useState('');
  const [annYear, setAnnYear] = useState('');
  const [annDate, setAnnDate] = useState('');
  const [annTime, setAnnTime] = useState('');
  const [annActive, setAnnActive] = useState(true);
  const [annNotes, setAnnNotes] = useState('');
  const [isSavingAnn, setIsSavingAnn] = useState(false);

  // Student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<GraduationStudent | null>(null);
  const [stNisn, setStNisn] = useState('');
  const [stName, setStName] = useState('');
  const [stBirthDate, setStBirthDate] = useState('');
  const [stClass, setStClass] = useState('VI A');
  const [stExamNum, setStExamNum] = useState('');
  const [stStatus, setStStatus] = useState<'LULUS' | 'DITUNDA' | 'TIDAK_LULUS'>('LULUS');
  const [stNotes, setStNotes] = useState('');
  const [isSavingStudent, setIsSavingStudent] = useState(false);

  // SKL Preview Modal
  const [selectedStudentForSKL, setSelectedStudentForSKL] = useState<GraduationStudent | null>(null);

  const fetchGraduationData = async () => {
    setIsLoading(true);
    try {
      const statusRes = await api.getGraduationStatus();
      if (statusRes.announcement) {
        setAnnouncement(statusRes.announcement);
        setAnnTitle(statusRes.announcement.title);
        setAnnYear(statusRes.announcement.academic_year);
        setAnnDate(statusRes.announcement.publish_date);
        setAnnTime(statusRes.announcement.publish_time);
        setAnnActive(statusRes.announcement.is_active);
        setAnnNotes(statusRes.announcement.notes || '');

        // Fetch students
        const stRes = await api.getGraduationStudents({ announcement_id: statusRes.announcement.id });
        setStudents(stRes.data);
      }
    } catch (err: any) {
      toast.error('Gagal memuat data kelulusan: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduationData();
  }, []);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement) return;

    setIsSavingAnn(true);
    try {
      const res = await api.updateGraduationAnnouncement(announcement.id, {
        title: annTitle,
        academic_year: annYear,
        publish_date: annDate,
        publish_time: annTime,
        is_active: annActive,
        notes: annNotes,
      });
      setAnnouncement(res.announcement);
      toast.success('Pengaturan jadwal kelulusan berhasil diperbarui!');
    } catch (err: any) {
      toast.error('Gagal menyimpan jadwal: ' + err.message);
    } finally {
      setIsSavingAnn(false);
    }
  };

  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStNisn('');
    setStName('');
    setStBirthDate('2012-01-01');
    setStClass('VI A');
    setStExamNum(`053-VI-${Math.floor(100 + Math.random() * 900)}`);
    setStStatus('LULUS');
    setStNotes('Memenuhi seluruh kriteria kelulusan kurikulum merdeka');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (st: GraduationStudent) => {
    setEditingStudent(st);
    setStNisn(st.nisn);
    setStName(st.name);
    setStBirthDate(st.birth_date);
    setStClass(st.student_class);
    setStExamNum(st.exam_number || '');
    setStStatus(st.status as any);
    setStNotes(st.notes || '');
    setIsStudentModalOpen(true);
  };

  const handleDeleteStudent = (st: GraduationStudent) => {
    setStudentToDelete(st);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeletingStudent(true);
    try {
      await api.deleteGraduationStudent(studentToDelete.id);
      toast.success('Data siswa berhasil dihapus.');
      setStudentToDelete(null);
      fetchGraduationData();
    } catch (err: any) {
      toast.error('Gagal menghapus siswa: ' + err.message);
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stNisn.trim() || !stName.trim()) {
      toast.warning('NISN dan Nama siswa wajib diisi.');
      return;
    }

    setIsSavingStudent(true);
    const payload = {
      announcement_id: announcement?.id || 'ann-grad-2025',
      nisn: stNisn.trim(),
      name: stName.trim(),
      birth_date: stBirthDate,
      student_class: stClass,
      exam_number: stExamNum,
      status: stStatus,
      notes: stNotes,
    };

    try {
      if (editingStudent) {
        await api.updateGraduationStudent(editingStudent.id, payload);
        toast.success('Data siswa berhasil diperbarui!');
      } else {
        await api.createGraduationStudent(payload);
        toast.success('Peserta didik berhasil ditambahkan!');
      }
      setIsStudentModalOpen(false);
      fetchGraduationData();
    } catch (err: any) {
      toast.error('Gagal menyimpan siswa: ' + err.message);
    } finally {
      setIsSavingStudent(false);
    }
  };

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.nisn.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || st.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Manajemen Pengumuman Kelulusan Siswa
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur jadwal pembukaan otomatis, hitung mundur, verifikasi data rahasia, dan terbitkan SKL resmi
        </p>
      </div>

      {/* 1. SCHEDULE & ANNOUNCEMENT SETTINGS */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Konfigurasi Jadwal Rilis & Portal Kelulusan
            </h3>
            <p className="text-xs text-slate-500">
              Sistem akan otomatis menghitung mundur dan mengunci formulir sebelum waktu rilis tiba
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveAnnouncement} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Pengumuman
              </label>
              <input
                type="text"
                required
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tahun Pelajaran
              </label>
              <input
                type="text"
                required
                value={annYear}
                onChange={(e) => setAnnYear(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Rilis Serentak
              </label>
              <input
                type="date"
                required
                value={annDate}
                onChange={(e) => setAnnDate(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Rilis (WIB)
              </label>
              <input
                type="time"
                required
                value={annTime}
                onChange={(e) => setAnnTime(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Portal Publik
              </label>
              <select
                value={annActive ? 'true' : 'false'}
                onChange={(e) => setAnnActive(e.target.value === 'true')}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
              >
                <option value="true">Aktif (Dapat Diakses / Menunggu Countdown)</option>
                <option value="false">Nonaktif (Portal Ditutup)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Resmi Kelulusan
            </label>
            <input
              type="text"
              value={annNotes}
              onChange={(e) => setAnnNotes(e.target.value)}
              placeholder="Contoh: Berdasarkan Keputusan Kepala SD Negeri 53 Kota Bengkulu No. 421.2/053/2025"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSavingAnn}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingAnn ? 'Menyimpan...' : 'Simpan Pengaturan Jadwal'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. STUDENTS DATABASE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Daftar Peserta Didik & Hasil Kelulusan ({students.length} Siswa)
            </h3>
            <p className="text-xs text-slate-500">
              Data rahasia tersimpan aman dan hanya dapat dicek menggunakan kombinasi NISN + Tanggal Lahir
            </p>
          </div>

          <button
            onClick={handleOpenAddStudent}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Data Siswa</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau NISN siswa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-700 focus:outline-hidden font-medium"
            >
              <option value="all">Semua Status</option>
              <option value="LULUS">Hanya LULUS</option>
              <option value="DITUNDA">Hanya DITUNDA</option>
              <option value="TIDAK_LULUS">Hanya TIDAK LULUS</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              <p className="text-xs">Memuat data peserta didik...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Belum ada data siswa yang cocok</p>
              <p className="text-xs text-slate-400">Klik "Tambah Data Siswa" untuk memasukkan peserta ujian.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">NISN</th>
                    <th className="p-4">Nama Siswa</th>
                    <th className="p-4">Tanggal Lahir</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">No. Peserta</th>
                    <th className="p-4">Status Kelulusan</th>
                    <th className="p-4 text-right">Aksi & SKL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-800">{st.nisn}</td>
                      <td className="p-4 font-bold text-slate-900">{st.name}</td>
                      <td className="p-4 text-slate-600 font-medium">{st.birth_date}</td>
                      <td className="p-4 text-slate-600">{st.student_class}</td>
                      <td className="p-4 text-slate-500 font-mono">{st.exam_number || '-'}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            st.status === 'LULUS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.status === 'DITUNDA'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedStudentForSKL(st)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                            title="Pratinjau / Cetak SKL"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditStudent(st)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-purple-50 hover:text-purple-600 text-slate-600 transition-colors"
                            title="Edit Data"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(st)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                            title="Hapus Data"
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
      </div>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={editingStudent ? 'Edit Data Siswa' : 'Tambah Peserta Didik Baru'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                NISN (10 Digit Angka) *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 0123456789"
                value={stNisn}
                onChange={(e) => setStNisn(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                placeholder="Nama sesuai akta/ijazah..."
                value={stName}
                onChange={(e) => setStName(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                required
                value={stBirthDate}
                onChange={(e) => setStBirthDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kelas
              </label>
              <input
                type="text"
                value={stClass}
                onChange={(e) => setStClass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                No. Peserta Ujian
              </label>
              <input
                type="text"
                value={stExamNum}
                onChange={(e) => setStExamNum(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status Keputusan Kelulusan *
              </label>
              <select
                value={stStatus}
                onChange={(e) => setStStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white font-bold"
              >
                <option value="LULUS">LULUS</option>
                <option value="DITUNDA">DITUNDA</option>
                <option value="TIDAK_LULUS">TIDAK LULUS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Catatan Resmi Sekolah
              </label>
              <input
                type="text"
                value={stNotes}
                onChange={(e) => setStNotes(e.target.value)}
                placeholder="Catatan pada cetakan SKL..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStudentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSavingStudent}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Siswa</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* SKL Modal */}
      {selectedStudentForSKL && (
        <SKLPreviewModal
          isOpen={!!selectedStudentForSKL}
          onClose={() => setSelectedStudentForSKL(null)}
          data={{
            nisn: selectedStudentForSKL.nisn,
            name: selectedStudentForSKL.name,
            student_class: selectedStudentForSKL.student_class,
            academic_year: announcement?.academic_year || '2024/2025',
            status: selectedStudentForSKL.status,
            notes: selectedStudentForSKL.notes,
            exam_number: selectedStudentForSKL.exam_number,
            school_name: settings?.school_name || 'SD Negeri 53 Kota Bengkulu',
            kepala_sekolah: settings?.kepala_sekolah_nama || 'Hj. Rosdiana, S.Pd., M.Pd.',
            release_date: new Date(announcement?.publish_date || Date.now()).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          }}
        />
      )}

      {/* Student Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={confirmDeleteStudent}
        isLoading={isDeletingStudent}
        title="Hapus Data Siswa"
        message={
          <span>
            Apakah Anda yakin ingin menghapus data kelulusan siswa{' '}
            <strong className="text-slate-900 font-semibold">"{studentToDelete?.name}"</strong>{' '}
            (NISN: {studentToDelete?.nisn})?
          </span>
        }
      />
    </div>
  );
};
