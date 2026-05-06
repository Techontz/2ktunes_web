import AuthPage from "@/features/auth/AuthPage";
import { Suspense } from "react";

export default function Auth() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black" />}>
      <AuthPage />
    </Suspense>
  );
}
