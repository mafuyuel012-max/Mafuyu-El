import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  Building,
} from 'lucide-react';
import { useSettings } from '../../lib/settings-context';
import { useToast } from '../../components/common/Toast';

export const KontakPage: React.FC = () => {
  const { settings } = useSettings();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast.success('Pesan Anda berhasil dikirim ke layanan informasi sekolah.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-white/20 text-sky-200 text-xs font-bold uppercase tracking-wider">
            Layanan Komunikasi & Informasi
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Hubungi SD Negeri 53 Kota Bengkulu
          </h1>
          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Kami siap melayani pertanyaan, konsultasi pendaftaran peserta didik baru, saran, maupun permohonan informasi kedinasan.
          </p>
        </div>
      </div>

      {/* Main Grid: Contact Info + Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Info Cards (Left) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Informasi Kontak Resmi
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Alamat Sekolah
                  </h3>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs sm:text-sm">
                    {settings?.address || 'Jl. Merapi Raya No. 53, Kebun Tebeng, Ratu Agung, Kota Bengkulu'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Layanan WhatsApp Center
                  </h3>
                  <p className="text-slate-600 mt-1 text-xs sm:text-sm">
                    {settings?.whatsapp || '0812-7345-6789'}
                  </p>
                  {settings?.whatsapp && (
                    <a
                      href={`https://wa.me/62${settings.whatsapp.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 mt-1"
                    >
                      <span>Chat WhatsApp Sekarang</span>
                      â†’
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Telepon Kantor
                  </h3>
                  <p className="text-slate-600 mt-1 text-xs sm:text-sm">
                    {settings?.phone || '(0736) 21543'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Email Resmi
                  </h3>
                  <p className="text-slate-600 mt-1 text-xs sm:text-sm">
                    {settings?.email || 'sdn53kotabengkulu@kemdikbud.go.id'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">
                    Jam Pelayanan Tata Usaha
                  </h3>
                  <p className="text-slate-600 mt-1 text-xs">
                    Senin - Kamis: 07.15 - 14.30 WIB<br />
                    Jumat: 07.15 - 11.30 WIB
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Map Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-xs overflow-hidden">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 px-2">
              Lokasi Google Maps Sekolah
            </h3>
            <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 relative">
              <iframe
                title="Peta Lokasi SD Negeri 53 Kota Bengkulu"
                src="https://maps.google.com/maps?q=SD%20Negeri%2053%20Kota%20Bengkulu&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* Message Form (Right) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-slate-900">Kirim Pesan atau Pertanyaan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Sampaikan pesan, aspirasi, atau pertanyaan Anda. Tim tata usaha kami akan segera merespons.
            </p>
          </div>

          {isSubmitted ? (
            <div className="py-12 text-center space-y-3 bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-950">Pesan Anda Telah Diterima!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Terima kasih telah menghubungi SD Negeri 53 Kota Bengkulu. Petugas tata usaha kami akan segera membalas melalui email atau WhatsApp.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: '', phone: '', email: '', subject: '', message: '' });
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors mt-2"
              >
                Kirim Pesan Lain
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Anda..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor WhatsApp / HP *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08xxxxxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Perihal / Topik *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Info Pendaftaran Siswa Baru"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Isi Pesan / Pertanyaan *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Tuliskan pesan Anda secara lengkap..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Pesan Sekarang</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
