/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vehicle, Garage, ServicePackage, DiagnosticResult } from "./types";

// UK registration mock database
export const MOCK_VEHICLES: Record<string, Vehicle> = {
  "AB12CDE": {
    registration: "AB12 CDE",
    make: "FORD",
    model: "FIESTA",
    year: 2012,
    fuelType: "Petrol",
    engineSize: "1.2L",
    currentMileage: 82140,
    motStatus: "Valid",
    motExpiryDate: "2027-01-15",
    recommendedService: "Full Service"
  },
  "EF64GHI": {
    registration: "EF64 GHI",
    make: "VOLKSWAGEN",
    model: "GOLF",
    year: 2014,
    fuelType: "Diesel",
    engineSize: "1.6L",
    currentMileage: 112500,
    motStatus: "Valid",
    motExpiryDate: "2026-11-04",
    recommendedService: "Major Service"
  },
  "JK20LMN": {
    registration: "JK20 LMN",
    make: "BMW",
    model: "3 SERIES",
    year: 2020,
    fuelType: "Petrol",
    engineSize: "2.0L",
    currentMileage: 34100,
    motStatus: "Valid",
    motExpiryDate: "2026-09-21",
    recommendedService: "Interim Service"
  },
  "XY71ZAB": {
    registration: "XY71 ZAB",
    make: "TESLA",
    model: "MODEL 3",
    year: 2021,
    fuelType: "Electric",
    engineSize: "Dual Motor",
    currentMileage: 28400,
    motStatus: "Valid",
    motExpiryDate: "2027-03-28",
    recommendedService: "Interim Service"
  },
  "C3P0R2D": {
    registration: "C3P0 R2D",
    make: "NISSAN",
    model: "QASHQAI",
    year: 2015,
    fuelType: "Diesel",
    engineSize: "1.5L",
    currentMileage: 98430,
    motStatus: "Expired",
    motExpiryDate: "2026-05-10",
    recommendedService: "Major Service"
  },
  "LC22XYZ": {
    registration: "LC22 XYZ",
    make: "VAUXHALL",
    model: "CORSA",
    year: 2022,
    fuelType: "Petrol",
    engineSize: "1.2L",
    currentMileage: 19800,
    motStatus: "Valid",
    motExpiryDate: "2027-04-12",
    recommendedService: "Interim Service"
  }
};

const COMMON_MAKES_MODELS = [
  { make: "FORD", models: ["Fiesta", "Focus", "Puma", "Kuga"], fuels: ["Petrol", "Diesel", "Hybrid"] },
  { make: "VOLKSWAGEN", models: ["Golf", "Polo", "Tiguan", "T-Roc"], fuels: ["Petrol", "Diesel", "Electric"] },
  { make: "VAUXHALL", models: ["Corsa", "Astra", "Mokka", "Insignia"], fuels: ["Petrol", "Diesel", "Electric"] },
  { make: "BMW", models: ["1 Series", "3 Series", "5 Series", "X3"], fuels: ["Petrol", "Diesel", "Hybrid"] },
  { make: "AUDI", models: ["A1", "A3", "A4", "Q3", "Q5"], fuels: ["Petrol", "Diesel", "Hybrid"] },
  { make: "TOYOTA", models: ["Yaris", "Corolla", "C-HR", "RAV4"], fuels: ["Hybrid", "Petrol"] },
  { make: "HYUNDAI", models: ["i10", "i20", "Tucson", "Kona"], fuels: ["Petrol", "Hybrid", "Electric"] },
  { make: "NISSAN", models: ["Micra", "Juke", "Qashqai", "Leaf"], fuels: ["Petrol", "Diesel", "Electric"] },
  { make: "MERCEDES-BENZ", models: ["A-Class", "C-Class", "E-Class", "GLC"], fuels: ["Diesel", "Petrol", "Hybrid"] },
  { make: "HONDA", models: ["Civic", "Jazz", "HR-V", "CR-V"], fuels: ["Hybrid", "Petrol"] }
];

export function generateVehicleFromRegistration(reg: string): Vehicle {
  const cleanReg = reg.toUpperCase().replace(/\s+/g, "");
  
  // Return mock if present
  if (MOCK_VEHICLES[cleanReg]) {
    return MOCK_VEHICLES[cleanReg];
  }

  // Parse UK Year from license plate
  // Traditional format: XXNN XXX (e.g. LC22 XYZ, LC02 XYZ, LC52 XYZ, LC72 XYZ)
  // If NN is between 02 and 49: year is 2000 + NN
  // If NN is between 51 and 99: year is 2000 + NN - 50 (e.g. 52 -> 2002, 72 -> 2022, 68 -> 2018)
  let year = 2016; // default fallback
  const yearMatch = cleanReg.match(/^[A-Z]{2}(\d{2})/);
  if (yearMatch) {
    const num = parseInt(yearMatch[1], 10);
    if (num >= 0 && num <= 49) {
      year = 2000 + num;
    } else if (num >= 51 && num <= 99) {
      year = 2000 + num - 50;
    }
    // Safety check for futuristic years, cap at 2026
    if (year > 2026) {
      year = 2026;
    }
  }

  // Pick a random make and model based on hash of registration
  let hash = 0;
  for (let i = 0; i < cleanReg.length; i++) {
    hash = cleanReg.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const makeObj = COMMON_MAKES_MODELS[hash % COMMON_MAKES_MODELS.length];
  const model = makeObj.models[hash % makeObj.models.length];
  const fuelType = makeObj.fuels[hash % makeObj.fuels.length];
  
  let engineSize = "1.4L";
  if (fuelType === "Electric") {
    engineSize = "82 kWh";
  } else if (hash % 3 === 0) {
    engineSize = "1.0L Turbo";
  } else if (hash % 3 === 1) {
    engineSize = "1.6L";
  } else {
    engineSize = "2.0L";
  }

  const ageYears = 2026 - year;
  const currentMileage = Math.max(8000, ageYears * 11500 + (hash % 10000));
  
  let motExpiryDate = "2027-04-18";
  let motStatus: "Valid" | "Expired" | "None" = "Valid";
  
  if (ageYears < 3) {
    motStatus = "None";
    motExpiryDate = "N/A (Under 3 Years Old)";
  } else {
    const daysOffset = (hash % 300) - 50; // Some can be expired
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    motExpiryDate = date.toISOString().split("T")[0];
    motStatus = daysOffset < 0 ? "Expired" : "Valid";
  }

  const serviceRecs: Array<"Interim Service" | "Full Service" | "Major Service"> = [
    "Interim Service",
    "Full Service",
    "Major Service"
  ];
  const recommendedService = serviceRecs[hash % 3];

  // Format the visual registration (e.g. AB12 CDE)
  let visualReg = cleanReg;
  if (cleanReg.length >= 4) {
    visualReg = cleanReg.substring(0, 4) + " " + cleanReg.substring(4);
  }

  return {
    registration: visualReg,
    make: makeObj.make,
    model: model.toUpperCase(),
    year,
    fuelType,
    engineSize,
    currentMileage,
    motStatus,
    motExpiryDate,
    recommendedService
  };
}

export const MOCK_GARAGES: Garage[] = [
  {
    id: "g1",
    name: "London Autocentre (Central)",
    address: "142-150 King's Cross Road, London",
    postcode: "WC1X 9DS",
    phone: "020 7837 1222",
    rating: 4.8,
    reviewsCount: 1480,
    distance: "1.2 miles"
  },
  {
    id: "g2",
    name: "London South (Wandsworth)",
    address: "Unit 3, Swandon Way, Wandsworth, London",
    postcode: "SW18 1EP",
    phone: "020 8871 4545",
    rating: 4.7,
    reviewsCount: 920,
    distance: "5.4 miles"
  },
  {
    id: "g3",
    name: "London East (Stratford)",
    address: "88-92 High Street, Stratford, London",
    postcode: "E15 2NE",
    phone: "020 8534 8989",
    rating: 4.6,
    reviewsCount: 1105,
    distance: "4.8 miles"
  },
  {
    id: "g4",
    name: "Manchester Autocentre",
    address: "24 Princess Road, Moss Side, Manchester",
    postcode: "M14 4TH",
    phone: "0161 226 7700",
    rating: 4.9,
    reviewsCount: 2012,
    distance: "182 miles"
  },
  {
    id: "g5",
    name: "Birmingham Central Autocentre",
    address: "15-18 Constitution Hill, Birmingham",
    postcode: "B19 3LG",
    phone: "0121 236 4488",
    rating: 4.7,
    reviewsCount: 1640,
    distance: "115 miles"
  }
];

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: "Interim",
    name: "Interim Service",
    price: 89,
    duration: "1.5 hours",
    interval: "Every 6 months or 6,000 miles",
    shortDescription: "Essential maintenance for high-mileage drivers, keeping key systems lubricated and safe.",
    description: "An interim service is designed for vehicles that cover high annual mileages (typically 20,000 miles or more per year), or for vehicles requiring a regular service check. It includes an engine oil and filter change, checks on fluid levels, and essential visual safety checks of tires, brakes, lights, and steering.",
    checklistCount: 40,
    items: [
      "Engine oil change (premium high-grade oil)",
      "Engine oil filter replacement",
      "Brake fluid level check & top-up",
      "Coolant level check & top-up",
      "Windscreen washer top-up",
      "Power steering fluid check",
      "Full tyre inspection (tread depth, pressure, condition)",
      "Visual brake inspection (pads and discs visible check)",
      "Wiper blade condition & operation check",
      "External light check (indicators, brake lights, headlights)",
      "Battery health & charge diagnostic test",
      "Dashboard warning lights diagnostic scan",
      "Exhaust system leak & mount inspection"
    ]
  },
  {
    id: "Full",
    name: "Full Service",
    price: 149,
    duration: "3 hours",
    interval: "Every 12 months or 12,000 miles",
    shortDescription: "Comprehensive annual service offering peace of mind and maximum performance maintenance.",
    description: "The Full Service is a comprehensive annual inspection that covers all areas of vehicle maintenance. In addition to all items in the Interim Service, we replace the air filter, conduct deep-dive wheel-off brake assessments, and inspect the steering, suspension, and drivetrain components fully to guarantee safety and roadworthiness.",
    checklistCount: 70,
    items: [
      "Everything in Interim Service PLUS...",
      "Engine air filter replacement",
      "Deep brake inspection (wheels removed, pads and discs measured)",
      "Handbrake linkage inspection & adjustment",
      "Steering system check & grease joints",
      "Suspension spring & shock absorber wear checks",
      "Wheel bearings play & noise inspection",
      "Driveshaft gaiters & CV joints inspection",
      "Gearbox oil level check (manual transmission)",
      "Auxiliary drive belt wear & tension inspection",
      "Fuel cap seal condition check",
      "Door lock hinges and locks lubrication",
      "Air conditioning system diagnostic & temperature check"
    ]
  },
  {
    id: "Major",
    name: "Major Service",
    price: 229,
    duration: "4.5 hours",
    interval: "Every 24 months or 24,000 miles",
    shortDescription: "Ultimate bumper-to-bumper deep service replacing critical lifetime filters and fluids.",
    description: "Our most thorough diagnostic service designed to restore your vehicle to peak efficiency. Includes everything in our Full Service, plus key scheduled replacements like the cabin/pollen filter, brake fluid renewal (crucial for stopping performance), coolant change, and replacement of spark plugs (petrol cars) or fuel filter (diesel cars).",
    checklistCount: 95,
    items: [
      "Everything in Full Service PLUS...",
      "Pollen/cabin air filter replacement",
      "Complete Brake Fluid flush & replacement",
      "Spark plugs replacement (petrol engines) OR Fuel filter replacement (diesel engines)",
      "Engine coolant refresh & flush",
      "Drive belts check & replacement recommendation",
      "Detailed suspension bush wear diagnostics",
      "Air conditioning cabin sanitisation treatment",
      "Full diagnostic trouble code (DTC) reporting"
    ]
  },
  {
    id: "MOT_Only",
    name: "MOT Test Only",
    price: 45,
    duration: "1 hour",
    interval: "Annual requirement (cars over 3 years old)",
    shortDescription: "Mandatory DVSA safety and emissions test. Save £15 when booked with any service!",
    description: "The Ministry of Transport (MOT) test is a mandatory annual inspection of safety and environmental standards. It is required for all vehicles in the UK over three years old. No components are replaced or topped up, but a full road safety certificate is issued upon passing. Book alongside any service package for our discounted price of £30!",
    checklistCount: 150,
    items: [
      "DVSA-approved safety inspection",
      "Exhaust emissions analysis (co2 & particulates)",
      "Seat belt security & warning system test",
      "Brake efficiency roller tester measurement",
      "Headlight aim, pattern, and alignment calibration",
      "Vehicle VIN and plate validation",
      "Windscreen chips, cracks, and visibility scan",
      "Suspension and steering play rig testing"
    ]
  }
];

// Complete comparative matrix
export const SERVICE_CHECKLIST_CATEGORIES = [
  {
    name: "Engine, Fuel & Oil",
    checks: [
      { name: "Drain & refill engine oil with correct specification", interim: true, full: true, major: true },
      { name: "Replace oil filter", interim: true, full: true, major: true },
      { name: "Replace air filter", interim: false, full: true, major: true },
      { name: "Replace pollen/cabin filter", interim: false, full: false, major: true },
      { name: "Replace spark plugs (petrol) or fuel filter (diesel)", interim: false, full: false, major: true },
      { name: "Check auxiliary drive belts condition & tension", interim: true, full: true, major: true },
      { name: "Check vacuum pipes & hoses for leaks", interim: false, full: true, major: true },
      { name: "Check radiator condition and leaks", interim: false, full: true, major: true },
    ]
  },
  {
    name: "Fluids & Levels",
    checks: [
      { name: "Check and top up brake fluid level", interim: true, full: true, major: true },
      { name: "Complete brake fluid renewal and bleed", interim: false, full: false, major: true },
      { name: "Check and top up engine coolant level", interim: true, full: true, major: true },
      { name: "Complete coolant system flush and refill", interim: false, full: false, major: true },
      { name: "Check and top up screenwash level", interim: true, full: true, major: true },
      { name: "Check and top up power steering fluid", interim: true, full: true, major: true },
      { name: "Check gearbox & differential oil levels", interim: false, full: true, major: true }
    ]
  },
  {
    name: "Brakes & Steering",
    checks: [
      { name: "Visual brake pad & disc check (wheels on)", interim: true, full: true, major: true },
      { name: "Detailed wheel-off brake measurement & inspection", interim: false, full: true, major: true },
      { name: "Inspect brake hoses and lines for leaks or swelling", interim: false, full: true, major: true },
      { name: "Check handbrake operation and adjust play", interim: false, full: true, major: true },
      { name: "Check steering rack, boot, and track rod ends", interim: false, full: true, major: true },
      { name: "Check power steering pump & rack for leaks", interim: true, full: true, major: true }
    ]
  },
  {
    name: "Suspension & Tyres",
    checks: [
      { name: "Inspect tyres for tread depth, pressure, cracking & wear", interim: true, full: true, major: true },
      { name: "Check shock absorbers and suspension springs for leaks/snaps", interim: false, full: true, major: true },
      { name: "Inspect suspension bushes, ball joints and link arms", interim: false, full: true, major: true },
      { name: "Check wheel bearings play and operation", interim: false, full: true, major: true },
      { name: "Inspect drive shaft gaiters and CV joints", interim: false, full: true, major: true }
    ]
  },
  {
    name: "Electrical & Cabin",
    checks: [
      { name: "Full battery health charge and crank capacity test", interim: true, full: true, major: true },
      { name: "Check all external lights & indicator operation", interim: true, full: true, major: true },
      { name: "Check horn and hazard lights operation", interim: true, full: true, major: true },
      { name: "Check dashboard warning lights & service resets", interim: true, full: true, major: true },
      { name: "Scan vehicle ECU for diagnostic trouble codes", interim: false, full: true, major: true },
      { name: "Check windscreen wipers and wash jets", interim: true, full: true, major: true },
      { name: "Check seat belt operation and anchors", interim: true, full: true, major: true },
      { name: "Air conditioning diagnostic (vent temp measurement)", interim: false, full: true, major: true }
    ]
  }
];

export const MOCK_TIME_SLOTS = [
  "08:30 - 09:30",
  "09:30 - 10:30",
  "10:30 - 11:30",
  "11:30 - 12:30",
  "13:30 - 14:30",
  "14:30 - 15:30",
  "15:30 - 16:30"
];

export const EXTRA_ADDONS = [
  { id: "air_con", name: "Air Con Recharge & Sanitise", price: 59, description: "Restores icy cooling and disinfects internal vents." },
  { id: "wheel_align", name: "4-Wheel Alignment & Balance", price: 49, description: "Aligns wheels perfectly to prevent uneven tyre wear and pulling." },
  { id: "engine_flush", name: "Engine De-carbonising Flush", price: 29, description: "Flushes carbon deposit from critical engine pistons before new oil." },
  { id: "wiper_blades", name: "Premium Bosch Wiper Blades Front + Rear", price: 35, description: "Replaces old squeaking wipers with top-tier Bosch Aerotwins." }
];

export const MOCK_DIAGNOSTIC_SYMPTOMS: Record<string, DiagnosticResult> = {
  "brakes": {
    issue: "Worn Front Brake Pads & Discs",
    explanation: "Squeaking or grinding noises when braking generally indicate that the friction material on your brake pads has worn down to the metal wear indicator. This can wear out the metal brake discs (rotors) rapidly. It is critical to replace them to avoid brake fade and ensure short stopping distances.",
    severity: "dangerous",
    estimatedCost: "£140 - £260",
    recommendedService: "Full Service",
    checklistItemsToInspect: [
      "Visual brake pad & disc check",
      "Detailed wheel-off brake measurement & inspection",
      "Inspect brake hoses and lines for leaks"
    ]
  },
  "rattle": {
    issue: "Worn Suspension Drop Links or Stabiliser Bar Bushes",
    explanation: "A metallic rattling or clunking noise when driving over bumps or potholes is typically caused by play in the anti-roll bar drop links or suspension bushes. These components connect your vehicle's suspension arm to the chassis and cushion shocks. Worn links affect vehicle handling and cornering stability.",
    severity: "moderate",
    estimatedCost: "£85 - £160",
    recommendedService: "Full Service",
    checklistItemsToInspect: [
      "Check shock absorbers and suspension springs",
      "Inspect suspension bushes, ball joints and link arms",
      "Check wheel bearings play and operation"
    ]
  },
  "smoke": {
    issue: "EGR Valve Blockage or Oil Leak into Combustion",
    explanation: "Smoke from the exhaust indicates combustion contamination. Blue smoke indicates engine oil is escaping past piston rings or valve seals into the cylinders and burning. Black smoke (diesel) indicates a fuel-rich mixture, often a soot-clogged EGR (Exhaust Gas Recirculation) valve or particulate filter.",
    severity: "dangerous",
    estimatedCost: "£180 - £450",
    recommendedService: "Major Service",
    checklistItemsToInspect: [
      "Drain & refill engine oil with correct specification",
      "Check radiator condition and leaks",
      "Replace air filter"
    ]
  },
  "steering": {
    issue: "Front-End Wheel Alignment Misalignment",
    explanation: "If the vehicle pulls to one side when driving on a flat road or the steering wheel is off-centre, your wheel tracking (alignment) is likely out. This is commonly caused by hitting a curb or pothole. It leads to rapid tyre tread wear on one shoulder, reduced fuel economy, and compromised high-speed steering response.",
    severity: "moderate",
    estimatedCost: "£49 - £85",
    recommendedService: "Interim Service",
    checklistItemsToInspect: [
      "Inspect tyres for tread depth, pressure, cracking & wear",
      "Inspect suspension bushes, ball joints and link arms",
      "Check steering rack, boot, and track rod ends"
    ]
  },
  "battery": {
    issue: "Failing 12V Battery Cell or Alternator Regulator Weakness",
    explanation: "A sluggish engine startup or slow crank in the morning usually indicates a weak 12V battery. Vehicle batteries typically last 4 to 6 years. Alternatively, the alternator might not be charging the battery fully during drive cycles. A comprehensive electrical crank and charging diagnostic is needed.",
    severity: "moderate",
    estimatedCost: "£90 - £170",
    recommendedService: "Interim Service",
    checklistItemsToInspect: [
      "Full battery health charge and crank capacity test",
      "Check dashboard warning lights & service resets",
      "Check all external lights & indicator operation"
    ]
  }
};
