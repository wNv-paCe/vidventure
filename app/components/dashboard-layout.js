import React from "react";
import Header from "./header";
import Sidebar from "./sidebar";

const DashboardLayout = ({ children, userType }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header userType={userType} />
      <div className="flex flex-1">
        <Sidebar userType={userType} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
