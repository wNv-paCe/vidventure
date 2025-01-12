"use client";

import Packages from "./Packages";
import Schedule from "./Schedule";
import Reservations from "./Reservations";
import Portfolio from "./Portfolio";

export default function ContentArea({ activeTab }) {
  return (
    <div className="w-3/4 bg-white h-full p-6">
      {activeTab === "packages" && <Packages />}
      {activeTab === "schedule" && <Schedule />}
      {activeTab === "reservations" && <Reservations />}
      {activeTab === "portfolio" && <Portfolio />}
    </div>
  );
}
