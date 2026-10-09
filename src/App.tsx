/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServiceCards from "./components/ServiceCards";
import BookingWizard from "./components/BookingWizard";
import ServiceChecklists from "./components/ServiceChecklists";
import DiagnosticsPanel from "./components/DiagnosticsPanel";
import MyBookings from "./components/MyBookings";
import { Vehicle, Booking } from "./types";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Award, Clock, Sparkles } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"book" | "checklists" | "diagnostics" | "bookings">("book");
  
  // Core application states
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricesMap, setPricesMap] = useState<Record<string, number>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("apex_auto_bookings");
      if (stored) {
        setBookings(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to load bookings from localStorage", err);
    }
  }, []);

  // Save bookings to localStorage when modified
  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    try {
      localStorage.setItem("apex_auto_bookings", JSON.stringify(newBookings));
    } catch (err) {
      console.error("Failed to save bookings to localStorage", err);
    }
  };

  // Select recommended service shortcut from AI Fault Finder
  const handleSelectRecommendedService = (serviceId: "Interim" | "Full" | "Major" | "MOT_Only") => {
    const serviceName = 
      serviceId === "Interim" ? "Interim Service" :
      serviceId === "Full" ? "Full Service" :
      serviceId === "Major" ? "Major Service" : "MOT Test Only";

    // Set prices map based on active car size
    let price = 89;
    if (serviceId === "Full") price = 149;
    if (serviceId === "Major") price = 229;
    if (serviceId === "MOT_Only") price = 45;

    // Adjust price for engine size if car is active
    if (selectedVehicle) {
      const sizeStr = selectedVehicle.engineSize.toLowerCase();
      if (selectedVehicle.fuelType === "Electric") {
        price = Math.round(price * 0.9);
      } else if (sizeStr.includes("2.0") || parseFloat(sizeStr) >= 2.0) {
        price += 25;
      } else if (sizeStr.includes("1.5") || sizeStr.includes("1.6") || parseFloat(sizeStr) >= 1.5) {
        price += 15;
      }
    }

    setPricesMap(prev => ({
      ...prev,
      [serviceName]: price
    }));

    if (!selectedServices.includes(serviceName)) {
      setSelectedServices([...selectedServices, serviceName]);
    }
    
    // Switch view to service basket
    setActiveTab("book");
    
    // Scroll to basket panel
    setTimeout(() => {
      document.getElementById("service-packages-section")?.scrollIntoView({ behavior: "smooth" });
    }, 200);
  };

  const handleToggleService = (serviceName: string, price: number) => {
    setPricesMap(prev => ({
      ...prev,
      [serviceName]: price
    }));

    if (selectedServices.includes(serviceName)) {
      setSelectedServices(selectedServices.filter(s => s !== serviceName));
    } else {
      setSelectedServices([...selectedServices, serviceName]);
    }
  };

  const handleVehicleFound = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    // Reset selected services when vehicle changes to avoid incorrect pricing
    setSelectedServices([]);
    
    // Auto-select recommended service
    const recName = vehicle.recommendedService;
    let basePrice = 89;
    if (recName.includes("Full")) basePrice = 149;
    if (recName.includes("Major")) basePrice = 229;

    // Apply engine size adjust
    let tailoredPrice = basePrice;
    if (vehicle.fuelType === "Electric") {
      tailoredPrice = Math.round(basePrice * 0.9);
    } else {
      const sizeStr = vehicle.engineSize.toLowerCase();
      if (sizeStr.includes("2.0") || parseFloat(sizeStr) >= 2.0) tailoredPrice += 25;
      else if (sizeStr.includes("1.5") || sizeStr.includes("1.6") || parseFloat(sizeStr) >= 1.5) tailoredPrice += 15;
    }

    handleToggleService(recName, tailoredPrice);

    // Scroll to services
    setTimeout(() => {
      document.getElementById("service-packages-section")?.scrollIntoView({ behavior: "smooth" });
    }, 250);
  };

  const handleBookingConfirmed = (confirmedBooking: Booking) => {
    const updatedBookings = [confirmedBooking, ...bookings];
    saveBookings(updatedBookings);
    
    // Reset basket selection
    setSelectedServices([]);
    
    // Redirect to bookings tracker
    setActiveTab("bookings");
  };

  const handleUpdateBookingStatus = (
    bookingId: string,
    status: Booking["status"],
    progressPercent: number,
    notes: string
  ) => {
    const updated = bookings.map((b) => {
      if (b.id === bookingId) {
        return {
          ...b,
          status,
          progressPercent,
          statusNotes: notes
        };
      }
      return b;
    });
    saveBookings(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Main navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        bookingsCount={bookings.length} 
      />

      {/* Main Container Area */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {activeTab === "book" && (
            <motion.div
              key="book-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Home / Booking workflow */}
              <Hero 
                onVehicleFound={handleVehicleFound} 
                onQuickSelectService={(id) => handleSelectRecommendedService(id)} 
              />
              
              <ServiceCards
                selectedVehicle={selectedVehicle}
                selectedServices={selectedServices}
                onToggleService={handleToggleService}
                onProceedToBooking={() => setActiveTab("bookings")} // Redirects wizard if pre-filled, or loads step
              />

              {/* Booking Step Wizard - shown inline if services are selected and clicked */}
              {selectedServices.length > 0 && (
                <div className="bg-slate-100/50 border-t border-slate-200">
                  <BookingWizard
                    selectedVehicle={selectedVehicle}
                    selectedServices={selectedServices}
                    initialPrices={pricesMap}
                    onBookingConfirmed={handleBookingConfirmed}
                    onBackToServices={() => {
                      document.getElementById("service-packages-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  />
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "checklists" && (
            <motion.div
              key="checklists-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ServiceChecklists />
            </motion.div>
          )}

          {activeTab === "diagnostics" && (
            <motion.div
              key="diagnostics-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <DiagnosticsPanel
                selectedVehicle={selectedVehicle}
                onSelectRecommendedService={handleSelectRecommendedService}
              />
            </motion.div>
          )}

          {activeTab === "bookings" && (
            <motion.div
              key="bookings-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              {bookings.length > 0 ? (
                <MyBookings 
                  bookings={bookings} 
                  onUpdateBookingStatus={handleUpdateBookingStatus} 
                />
              ) : (
                <div className="py-20">
                  <MyBookings 
                    bookings={bookings} 
                    onUpdateBookingStatus={handleUpdateBookingStatus} 
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="font-display font-black text-xl tracking-tight text-white">
              APEX<span className="text-amber-500">AUTOCARE</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              We are the UK's premier car servicing and vehicle diagnostics specialists, providing certified dealership-grade repairs and MOTs without the premium price tag.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => handleSelectRecommendedService("Interim")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Interim Servicing (Every 6m)</button></li>
              <li><button onClick={() => handleSelectRecommendedService("Full")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Full Annual Servicing (Every 12m)</button></li>
              <li><button onClick={() => handleSelectRecommendedService("Major")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Major Bumper Servicing (Every 24m)</button></li>
              <li><button onClick={() => handleSelectRecommendedService("MOT_Only")} className="hover:text-amber-500 transition-colors cursor-pointer text-left">DVSA Approved MOT Testing</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Diagnostics Help</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => { setActiveTab("diagnostics"); }} className="hover:text-amber-500 transition-colors cursor-pointer text-left">AI Mechanical Fault Finder</button></li>
              <li><button onClick={() => { setActiveTab("checklists"); }} className="hover:text-amber-500 transition-colors cursor-pointer text-left">Compare Checklists Matrix</button></li>
              <li><span className="text-slate-500 text-xs">Workshop Progress Simulator</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quality & Trust</h4>
            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2">
                <Shield className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>12-Month/12,000mi Nationwide Parts Guarantee</span>
              </div>
              <div className="flex gap-2">
                <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>DVSA Registered MOT Testers &amp; IMI Techs</span>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800/60 mt-10 pt-6 text-center text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Apex Autocare Ltd. All Rights Reserved. Reference: Halfords Servicing &amp; MOT Centretrain.</p>
        </div>
      </footer>
    </div>
  );
}
