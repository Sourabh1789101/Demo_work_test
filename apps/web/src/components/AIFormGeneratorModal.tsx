// This file has been removed - AI generation feature was removed for local-only development
// All forms must now be created manually using the drag-and-drop builder
    setError(null);

    try {
      const response = await AIFormService.generateForm(prompt);
      updateSchema(response.form.schema);
      setPrompt('');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate form. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !isLoading && prompt.trim()) {
      handleGenerateForm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={24} className="text-violet-600" />
            <h2 className="text-xl font-bold text-gray-900">AI Form Generator</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4">
          Describe the form you want to create, and AI will generate it for you.
        </p>

        {/* Textarea */}
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Describe your form... e.g., Job application form with fields for name, email, resume, and cover letter"
          disabled={isLoading}
          maxLength={2000}
          className="w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:bg-gray-50 resize-none"
        />

        {/* Character count */}
        <div className="text-xs text-gray-500 mt-1 text-right">
          {prompt.length} / 2000
        </div>

        {/* Error message */}
        {error && <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600">{error}</div>}

        {/* Buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerateForm}
            disabled={isLoading || !prompt.trim()}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg hover:from-violet-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Form
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
