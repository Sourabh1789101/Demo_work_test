import React, { useState, useRef } from 'react';
import {
  X,
  Link2,
  Check,
  Code2,
  Mail,
  ExternalLink,
  Globe,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
} from 'lucide-react';

interface ShareModalProps {
  formId: string;
  onClose: () => void;
}

type Tab = 'link' | 'embed' | 'social' | 'email';

const BASE_URL = window.location.origin;

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'link',   label: 'Share Link', icon: <Link2 size={14} />   },
  { id: 'embed',  label: 'Embed',      icon: <Code2 size={14} />   },
  { id: 'social', label: 'Social',     icon: <Globe size={14} />   },
  { id: 'email',  label: 'Email',      icon: <Mail size={14} />    },
];

const CopyButton: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
        copied
          ? 'bg-green-100 text-green-700 border border-green-200'
          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
      } ${className}`}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export const ShareModal: React.FC<ShareModalProps> = ({ formId, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('link');
  const shareUrl = `${BASE_URL}/f/${formId}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0" style="border:none;border-radius:12px;"></iframe>`;
  const iframeRef = useRef<HTMLTextAreaElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Share Form</h2>
            <p className="text-xs text-gray-500 mt-0.5">Share your form and collect responses</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-violet-600 text-violet-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Form URL
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <Globe size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 font-mono truncate">{shareUrl}</span>
                  <CopyButton text={shareUrl} />
                </div>
              </div>

              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-200"
              >
                <ExternalLink size={16} />
                Open Form in New Tab
              </a>

              {/* QR Placeholder */}
              <div className="border border-gray-100 rounded-2xl p-4 text-center bg-gray-50">
                <div className="w-24 h-24 bg-gray-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xs text-gray-400 font-mono">QR</span>
                </div>
                <p className="text-xs text-gray-500">QR code for easy mobile sharing</p>
                <button
                  type="button"
                  className="mt-2 text-xs text-violet-600 font-medium hover:underline"
                >
                  Download QR Code
                </button>
              </div>
            </div>
          )}

          {activeTab === 'embed' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Embed Code
                </label>
                <div className="relative">
                  <textarea
                    ref={iframeRef}
                    readOnly
                    value={embedCode}
                    rows={4}
                    className="w-full px-3 py-3 text-xs font-mono bg-gray-900 text-green-400 rounded-xl border-0 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400"
                  />
                  <div className="absolute top-2 right-2">
                    <CopyButton text={embedCode} />
                  </div>
                </div>
              </div>

              <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                <h4 className="text-xs font-bold text-violet-800 mb-1">How to use</h4>
                <p className="text-xs text-violet-700 leading-relaxed">
                  Copy the code above and paste it anywhere in your website HTML. The form will automatically
                  resize to fit the container.
                </p>
              </div>

              {/* Preview */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Preview</p>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
                  <iframe
                    src={shareUrl}
                    className="w-full h-full border-0 pointer-events-none scale-75 origin-top"
                    title="Form preview"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">Share your form on social media</p>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Fill out my form!')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <Twitter size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Share on X (Twitter)</p>
                  <p className="text-xs text-gray-400">Tweet your form link</p>
                </div>
                <ExternalLink size={14} className="text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </a>

              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Facebook size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Share on Facebook</p>
                  <p className="text-xs text-gray-400">Post to your timeline</p>
                </div>
                <ExternalLink size={14} className="text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </a>

              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                  <Linkedin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Share on LinkedIn</p>
                  <p className="text-xs text-gray-400">Share with your network</p>
                </div>
                <ExternalLink size={14} className="text-gray-300 ml-auto group-hover:text-gray-500 transition-colors" />
              </a>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Send the form link directly via email</p>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Recipients
                </label>
                <input
                  type="email"
                  placeholder="email@example.com, another@email.com"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Message (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Hi, please fill out this form..."
                  defaultValue={`Hi!\n\nPlease fill out this form: ${shareUrl}\n\nThank you!`}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
                />
              </div>
              <a
                href={`mailto:?subject=Please fill out this form&body=Hi!%0A%0APlease fill out this form: ${encodeURIComponent(shareUrl)}%0A%0AThank you!`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-200"
              >
                <Mail size={16} />
                Open in Email Client
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
