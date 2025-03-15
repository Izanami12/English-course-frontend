import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import wheelchair from '../../assets/images/Wheelchair_work_0.2.gif';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isProgressActive = location.pathname.startsWith('/irregular-verbs-progress');
  const isVerbsActive = location.pathname.startsWith('/irregular-verbs');
  const isHomeActive = location.pathname === '/';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-black p-4 flex items-center justify-between relative">
      <div className="text-white font-bold text-xl flex items-center">
        <img src={wheelchair} alt="Logo" className="h-16" />
      </div>

      {/* Desktop Links */}
      <div className="hidden md:flex flex-grow justify-center space-x-4">
        <Link
          to="/"
          className={`px-4 py-2 rounded ${isHomeActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
        >
          Home
        </Link>
        <Link
          to="/irregular-verbs"
          className={`px-4 py-2 rounded ${isVerbsActive && !isProgressActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
        >
          Irregular Verbs
        </Link>
        <Link
          to="/irregular-verbs-progress"
          className={`px-4 py-2 rounded ${isProgressActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
        >
          Progress
        </Link>
      </div>

      {/* Mobile Menu Icon */}
      <div className="md:hidden text-white cursor-pointer" onClick={toggleMenu}>
        {isMenuOpen ? <FaTimes size={28} /> : <FaBars size={28} />}
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-black flex flex-col items-center space-y-4 py-4 md:hidden z-50">
          <Link
            to="/"
            onClick={closeMenu}
            className={`px-4 py-2 rounded ${isHomeActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
          >
            Home
          </Link>
          <Link
            to="/irregular-verbs"
            onClick={closeMenu}
            className={`px-4 py-2 rounded ${isVerbsActive && !isProgressActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
          >
            Irregular Verbs
          </Link>
          <Link
            to="/irregular-verbs-progress"
            onClick={closeMenu}
            className={`px-4 py-2 rounded ${isProgressActive ? 'bg-blue-600 text-white' : 'text-white hover:bg-gray-800'}`}
          >
            Progress
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
