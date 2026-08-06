"use client";

import { create } from "zustand";

interface AppUIState {
  sidebarCollapsed: boolean;
  commandMenuOpen: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setCommandMenuOpen: (v: boolean) => void;
  setMobileSidebarOpen: (v: boolean) => void;
}

export const useAppUI = create<AppUIState>((set) => ({
  sidebarCollapsed: false,
  commandMenuOpen: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setCommandMenuOpen: (v) => set({ commandMenuOpen: v }),
  setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),
}));
