import { useState, useEffect } from "react";
import { HiMoon, HiSun } from "react-icons/hi";
import logoSeano from "../../../../assets/logo_seano.webp";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  //   const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //   useEffect(() => {
  //     // Check initial theme from localStorage or system preference
  //     const savedTheme = localStorage.getItem("theme");
  //     const prefersDark = window.matchMedia(
  //       "(prefers-color-scheme: dark)"
  //     ).matches;

  //     if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
  //       setIsDarkMode(true);
  //       document.documentElement.classList.add("dark");
  //     }
  //   }, []);

  //   const toggleDarkMode = () => {
  //     setIsDarkMode(!isDarkMode);
  //     if (!isDarkMode) {
  //       document.documentElement.classList.add("dark");
  //       localStorage.setItem("theme", "dark");
  //     } else {
  //       document.documentElement.classList.remove("dark");
  //       localStorage.setItem("theme", "light");
  //     }
  //   };

  return (
    <div
      className={`w-full py-4 z-50 fixed top-0 left-0 right-0 transition-all duration-300 ${
        isScrolled ? "bg-black/50 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-1 group cursor-pointer">
            <img
              src={logoSeano}
              width={40}
              alt="Seano Logo"
              className="transition-transform duration-500 ease-in-out group-hover:scale-110 group-hover:rotate-3"
            />
            <h1 className="text-2xl font-semibold italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent transition-all duration-300 ease-in-out">
              Seano
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-8">
              <li>
                <a
                  href="#about"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#technology"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  Technology
                </a>
              </li>
              <li>
                <a
                  href="#data"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  Data
                </a>
              </li>
              <li>
                <a
                  href="#publications"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  Publications
                </a>
              </li>
              <li>
                <a
                  href="#team"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  Team
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-gray-200 hover:text-primary font-medium transition-all duration-300 ease-in-out relative pb-1 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-500 after:ease-in-out hover:after:w-full"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>

          {/* CTA Button & Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            {/* <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-full hover:bg-gray-800 transition-all duration-300 ease-in-out group"
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <HiSun className="w-7 h-7 text-yellow-500 transition-transform duration-300 ease-in-out group-hover:rotate-45 group-hover:scale-110" />
              ) : (
                <HiMoon className="w-7 h-7 text-gray-200 transition-transform duration-300 ease-in-out group-hover:-rotate-12 group-hover:scale-110" />
              )}
            </button> */}

            {/* CTA Button */}
            <a
              href="#get-started"
              className="relative px-6 py-2.5 text-white rounded-full font-medium shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 ease-in-out inline-block overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] bg-left hover:bg-right"
            >
              Get it Now
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-all duration-300 ease-in-out">
            <svg
              className="w-6 h-6 text-gray-200 transition-transform duration-300 ease-in-out hover:scale-110"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
