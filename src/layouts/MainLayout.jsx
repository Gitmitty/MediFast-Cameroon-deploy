import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

import Header from '../components/Header';
import Navigation from '../components/Navigation';
import BottomNav from '../components/BottomNav';
import SimpleDashboard from '../components/SimpleDashboard';

const MainLayout = () => {
  const { darkMode, simpleMode } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      
      {/* HEADER */}
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* SIDE NAVIGATION */}
      <Navigation isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* MAIN CONTENT */}
      <main className="pb-20 pt-20">
        {simpleMode ? <SimpleDashboard /> : <Outlet />}
      </main>

      {/* BOTTOM NAV */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
