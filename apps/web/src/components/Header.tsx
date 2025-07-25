"use client";

import { useUser } from "@clerk/clerk-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./common/Logo";
import { UserNav } from "./common/UserNav";

type NavigationItem = {
  name: string;
  href: string;
  current: boolean;
};

const navigation: NavigationItem[] = [
  { name: "Benefits", href: "#Benefits", current: true },
  { name: "Reviews", href: "#reviews", current: false },
];

export default function Header() {
  const { user } = useUser();
  const pathname = usePathname();

  return (
    <Disclosure as="nav" className=" ">
      {({ open }) => (
        <>
          <div className="flex items-center bg-white h-16 sm:h-20">
            <div className="container px-2 sm:px-0">
              <div className="flex h-16 items-center justify-between w-full">
                {/* Left: Logo */}
                <div className="flex shrink-0 items-center">
                  <Logo />
                </div>
                {/* Right: Navigation and actions */}
                <div className="hidden sm:flex items-center gap-8 ml-auto">
                            <Link
                    href={pathname === "/" ? "#Benefits" : "/#Benefits"}
                              className="text-[#2D2D2D] text-center text-xl not-italic font-normal leading-[normal]"
                            >
                    Benefits
                            </Link>
                  <Link href="/tasks">
                      <button
                      className="bg-blue-600 text-white rounded-lg px-6 py-2 font-semibold hover:bg-blue-700 transition text-lg"
                        type="button"
                      >
                      Get Started
                      </button>
                    </Link>
                  {user && (
                    <div className="ml-2">
                      <UserNav
                        image={user?.imageUrl}
                        name={user?.fullName || "User"}
                        email={user?.primaryEmailAddress?.emailAddress || ""}
                      />
                    </div>
                  )}
                  </div>
                {/* Mobile: Hamburger and logo only */}
                <div className="block sm:hidden ml-auto">
                  <DisclosureButton className="relative inline-flex  items-center justify-center rounded-md p-2 text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 flex flex-col gap-3 items-start">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className="text-[#2D2D2D] text-center text-xl not-italic font-normal leading-[normal]"
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </DisclosureButton>
              ))}
              <div className="flex gap-6 items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Link
                  href="/tasks"
                  className="border rounded-lg border-solid border-[#2D2D2D] text-[#2D2D2D] text-center text-xl not-italic font-normal leading-[normal] font-montserrat px-5 py-[5px]"
                >
                  Sign in
                </Link>
                <Link
                  href="/tasks"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
}
