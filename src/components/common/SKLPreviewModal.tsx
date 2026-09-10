import React from 'react';
import { Printer, Download, X, Award, CheckCircle2 } from 'lucide-react';
import { Modal } from './Modal';
import { useSettings } from '../../lib/settings-context';

interface SKLData {
  nisn: string;
  name: string;
  student_class: string;
  academic_year: string;
  status: string;
  notes?: string;
  exam_number?: string;
  school_name: string;
  kepala_sekolah: string;
  release_date: string;
}

interface SKLPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SKLData | null;
}

export const SKLPreviewModal: React.FC<SKLPreviewModalProps> = ({ isOpen, onClose, data }) => {
  const { settings } = useSettings();

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const isLulus = data.status === 'LULUS';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl">
      <div className="flex flex-col gap-6">
        {/* Action Header */}
        <div className="flex items-center justify-between no-print border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Surat Keterangan Lulus (SKL) Resmi
            </h3>
            <p className="text-xs text-slate-500">
              Dapat dicetak atau disimpan sebagai dokumen bukti kelulusan sementara.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen (Print / PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Layout */}
        <div
          id="printable-skl"
          className="bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-md max-w-2xl mx-auto w-full text-slate-900 text-sm leading-relaxed relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
            <Award className="w-96 h-96 text-slate-900" />
          </div>

          {/* Kop Surat Resmi */}
          <div className="flex items-center gap-5 border-b-4 border-double border-slate-800 pb-5 mb-6 text-center">
            {settings?.logo && (
              <img
                src={settings.logo}
                alt="Logo Sekolah"
                className="w-20 h-20 object-contain shrink-0"
              />
            )}
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                PEMERINTAH KOTA BENGKULU
              </h4>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                DINAS PENDIDIKAN DAN KEBUDAYAAN
              </h4>
              <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900 mt-0.5">
                {settings?.school_name || 'SD NEGERI 53 KOTA BENGKULU'}
              </h2>
              <p className="text-[11px] text-slate-600 mt-1 leading-tight">
                {settings?.address || 'Jl. Merapi Raya No. 53 Kota Bengkulu'} | NPSN: {settings?.npsn || '10702672'}
              </p>
              <p className="text-[10px] text-slate-500">
                Email: {settings?.email || 'sdn53kotabengkulu@kemdikbud.go.id'} | Telp: {settings?.phone || '(0736) 21543'}
              </p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase underline tracking-wider text-slate-900">
              SURAT KETERANGAN LULUS (SKL)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Nomor: 421.2 / {data.exam_number ? data.exam_number.replace(/\D/g, '').substring(0, 4) : '053'} / SDN53 / VI / {new Date().getFullYear()}
            </p>
          </div>

          {/* Statement */}
          <p className="mb-4 text-justify">
            Kepala SD Negeri 53 Kota Bengkulu, dengan ini menerangkan bahwa:
          </p>

          {/* Student Details Table */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-600 font-medium">Nama Lengkap</span>
              <span className="col-span-2 font-bold text-slate-900">: {data.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-600 font-medium">NISN</span>
              <span className="col-span-2 font-semibold text-slate-900">: {data.nisn}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-600 font-medium">Nomor Peserta Ujian</span>
              <span className="col-span-2 font-semibold text-slate-900">: {data.exam_number || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-600 font-medium">Kelas</span>
              <span className="col-span-2 text-slate-900">: {data.student_class}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-600 font-medium">Tahun Pelajaran</span>
              <span className="col-span-2 text-slate-900">: {data.academic_year}</span>
            </div>
          </div>

          <p className="mb-4 text-justify">
            Berdasarkan kriteria kelulusan peserta didik yang telah ditetapkan dan hasil rapat pleno dewan guru SD Negeri 53 Kota Bengkulu, yang bersangkutan dinyatakan:
          </p>

          {/* STATUS BADGE BOX */}
          <div className="my-6 text-center">
            <div
              className={`inline-flex flex-col items-center justify-center px-8 py-4 rounded-2xl border-2 font-extrabold tracking-widest text-xl uppercase shadow-xs ${
                isLulus
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                  : 'bg-rose-50 border-rose-600 text-rose-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLulus && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                <span>{data.status.replace('_', ' ')}</span>
              </div>
            </div>
            {data.notes && (
              <p className="text-xs italic text-slate-600 mt-2 max-w-md mx-auto">
                Catatan: {data.notes}
              </p>
            )}
          </div>

          <p className="text-justify mb-8">
            Surat Keterangan ini bersifat resmi dan dapat dipergunakan untuk keperluan pendaftaran ke jenjang Sekolah Menengah Pertama (SMP/MTs) atau sederajat sebelum Ijazah Asli diterbitkan.
          </p>

          {/* Signature Block */}
          <div className="flex justify-between items-end pt-4">
            <div className="text-center">
              <div className="w-24 h-24 border border-slate-300 rounded-lg flex items-center justify-center p-2 text-[10px] text-slate-400 bg-slate-50">
                Pas Foto 3x4 Siswa
              </div>
            </div>

            <div className="text-center min-w-[200px]">
              <p className="text-xs text-slate-700">Kota Bengkulu, {data.release_date || new Date().toLocaleDateString('id-ID')}</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">Kepala Sekolah,</p>

              {/* Space for stamp/signature */}
              <div className="h-16 flex items-center justify-center">
                <span className="text-[10px] text-slate-400 italic">[Tanda Tangan & Cap Resmi Sekolah]</span>
              </div>

              <p className="font-bold underline text-slate-900 text-sm">
                {data.kepala_sekolah || settings?.kepala_sekolah_nama || 'Hj. Rosdiana, S.Pd., M.Pd.'}
              </p>
              <p className="text-[11px] text-slate-600">NIP. 19680512 199203 2 004</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
