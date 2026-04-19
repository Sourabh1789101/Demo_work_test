import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2, Wand2 } from 'lucide-react';
import { aiFormService } from '../services/aiFormService';

interface AIFormGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXAMPLE_PROMPTS = [
  'Create a customer feedback form with rating, comments, and contact info',
  'Build a job application form with resume upload and work experience',
  'Design an event registration form with meal preferences and t-shirt size',
  'Make a contact form with name, email, phone, and message',
  'Create a survey about product satisfaction with multiple choice questions',
];

export function AIFormGeneratorModal({ isOpen, onClose }: AIFormGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ remaining: number; limit: number } | null>(null);
  const [aiConfigured, setAiConfigured] = useState(true);

  useEffect(() => {
    if (isOpen) {
      aiFormService.getGenerationStatus()
        .then(status => {
          if (status?.rateLimit) {
            setRateLimit({ remaining: status.rateLimit.remaining, limit: status.rateLimit.limit });
            setAiConfigured(status.configured ?? true);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of the form you want to create');
      return;
    }

    if (prompt.length < 10) {
      setError('Please provide a more detailed description (at least 10 characters)');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await aiFormService.generateForm(prompt, true);

      if (response?.data?.rateLimit) {
        setRateLimit({ remaining: response.data.rateLimit.remaining, limit: response.data.rateLimit.limit });
      }
      setSuccess(true);

      setTimeout(() => {
        onClose();
        setPrompt('');
        setSuccess(false);
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate form');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
      setPrompt('');
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">AI Form Generator</h2>
              <p className="text-sm text-purple-100">Describe your form and let AI create it</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isGenerating}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          {!aiConfigured && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">Using template-based generation (instant, no API needed!)</p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe your form
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setError(null);
              }}
              placeholder="E.g., Create a feedback form with name, email, rating, and comments..."
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">{prompt.length}/2000 characters</span>
              {rateLimit && (
                <span className="text-xs text-gray-500">
                  {rateLimit.remaining}/{rateLimit.limit} remaining
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Examples:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.slice(0, 3).map((example, i) => (
                <button
                  key={i}
                  onClick={() => handleExampleClick(example)}
                  disabled={isGenerating}
                  className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full hover:bg-purple-100 disabled:opacity-50"
                >
                  {example.substring(0, 45)}...
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-sm text-green-700">Form generated!</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <p className="text-xs text-gray-500">AI generates form fields from your description</p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isGenerating}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIFormGeneratorModal;
