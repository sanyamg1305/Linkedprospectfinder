/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Download, Trash2, Plus, Loader2, Linkedin, ExternalLink, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prospect, ResearchResult } from './types';
import { findLinkedInProfiles } from './services/researchService';

export default function App() {
  const [prospects, setProspects] = useState<Prospect[]>([
    { name: 'Rahul Sharma', company: 'Infosys', designation: 'Senior Data Analyst' },
    { name: 'Priya Mehta', company: 'Tata Consultancy Services', designation: 'HR Manager' },
    { name: 'Amit Verma', company: 'HDFC Bank', designation: 'Relationship Manager' },
  ]);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddRow = () => {
    setProspects([...prospects, { name: '', company: '', designation: '' }]);
  };

  const handleUpdateProspect = (index: number, field: keyof Prospect, value: string) => {
    const updated = [...prospects];
    updated[index][field] = value;
    setProspects(updated);
  };

  const handleRemoveRow = (index: number) => {
    setProspects(prospects.filter((_, i) => i !== index));
  };

  const handleResearch = async () => {
    const validProspects = prospects.filter(p => p.name && p.company);
    if (validProspects.length === 0) {
      setError("Please add at least one prospect with a name and company.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await findLinkedInProfiles(validProspects);
      setResults(response.results);
    } catch (err) {
      setError("An error occurred during research. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Contact Name', 'Company', 'Designation', 'LinkedIn URL'];
    const rows = results.map(r => [r.name, r.company, r.designation, r.linkedinUrl]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "linkedin_prospects.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newProspects: Prospect[] = lines.slice(1).map(line => {
        const [name, company, designation] = line.split(',').map(s => s.trim());
        return { name: name || '', company: company || '', designation: designation || '' };
      }).filter(p => p.name || p.company);
      
      if (newProspects.length > 0) {
        setProspects(newProspects);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold tracking-tight">Prospect Finder</h1>
          </div>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              <FileText className="w-4 h-4" />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
            </label>
            <button 
              onClick={handleResearch}
              disabled={isLoading}
              className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {isLoading ? 'Researching...' : 'Start Research'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Input Section */}
        <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Input Data</h2>
              <p className="text-xs text-zinc-400 mt-1">Add prospects to find their LinkedIn profiles</p>
            </div>
            <button 
              onClick={handleAddRow}
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Row
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Contact Name</th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Company</th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Designation</th>
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {prospects.map((prospect, idx) => (
                  <tr key={idx} className="group hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-3">
                      <input 
                        type="text" 
                        value={prospect.name}
                        onChange={(e) => handleUpdateProspect(idx, 'name', e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-zinc-300"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        type="text" 
                        value={prospect.company}
                        onChange={(e) => handleUpdateProspect(idx, 'company', e.target.value)}
                        placeholder="e.g. Microsoft"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-zinc-300"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <input 
                        type="text" 
                        value={prospect.designation}
                        onChange={(e) => handleUpdateProspect(idx, 'designation', e.target.value)}
                        placeholder="e.g. Product Manager"
                        className="w-full bg-transparent border-none focus:ring-0 text-sm placeholder:text-zinc-300"
                      />
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button 
                        onClick={() => handleRemoveRow(idx)}
                        className="p-1 text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {(results.length > 0 || isLoading) && (
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Research Results</h2>
                  <p className="text-xs text-zinc-400 mt-1">Verified LinkedIn profiles found by AI</p>
                </div>
                {results.length > 0 && !isLoading && (
                  <button 
                    onClick={downloadCSV}
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50/50">
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Contact Name</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Company</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">Designation</th>
                      <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">LinkedIn URL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-zinc-100 rounded w-3/4"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-zinc-100 rounded w-1/2"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-zinc-100 rounded w-2/3"></div></td>
                          <td className="px-6 py-4"><div className="h-4 bg-zinc-100 rounded w-full"></div></td>
                        </tr>
                      ))
                    ) : (
                      results.map((result, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-zinc-900">{result.name}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{result.company}</td>
                          <td className="px-6 py-4 text-sm text-zinc-600">{result.designation}</td>
                          <td className="px-6 py-4 text-sm">
                            {result.linkedinUrl !== 'Not Found' ? (
                              <a 
                                href={result.linkedinUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium group"
                              >
                                <Linkedin className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[200px]">{result.linkedinUrl}</span>
                                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </a>
                            ) : (
                              <span className="text-zinc-400 italic">Not Found</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 text-center">
        <p className="text-xs text-zinc-400">
          Powered by Gemini AI with Google Search Grounding. 
          Use responsibly and verify results.
        </p>
      </footer>
    </div>
  );
}
