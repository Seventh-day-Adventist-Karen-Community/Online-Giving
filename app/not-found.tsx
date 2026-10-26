import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto h-screen flex flex-col justify-center text-gray-600">
      <div className="mx-auto flex flex-col gap-2">
        <Image src="/logo.png" width={200} height={100} alt="Karen Community SDA logo" className="mx-auto" />
        <div className="font-bold text-9xl text-gray-200 text-center py-2">404</div>
        <div className="text-center">Sorry, this page could not be found.</div>
        <div className="py-3 flex justify-center font-semibold">
          <Link className="text-maroon-700 hover:border-b-2 hover:border-maroon-700 transition-all" href="/">
            Give Online
          </Link>
        </div>
      </div>
    </div>
  );
}
