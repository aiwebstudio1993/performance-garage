/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Booking } from "../types";
import { Wrench, Calendar, Clock, MapPin, CheckCircle, Car, Play, ClipboardList, Printer, Shield, ChevronRight } from "lucide-react";

interface MyBookingsProps {
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking["status"], progressPercent: number, notes: string) => void;
}

export default function MyBookings({ bookings, onUpdateBookingStatus }: MyBookingsProps) {
  const [selectedBookingId, setSelectedBookingId] = useState<string>("");

  const activeBooking = bookings.find(b => b.id === selectedBookingId) || bookings[0];

  useEffect(() => {
    if (bookings.length > 0 && !selectedBookingId) {
      setSelectedBookingId(bookings[0].id);
    }
  }, [bookings, selectedBookingId]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "Booked": return "text-amber-500 bg-amber-500/10 border-amber-500/20";
      case "Received": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "In_Progress": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20 animate-pulse";
      case "Testing": return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "Completed": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
  };

  const getStatusLabel = (status: Booking["status"]) => {
    switch (status) {
      case "Booked": return "Booking Confirmed";
      case "Received": return "Vehicle Checked In";
      case "In_Progress": return "Active Service In Progress";
      case "Testing": return "Road & Brake Testing";
      case "Completed": return "Work Completed & Ready";
    }
  };

  // Checklist milestones for the active tracker based on progress percent
  const getMilestones = (percent: number) => {
    return [
      { label: "Booking Received & Key Slip Registered", minProgress: 0, completed: percent >= 0 },
      { label: "Vehicle Inspection & Diagnostics Scan Completed", minProgress: 25, completed: percent >= 25 },
      { label: "Oil Drained, Fluids Renewed & Components Replaced", minProgress: 50, completed: percent >= 50 },
      { label: "Brake Roller Test & Emissions Calibrations Pass", minProgress: 75, completed: percent >= 75 },
      { label: "Quality Assurance Road-Test & Digital Certificate Issued", minProgress: 100, completed: percent >= 100 }
    ];
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="my-bookings-panel">
      {bookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 max-w-xl mx-auto space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-150 text-slate-400 rounded-full w-fit mx-auto">
            <ClipboardList className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-slate-900 font-display">No Bookings Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven't scheduled any service bookings yet. Head to the <strong>Book Service &amp; MOT</strong> tab to schedule maintenance for your car.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bookings Directory Selector */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold font-display uppercase tracking-wider text-slate-400">My Vehicle Bookings</h3>
            <div className="grid gap-2.5">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingId(b.id)}
                  className={`p-4 border rounded-2xl cursor-pointer transition-all select-none flex justify-between items-center ${
                    selectedBookingId === b.id
                      ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                      : "border-slate-200 bg-white hover:border-slate-350"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${selectedBookingId === b.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 text-xs uppercase">{b.vehicle.make} {b.vehicle.model}</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">{b.services[0]} {b.services.length > 1 && `+ ${b.services.length - 1} more`}</span>
                      <span className="text-[10px] font-semibold text-slate-400 mt-1 font-mono">{b.date} @ {b.timeSlot.split(" ")[0]}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-900 font-mono">£{b.total}</span>
                    <span className={`text-[9px] font-bold uppercase mt-1 px-1.5 py-0.5 rounded border ${getStatusColor(b.status)}`}>
                      {b.status === "In_Progress" ? "In Progress" : b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* INTERACTIVE WORKSHOP SIMULATOR PANEL */}
            {activeBooking && (
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-md" id="workshop-simulator">
                <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
                  <Play className="w-4 h-4 text-amber-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-display">Workshop Status Simulator</h4>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-snug">
                  Use this testing control panel to fast-forward your car's physical progress through our workshop bays.
                </p>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => onUpdateBookingStatus(activeBooking.id, "Received", 25, "Vehicle checked-in. Drop-off key processed. Technician assigned.")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2 px-1 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    1. Check-In Key
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(activeBooking.id, "In_Progress", 50, "Technician currently performing active servicing checks, renewing oil, and flushing gaskets.")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2 px-1 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    2. Start Servicing
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(activeBooking.id, "Testing", 75, "Workshop service completed. Currently performing DVSA roller brake tests and fuel emissions diagnostic calibrations.")}
                    className="bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold py-2 px-1 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    3. Run Testing
                  </button>
                  <button
                    onClick={() => onUpdateBookingStatus(activeBooking.id, "Completed", 100, "Workshop operations completed successfully! Digital certificate compiled. Car parked in pickup bay. Pay on collection.")}
                    className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20 font-bold py-2 px-1 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    4. Finalise Work
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Status Tracker Screen */}
          {activeBooking && (
            <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-6" id="booking-tracker-screen">
              
              {/* Tracker Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 pb-5">
                <div className="flex flex-col">
                  <span className="text-[10px] text-amber-500 font-mono font-bold tracking-wider uppercase">ACTIVE WORKSHOP TRACKER</span>
                  <h3 className="text-xl font-extrabold font-display tracking-tight text-slate-900 mt-0.5">
                    Job ID: #{activeBooking.id}
                  </h3>
                  <span className="text-xs text-slate-500 mt-1">
                    Booked for: <strong>{activeBooking.customerName}</strong> • {activeBooking.vehicle.make} {activeBooking.vehicle.model} ({activeBooking.vehicle.registration})
                  </span>
                </div>

                <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(activeBooking.status)}`}>
                    {getStatusLabel(activeBooking.status)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1">Created: {new Date(activeBooking.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Progress Bar Gauge */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="text-slate-700">Service Progress:</span>
                  <span className="font-mono text-amber-500 text-sm font-extrabold">{activeBooking.progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${activeBooking.progressPercent}%` }}
                  ></div>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed italic bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                  📝 <strong>Status Note:</strong> {activeBooking.statusNotes}
                </p>
              </div>

              {/* Workshop milestones list */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Workshop Milestones:</h4>
                <div className="grid gap-3">
                  {getMilestones(activeBooking.progressPercent).map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 border rounded-2xl transition-all ${
                        m.completed
                          ? "bg-emerald-500/5 border-emerald-500/20 text-slate-800"
                          : "bg-white border-slate-100 text-slate-400 opacity-60"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        m.completed ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                      }`}>
                        {m.completed ? "✓" : idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className={`text-xs ${m.completed ? "font-semibold text-slate-900" : "font-normal"}`}>{m.label}</span>
                        {m.completed && (
                          <span className="text-[10px] text-emerald-600 font-mono mt-0.5">Bay Checked &amp; Signed Off</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Printable Invoice Block */}
              <div className="border-t border-slate-150 pt-6 space-y-4" id="invoice-block">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Digital Estimations Invoice:</h4>
                  <button
                    onClick={handlePrintReceipt}
                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Booking Slip</span>
                  </button>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-xs text-slate-700 space-y-3">
                  <div className="text-center border-b border-dashed border-slate-300 pb-3">
                    <span className="font-sans font-bold text-slate-900 uppercase tracking-tight block">APEX AUTOCARE LTD</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">OFFICIAL REPAIR WORKSHOP RECEIPT</span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1.5 text-[11px] border-b border-dashed border-slate-300 pb-3">
                    <div>Booking Ref:</div>
                    <div className="text-right font-bold text-slate-900">#{activeBooking.id}</div>
                    <div>Drop-off Location:</div>
                    <div className="text-right text-slate-900">{activeBooking.garageName}</div>
                    <div>Drop-off Time:</div>
                    <div className="text-right text-slate-900">{activeBooking.date} • {activeBooking.timeSlot}</div>
                    <div>Customer Phone:</div>
                    <div className="text-right text-slate-900">{activeBooking.customerPhone}</div>
                  </div>

                  <div className="space-y-1 text-[11px] border-b border-dashed border-slate-300 pb-3">
                    <div className="font-semibold text-slate-950 uppercase text-[10px] tracking-wider mb-1.5">Job Line Items:</div>
                    {activeBooking.services.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>• {item}</span>
                        <span>Included</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] space-y-1.5 pt-1.5">
                    <div className="flex justify-between">
                      <span>Services Subtotal:</span>
                      <span>£{activeBooking.subtotal}</span>
                    </div>
                    {activeBooking.discount > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Multi-service / Promo Discount:</span>
                        <span>-£{activeBooking.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-extrabold text-slate-900 text-sm border-t border-slate-200 pt-2">
                      <span>NET TOTAL ESTIMATED:</span>
                      <span>£{activeBooking.total}</span>
                    </div>
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-dashed border-slate-300 leading-snug">
                    Pay on completion at the Autocentre desk. <br />
                    All work backed by our standard 12-Month Guarantee.
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
