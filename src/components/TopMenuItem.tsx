import Link from "next/link";

export default function TopMenuItem({
  title,
  pageRef,
}: {
  title: string;
  pageRef: string;
}) {
  return (
    <Link
      href={pageRef}
      className="w-[120px] flex items-center justify-center font-serif text-sm text-white px-2
                 hover:text-[#C9A55C] transition-colors duration-300 relative group"
    >
      {title}
      <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#C9A55C] 
                      group-hover:w-full transition-all duration-300"></span>
    </Link>
  );
}
