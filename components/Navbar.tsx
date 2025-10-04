import Image from "next/image";
import { Bell } from "lucide-react";
import { Button } from "./ui/button";
import SearchBox from "./SearchBox";
const Navbar = () => {
  return (
    <nav className="wrapper py-4 flex items-center justify-between">
      <div className="flex gap-14 w-full max-w-2xl pr-4">
        <div className="flex items-center gap-3.5">
          <Image src="/logo2.png" alt="lamina logo" width={40} height={40} />
          <span className="font-bold text-[1.375rem] leading-none">Lamina</span>
        </div>

        <SearchBox />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button size={"icon"} variant={"outline"}>
          <Bell />
        </Button>
        <Button variant={"outline"} size={"icon"}>
          <div className="size-6 relative">
            <Image
              src="/profile.webp"
              alt="genta profile picture"
              fill
              className="object-cover object-top rounded"
            />
          </div>
        </Button>
      </div>
    </nav>
  );
};
export default Navbar;
