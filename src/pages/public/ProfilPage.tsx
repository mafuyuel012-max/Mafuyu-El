import React, { useState } from 'react';
import {
  BookOpen,
  Target,
  Compass,
  History,
  Award,
  Users,
  Building2,
  Sparkles,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';

export const ProfilPage: React.FC = () => {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<
    'identitas' | 'sambutan' | 'visi-misi' | 'sejarah' | 'organisasi' | 'sarpras' | 'program' | 'ekskul'
  >('identitas');

  const tabs = [
    { id: 'identitas', label: 'Identitas Sekolah', icon: Award },
    { id: 'sambutan', label: 'Sambutan Kepala Sekolah', icon: BookOpen },
    { id: 'visi-misi', label: 'Visi, Misi & Tujuan', icon: Target },
    { id: 'sejarah', label: 'Sejarah Singkat', icon: History },
    { id: 'organisasi', label: 'Struktur Organisasi', icon: Users },
    { id: 'sarpras', label: 'Sarana & Prasarana', icon: Building2 },
    { id: 'program', label: 'Program Unggulan', icon: Sparkles },
    { id: 'ekskul', label: 'Ekstrakurikuler', icon: Compass },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-bold uppercase tracking-wider">
            Profil Resmi Lembaga
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Profil {settings?.school_name || 'SD Negeri 53 Kota Bengkulu'}
          </h1>
          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Mengenal lebih dekat visi, misi, rekam jejak sejarah, sarana prasarana, serta program pendidikan unggulan berwawasan lingkungan hidup.
          </p>
        </div>
      </div>

      {/* Profile Navigation Tabs & Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Tab Buttons */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1 sticky top-24">
          <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Daftar Informasi
          </p>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Box */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs min-h-[500px]">
          {/* TAB 1: IDENTITAS SEKOLAH */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Identitas Resmi Sekolah</h2>
                <p className="text-xs text-slate-500 mt-1">Data pokok pendidikan terdaftar resmi pada Kemendikbudristek RI</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Nama Sekolah</span>
                  <span className="sm:col-span-2 font-bold text-slate-900">{settings?.school_name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">NPSN</span>
                  <span className="sm:col-span-2 font-bold text-slate-900">{settings?.npsn || '10702672'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Status Akreditasi</span>
                  <span className="sm:col-span-2 font-bold text-emerald-600">{settings?.akreditasi || 'A (Unggul)'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Bentuk Pendidikan</span>
                  <span className="sm:col-span-2 text-slate-900">Sekolah Dasar Negeri (SDN)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Status Sekolah</span>
                  <span className="sm:col-span-2 text-slate-900">Negeri</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Alamat Lengkap</span>
                  <span className="sm:col-span-2 text-slate-900">{settings?.address}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Email Resmi</span>
                  <span className="sm:col-span-2 text-slate-900">{settings?.email}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-500">Nomor Telepon</span>
                  <span className="sm:col-span-2 text-slate-900">{settings?.phone}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SAMBUTAN KEPALA SEKOLAH */}
          {activeTab === 'sambutan' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
                <div className="w-36 h-36 rounded-2xl overflow-hidden shadow-md shrink-0 bg-slate-100 border-2 border-slate-200">
                  <img
                    src={settings?.kepala_sekolah_foto}
                    alt={settings?.kepala_sekolah_nama}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Pimpinan Sekolah</span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">{settings?.kepala_sekolah_nama}</h2>
                  <p className="text-xs text-slate-500 font-medium">Kepala SD Negeri 53 Kota Bengkulu</p>
                </div>
              </div>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {settings?.kepala_sekolah_sambutan}
              </div>
            </div>
          )}

          {/* TAB 3: VISI & MISI */}
          {activeTab === 'visi-misi' && (
            <div className="space-y-8">
              {/* Visi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-sky-600" />
                  <h2 className="text-lg font-bold text-slate-900">Visi Sekolah</h2>
                </div>
                <div className="bg-sky-50 border border-sky-100 rounded-2xl p-6 text-sky-950 font-bold text-base leading-relaxed">
                  "{settings?.visi}"
                </div>
              </div>

              {/* Misi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Misi Sekolah</h2>
                </div>
                <div className="space-y-2.5">
                  {(settings?.misi || []).map((m, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 leading-relaxed">{m}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tujuan */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">Tujuan Sekolah</h2>
                </div>
                <div className="space-y-2.5">
                  {(settings?.tujuan || []).map((t, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SEJARAH SINGKAT */}
          {activeTab === 'sejarah' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Sejarah Singkat Sekolah</h2>
                <p className="text-xs text-slate-500 mt-1">Perjalanan panjang dedikasi mencerdaskan anak bangsa di Kota Bengkulu</p>
              </div>

              <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {settings?.sejarah}
              </div>
            </div>
          )}

          {/* TAB 5: STRUKTUR ORGANISASI */}
          {activeTab === 'organisasi' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Struktur Organisasi & Dewan Pendidik</h2>
                <p className="text-xs text-slate-500 mt-1">Susunan pimpinan, dewan guru, dan pengurus komite sekolah</p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 whitespace-pre-line text-sm text-slate-800 leading-loose">
                {settings?.struktur_organisasi}
              </div>
            </div>
          )}

          {/* TAB 6: SARANA & PRASARANA */}
          {activeTab === 'sarpras' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Fasilitas & Sarana Prasarana</h2>
                <p className="text-xs text-slate-500 mt-1">Ruang belajar yang representatif, modern, asri, dan ramah anak</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(settings?.sarana_prasarana || []).map((s, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                    <Building2 className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: PROGRAM UNGGULAN */}
          {activeTab === 'program' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Program Unggulan Sekolah</h2>
                <p className="text-xs text-slate-500 mt-1">Inovasi pembelajaran membentuk keunggulan akademis dan karakter</p>
              </div>

              <div className="space-y-3">
                {(settings?.program_unggulan || []).map((p, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-sky-50/60 rounded-2xl border border-sky-100">
                    <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                    <span className="text-sm font-bold text-sky-950">{p}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: EKSTRAKURIKULER */}
          {activeTab === 'ekskul' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Kegiatan Ekstrakurikuler</h2>
                <p className="text-xs text-slate-500 mt-1">Wadah penyaluran bakat, minat, seni, olahraga, dan kepemimpinan siswa</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(settings?.ekstrakurikuler || []).map((e, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <Compass className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span className="text-sm font-bold text-emerald-950">{e}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
