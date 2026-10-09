/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Vehicle, Garage, Booking } from "../types";
import { MOCK_GARAGES, MOCK_TIME_SLOTS, EXTRA_ADDONS } from "../mockData";
import { MapPin, Calendar as CalendarIcon, Clock, ChevronRight, ChevronLeft, CreditCard, CheckCircle, ShieldCheck, Mail, Phone, User, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingWizardProps {
  selectedVehicle: Vehicle | null;
  selectedServices: string[];
  initialPrices: Record<string, number>;
  onBookingConfirmed: (booking: Booking) => void;
  onBackToServices: () => void;
}

export default function BookingWizard({
  selectedVehicle,
  selectedServices,
  initialPrices,
  onBookingConfirmed,
  onBackToServices
}: BookingWizardProps) {
  
  const [step, setStep] = useState<"location" | "datetime" | "addons" | "customer" | "payment">("location");
  
  // State variables for Wizard
  const [selectedGarage, setSelectedGarage] = useState<Garage | null>(MOCK_GARAGES[0]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  
  // Customer details
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [manualReg, setManualReg] = useState("");

  const [bookingLoading, setBookingLoading] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Create date options for the next 7 days (excluding Sundays)
  const getNext7Days = () => {
    const dates = [];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    let count = 0;
    let offset = 1;
    
    while (count < 7) {
      const date = new Date();
      date.setDate(date.getDate() + offset);
      
      // Skip Sundays (standard garage closures)
      if (date.getDay() !== 0) {
        const formattedDate = date.toISOString().split("T")[0];
        const label = `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
        dates.push({ value: formattedDate, label });
        count++;
      }
      offset++;
    }
    return dates;
  };

  const datesList = getNext7Days();

  // Set default date if empty
  if (selectedDate === "" && datesList.length > 0) {
    setSelectedDate(datesList[0].value);
  }

  // Calculate pricing summary
  const getSubtotal = () => {
    let sub = 0;
    // Core services
    selectedServices.forEach(s => {
      sub += initialPrices[s] || 0;
    });
    // Addons
    selectedAddons.forEach(aId => {
      const addon = EXTRA_ADDONS.find(a => a.id === aId);
      if (addon) sub += addon.price;
    });
    return sub;
  };

  const subtotal = getSubtotal();
  const savingsCombo = selectedServices.includes("MOT Test Only") && selectedServices.length > 1 ? 15 : 0; // MOT multi-service combo
  const discountTotal = savingsCombo + promoDiscount;
  const total = Math.max(0, subtotal - discountTotal);

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === "SAVE10") {
      setPromoDiscount(10);
      setPromoMessage("✓ £10 Promo discount applied successfully!");
    } else {
      setPromoMessage("❌ Invalid or expired promo code.");
    }
  };

  const handleToggleAddon = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  const handleBookSubmit = async () => {
    if (!selectedGarage || !selectedDate || !selectedTime || !customerName || !customerEmail || !customerPhone) {
      alert("Please complete all booking inputs.");
      return;
    }

    setBookingLoading(true);

    // Determine the active vehicle
    let activeVehicle = selectedVehicle;
    if (!activeVehicle) {
      // Create manual vehicle object if they entered a plate directly
      activeVehicle = {
        registration: (manualReg || "MOCK REG").toUpperCase(),
        make: "VEHICLE",
        model: "SPECIFIED",
        year: 2018,
        fuelType: "Petrol",
        engineSize: "1.6L",
        currentMileage: 65000,
        motStatus: "Valid",
        motExpiryDate: "2027-01-01",
        recommendedService: "Full Service"
      };
    }

    const payload = {
      vehicle: activeVehicle,
      services: [...selectedServices, ...selectedAddons.map(id => EXTRA_ADDONS.find(a => a.id === id)?.name || id)],
      garageId: selectedGarage.id,
      garageName: selectedGarage.name,
      date: selectedDate,
      timeSlot: selectedTime || "09:30 - 10:30",
      customerName,
      customerEmail,
      customerPhone,
      subtotal,
      discount: discountTotal,
      total
    };

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error("Failed to book.");
      }
      const data: Booking = await res.json();
      onBookingConfirmed(data);
    } catch (err) {
      console.error("Booking failed", err);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="booking-wizard-wrapper">
      {/* Wizard Header Progress Tracker */}
      <div className="mb-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto gap-4">
          {[
            { id: "location", label: "1. Garage Location" },
            { id: "datetime", label: "2. Date & Time" },
            { id: "addons", label: "3. Extra Upgrades" },
            { id: "customer", label: "4. Contact Details" },
            { id: "payment", label: "5. Confirm Order" }
          ].map((s) => {
            const stepsOrder = ["location", "datetime", "addons", "customer", "payment"];
            const currentIdx = stepsOrder.indexOf(step);
            const thisIdx = stepsOrder.indexOf(s.id);
            const isCompleted = thisIdx < currentIdx;
            const isCurrent = thisIdx === currentIdx;

            return (
              <div key={s.id} className="flex items-center gap-1.5 whitespace-nowrap text-xs">
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-full font-bold transition-all ${
                    isCompleted 
                      ? "bg-emerald-500 text-white" 
                      : isCurrent 
                        ? "bg-amber-500 text-slate-950 font-semibold shadow-inner" 
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {isCompleted ? "✓" : thisIdx + 1}
                </span>
                <span className={`font-semibold ${isCurrent ? "text-slate-900" : isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                  {s.label.split(". ")[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Area: Step views */}
        <div className="lg:col-span-8 bg-white border border-slate-200 p-6 rounded-3xl shadow-sm min-h-[420px] flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* STEP 1: GARAGE LOCATION */}
            {step === "location" && (
              <div className="space-y-4 animate-fadeIn" id="step-location-view">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Select an Autocentre</h3>
                  <p className="text-xs text-slate-400 mt-1">Select your preferred garage for vehicle drop-off and mechanics work.</p>
                </div>
                
                <div className="grid gap-3">
                  {MOCK_GARAGES.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGarage(g)}
                      className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center select-none ${
                        selectedGarage?.id === g.id
                          ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                          : "border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2.5 rounded-xl ${selectedGarage?.id === g.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">{g.name}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{g.address} • {g.postcode}</span>
                          <span className="text-[10px] text-amber-500 font-mono mt-1 font-semibold uppercase tracking-wide">★ {g.rating} Rating ({g.reviewsCount} reviews)</span>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-700 font-mono">{g.distance}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Distance</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: DATE & TIME */}
            {step === "datetime" && (
              <div className="space-y-4 animate-fadeIn" id="step-datetime-view">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Select Date &amp; Time Slot</h3>
                  <p className="text-xs text-slate-400 mt-1">Book your drop-off window. Servicing is usually completed same-day.</p>
                </div>

                <div className="space-y-4">
                  {/* Dates Selection Slider */}
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Available Dates:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                      {datesList.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setSelectedDate(d.value)}
                          className={`p-3 border rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                            selectedDate === d.value
                              ? "bg-amber-500 border-amber-600 text-slate-950 font-bold shadow-sm"
                              : "bg-white border-slate-200 text-slate-700 hover:border-slate-450"
                          }`}
                        >
                          <span className="text-[10px] opacity-75 font-mono">{d.label.split(" ")[0]}</span>
                          <span className="text-sm font-extrabold font-display leading-tight">{d.label.split(" ")[1]}</span>
                          <span className="text-[10px] opacity-75 uppercase font-mono">{d.label.split(" ")[2]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div className="flex flex-col pt-2">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Available Drop-off Slots:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {MOCK_TIME_SLOTS.map((t) => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`p-2.5 border rounded-xl font-mono text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectedTime === t
                              ? "bg-slate-900 border-slate-950 text-amber-500 font-bold shadow-inner"
                              : "bg-white border-slate-200 text-slate-600 hover:border-slate-350"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ADDONS */}
            {step === "addons" && (
              <div className="space-y-4 animate-fadeIn" id="step-addons-view">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Custom Upgrades &amp; Fluid Top-ups</h3>
                  <p className="text-xs text-slate-400 mt-1">Upgrade your booking with common safety and performance additives.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {EXTRA_ADDONS.map((addon) => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon.id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-start select-none ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                            : "border-slate-200 hover:border-slate-350"
                        }`}
                      >
                        <div className="space-y-1 pr-4">
                          <h4 className="text-xs font-bold text-slate-900">{addon.name}</h4>
                          <p className="text-[11px] text-slate-500 leading-snug">{addon.description}</p>
                        </div>
                        <div className="text-right flex flex-col items-end flex-shrink-0">
                          <span className="text-xs font-extrabold text-amber-500 font-mono">+£{addon.price}</span>
                          <span className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded ${isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                            {isSelected ? "Added" : "Add"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: CUSTOMER CONTACT DETAILS */}
            {step === "customer" && (
              <div className="space-y-4 animate-fadeIn" id="step-customer-view">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Your Contact Details</h3>
                  <p className="text-xs text-slate-400 mt-1">Please provide details so we can send booking confirmations and update progress.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Full Name:</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>Email Address:</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. john@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Mobile Number:</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 07123 456789"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:bg-white"
                    />
                  </div>

                  {/* Manual Reg if no vehicle was looked up */}
                  {!selectedVehicle && (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                        <span>Confirm Vehicle Registration:</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AB12 CDE"
                        value={manualReg}
                        onChange={(e) => setManualReg(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm license-plate-input focus:outline-none focus:border-amber-500 focus:bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: PAYMENT & SUMMARY */}
            {step === "payment" && (
              <div className="space-y-4 animate-fadeIn" id="step-payment-view">
                <div>
                  <h3 className="text-xl font-bold font-display text-slate-900">Review &amp; Reserve Online</h3>
                  <p className="text-xs text-slate-400 mt-1">No upfront payment required today. Book now and pay securely at the garage after completion.</p>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-8 h-8 text-amber-500 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs text-amber-400 font-semibold">APEX SECURE BOOKING POLICY</span>
                      <span className="text-xs text-slate-300 font-medium">£0 Charged Today • Pay Post-Service • 100% Satisfaction Guarantee</span>
                    </div>
                  </div>
                </div>

                {/* Promo application */}
                <div className="flex gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="relative flex-grow">
                    <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ENTER PROMO CODE (Try: SAVE10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:outline-none uppercase"
                    />
                  </div>
                  <button
                    onClick={handleApplyPromo}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-1.5 px-4 rounded-lg select-none cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className={`text-[11px] font-semibold ${promoMessage.includes("✓") ? "text-emerald-600" : "text-red-500"}`}>
                    {promoMessage}
                  </p>
                )}
              </div>
            )}

          </div>

          {/* Navigation Action Buttons */}
          <div className="border-t border-slate-100 pt-6 mt-6 flex justify-between items-center">
            {step === "location" ? (
              <button
                onClick={onBackToServices}
                className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 py-2 px-3 border border-slate-200 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Adjust Services</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  const steps: Array<"location" | "datetime" | "addons" | "customer" | "payment"> = ["location", "datetime", "addons", "customer", "payment"];
                  const prevIdx = steps.indexOf(step) - 1;
                  setStep(steps[prevIdx]);
                }}
                className="text-xs text-slate-600 hover:text-slate-950 font-bold flex items-center gap-1 py-2 px-3 hover:bg-slate-50 rounded-xl"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            {step !== "payment" ? (
              <button
                onClick={() => {
                  // Validations
                  if (step === "datetime" && !selectedTime) {
                    alert("Please select drop-off time slot.");
                    return;
                  }
                  if (step === "customer" && (!customerName || !customerEmail || !customerPhone)) {
                    alert("Please complete the contact fields.");
                    return;
                  }
                  if (step === "customer" && !selectedVehicle && !manualReg) {
                    alert("Please enter your registration.");
                    return;
                  }

                  const steps: Array<"location" | "datetime" | "addons" | "customer" | "payment"> = ["location", "datetime", "addons", "customer", "payment"];
                  const nextIdx = steps.indexOf(step) + 1;
                  setStep(steps[nextIdx]);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleBookSubmit}
                disabled={bookingLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white font-extrabold py-3 px-8 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow"
              >
                {bookingLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Right Area: Sidebar summary */}
        <div className="lg:col-span-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md flex flex-col space-y-5">
          <h3 className="text-sm font-bold font-display uppercase tracking-wider text-amber-500 border-b border-slate-800 pb-3">Booking Summary</h3>
          
          {/* Active vehicle card */}
          <div className="space-y-1.5 text-xs text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">VEHICLE DETECTED:</span>
            {selectedVehicle ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-sm uppercase">{selectedVehicle.make} {selectedVehicle.model}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedVehicle.engineSize} • {selectedVehicle.fuelType}</p>
                </div>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 font-bold font-display text-[10px] rounded uppercase">
                  {selectedVehicle.registration}
                </span>
              </div>
            ) : manualReg ? (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <p className="font-bold text-white text-sm uppercase">CUSTOM VEHICLE</p>
                </div>
                <span className="bg-amber-400 text-slate-950 px-2 py-0.5 font-bold font-display text-[10px] rounded uppercase">
                  {manualReg}
                </span>
              </div>
            ) : (
              <p className="text-slate-400 italic">No vehicle confirmed yet.</p>
            )}
          </div>

          {/* Autocentre info */}
          {selectedGarage && (
            <div className="space-y-1.5 text-xs text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">SELECTED GARAGE:</span>
              <p className="font-semibold text-white">{selectedGarage.name}</p>
              <p className="text-[11px] text-slate-400 leading-snug">{selectedGarage.address}</p>
            </div>
          )}

          {/* Date and drop-off slot */}
          {(selectedDate || selectedTime) && (
            <div className="space-y-1.5 text-xs text-slate-300">
              <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">DATE &amp; TIME SLOT:</span>
              <div className="flex gap-4">
                {selectedDate && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Date</span>
                    <span className="font-semibold text-white font-mono">{selectedDate}</span>
                  </div>
                )}
                {selectedTime && (
                  <div>
                    <span className="text-[10px] text-slate-500 block">Time Slot</span>
                    <span className="font-semibold text-white font-mono">{selectedTime}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing Breakdown checklist */}
          <div className="border-t border-slate-800 pt-4 space-y-3 text-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">LINE ITEMS:</span>
            
            <div className="space-y-2">
              {/* Core services */}
              {selectedServices.map((service) => {
                const price = initialPrices[service] || 0;
                return (
                  <div key={service} className="flex justify-between items-center text-slate-300">
                    <span>{service}</span>
                    <span className="font-mono text-white">£{price}</span>
                  </div>
                );
              })}

              {/* Addons */}
              {selectedAddons.map((addonId) => {
                const addon = EXTRA_ADDONS.find(a => a.id === addonId);
                if (!addon) return null;
                return (
                  <div key={addonId} className="flex justify-between items-center text-slate-400">
                    <span>+ {addon.name}</span>
                    <span className="font-mono text-white">£{addon.price}</span>
                  </div>
                );
              })}
            </div>

            {/* Surcharges & discounts */}
            <div className="border-t border-slate-800 pt-3 space-y-1 text-slate-400">
              <div className="flex justify-between items-center text-[11px]">
                <span>Service Subtotal:</span>
                <span className="font-mono">£{subtotal}</span>
              </div>
              
              {savingsCombo > 0 && (
                <div className="flex justify-between items-center text-emerald-400 text-[11px]">
                  <span>MOT Multi-Booking Saving:</span>
                  <span className="font-mono">-£{savingsCombo}</span>
                </div>
              )}

              {promoDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 text-[11px]">
                  <span>Promo Discount:</span>
                  <span className="font-mono">-£{promoDiscount}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-bold text-white">Total Estimate:</span>
              <div className="text-right">
                <p className="text-2xl font-extrabold font-display tracking-tight text-amber-500 font-mono">£{total}</p>
                <p className="text-[9px] text-slate-400 mt-0.5">Includes VAT &amp; standard fluids</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
