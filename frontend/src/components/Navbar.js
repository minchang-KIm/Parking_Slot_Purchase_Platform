import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Car, Menu, User, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Car className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">주차 플랫폼</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/search" className="text-gray-700 hover:text-primary-600">
              검색
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/my-bookings" className="text-gray-700 hover:text-primary-600">
                  내 예약
                </Link>
                <Link to="/my-spaces" className="text-gray-700 hover:text-primary-600">
                  내 주차공간
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-gray-700 hover:text-primary-600">
                    관리자
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                    <User className="w-5 h-5" />
                  </Link>
                  <button onClick={handleLogout} className="text-gray-700 hover:text-primary-600">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">
                  로그인
                </Link>
                <Link to="/register" className="btn btn-primary">
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
