"use client";

import Sidebar from "./Sidebar";
import ContentArea from "./ContentArea";
import { useState } from "react";

export default function DashboardLayout() {
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ContentArea activeTab={activeTab} />
    </div>
  );
}
