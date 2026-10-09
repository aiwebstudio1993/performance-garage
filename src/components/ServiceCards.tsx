/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, Shield, Clock, Plus, Trash2, ArrowRight } from "lucide-react";
import { Vehicle, ServicePackage } from "../types";
import { SERVICE_PACKAGES } from "../mockData";

interface ServiceCardsProps {
  selectedVehicle: Vehicle | null;
  selectedServices: string[];
  onToggleService: (serviceName: string, price: number) => void;
  onProceedToBooking: () => void;
}

export default function ServiceCards({
  selectedVehicle,
  selectedServices,
  onToggleService,
  onProceedToBooking
}: ServiceCardsProps) {
  
  // Dynamic price calculator based on vehicle engine size
  const getTailoredPrice = (basePkg: ServicePackage): number => {
    if (basePkg.id === "MOT_Only") {
      // MOT is standard or £30 when combined with service
      const hasOtherService = selectedServices.some(s => s !== "MOT Test Only");
      return hasOtherService ? 30 : 45;
    }

    if (!selectedVehicle) return basePkg.price;

    const sizeStr = selectedVehicle.engineSize.toLowerCase();
    if (selectedVehicle.fuelType === "Electric") {
      // Electric discount (fewer fluids to replace!)
      return Math.round(basePkg.price * 0.9);
    } else if (sizeStr.includes("2.0") || sizeStr.includes("dual") || parseFloat(sizeStr) >= 2.0) {
      // Large engine surcharges
      return basePkg.price + 25;
    } else if (sizeStr.includes("1.5") || sizeStr.includes("1.6") || parseFloat(sizeStr) >= 1.5) {
      // Medium engine
      return basePkg.price + 15;
    }
    
    return basePkg.price;
  };

  const hasServicesSelected = selectedServices.length > 0;

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="service-packages-section">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-slate-900 sm:text-4xl">
          Choose Your Servicing <span className="text-amber-500">Packages</span>
        </h2>
        <p className="mt-4 text-slate-500 text-base">
          {selectedVehicle ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              Showing exact, tailored pricing for your {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.engineSize})
            </span>
          ) : (
            "Explore our standard pricing below. Enter a registration plate to unlock precise pricing matched to your exact vehicle specification."
          )}
        </p>
      </div>

      {/* Pricing adjustment banner */}
      {selectedVehicle && (
        <div className="mb-8 p-4 bg-slate-900 border border-slate-800 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 font-mono font-bold">ACTIVE VEHICLE DETAILS</span>
            <span className="text-sm font-bold mt-0.5">{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.registration})</span>
            <span className="text-xs text-slate-400 mt-0.5">
              Engine Size: {selectedVehicle.engineSize} • Fuel: {selectedVehicle.fuelType} • Mileage: {Math.round(selectedVehicle.currentMileage).toLocaleString()} mi
            </span>
          </div>
          {selectedVehicle.fuelType === "Electric" ? (
            <span className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold">
              ✓ Electric Vehicle Discount Applied (10% Off Servicing)
            </span>
          ) : (
            <span className="bg-slate-800 border border-slate-750 px-3 py-1.5 rounded-xl text-slate-300 text-xs font-semibold">
              Pricing calculated for engine size: {selectedVehicle.engineSize}
            </span>
          )}
        </div>
      )}

      {/* Grid of packages */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {SERVICE_PACKAGES.map((pkg) => {
          const price = getTailoredPrice(pkg);
          const serviceName = pkg.id === "MOT_Only" ? "MOT Test Only" : `${pkg.name}`;
          const isSelected = selectedServices.includes(serviceName);

          // Check if MOT discount applies
          const isMotDiscounted = pkg.id === "MOT_Only" && selectedServices.some(s => s !== "MOT Test Only");

          return (
            <div
              key={pkg.id}
              id={`service-card-${pkg.id}`}
              className={`flex flex-col justify-between p-6 bg-white border rounded-3xl transition-all duration-300 relative shadow-sm hover:shadow-lg ${
                isSelected 
                  ? "border-amber-500 ring-2 ring-amber-500/40 transform -translate-y-1.5" 
                  : "border-slate-200"
              }`}
            >
              {/* Recommended Badge */}
              {selectedVehicle && selectedVehicle.recommendedService === pkg.name && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-extrabold tracking-wider uppercase px-3 py-1 rounded-full border border-white shadow">
                  RECOMMENDED FOR YOU
                </span>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold font-display tracking-tight text-slate-900">{pkg.name}</h3>
                    <p className="text-xs text-slate-400 font-medium tracking-wide mt-0.5 uppercase font-mono">{pkg.interval}</p>
                  </div>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 py-1">
                  <span className="text-slate-500 text-xs font-medium">£</span>
                  <span className="text-4xl font-extrabold font-display tracking-tight text-slate-900">{price}</span>
                  {isMotDiscounted && (
                    <span className="text-xs text-red-500 line-through font-mono ml-2">£45</span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[50px]">{pkg.shortDescription}</p>

                <div className="border-t border-slate-100 pt-4 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duration: ~{pkg.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Includes {pkg.checklistCount}+ Point Checklist</span>
                  </div>
                </div>

                {/* Checklist Bullet Points preview */}
                <div className="pt-2 space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase block">KEY ITEMS INCLUDED:</span>
                  <ul className="space-y-1.5">
                    {pkg.items.slice(0, 4).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Check className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Trigger */}
              <div className="pt-6">
                <button
                  onClick={() => onToggleService(serviceName, price)}
                  id={`btn-add-service-${pkg.id}`}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm"
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Service</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Booking</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Panel if items selected */}
      {hasServicesSelected && (
        <div className="mt-12 p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 animate-fadeIn" id="basket-action-panel">
          <div className="flex flex-col">
            <span className="text-xs text-amber-500 font-mono font-bold">YOUR BOOKING BASKET</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-sm text-slate-400">Total Services Selected:</span>
              <span className="text-lg font-bold text-white ml-1">{selectedServices.length}</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedServices.map((service, idx) => (
                <span key={idx} className="bg-slate-800 border border-slate-750 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <span>{service}</span>
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={onProceedToBooking}
            id="proceed-booking-btn"
            className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 px-8 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm uppercase tracking-wider shadow-md select-none cursor-pointer"
          >
            <span>Proceed to Booking Details</span>
            <ArrowRight className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      )}
    </div>
  );
}
