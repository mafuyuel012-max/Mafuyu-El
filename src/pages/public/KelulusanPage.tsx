import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Lock,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  RotateCcw,
  Calendar,
  Award,
  Sparkles,
  Info,
} from 'lucide-react';
import { api } from '../../lib/api';
import { GraduationAnnouncement, GraduationStudent } from '../../types';
import { SKLPreviewModal } from '../../components/common/SKLPreviewModal';
import { useSettings } from '../../lib/settings-context';
import { useToast } from '../../components/common/Toast';

export const KelulusanPage: React.FC = () => {
  const { settings } = useSettings();
  const toast = useToast();

  const [announcement, setAnnouncement] = useState<GraduationAnnouncement | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Form states
  const [nisn, setNisn] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [resultData, setResultData] = useState<{
    student: GraduationStudent;
    announcement: GraduationAnnouncement;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isReleased: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isReleased: false });

  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const res = await api.getGraduationStatus();
      setIsActive(res.is_active);
      setAnnouncement(res.announcement);
    } catch (err) {
      console.error('Failed to get graduation status:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Calculate countdown
  useEffect(() => {
    if (!announcement) return;

    const targetDateStr = `${announcement.publish_date}T${announcement.publish_time || '00:00'}:00`;
    const targetTime = new Date(targetDateStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isReleased: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isReleased: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [announcement]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisn.trim() || !birthDate.trim()) {
      toast.warning('Silakan masukkan NISN dan Tanggal Lahir secara lengkap.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await api.checkGraduation({ nisn: nisn.trim(), birth_date: birthDate.trim() });
      setResultData(res);
      toast.success('Data peserta didik berhasil diverifikasi!');
    } catch (err: any) {
      toast.error(err.message || 'Verifikasi gagal. Periksa kembali NISN dan tanggal lahir.');
      setResultData(null);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = () => {
    setResultData(null);
    setNisn('');
    setBirthDate('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl relative overflow-hidden text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center mx-auto shadow-inner">
          <GraduationCap className="w-8 h-8 text-sky-300" />
        </div>

        <div className="space-y-2">
          <span className="px-3.5 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold uppercase tracking-wider">
            Sistem Informasi Kelulusan Resmi
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {announcement?.title || 'Pengumuman Kelulusan Peserta Didik'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100/90 max-w-xl mx-auto leading-relaxed">
            {settings?.school_name || 'SD Negeri 53 Kota Bengkulu'} â€¢ Tahun Pelajaran {announcement?.academic_year || '2024/2025'}
          </p>
        </div>
      </div>

      {/* Case 1: Kelulusan Tidak Aktif */}
      {!isLoading && !isActive && (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">Layanan Kelulusan Belum Aktif</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Saat ini belum ada jadwal rilis pengumuman kelulusan aktif dari manajemen sekolah. Silakan pantau pengumuman resmi di website atau hubungi pihak sekolah.
          </p>
        </div>
      )}

      {/* Case 2: Countdown Timer (Belum Waktunya Rilis) */}
      {!isLoading && isActive && !timeLeft.isReleased && (
        <div className="bg-white rounded-3xl border border-amber-200 p-8 sm:p-12 text-center space-y-6 shadow-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Clock className="w-4 h-4 animate-spin text-amber-600" />
            <span>Pengumuman Belum Dibuka â€¢ Menunggu Waktu Rilis</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Hitung Mundur Pembukaan Kelulusan
          </h2>

          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Pengumuman akan dibuka secara serentak pada tanggal{' '}
            <strong className="text-slate-800">
              {new Date(announcement!.publish_date).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </strong>{' '}
            pukul <strong className="text-slate-800">{announcement!.publish_time} WIB</strong>.
          </p>

          {/* Countdown Clock Units */}
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto pt-2">
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
              <span className="text-2xl sm:text-4xl font-black">{timeLeft.days}</span>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Hari</p>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
              <span className="text-2xl sm:text-4xl font-black">{timeLeft.hours}</span>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Jam</p>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
              <span className="text-2xl sm:text-4xl font-black">{timeLeft.minutes}</span>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Menit</p>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-md">
              <span className="text-2xl sm:text-4xl font-black text-amber-400">{timeLeft.seconds}</span>
              <p className="text-[10px] sm:text-xs text-slate-400 uppercase font-bold mt-1">Detik</p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 max-w-md mx-auto flex items-center justify-center gap-2">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Formulir verifikasi kelulusan terkunci hingga waktu pembukaan tiba.</span>
          </div>
        </div>
      )}

      {/* Case 3: Rilis Aktif (Formulir Verifikasi Siswa) */}
      {!isLoading && isActive && timeLeft.isReleased && !resultData && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Formulir Verifikasi Identitas Siswa
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Demi keamanan dan privasi data, hasil kelulusan hanya dapat diakses melalui verifikasi identitas resmi peserta didik.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: 0123456789 (10 digit angka)"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                NISN tertera pada raport, Kartu Pelajar, atau bukti pendaftaran ujian sekolah.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Tanggal Lahir Peserta Didik
              </label>
              <input
                type="date"
                required
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Format: Tanggal / Bulan / Tahun sesuai akta kelahiran/raport.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{isVerifying ? 'Memverifikasi Data Siswa...' : 'Cek Status Kelulusan'}</span>
              </button>
            </div>
          </form>

          <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-3 text-xs text-sky-900">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Contoh data siswa untuk pengujian: NISN: <strong>0123456789</strong> dengan tanggal lahir <strong>2012-05-14</strong> (Ahmad Rizky Pratama) atau NISN: <strong>0123456790</strong> (Siti Nurhaliza).
            </span>
          </div>
        </div>
      )}

      {/* Case 4: Hasil Kelulusan Terverifikasi */}
      {resultData && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6 animate-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                Verifikasi Berhasil
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Hasil Kelulusan Peserta Didik
              </h2>
            </div>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Periksa Siswa Lain</span>
            </button>
          </div>

          {/* Student details grid */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Nama Lengkap</span>
              <span className="col-span-2 font-bold text-slate-900 text-base">
                {resultData.student.name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">NISN</span>
              <span className="col-span-2 font-semibold text-slate-800">{resultData.student.nisn}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Nomor Peserta</span>
              <span className="col-span-2 text-slate-800">{resultData.student.exam_number || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Kelas</span>
              <span className="col-span-2 text-slate-800">{resultData.student.student_class}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Tahun Pelajaran</span>
              <span className="col-span-2 text-slate-800">{resultData.announcement.academic_year}</span>
            </div>
          </div>

          {/* STATUS RESULT BANNER */}
          <div className="text-center py-6">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-2">
              Status Keputusan Dewan Guru:
            </span>
            <div
              className={`inline-flex flex-col items-center justify-center px-10 py-5 rounded-2xl border-2 font-black text-2xl sm:text-3xl tracking-wider uppercase shadow-md ${
                resultData.student.status === 'LULUS'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                  : 'bg-rose-50 border-rose-500 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {resultData.student.status === 'LULUS' && (
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                )}
                <span>{resultData.student.status.replace('_', ' ')}</span>
              </div>
            </div>

            {resultData.student.notes && (
              <p className="text-xs text-slate-600 italic mt-3 max-w-md mx-auto">
                Catatan: {resultData.student.notes}
              </p>
            )}
          </div>

          {/* Action Buttons: CETAK HASIL / DOWNLOAD SKL */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              Surat Keterangan Lulus (SKL) resmi dapat dicetak sebagai bukti untuk pendaftaran jenjang SMP.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Hasil / Download SKL Resmi</span>
            </button>
          </div>
        </div>
      )}

      {/* SKL Modal */}
      {resultData && (
        <SKLPreviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={{
            nisn: resultData.student.nisn,
            name: resultData.student.name,
            student_class: resultData.student.student_class,
            academic_year: resultData.announcement.academic_year,
            status: resultData.student.status,
            notes: resultData.student.notes,
            exam_number: resultData.student.exam_number,
            school_name: settings?.school_name || 'SD Negeri 53 Kota Bengkulu',
            kepala_sekolah: settings?.kepala_sekolah_nama || 'Hj. Rosdiana, S.Pd., M.Pd.',
            release_date: new Date(resultData.announcement.publish_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            }),
          }}
        />
      )}
    </div>
  );
};
