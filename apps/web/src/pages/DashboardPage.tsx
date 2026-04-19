import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Trash2,
  Edit3,
  Share2,
  BarChart2,
  Clock,
  ChevronDown,
  LayoutTemplate,
  Zap,
  Users,
  TrendingUp,
  Eye,
  Sparkles,
} from 'lucide-react';
import { formService } from '../services/formService';
import type { StoredForm } from '../services/formService';
import { useBuilderStore } from '../../modules/store/builderStore';
import { ShareModal } from '../components/shared/ShareModal';
import { AIFormGeneratorModal } from '../components/AIFormGeneratorModal';

const FORMBUILDER_LOGO = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-200">
      <Zap size={16} className="text-white" />
    </div>
    <span className="text-xl font-bold bg-gradient-to-r from-violet-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">
      FormBuilder
    </span>
  </div>
);

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}> = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
      {icon}
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

const FormCard: React.FC<{
  form: StoredForm;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onViewSubmissions: () => void;
}> = ({ form, onEdit, onDelete, onShare, onViewSubmissions }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const fieldCount = Array.isArray((form.schema as any)?.components)
    ? (form.schema as any).components.length
    : 0;

  const submissionCount = (form as any).submissionCount ?? 0;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-violet-200 transition-all duration-200 overflow-hidden">
      {/* Card top gradient bar */}
      <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />

      <div className="p-5">
        {/* Icon + Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-xl flex items-center justify-center">
            <FileText size={20} className="text-violet-600" />
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-9 w-44 bg-white rounded-xl border border-gray-100 shadow-xl z-10 py-1 text-sm"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Edit3 size={14} /> Edit Form
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onShare(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Share2 size={14} /> Share
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onViewSubmissions(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <BarChart2 size={14} /> Submissions
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title + description */}
        <h3
          className="font-semibold text-gray-900 text-base leading-snug truncate cursor-pointer hover:text-violet-700 transition-colors"
          onClick={onEdit}
        >
          {form.title || 'Untitled Form'}
        </h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2 min-h-[2.5rem]">
          {form.description || 'No description'}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <FileText size={12} />
            {fieldCount} fields
          </span>
          <span className="flex items-center gap-1">
            <Users size={12} />
            {submissionCount} submissions
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock size={12} />
            {timeAgo(form.updatedAt)}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="px-5 pb-4 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="flex-1 py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5"
        >
          <Edit3 size={12} /> Edit
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Share2 size={12} /> Share
        </button>
        <button
          type="button"
          onClick={onViewSubmissions}
          className="flex-1 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
        >
          <Eye size={12} /> Results
        </button>
      </div>
    </div>
  );
};

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState<StoredForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'name'>('updated');
  const [shareFormId, setShareFormId] = useState<string | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const { resetSchema, setSchema } = useBuilderStore();

  useEffect(() => {
    void formService.listForms()
      .then(setForms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCreateNew = () => {
    resetSchema();
    navigate('/builder');
  };

  const handleEdit = (form: StoredForm) => {
    setSchema(form.schema as any);
    navigate(`/builder/${form.id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this form? This cannot be undone.')) return;
    try {
      await formService.deleteForm(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
    } catch (e) {
      alert('Failed to delete form');
    }
  };

  const handleAIFormGenerated = () => {
    // Refresh forms list from database
    void formService.listForms()
      .then(setForms)
      .catch(console.error);
  };

  const filtered = forms
    .filter((f) =>
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      (f.description ?? '').toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sortBy === 'updated'
        ? new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        : a.title.localeCompare(b.title),
    );

  const totalSubmissions = forms.reduce((acc, f) => acc + ((f as any).submissionCount ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      {shareFormId && (
        <ShareModal formId={shareFormId} onClose={() => setShareFormId(null)} />
      )}
      <AIFormGeneratorModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onFormGenerated={handleAIFormGenerated}
      />
      {/* Top Nav */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <FORMBUILDER_LOGO />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 rounded-lg transition-colors shadow-sm"
            >
              <Sparkles size={16} />
              AI Generate
            </button>
            <button
              type="button"
              onClick={() => navigate('/builder')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LayoutTemplate size={16} />
              Templates
            </button>
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-violet-200 transition-all"
            >
              <Plus size={16} />
              Create Form
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome banner */}
        <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative">
            <h1 className="text-2xl font-bold mb-1">Welcome to FormBuilder</h1>
            <p className="text-violet-200 text-sm">Create beautiful forms, collect responses, and analyze results.</p>
            <button
              type="button"
              onClick={handleCreateNew}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-white text-violet-700 font-semibold text-sm rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
            >
              <Plus size={16} />
              Build Your First Form
            </button>
            <button
              type="button"
              onClick={() => setShowAIModal(true)}
              className="mt-5 ml-3 inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 text-white font-semibold text-sm rounded-xl hover:bg-white/30 transition-colors border border-white/30"
            >
              <Sparkles size={16} />
              Generate with AI
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<FileText size={18} className="text-violet-600" />}
            label="Total Forms"
            value={forms.length}
            color="bg-violet-50"
          />
          <StatCard
            icon={<Users size={18} className="text-blue-600" />}
            label="Submissions"
            value={totalSubmissions}
            color="bg-blue-50"
          />
          <StatCard
            icon={<TrendingUp size={18} className="text-emerald-600" />}
            label="Active Forms"
            value={forms.length}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<BarChart2 size={18} className="text-amber-600" />}
            label="Avg. Responses"
            value={forms.length > 0 ? Math.round(totalSubmissions / forms.length) : 0}
            color="bg-amber-50"
          />
        </div>

        {/* My Forms header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">My Forms</h2>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-52"
              />
            </div>
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'updated' | 'name')}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
              >
                <option value="updated">Last Modified</option>
                <option value="name">Name A–Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Forms grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-52 border border-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-500 mb-1">
              {search ? 'No forms match your search' : 'No forms yet'}
            </h3>
            <p className="text-sm text-gray-400 mb-5">
              {search ? 'Try a different keyword' : 'Create your first form to get started'}
            </p>
            {!search && (
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                <Plus size={16} />
                Create Form
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Create new card */}
            <button
              type="button"
              onClick={handleCreateNew}
              className="group bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-violet-400 hover:bg-violet-50/30 transition-all duration-200 p-5 flex flex-col items-center justify-center gap-3 min-h-[200px]"
            >
              <div className="w-12 h-12 bg-violet-100 group-hover:bg-violet-200 rounded-2xl flex items-center justify-center transition-colors">
                <Plus size={22} className="text-violet-600" />
              </div>
              <span className="text-sm font-semibold text-gray-500 group-hover:text-violet-700 transition-colors">
                Create New Form
              </span>
            </button>

            {filtered.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onEdit={() => handleEdit(form)}
                onDelete={() => handleDelete(form.id)}
                onShare={() => setShareFormId(form.id)}
                onViewSubmissions={() => navigate(`/forms/${form.id}/submissions`)}
              />
            ))}
          </div>
        )}
      </div>

      {shareFormId && (
        <ShareModal formId={shareFormId} onClose={() => setShareFormId(null)} />
      )}
    </div>
  );
};
