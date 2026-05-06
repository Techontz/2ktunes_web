'use client';

import SettingsTab from "@/features/dashboard/SettingsTab";
import { useDashboard } from "@/lib/DashboardContext";

export default function SettingsPage() {
  const { setShowLogoutDialog, setShowDeleteDialog, setShowPlansModal } = useDashboard();

  return (
    <SettingsTab 
      onLogout={() => setShowLogoutDialog(true)} 
      onDeleteAccount={() => setShowDeleteDialog(true)}
      onManageSubscription={() => setShowPlansModal(true)}
    />
  );
}
