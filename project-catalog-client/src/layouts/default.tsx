import { useNavigate } from "react-router-dom";

import { Navbar } from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Logo, GithubIcon, DiscordIcon, TwitterIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Home", href: "/" },
        { label: "Projects", href: "/projects" },
        { label: "Create Project", href: "/create" },
        { label: "Saved Projects", href: "/saved" },
      ],
    },
    {
      title: "Dashboard",
      links: [
        { label: "Supervisor", href: "/supervisor-dashboard" },
        { label: "Admin", href: "/admin-dashboard" },
        { label: "Profile", href: "/profile" },
        { label: "Notifications", href: "/notifications" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "About", href: "/about" },
        { label: "Help & Support", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
      ],
    },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="relative flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl px-6 pt-4 flex-grow">
        {children}
      </main>
      <Toaster />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-white relative overflow-hidden mt-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMS41Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative z-10">
          {/* Main Footer Content */}
          <div className="container mx-auto max-w-7xl px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                    <Logo className="text-white" size={32} />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Project Catalog
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  The ultimate platform for managing, discovering, and analyzing
                  academic projects. Powered by AI chat assistants to provide
                  intelligent help and streamline your workflow.
                </p>

                {/* Social Links */}
                <div className="flex gap-3">
                  <Button
                    className="p-2 h-10 w-10 bg-gray-800 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-all duration-300"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(siteConfig.links.github, "_blank")
                    }
                  >
                    <GithubIcon size={20} />
                  </Button>
                  <Button
                    className="p-2 h-10 w-10 bg-gray-800 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-all duration-300"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(siteConfig.links.twitter, "_blank")
                    }
                  >
                    <TwitterIcon size={20} />
                  </Button>
                  <Button
                    className="p-2 h-10 w-10 bg-gray-800 hover:bg-cyan-500/20 text-gray-400 hover:text-cyan-400 transition-all duration-300"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(siteConfig.links.discord, "_blank")
                    }
                  >
                    <DiscordIcon size={20} />
                  </Button>
                </div>
              </div>

              {/* Footer Sections */}
              {footerSections.map((section, index) => (
                <div key={index} className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-4 text-cyan-400">
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <button
                          className="text-gray-300 hover:text-cyan-400 transition-colors duration-200 text-left hover:translate-x-1 transform"
                          onClick={() => navigate(link.href)}
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800">
            <div className="container mx-auto max-w-7xl px-6 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-gray-400 text-sm">
                  © {currentYear} Project Catalog. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm text-gray-400">
                  <button
                    className="hover:text-cyan-400 transition-colors"
                    onClick={() => navigate("#")}
                  >
                    Privacy Policy
                  </button>
                  <button
                    className="hover:text-cyan-400 transition-colors"
                    onClick={() => navigate("#")}
                  >
                    Terms of Service
                  </button>
                  <button
                    className="hover:text-cyan-400 transition-colors"
                    onClick={() => navigate("#")}
                  >
                    Cookie Policy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
