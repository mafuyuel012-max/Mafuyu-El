import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Clock, User, Globe, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api';
import { ActivityLog } from '../../types';
import { useToast } from '../../components/common/Toast';

export const AdminAktivitasPage: React.FC = () => {
  const toast = useToast();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getActivityLogs(1, 50);
      if (res && Array.isArray(res.data)) {
        setLogs(res.data);
      } else if (Array.isArray(res)) {
        setLogs(res as any);
      } else {
        setLogs([]);
      }
    } catch (err: any) {
      toast.error('Gagal memuat log aktivitas: ' + err.message);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const safeLogs = Array.isArray(logs) ? logs : [];
  const filteredLogs = safeLogs.filter((l) =>
    searchQuery
      ? l.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.details.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Log Aktivitas & Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rekam jejak seluruh operasi penerbitan berita, berkas media, data kelulusan, dan sesi operator
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama user, tindakan (login, create, update), atau detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
            <p className="text-xs">Memuat catatan aktivitas...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada log aktivitas ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Waktu (Timestamp)</th>
                  <th className="p-4">Operator</th>
                  <th className="p-4">Tindakan (Action)</th>
                  <th className="p-4">Entitas</th>
                  <th className="p-4">Rincian Aktivitas</th>
                  <th className="p-4">IP Client</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-4 font-bold text-slate-800">{log.user_name}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          log.action === 'login' || log.action === 'create'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'delete'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 capitalize">
                      {log.entity_type}
                    </td>
                    <td className="p-4 text-slate-600 max-w-sm">{log.details}</td>
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
