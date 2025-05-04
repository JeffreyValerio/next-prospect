import { Logo } from "../shared/Logo";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";
import { SidebarTrigger } from "../ui/sidebar";

export const Navbar = async () => {
  return (
    <div className="bg-white rounded sticky top-0 md:w-full md:z-30 flex justify-between flex-row flex-wrap items-center p-2">
      <SidebarTrigger />
      <Logo />

      <nav className="flex justify-end items-center gap-2">
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