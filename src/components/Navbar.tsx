/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wrench, Calendar, ClipboardCheck, AlertTriangle, Eye } from "lucide-react";

interface NavbarProps {
  activeTab: "book" | "checklists" | "diagnostics" | "bookings";
  setActiveTab: (tab: "book" | "checklists" | "diagnostics" | "bookings") => void;
  bookingsCount: number;
}

export default function Navbar({ activeTab, setActiveTab, bookingsCount }: NavbarProps) {
  const tabs: Array<{
    id: "book" | "checklists" | "diagnostics" | "bookings";
    label: string;
    icon: any;
    badge?: number;
  }> = [
    { id: "book", label: "Book Service & MOT", icon: Calendar },
    { id: "checklists", label: "Servicing Checklist", icon: ClipboardCheck },
    { id: "diagnostics", label: "AI Fault Finder", icon: AlertTriangle },
    { id: "bookings", label: "My Bookings & Tracker", icon: Eye, badge: bookingsCount > 0 ? bookingsCount : undefined },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setActiveTab("book")}
            id="nav-logo"
          >
            <div className="bg-amber-500 text-slate-950 p-1.5 rounded-lg font-bold flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-lg tracking-tight leading-none text-white">
                APEX<span className="text-amber-500">AUTOCARE</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase leading-none mt-1">
                Servicing &amp; Repair Centres
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1" id="nav-desktop-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 select-none cursor-pointer ${
                    isActive 
                      ? "bg-amber-500 text-slate-950 shadow-inner font-semibold" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-slate-950 text-amber-500' : 'bg-amber-500 text-slate-950'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Contact Hotline & Badge */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-slate-400">Bookings Hotline</span>
              <span className="text-sm font-semibold text-amber-500 font-mono">0800 123 4567</span>
            </div>
            <button 
              onClick={() => setActiveTab("bookings")}
              className="md:hidden relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg select-none"
              id="nav-mobile-bookings-btn"
            >
              <Eye className="w-5 h-5" />
              {bookingsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center rounded-full animate-pulse">
                  {bookingsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex bg-slate-950 border-t border-slate-800 justify-around py-1" id="nav-mobile-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-md transition-colors select-none ${
                isActive ? "text-amber-500" : "text-slate-400"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 text-[9px] font-bold px-1 py-0.2 bg-amber-500 text-slate-950 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">
                {tab.id === "book" ? "Book" : tab.id === "checklists" ? "Checklist" : tab.id === "diagnostics" ? "AI Diag" : "Tracker"}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
