/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { Vehicle, DiagnosticResult } from "../types";
import { Sparkles, AlertCircle, AlertTriangle, Check, ShieldAlert, BadgeHelp, ArrowRight } from "lucide-react";

interface DiagnosticsPanelProps {
  selectedVehicle: Vehicle | null;
  onSelectRecommendedService: (serviceId: "Interim" | "Full" | "Major" | "MOT_Only") => void;
}

export default function DiagnosticsPanel({
  selectedVehicle,
  onSelectRecommendedService
}: DiagnosticsPanelProps) {
  
  const [symptomText, setSymptomText] = useState("");
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState("");

  const runDiagnostics = async (e: FormEvent) => {
    e.preventDefault();
    if (!symptomText.trim()) return;

    setDiagnosing(true);
    setDiagnosticResult(null);
    setError(null);

    // Simulate diagnostic loading steps
    const steps = [
      "Analyzing written car symptoms...",
      "Matching against typical vehicle wear logs...",
      "Factoring in manufacturer recommendations...",
      "Compiling professional diagnostic advice..."
    ];

    let stepIdx = 0;
    setLoadingStatus(steps[0]);
    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStatus(steps[stepIdx]);
      }
    }, 1000);

    try {
      const res = await fetch("/api/ai-diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptom: symptomText,
          vehicle: selectedVehicle
        })
      });

      clearInterval(interval);

      if (!res.ok) {
        throw new Error("Unable to perform diagnostics analysis. Please try again.");
      }

      const data: DiagnosticResult = await res.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setDiagnosing(false);
    }
  };

  const handleSelectServiceShortcut = () => {
    if (!diagnosticResult) return;
    const rec = diagnosticResult.recommendedService;
    if (rec.includes("Interim")) {
      onSelectRecommendedService("Interim");
    } else if (rec.includes("Full")) {
      onSelectRecommendedService("Full");
    } else if (rec.includes("Major")) {
      onSelectRecommendedService("Major");
    } else if (rec.includes("MOT")) {
      onSelectRecommendedService("MOT_Only");
    } else {
      // default fallback
      onSelectRecommendedService("Full");
    }
  };

  const sampleSymptoms = [
    { title: "Squeaking Brakes", text: "High-pitched squeal when braking at low speeds" },
    { title: "Dashboard Rattle", text: "Metallic rattling noise underneath when going over bumps" },
    { title: "Weak Startup", text: "Car takes longer to crank and start in the cold morning" },
    { title: "Black Exhaust Smoke", text: "Puff of dark smoke from exhaust when heavy accelerating" }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto" id="diagnostics-panel-wrapper">
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 sm:text-4xl">
          Smart AI <span className="text-amber-500">Fault Finder</span> &amp; Diagnostics
        </h2>
        <p className="mt-4 text-slate-500 text-sm">
          Describe what's wrong with your vehicle in plain English (e.g. "metallic rattle when cold", "squealing brakes"). Our AI engine will inspect the issue, estimate costs, and match it with the right service.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        
        {/* Left Area: Form Input */}
        <div className="md:col-span-5 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-4">
          <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Consult the AI Mechanic</span>
          </h3>

          {/* Active vehicle context indicator */}
          {selectedVehicle ? (
            <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex justify-between items-center shadow-inner">
              <div className="flex flex-col">
                <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider">VEHICLE CONTEXT ACTIVE</span>
                <span className="font-semibold mt-0.5">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</span>
              </div>
              <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                {selectedVehicle.registration}
              </span>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-xs border border-slate-200">
              💡 <strong>Want better advice?</strong> Select a vehicle first via the yellow registration plate on the home/booking tab to feed engine details to the AI.
            </div>
          )}

          <form onSubmit={runDiagnostics} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">What symptoms are you experiencing?</label>
              <textarea
                rows={4}
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="e.g., There is a metallic grinding sound whenever I press on the brake pedal, and the car pulls slightly to the left..."
                disabled={diagnosing}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs leading-relaxed focus:outline-none focus:border-amber-500 focus:bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={diagnosing || !symptomText.trim()}
              id="ai-diagnose-submit"
              className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {diagnosing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Running AI Scan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Symptoms</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Symptoms templates */}
          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-2">COMMON SYMPTOMS EXAMPLES:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {sampleSymptoms.map((sample) => (
                <button
                  key={sample.title}
                  onClick={() => setSymptomText(sample.text)}
                  className="p-2 border border-slate-200 hover:border-slate-350 bg-slate-50/50 hover:bg-white text-left rounded-lg text-[11px] transition-all"
                >
                  <span className="font-semibold block text-slate-800">{sample.title}</span>
                  <span className="text-slate-500 line-clamp-1 mt-0.5 text-[10px]">{sample.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Area: Results Screen */}
        <div className="md:col-span-7">
          {diagnosing ? (
            <div className="bg-slate-900 text-white rounded-3xl p-8 min-h-[300px] flex flex-col justify-center items-center text-center space-y-4 border border-slate-800 shadow animate-pulse">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full">
                <Sparkles className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h4 className="font-bold text-base font-display">AI Diagnostic Assessment in Progress</h4>
                <p className="text-xs text-slate-400 font-mono tracking-wide">{loadingStatus}</p>
              </div>
            </div>
          ) : diagnosticResult ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 animate-fadeIn" id="ai-diagnostic-result">
              {/* Fallback Warning */}
              {diagnosticResult.isFallback && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                  <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Running in Standard Fallback Mode.</strong> The AI diagnostic advisor matched your keywords against our technical manual database.
                  </span>
                </div>
              )}

              {/* Diagnosis Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-100 pb-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase">MOST LIKELY DIAGNOSIS</span>
                  <h3 className="text-xl font-extrabold font-display tracking-tight text-slate-900 mt-0.5">
                    {diagnosticResult.issue}
                  </h3>
                </div>
                
                {/* Severity Badge */}
                <div className="flex-shrink-0">
                  {diagnosticResult.severity === "dangerous" ? (
                    <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      DANGEROUS
                    </span>
                  ) : diagnosticResult.severity === "moderate" ? (
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      MODERATE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                      <Check className="w-3.5 h-3.5" />
                      SAFE TO DRIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Jargon free explanation */}
              <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">MECHANICAL ANALYSIS</span>
                <p>{diagnosticResult.explanation}</p>
              </div>

              {/* Estimates and recommended booking */}
              <div className="grid sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estimated Repair Cost:</span>
                  <span className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">{diagnosticResult.estimatedCost}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Subject to workshop physical inspection</span>
                </div>
                <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-slate-200/80 pt-3 sm:pt-0 sm:pl-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Recommended Service:</span>
                  <span className="text-sm font-bold text-slate-800 mt-0.5">{diagnosticResult.recommendedService}</span>
                  <span className="text-[9px] text-slate-500 mt-0.5">Optimized to resolve these exact symptoms</span>
                </div>
              </div>

              {/* Checklist items to look at */}
              {diagnosticResult.checklistItemsToInspect && diagnosticResult.checklistItemsToInspect.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">ITEMS OUR MECHANICS WILL ZERO-IN ON:</span>
                  <ul className="grid sm:grid-cols-2 gap-2">
                    {diagnosticResult.checklistItemsToInspect.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 bg-white border border-slate-100 p-2 rounded-xl text-xs text-slate-700 shadow-sm">
                        <span className="w-5 h-5 bg-amber-500/10 border border-amber-500/20 text-amber-600 font-mono text-[10px] font-bold flex items-center justify-center rounded-lg">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Direct Booking Shortcut */}
              <div className="border-t border-slate-100 pt-5 flex items-center justify-between gap-4">
                <div className="flex flex-col text-xs text-slate-400 leading-snug">
                  <span>Satisfied with the AI's diagnosis?</span>
                  <span className="font-semibold text-slate-700 mt-0.5">Pre-select {diagnosticResult.recommendedService} with one click.</span>
                </div>
                <button
                  onClick={handleSelectServiceShortcut}
                  id="diag-booking-shortcut-btn"
                  className="bg-slate-950 hover:bg-slate-850 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer shadow-sm transition-all"
                >
                  <span>Pre-Fill &amp; Book Now</span>
                  <ArrowRight className="w-4 h-4 animate-pulse" />
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 min-h-[300px] flex flex-col justify-center items-center text-center text-slate-400 space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl text-slate-400">
                <BadgeHelp className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-700 text-sm">Diagnostic Advisor Idle</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">Input symptoms on the left to run an automotive scan on engine or mechanical wear.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
