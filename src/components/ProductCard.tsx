"use client";
import Image from "next/image";

export default function ProductCard({
  carName,
  imgSrc,
  onCompare,
}: {
  carName: string;
  imgSrc: string;
  onCompare?: Function;
}) {
  function onCarSelected() {
    alert("You selected " + carName);
  }

  return (
    <div
      className="w-full h-[300px] rounded-lg bg-[#1A1A1A] border border-[#333333]
                 shadow-lg shadow-black/20 cursor-pointer transition-all duration-300
                 hover:border-[#C9A55C]/30 hover:shadow-[0_0_40px_rgba(201,165,92,0.1)]
                 transform hover:-translate-y-1"
      onClick={onCarSelected}
      onMouseOver={(e) => {
        e.currentTarget.classList.remove("shadow-lg");
        e.currentTarget.classList.add("shadow-2xl");
      }}
      onMouseOut={(e) => {
        e.currentTarget.classList.remove("shadow-2xl");
        e.currentTarget.classList.add("shadow-lg");
      }}
    >
      <div className="w-full h-[70%] relative rounded-t-lg overflow-hidden">
        <Image
          src={imgSrc}
          alt="Product Picture"
          layout="fill"
          objectFit="cover"
          className="object-cover rounded-t-lg transition-transform duration-700 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="w-full h-[15%] p-[10px] text-[#C9A55C] text-center font-serif text-lg">
        {carName}
      </div>
      {onCompare ? (
        <button
          className="block h-[10%] text-sm rounded-md bg-[#C9A55C] hover:bg-[#B38B4A] mx-2 px-4 py-1 text-white 
                     shadow-sm transition-all duration-300 transform hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onCompare(carName);
          }}
        >
          Compare
        </button>
      ) : (
        ""
      )}
    </div>
  );
}
