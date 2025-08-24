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
import { link as linkStyles } from "@heroui/theme";
import clsx from "clsx";
import { button as buttonStyles } from "@heroui/theme";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { LogOut, SaveIcon, UserCircle } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon, SearchIcon, Logo } from "@/components/icons";
import { isAuthenticated } from "@/config/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
      }
      type="search"
    />
  );

  return (
    <HeroUINavbar isBlurred={true} maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Logo />
            <p className="text-inherit font-extrabold text-xl">CATALOG</p>
          </Link>
        </NavbarBrand>
        <div className="hidden lg:flex gap-4 justify-start ml-2">
          {siteConfig.navItems.map((item) => (
            <NavbarItem key={item.href}>
              <Link
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "data-[active=true]:text-primary data-[active=true]:font-medium"
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

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NavbarItem>
          <Link
            className={buttonStyles({
              radius: "md",
              size: "md",
              color: "primary",
              className: "primary",
            })}
            href="/create"
          >
            Create Project
          </Link>
        </NavbarItem>
        {isAuthenticated() ? (
          <NavbarItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer outline-none">
                <Avatar className="h-10 w-10">
                  {user?.avatarUrl ? (
                    <AvatarImage
                      alt={user?.name || "User"}
                      src={user.avatarUrl}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/saved-projects")}>
                    <SaveIcon className="mr-2 h-4 w-4" />
                    <span>Saved Projects</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </NavbarItem>
        ) : (
          <Link
            className={buttonStyles({
              radius: "md",
              size: "md",
              color: "primary",
              className: "primary",
            })}
            href="/register"
          >
            Sign Up
          </Link>
        )}
      </NavbarContent>
      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        {searchInput}
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                      ? "danger"
                      : "foreground"
                }
                href="#"
                size="lg"
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
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
