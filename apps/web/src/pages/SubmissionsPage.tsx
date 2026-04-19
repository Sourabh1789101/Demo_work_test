import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trash2,
  Download,
  Search,
  Calendar,
  BarChart2,
  Users,
  Clock,
  RefreshCw,
  FileText,
  Zap,
  ChevronRight,
  X,
} from 'lucide-react';
import { formService } from '../services/formService';
import { submissionService, type Submission, type SubmissionStats } from '../services/submissionService';
import type { FormSchema } from '../../modules/Core/types';

const KIM_LOGO = () => (
  <div className="flex items-center gap-2">
    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
      <Zap size={13} className="text-white" />
    </div>
    <span className="text-lg font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent">
      FormBuilder
    </span>
  </div>
);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const SubmissionDetailModal: React.FC<{
  submission: Submission;
  schema: FormSchema;
  onClose: () => void;
  onDelete: () => void;
}> = ({ submission, schema, onClose, onDelete }) => {
  const fieldMap = new Map(schema.components.map((c) => [c.id, c.label || c.type]));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900">Submission Detail</h3>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(submission.submittedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onDelete}
              className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
              title="Delete submission"
            >
              <Trash2 size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              title="Close"
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Object.entries(submission.data).map(([fieldId, val]) => (
            <div key={fieldId} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {fieldMap.get(fieldId) || fieldId}
              </p>
              <p className="text-sm text-gray-800 break-words">
                {Array.isArray(val) ? val.join(', ') : val == null ? '—' : String(val)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SubmissionsPage: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SubmissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Submission | null>(null);

  const load = async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const [form, subs, st] = await Promise.all([
        formService.getForm(formId),
        submissionService.listSubmissions(formId),
        submissionService.getStats(formId),
      ]);
      setSchema(form.schema as FormSchema);
      setSubmissions(subs);
      setStats(st);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [formId]);

  const handleDelete = async (sub: Submission) => {
    if (!formId || !confirm('Delete this submission?')) return;
    await submissionService.deleteSubmission(formId, sub.id);
    setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
    if (selected?.id === sub.id) setSelected(null);
  };

  const handleExportCSV = () => {
    if (!schema || submissions.length === 0) return;
    const headers = schema.components
      .filter((c) => c.type !== 'heading' && c.type !== 'paragraph' && c.type !== 'divider')
      .map((c) => c.label || c.type);
    const fieldIds = schema.components
      .filter((c) => c.type !== 'heading' && c.type !== 'paragraph' && c.type !== 'divider')
      .map((c) => c.id);

    const rows = submissions.map((sub) =>
      fieldIds.map((id) => {
        const val = sub.data[id];
        const str = Array.isArray(val) ? val.join('; ') : val == null ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      }).join(','),
    );

    const csv = ['Submitted At,' + headers.join(',')]
      .concat(submissions.map((sub, i) => `"${formatDate(sub.submittedAt)}",${rows[i]}`))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `submissions-${formId}.csv`;
    a.click();
  };

  const fieldLabels = schema
    ? new Map(schema.components.map((c) => [c.id, c.label || c.type]))
    : new Map<string, string>();

  const inputFields = schema
    ? schema.components.filter((c) => !['heading', 'paragraph', 'divider', 'spacer'].includes(c.type))
    : [];

  const filtered = submissions.filter((sub) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return Object.values(sub.data).some((v) => String(v).toLowerCase().includes(q));
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
          <Link to="/" className="flex-shrink-0"><KIM_LOGO /></Link>
          <ChevronRight size={14} className="text-gray-300" />
          <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-800 transition-colors truncate max-w-xs">
            {schema?.title || 'Form'}
          </button>
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-sm font-semibold text-gray-800">Submissions</span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(`/builder/${formId}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText size={13} />
              Edit Form
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={submissions.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <Users size={16} className="text-violet-600" />, label: 'Total', value: stats?.total ?? 0, bg: 'bg-violet-50' },
            { icon: <Calendar size={16} className="text-blue-600" />, label: 'First Response', value: stats?.firstAt ? new Date(stats.firstAt).toLocaleDateString() : '—', bg: 'bg-blue-50' },
            { icon: <Clock size={16} className="text-emerald-600" />, label: 'Last Response', value: stats?.lastAt ? new Date(stats.lastAt).toLocaleDateString() : '—', bg: 'bg-emerald-50' },
            { icon: <BarChart2 size={16} className="text-amber-600" />, label: 'Fields Tracked', value: inputFields.length, bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center mb-2`}>
                {s.icon}
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-gray-900 text-sm">
              Responses <span className="text-gray-400 font-normal ml-1">({filtered.length})</span>
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search responses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-48"
                />
              </div>
              <button
                type="button"
                onClick={() => void load()}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <BarChart2 size={32} className="mb-2 text-gray-200" />
              <p className="text-sm font-medium">{search ? 'No matching responses' : 'No submissions yet'}</p>
              <p className="text-xs mt-1">
                {!search && (
                  <Link to={`/f/${formId}`} target="_blank" className="text-violet-500 hover:underline">
                    Open form to collect responses →
                  </Link>
                )}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">
                      Submitted
                    </th>
                    {inputFields.slice(0, 4).map((f) => (
                      <th key={f.id} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {fieldLabels.get(f.id) || f.type}
                      </th>
                    ))}
                    <th className="w-10" scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-violet-50/30 cursor-pointer transition-colors"
                      onClick={() => setSelected(sub)}
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(sub.submittedAt)}
                      </td>
                      {inputFields.slice(0, 4).map((f) => (
                        <td key={f.id} className="px-5 py-3.5 text-sm text-gray-700 max-w-48 truncate">
                          {(() => {
                            const v = sub.data[f.id];
                            if (v == null) return <span className="text-gray-300">—</span>;
                            if (Array.isArray(v)) return v.join(', ');
                            return String(v);
                          })()}
                        </td>
                      ))}
                      <td className="px-3 py-3.5">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); void handleDelete(sub); }}
                          title="Delete submission"
                          className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && schema && (
        <SubmissionDetailModal
          submission={selected}
          schema={schema}
          onClose={() => setSelected(null)}
          onDelete={() => void handleDelete(selected)}
        />
      )}
    </div>
  );
};
