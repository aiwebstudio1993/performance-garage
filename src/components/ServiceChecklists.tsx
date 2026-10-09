/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Check, X, Search, Info } from "lucide-react";
import { SERVICE_CHECKLIST_CATEGORIES } from "../mockData";

export default function ServiceChecklists() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", ...SERVICE_CHECKLIST_CATEGORIES.map(cat => cat.name)];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="service-checklists-wrapper">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 sm:text-4xl">
          What's Included in Our <span className="text-amber-500">Service Tiers</span>
        </h2>
        <p className="mt-4 text-slate-500 text-sm">
          Examine our complete multi-point visual and mechanical checklists. Choose the exact level of protection and tuning your car requires.
        </p>
      </div>

      {/* Help Advisory Tip */}
      <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-bold uppercase tracking-wide">Mechanics Tip:</span> It is highly recommended to book a <strong>Full Service</strong> annually (or every 12,000 miles) and a <strong>Major Service</strong> every 2 years (or 24,000 miles) to replace crucial lifetime cabin filters, spark plugs, and completely replace old hydroscopic brake fluid.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between" id="checklists-toolbar">
        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search checklists (e.g. brakes, plugs)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Comparative Checklist Matrix */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="checklist-table">
            <thead>
              <tr className="bg-slate-900 text-white text-xs uppercase font-mono tracking-wider border-b border-slate-800">
                <th className="p-4 pl-6 font-semibold w-2/5">Checklist Item / Task Description</th>
                <th className="p-4 text-center font-semibold w-1/5">Interim</th>
                <th className="p-4 text-center font-semibold w-1/5">Full</th>
                <th className="p-4 text-center font-semibold w-1/5">Major</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {SERVICE_CHECKLIST_CATEGORIES.map((cat) => {
                // If a specific category tab is chosen, filter out others
                if (selectedCategory !== "All" && selectedCategory !== cat.name) {
                  return null;
                }

                // Filter checks based on search query
                const filteredChecks = cat.checks.filter(check => 
                  check.name.toLowerCase().includes(searchQuery.toLowerCase())
                );

                if (filteredChecks.length === 0) return null;

                return (
                  <div key={cat.name} className="contents">
                    {/* Category Header Row */}
                    <tr className="bg-slate-50 text-slate-800 font-bold text-xs uppercase tracking-wider">
                      <td colSpan={4} className="p-3 pl-6 font-display border-t border-slate-200/60">
                        {cat.name}
                      </td>
                    </tr>

                    {/* Check items rows */}
                    {filteredChecks.map((check, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 pl-8 text-xs text-slate-700 leading-snug">{check.name}</td>
                        
                        {/* Interim check */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            {check.interim ? (
                              <div className="bg-amber-100 text-amber-800 p-1 rounded-full">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <X className="w-4 h-4 text-slate-200" />
                            )}
                          </div>
                        </td>

                        {/* Full check */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            {check.full ? (
                              <div className="bg-amber-500 text-slate-950 p-1 rounded-full">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <X className="w-4 h-4 text-slate-200" />
                            )}
                          </div>
                        </td>

                        {/* Major check */}
                        <td className="p-4 text-center">
                          <div className="flex justify-center">
                            {check.major ? (
                              <div className="bg-emerald-600 text-white p-1 rounded-full shadow-sm">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <X className="w-4 h-4 text-slate-200" />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </div>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
