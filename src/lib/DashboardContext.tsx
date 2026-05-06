'use client';

import React, { createContext, useContext, useState } from 'react';

interface DashboardContextType {
  setShowPlansModal: (show: boolean) => void;
  setShowLogoutDialog: (show: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, value }: { children: React.ReactNode, value: DashboardContextType }) {
  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}
