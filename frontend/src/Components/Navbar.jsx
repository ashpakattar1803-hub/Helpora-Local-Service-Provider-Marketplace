
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-emerald-900 border-b border-emerald-800 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          onClick={closeMenu}
          className="text-2xl font-bold text-white"
        >
          Helpora
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 text-white">
          <Link to="/" className="hover:text-teal-300">Home</Link>
          <Link to="/about" className="hover:text-teal-300">About</Link>
          <Link to="/search" className="hover:text-teal-300">Services</Link>
          <Link to="/login" className="hover:text-teal-300">
            Customer Login
          </Link>
          <Link to="/register" className="hover:text-teal-300">
            Customer Sign Up
          </Link>
        </div>

        {/* Admin and Provider Options */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/provider-login?mode=login"
            className="border border-emerald-300 text-white px-4 py-2 rounded-lg hover:bg-emerald-800"
          >
            Admin Login
          </Link>

          <Link
            to="/provider-login"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-400"
          >
            Become a Provider
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-emerald-800 px-6 py-5 space-y-4 text-white">

          <Link to="/" onClick={closeMenu} className="block">
            Home
          </Link>

          <Link to="/about" onClick={closeMenu} className="block">
            About
          </Link>

          <Link to="/search" onClick={closeMenu} className="block">
            Services
          </Link>

          <Link to="/login" onClick={closeMenu} className="block">
            Customer Login
          </Link>

          <Link to="/register" onClick={closeMenu} className="block">
            Customer Sign Up
          </Link>

          <Link
            to="/provider-login?mode=login"
            onClick={closeMenu}
            className="block"
          >
            Admin Login
          </Link>

          <Link
            to="/provider-login"
            onClick={closeMenu}
            className="block bg-emerald-500 text-center py-2 rounded-lg"
          >
            Become a Provider
          </Link>

        </div>
      )}
    </nav>
  );
}

export default Navbar;
