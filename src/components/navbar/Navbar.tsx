import { Logo } from "../shared/Logo";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "../ui/sidebar";

export const Navbar = async () => {
  return (
    <div className="bg-white rounded sticky top-0 w-full md:z-30 flex items-center justify-between p-2">

      <div className="">
        <SidebarTrigger />
      </div>

      <div className="">
        <Logo />
      </div>

      <nav className="flex items-center">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </nav>

    </div>
  );
};