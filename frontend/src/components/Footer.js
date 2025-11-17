import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">주차 거래 플랫폼</h3>
            <p className="text-gray-400">
              안전하고 편리한 개인간 주차공간 거래 플랫폼
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">링크</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/search" className="hover:text-white">주차공간 찾기</a></li>
              <li><a href="/my-spaces" className="hover:text-white">내 주차공간</a></li>
              <li><a href="/about" className="hover:text-white">서비스 소개</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">고객지원</h3>
            <ul className="space-y-2 text-gray-400">
              <li>이메일: support@parking.com</li>
              <li>전화: 1588-0000</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 주차 거래 플랫폼. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
