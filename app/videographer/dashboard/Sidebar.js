"use client";

export default function Sidebar({ activeTab, setActiveTab }) {
  const tabs = [
    { key: "packages", label: "Service Package Management" },
    { key: "schedule", label: "Schedule Management" },
    { key: "reservations", label: "Reservation Management" },
    { key: "portfolio", label: "Portfolio Management" },
  ];

  return (
    <div className="w-1/4 bg-gray-200 h-full p-4">
      <ul>
        {tabs.map((tab) => (
          <li
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`p-3 rounded cursor-pointer ${
              activeTab === tab.key ? "bg-blue-500 text-white" : "text-gray-800"
            }`}
          >
            {tab.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
