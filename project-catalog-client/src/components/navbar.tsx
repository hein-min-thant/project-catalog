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
import { LogOut, SaveIcon, UserCircle, Bell } from "lucide-react";

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
      const { data } = await api.get("/users/me");

      setUser(data);
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
            <p className="text-inherit font-extrabold text-xl text-cyan-500">
              CATALOG
            </p>
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

        {isAuthenticated() && (
          <NavbarItem>
            <NotificationDropdown />
          </NavbarItem>
        )}

        <NavbarItem>
          <Link
            className={buttonStyles({
              radius: "md",
              size: "md",
              color: "primary",
              className: "bg-cyan-500 text-white hover:bg-cyan-600 transition",
            })}
            href="/create"
          >
            Create Project
          </Link>
        </NavbarItem>

        {isAuthenticated() ? (
          <NavbarItem>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-9 w-9 ring-2 ring-cyan-500 ring-offset-2 ring-offset-background">
                  {user?.avatarUrl ? (
                    <AvatarImage
                      alt={user.name || "User"}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <AvatarFallback className="bg-cyan-500 text-white font-bold">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-background">
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
                    className="bg-background"
                    onClick={() => navigate("/profile")}
                  >
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="bg-background"
                    onClick={() => navigate("/saved-projects")}
                  >
                    <SaveIcon className="mr-2 h-4 w-4" />
                    Saved Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="bg-background"
                    onClick={() => navigate("/notifications")}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavbarItem>
        ) : (
          <NavbarItem>
            <Link
              className={buttonStyles({
                radius: "md",
                size: "md",
                color: "primary",
                className:
                  "bg-cyan-500 text-white hover:bg-cyan-600 transition",
              })}
              href="/register"
            >
              Sign Up
            </Link>
          </NavbarItem>
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
        {siteConfig.navMenuItems.map((item, index) => (
          <NavbarMenuItem key={item.href}>
            <Link
              className={clsx(
                "block py-2 text-lg",
                index === siteConfig.navMenuItems.length - 1
                  ? "text-red-500 hover:text-red-600"
                  : "text-foreground/90 hover:text-cyan-500"
              )}
              color={index === 2 ? "primary" : "foreground"}
              href={item.href}
              onClick={
                index === siteConfig.navMenuItems.length - 1
                  ? handleLogout
                  : undefined
              }
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroUINavbar>
  );
};
