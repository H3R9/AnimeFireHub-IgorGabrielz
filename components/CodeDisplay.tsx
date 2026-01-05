import React, { useState } from 'react';
import { Copy, Check, Terminal, FileJson, Download } from 'lucide-react';

interface CodeDisplayProps {
  code: string;
  filename?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({ code, filename = 'server.js' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isJson = filename.endsWith('.json');

  return (
    <div className="bg-[#1e1e24] rounded-lg border border-gray-700 overflow-hidden shadow-2xl h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-[#25252d] border-b border-gray-700">
        <div className="flex items-center gap-2">
            {isJson ? <FileJson size={18} className="text-yellow-500" /> : <Terminal size={18} className="text-orange-500" />}
            <span className="text-sm font-mono text-gray-300">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors group"
            title="Baixar Arquivo"
          >
            <Download size={14} className="group-hover:text-blue-400" />
            <span className="hidden sm:inline">Baixar</span>
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded transition-colors"
          >
            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto h-[500px] overflow-y-auto">
        <pre className={`text-sm font-mono leading-relaxed whitespace-pre-wrap ${isJson ? 'text-yellow-100' : 'text-blue-100'}`}>
          {code}
        </pre>
      </div>
    </div>
  );
};

export default CodeDisplay;