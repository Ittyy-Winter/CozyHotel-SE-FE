import Image from "next/image";
import Link from "next/link";
import TopMenuItem from "./TopMenuItem";
import { getServerSession } from "next-auth";
import { authOptions } from "../app/api/auth/[...nextauth]/authOptions";

export default async function TopMenu() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div
      className="h-[64px] bg-[#1A1A1A] sticky top-0 left-0 right-0 z-30 
                    border-b border-[#333333] flex justify-between items-center px-8
                    shadow-lg shadow-black/20"
    >
      <div className="flex items-center h-full space-x-8">
        <Link href="/" className="flex items-center space-x-2">
          {/*<Image
            src="/img/logo.png"
            alt="logo"
            width={39}
            height={39}
            className="h-full w-auto"
          /> */}
          <span className="text-[#C9A55C] font-serif text-xl">CozyHotel</span>
        </Link>
        <TopMenuItem title="Select Hotel" pageRef="/hotel" />
        <TopMenuItem title="About" pageRef="/about" />
        <TopMenuItem title="My Bookings" pageRef="/cart" />
        {isAdmin && (
          <TopMenuItem 
            title="Admin Dashboard" 
            pageRef="/admin/dashboard" 
          />
        )}
      </div>
      <div className="flex items-center h-full space-x-6">
        {session && session.user ? (
          <Link href="/api/auth/signout">
            <div
              className="px-4 py-2 text-[#C9A55C] text-sm font-serif cursor-pointer
                          hover:text-white transition-colors duration-300
                          border border-[#C9A55C] rounded-full
                          hover:bg-[#C9A55C]/10"
            >
              Sign-Out
            </div>
          </Link>
        ) : (
          <>
            <Link href="/api/auth/signin">
              <div
                className="px-4 py-2 text-[#C9A55C] text-sm font-serif cursor-pointer
                            hover:text-white transition-colors duration-300
                            border border-[#C9A55C] rounded-full
                            hover:bg-[#C9A55C]/10"
              >
                Sign-In
              </div>
            </Link>
            <Link href="/register">
              <div
                className="px-4 py-2 text-white text-sm font-serif cursor-pointer
                            bg-[#C9A55C] rounded-full
                            hover:bg-[#B38B4A] transition-colors duration-300"
              >
                Register
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
