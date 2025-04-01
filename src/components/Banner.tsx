"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Banner() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture
        className="absolute top-0 left-0 w-full h-full object-cover brightness-75"
      >
        <source src="https://media.iceportal.com/138346/Videos/video040524214954517_1080p.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>

      {/* Content */}
      <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
        {/* Welcome Message */}
        {session && (
          <div className="absolute top-8 right-8">
            <p className="text-[#C9A55C] font-serif text-lg">
              Welcome back, {session.user?.name}
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6 max-w-4xl">
          <h1 className="text-6xl md:text-7xl font-serif text-white tracking-wider">
            CozyHotel
          </h1>
          <div className="w-24 h-[2px] bg-[#C9A55C] mx-auto"></div>
          <h3 className="text-2xl md:text-3xl font-serif text-[#C9A55C] tracking-wide">
            Where Luxury Meets Comfort
          </h3>
          <p className="text-gray-300 text-lg md:text-xl font-light max-w-2xl mx-auto">
            Experience unparalleled elegance and exceptional service at our collection of premium hotels
          </p>
        </div>

        {/* CTA Button */}
        <div className="absolute bottom-12">
          <button
            className="luxury-button"
            onClick={() => {
              router.push("/hotel");
            }}
          >
            Discover Our Hotels
          </button>
        </div>
      </div>
    </div>
  );
}
