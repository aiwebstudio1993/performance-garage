/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vehicle {
  registration: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  engineSize: string;
  currentMileage: number;
  motStatus: "Valid" | "Expired" | "None";
  motExpiryDate: string;
  recommendedService: "Interim Service" | "Full Service" | "Major Service";
}

export type ServiceType = "Interim" | "Full" | "Major" | "MOT_Only";

export interface ServicePackage {
  id: ServiceType;
  name: string;
  price: number;
  duration: string;
  interval: string;
  shortDescription: string;
  description: string;
  checklistCount: number;
  items: string[];
}

export interface Booking {
  id: string;
  vehicle: Vehicle;
  services: string[]; // e.g., ["Full Service", "MOT Test"]
  garageId: string;
  garageName: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: "Booked" | "Received" | "In_Progress" | "Testing" | "Completed";
  progressPercent: number;
  statusNotes: string;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  checklistState?: Record<string, "pending" | "pass" | "action">;
}

export interface Garage {
  id: string;
  name: string;
  address: string;
  postcode: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  distance: string;
}

export interface DiagnosticResult {
  issue: string;
  explanation: string;
  severity: "safe" | "moderate" | "dangerous";
  estimatedCost: string;
  recommendedService: "Interim Service" | "Full Service" | "Major Service" | "MOT" | "Diagnostic Check";
  checklistItemsToInspect: string[];
  isFallback?: boolean;
}
