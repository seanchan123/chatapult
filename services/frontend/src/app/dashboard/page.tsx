// src/app/dashboard/page.tsx
"use client";

import { useRouter } from "next/navigation";
import React, { useContext, useEffect } from "react";

import { AuthContext } from "@/contexts/AuthContext";

const Dashboard: React.FC = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
};

export default Dashboard;
