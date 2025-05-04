import { currentUser } from "@clerk/nextjs/server";
import { Logo } from "../shared/Logo";
import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/nextjs";

export const Navbar = async () => {
  const user = await currentUser();
  return (
    <div className="sticky top-0 md:w-full md:top-0 md:z-30 flex justify-between flex-row flex-wrap items-center bg-white p-6 border-b border-gray-300">
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