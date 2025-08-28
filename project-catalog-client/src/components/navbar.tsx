// src/components/Navbar.tsx
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import clsx from "clsx";
import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LogOut,
  SaveIcon,
  UserCircle,
  Bell,
  Plus,
  UserPlus,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";
import { isAuthenticated } from "@/config/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/config/api";

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
  } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated()) {
        try {
          const { data } = await api.get("/users/me");

          setUser(data);
        } catch (error) {
          // If token is invalid, user will be redirected to login
          localStorage.removeItem("jwt");
          setUser(null);
        }
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    setUser(null);
    navigate("/login");
  };

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper:
          "bg-card/60 backdrop-blur-md border border-border rounded-xl focus-within:ring-2 focus-within:ring-cyan-500",
        input: "text-sm placeholder-muted-foreground",
      }}
      endContent={<Kbd className="hidden lg:inline-block text-xs">⌘ K</Kbd>}
      labelPlacement="outside"
      placeholder="Search projects…"
      startContent={
        <SearchIcon className="text-base text-muted-foreground pointer-events-none" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar
      className="bg-card/60 backdrop-blur-md border-b border-border"
      isBlurred={true}
      maxWidth="xl"
      position="sticky"
    >
      {/* Brand & desktop nav */}
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link className="flex items-center gap-1" color="foreground" href="/">
            <Logo />
            <p className="font-extrabold text-xl text-cyan-500">CATALOG</p>
          </Link>
        </NavbarBrand>

        <div className="hidden lg:flex gap-4 ml-4">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  "text-foreground/90 hover:text-cyan-500 transition",
                  "data-[active=true]:underline data-[active=true]:underline-offset-4 data-[active=true]:decoration-cyan-500 data-[active=true]:decoration-2"
                )}
                color="foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            </NavbarItem>
          ))}
        </div>
      </NavbarContent>

      {/* Desktop – right side */}
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>

        {/* Show notification dropdown only when authenticated */}
        {isAuthenticated() && (
          <NavbarItem>
            <NotificationDropdown />
          </NavbarItem>
        )}

        {/* Authentication-based button */}
        {isAuthenticated() ? (
          <>
            {/* Create Project Button - for logged in users */}
            <NavbarItem>
              <Link
                className={buttonStyles({
                  radius: "md",
                  size: "md",
                  color: "primary",
                  className:
                    "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl",
                })}
                href="/create"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Link>
            </NavbarItem>

            {/* User Avatar Dropdown */}
            <NavbarItem>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Avatar className="h-9 w-9 ring-2 ring-cyan-500 ring-offset-2 ring-offset-background hover:ring-cyan-400 transition-all cursor-pointer">
                    {user?.avatarUrl ? (
                      <AvatarImage
                        className="object-cover"
                        alt={user.name || "User"}
                        src={user.avatarUrl}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-background border-border"
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold">{user?.name || "User"}</span>
                      <span className="text-xs text-muted-foreground">
                        {user?.email || ""}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem
                      className="bg-background hover:bg-accent"
                      onClick={() => navigate("/profile")}
                    >
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="bg-background hover:bg-accent"
                      onClick={() => navigate("/saved-project")}
                    >
                      <SaveIcon className="mr-2 h-4 w-4" />
                      Saved Projects
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="bg-background hover:bg-accent"
                      onClick={() => navigate("/notifications")}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="bg-background hover:bg-destructive/10 text-destructive hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </NavbarItem>
          </>
        ) : (
          <>
            {/* Create Project Button - for non-authenticated users */}
            <NavbarItem>
              <Link
                className={buttonStyles({
                  radius: "md",
                  size: "md",
                  color: "primary",
                  className:
                    "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl",
                })}
                href="/create"
              >
                {isAuthenticated() && <Plus className="mr-2 h-4 w-4" />}
                {!isAuthenticated() ? "Login" : "Create Project"}
              </Link>
            </NavbarItem>

            {/* Sign Up Button */}
            <NavbarItem>
              <Link
                className={buttonStyles({
                  radius: "md",
                  size: "md",
                  variant: "bordered",
                  className:
                    "border-cyan-500 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 transition-all duration-300",
                })}
                href="/register"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* Mobile menu */}
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-muted-foreground hover:text-cyan-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      {/* Mobile menu drawer */}
      <NavbarMenu className="bg-card/80 backdrop-blur-md pt-4">
        <div className="mx-4 mb-4">{searchInput}</div>

        {/* Mobile navigation items */}
        {siteConfig.navItems.map((item) => (
          <NavbarMenuItem key={item.href}>
            <Link
              className="block py-2 text-lg text-foreground/90 hover:text-cyan-500 transition"
              color="foreground"
              href={item.href}
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}

        {/* Mobile auth section */}
        <div className="mt-4 pt-4 border-t border-border">
          {isAuthenticated() ? (
            <>
              <NavbarMenuItem>
                <Link
                  className="py-2 text-lg text-foreground/90 hover:text-cyan-500 transition flex items-center"
                  color="foreground"
                  href="/profile"
                >
                  <UserCircle className="mr-3 h-5 w-5" />
                  Profile
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className="py-2 text-lg text-foreground/90 hover:text-cyan-500 transition flex items-center"
                  color="foreground"
                  href="/create"
                >
                  {isAuthenticated() && <Plus className="mr-2 h-4 w-4" />}
                  {!isAuthenticated() ? "Login" : "Create Project"}
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <button
                  className="w-full text-left py-2 text-lg text-red-500 hover:text-red-600 transition flex items-center"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log out
                </button>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <Link
                  className="py-2 text-lg text-foreground/90 hover:text-cyan-500 transition flex items-center"
                  color="foreground"
                  href="/register"
                >
                  <UserPlus className="mr-3 h-5 w-5" />
                  Sign Up
                </Link>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <Link
                  className="py-2 text-lg text-foreground/90 hover:text-cyan-500 transition flex items-center"
                  color="foreground"
                  href="/create"
                >
                  <Plus className="mr-3 h-5 w-5" />
                  Create Project
                </Link>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
