import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-black p-4 flex items-center justify-between">
      <div className="text-white font-bold text-xl">
        <img src="src\components\images\second_chair.gif" alt="Logo" className="h-16" />
      </div>
      <div className="space-x-4">
        <Link to="/" className="text-white hover:text-gray-400">Home</Link>
        <Link to="/irregular-verbs" className="text-white hover:text-gray-400">Irregular Verbs</Link>
        <Link to="/irregular-verbs-progress" className="text-white hover:text-gray-400">Progress</Link>
      </div>
    </nav>
  );
};

export default Navbar;
