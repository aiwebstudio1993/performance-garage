/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from "react";
import { Search, Shield, Award, Clock, Star, AlertCircle, Sparkles } from "lucide-react";
import { Vehicle } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface HeroProps {
  onVehicleFound: (vehicle: Vehicle) => void;
  onQuickSelectService: (serviceId: "Interim" | "Full" | "Major" | "MOT_Only") => void;
}

export default function Hero({ onVehicleFound, onQuickSelectService }: HeroProps) {
  const [regInput, setRegInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    if (!regInput.trim()) {
      setError("Please enter a valid registration plate.");
      return;
    }
    setError(null);
    setLoading(true);
    setFoundVehicle(null);

    try {
      const formattedReg = encodeURIComponent(regInput.trim().toUpperCase());
      const res = await fetch(`/api/vehicle-lookup?reg=${formattedReg}`);
      if (!res.ok) {
        throw new Error("Unable to retrieve vehicle details.");
      }
      const data: Vehicle = await res.json();
      setFoundVehicle(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your spelling.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmVehicle = () => {
    if (foundVehicle) {
      onVehicleFound(foundVehicle);
      setRegInput("");
      setFoundVehicle(null);
    }
  };

  // Quick lookup trigger for mock buttons
  const triggerQuickLookup = async (plate: string) => {
    setRegInput(plate);
    setLoading(true);
    setError(null);
    setFoundVehicle(null);
    try {
      const res = await fetch(`/api/vehicle-lookup?reg=${encodeURIComponent(plate)}`);
      if (res.ok) {
        const data: Vehicle = await res.json();
        setFoundVehicle(data);
      }
    } catch (err) {
      setError("Failed to retrieve details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative bg-slate-950 text-white py-12 md:py-20 overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Decorative background grids & glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1e293b,transparent_60%)] opacity-70"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center">
        {/* Left: Text copy & CTAs */}
        <div className="md:col-span-7 flex flex-col space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold self-start tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Voted UK's Most Reliable Autocentre 2026
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight leading-tight">
            Professional Servicing <br />
            &amp; MOTs <span className="text-amber-500">Made Simple.</span>
          </h1>

          <p className="text-slate-300 text-lg max-w-xl font-normal leading-relaxed">
            Enter your registration below to view tailor-made car servicing options, instant quotes based on your engine size, and book online in minutes.
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">DVSA Approved</span>
                <span className="text-sm font-semibold text-white">Full Certifications</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Parts Guaranteed</span>
                <span className="text-sm font-semibold text-white">12-Month Cover</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Rapid Turnaround</span>
                <span className="text-sm font-semibold text-white">Same-Day Pick Up</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-500 text-amber-500 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-400">Highly Rated</span>
                <span className="text-sm font-semibold text-white">4.8/5 (12k Reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interactive Registration Input & Plate Box */}
        <div className="md:col-span-5 bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl shadow-2xl backdrop-blur-md">
          <div className="flex flex-col space-y-4">
            <h2 className="text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>Start Your Booking</span>
            </h2>
            <p className="text-xs text-slate-400">
              Enter your vehicle registration to discover the recommended service package and exact costs.
            </p>

            {/* The UK Yellow Plate Input form */}
            <form onSubmit={handleLookup} className="space-y-4" id="reg-lookup-form">
              <div className="relative flex items-stretch border-4 border-slate-950 rounded-xl overflow-hidden bg-amber-400 shadow-lg group focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-slate-950">
                {/* GB Strip */}
                <div className="bg-blue-800 text-white w-10 flex flex-col justify-between items-center py-2 px-1 font-mono text-[9px] select-none">
                  <div className="flex flex-col gap-0.5 items-center">
                    <span className="text-amber-400 font-bold">★</span>
                    <span className="text-amber-400 text-[6px]">★★</span>
                  </div>
                  <span className="font-bold tracking-wider">UK</span>
                </div>

                {/* Input Area */}
                <input
                  type="text"
                  placeholder="AB12 CDE"
                  value={regInput}
                  onChange={(e) => setRegInput(e.target.value)}
                  disabled={loading}
                  id="reg-input-field"
                  className="w-full bg-transparent px-4 py-3.5 text-slate-950 font-display font-extrabold text-2xl tracking-wider text-center focus:outline-none uppercase placeholder:text-slate-700/60"
                  maxLength={10}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                id="reg-lookup-submit"
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-semibold py-3 px-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-wider select-none cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find My Car &amp; Price</span>
                  </>
                )}
              </button>
            </form>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-950/40 border border-red-500/20 rounded-xl text-xs text-red-400 animate-fadeIn" id="lookup-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Vehicle Result Card */}
            <AnimatePresence>
              {foundVehicle && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-col space-y-3 shadow-inner"
                  id="found-vehicle-card"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase">VEHICLE FOUND</span>
                      <h3 className="text-base font-extrabold font-display tracking-tight text-white mt-0.5">
                        {foundVehicle.make} {foundVehicle.model}
                      </h3>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {foundVehicle.year} • {foundVehicle.engineSize} • {foundVehicle.fuelType}
                      </span>
                    </div>
                    <div className="px-2.5 py-1 bg-amber-400 text-slate-950 font-display font-bold text-xs rounded border border-slate-800 shadow-sm uppercase tracking-wide">
                      {foundVehicle.registration}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800/60 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Mileage</span>
                      <span className="font-semibold text-white font-mono">{Math.round(foundVehicle.currentMileage).toLocaleString()} mi</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">MOT Expiry</span>
                      <span className={`font-semibold font-mono ${foundVehicle.motStatus === "Expired" ? "text-red-400" : "text-emerald-400"}`}>
                        {foundVehicle.motExpiryDate}
                      </span>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-xs flex flex-col gap-1">
                    <span className="text-amber-400 font-semibold flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Recommended: {foundVehicle.recommendedService}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Based on age, mileage, and service records. Add MOT to save £15!
                    </span>
                  </div>

                  <button
                    onClick={handleConfirmVehicle}
                    id="confirm-vehicle-btn"
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 px-3 rounded-lg text-xs shadow transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Confirm &amp; Choose Services</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Demo Plates */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider mb-2">TRY POPULAR DEMO PLATES:</span>
              <div className="flex flex-wrap gap-2">
                {["JK20LMN", "C3P0R2D", "XY71ZAB"].map((plate) => (
                  <button
                    key={plate}
                    type="button"
                    onClick={() => triggerQuickLookup(plate)}
                    className="px-2.5 py-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-amber-400 font-mono text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    {plate.substring(0, 4)} {plate.substring(4)}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
