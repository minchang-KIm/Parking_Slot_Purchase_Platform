import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, Shield } from 'lucide-react';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">주차공간을 쉽고 빠르게</h1>
          <p className="text-xl mb-8">개인간 안전한 주차공간 거래 플랫폼</p>
          <Link to="/search" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            지금 검색하기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center">
              <MapPin className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">위치 기반 검색</h3>
              <p className="text-gray-600">내 주변 주차공간을 실시간으로 검색</p>
            </div>
            <div className="card text-center">
              <Calendar className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">간편한 예약</h3>
              <p className="text-gray-600">원하는 시간에 빠르게 예약</p>
            </div>
            <div className="card text-center">
              <Shield className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">안전한 결제</h3>
              <p className="text-gray-600">카카오페이, 토스 등 다양한 결제 수단</p>
            </div>
            <div className="card text-center">
              <Search className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">리뷰 시스템</h3>
              <p className="text-gray-600">실제 이용자 리뷰로 안심 선택</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">지금 시작하세요!</h2>
          <p className="text-xl text-gray-600 mb-8">
            주차공간을 등록하고 수익을 창출하거나<br />
            필요할 때 주차공간을 예약하세요
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn btn-primary text-lg px-8 py-3">
              회원가입
            </Link>
            <Link to="/search" className="btn btn-secondary text-lg px-8 py-3">
              주차공간 찾기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
