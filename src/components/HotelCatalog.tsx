"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import getHotels from "@/libs/hotel/getHotels";

type Hotel = {
  name: string;
  address: string;
  district: string;
  province: string;
  postalcode: string;
  tel: string;
  picture: string;
  description: string;
  id: string;
};

type HotelJson = {
  data: Hotel[];
  count: number;
};

export default function HotelCatalog() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchHotels();
  }, [currentPage]);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);
      const response = await getHotels(currentPage, itemsPerPage);
      setHotels(response.data);
      setTotalItems(response.count);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const HotelList = ({ hotels }: { hotels: Hotel[] }) => (
    <div className="space-y-8">
      {hotels.map((hotelItem) => (
        <Link href={`/hotel/${hotelItem.id}`} key={hotelItem.id} className="group block">
          <div className="flex flex-col md:flex-row">
            {/* Image container */}
            <div className="relative w-full md:w-[400px] h-[300px] md:h-[250px] overflow-hidden">
              <Image
                src={hotelItem.picture}
                alt={hotelItem.name}
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/30 to-transparent 
                opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>

            {/* Content container */}
            <div className="flex-1 p-6 bg-[#1A1A1A] border border-[#333333] hover:border-[#C9A55C]/30 
              transition-all duration-500">
              <div>
                <h3 className="text-2xl font-serif text-[#C9A55C] 
                  transition-colors duration-500 group-hover:text-white mb-3 tracking-wide">
                  {hotelItem.name}
                </h3>
                <p className="text-gray-400 text-sm font-light tracking-[0.1em] uppercase mb-4">
                  {hotelItem.district}, {hotelItem.province}
                </p>
                <p className="text-gray-300 text-sm font-light leading-relaxed line-clamp-2">
                  {hotelItem.description}
                </p>
              </div>
              
              {/* Elegant button */}
              <div className="mt-6">
                <span className="inline-flex items-center text-[#C9A55C] text-sm font-light tracking-[0.2em] uppercase
                  border-b border-transparent group-hover:border-[#C9A55C] transition-all duration-500">
                  Discover More
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-500" 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  const Pagination = ({ totalItems, currentPage, onPageChange }: { 
    totalItems: number; 
    currentPage: number; 
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push(-1); // Ellipsis
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push(-1); // Ellipsis
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push(-1); // Ellipsis
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push(-1); // Ellipsis
          pages.push(totalPages);
        }
      }
      return pages;
    };

    return (
      <div className="flex justify-center items-center space-x-2 mt-12">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-serif text-sm
            ${currentPage === 1 
              ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed' 
              : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
        >
          Previous
        </button>
        
        {getPageNumbers().map((pageNum, idx) => (
          pageNum === -1 ? (
            <span key={`ellipsis-${idx}`} className="text-gray-500">...</span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-serif text-sm
                ${currentPage === pageNum
                  ? 'bg-[#C9A55C] text-white'
                  : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
            >
              {pageNum}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(totalItems / itemsPerPage)}
          className={`px-4 py-2 rounded-lg font-serif text-sm
            ${currentPage === Math.ceil(totalItems / itemsPerPage)
              ? 'bg-[#2A2A2A] text-gray-500 cursor-not-allowed' 
              : 'bg-[#2A2A2A] text-[#C9A55C] hover:bg-[#333333] transition-colors'}`}
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="luxury-section container mx-auto px-4 py-16">
        <div className="text-center mb-20">
          <h1 className="luxury-heading text-5xl tracking-[0.2em] uppercase mb-6">
            Our Collection
          </h1>
          <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto mb-6"></div>
          <p className="luxury-subheading text-lg tracking-[0.1em] uppercase">
            Curated Luxury Hotels for the Discerning Traveler
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A55C]"></div>
          </div>
        ) : (
          <>
            <HotelList hotels={hotels} />
            <Pagination 
              totalItems={totalItems}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
