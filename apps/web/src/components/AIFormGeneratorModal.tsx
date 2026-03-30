import { useState } from 'react';
import { X, Wand2, Loader, AlertCircle } from 'lucide-react';
import { AIFormService } from '../services/aiFormService';
import { useBuilderStore } from '../../modules/store/builderStore';

interface AIFormGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFormGenerated?: (formId: string) => void;
}

export function AIFormGeneratorModal({ isOpen, onClose, onFormGenerated }: AIFormGeneratorModalProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokensUsed, setTokensUsed] = useState<{ input: number; output: number } | null>(null);
  const { setSchema } = useBuilderStore();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please describe the form you want to create');
      return;
    }

    setError(null);
    setLoading(true);
    setTokensUsed(null);

    try {
      const response = await AIFormService.generateForm(prompt);

      // Update the schema in the builder store
      setSchema(response.form.schema);
      setTokensUsed(response.tokensUsed);

      // Clear the prompt
      setPrompt('');

      // Call the callback if provided
      if (onFormGenerated) {
        onFormGenerated(response.form.id);
      }

      // Close the modal after a brief delay to show success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate form';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wand2 size={20} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Generate with AI</h2>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe the form you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={loading}
              maxLength={2000}
              placeholder="Example: Create a customer feedback form with email, satisfaction rating, comments, and phone number fields"
              className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">{prompt.length}/2000 characters</p>
          </div>

          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {tokensUsed && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">Form generated successfully!</p>
              <p className="text-xs text-green-700 mt-1">Tokens used: {tokensUsed.input + tokensUsed.output}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Tip:</strong> Be specific about the fields you need. For example: "Customer registration form with name, email, company, and password fields"
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
