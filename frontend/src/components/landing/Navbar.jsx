import React, { useState, useEffect } from "react";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800" : "bg-transparent"} h-20 flex items-center`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
            </div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
              Leads
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#infrastructure"
              className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Infrastructure
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a
              href="#docs"
              className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="hidden md:block text-sm font-medium text-gray-900 dark:text-white hover:opacity-70 transition-opacity"
            >
              Log In
            </a>
            <a
              href="/signup"
              className="bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-5 py-2.5 rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 dark:shadow-white/20"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
