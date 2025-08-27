"use client";
import { useNavigate } from "react-router-dom";

import { title, subtitle } from "@/components/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo, SearchIcon } from "@/components/icons";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const navigate = useNavigate();

  const features = [
    {
      title: "AI Chat Assistant",
      description:
        "Get instant help with project questions using advanced AI models like DeepSeek and Qwen.",
      icon: "💬",
      color: "cyan",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      title: "Project Management",
      description:
        "Comprehensive project tracking with approval workflows, file management, and progress monitoring.",
      icon: "📋",
      color: "emerald",
      gradient: "from-emerald-500 to-green-500",
    },
    {
      title: "Supervisor Collaboration",
      description:
        "Seamless collaboration between students and supervisors with real-time notifications and feedback.",
      icon: "👥",
      color: "violet",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Smart Search & Discovery",
      description:
        "Advanced search capabilities to discover projects, get recommendations, and explore categories.",
      icon: "🔍",
      color: "orange",
      gradient: "from-orange-500 to-red-500",
    },
    {
      title: "File Management",
      description:
        "Secure cloud storage for project files, documents, and multimedia content with version control.",
      icon: "📁",
      color: "pink",
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Community Engagement",
      description:
        "Interactive platform with comments, reactions, and community-driven project discussions.",
      icon: "💬",
      color: "indigo",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const aiCapabilities = [
    "DeepSeek R1 Advanced Reasoning",
    "Qwen Coder for Programming Help",
    "DeepSeek Chat for General Questions",
    "Multi-Model AI Selection",
    "Context-Aware Responses",
    "Real-time Project Assistance",
  ];

  return (
    <DefaultLayout>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 px-4 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-cyan-500/5 dark:to-cyan-500/10" />

        <div className="inline-block max-w-4xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-500/30">
              <Logo className="text-cyan-500" size={64} />
            </div>
          </div>
          <h1 className={title({ color: "cyan", size: "lg" })}>
            Welcome to{" "}
            <span className={title({ color: "violet" })}>Project Catalog</span>
          </h1>
          <div className={subtitle({ class: "mt-4" })}>
            The ultimate platform for managing, discovering, and analyzing
            academic projects. Powered by AI chat assistants to provide
            intelligent help and streamline your project workflow.
          </div>
        </div>

        <div className="flex gap-4 flex-col sm:flex-row relative z-10">
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            color="primary"
            size="lg"
            onClick={() => navigate("/register")}
          >
            Get Started Free
          </Button>
          <Button
            className="border-2 border-cyan-500 text-cyan-500 hover:bg-cyan-500 hover:text-white px-8 py-3 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-400 dark:hover:text-black transition-all duration-300"
            size="lg"
            variant="ghost"
            onClick={() => navigate("/projects")}
          >
            Explore Projects
          </Button>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl relative z-10">
          <Card className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50 border-cyan-200/50 dark:border-cyan-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                1000+
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Projects Cataloged
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 border-violet-200/50 dark:border-violet-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400 bg-clip-text text-transparent">
                AI-Powered
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Chat Assistants
              </p>
            </CardContent>
          </Card>
          <Card className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50 border-emerald-200/50 dark:border-emerald-800/50 hover:shadow-lg transition-all duration-300">
            <CardContent>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 dark:from-emerald-400 dark:to-green-400 bg-clip-text text-transparent">
                24/7
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Supervisor Support
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-background to-gray-50/50 dark:to-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <Badge
              className="mb-4 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20"
              color="cyan"
            >
              Platform Features
            </Badge>
            <br />
            <h2 className={title({ size: "md", color: "foreground" })}>
              Powerful Features for Modern Project Management
            </h2>
            <p className="text-lg text-default-600 mt-4 max-w-2xl mx-auto">
              Everything you need to manage, analyze, and showcase your academic
              projects with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 bg-gradient-to-br from-background to-gray-50/50 dark:to-gray-800/50 group"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <span className="text-2xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                      {feature.title}
                    </h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-default-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-violet-500/5 dark:from-cyan-500/10 dark:via-blue-500/10 dark:to-violet-500/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge
                className="mb-4 bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
                color="violet"
              >
                AI Chat Technology
              </Badge>
              <br />
              <h2 className={title({ size: "md", color: "cyan" })}>
                Chat with AI Assistants for Instant Help
              </h2>
              <p className="text-lg text-default-600 mt-4">
                Our advanced AI chat system provides instant assistance with
                multiple specialized models. Get help with coding, project
                planning, research questions, and more.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                {aiCapabilities.map((capability, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                    <span className="text-sm font-medium">{capability}</span>
                  </div>
                ))}
              </div>

              <Button
                className="mt-8 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                color="primary"
                size="lg"
                onClick={() => navigate("/projects")}
              >
                Start Chatting with AI
              </Button>
            </div>

            <div className="relative">
              {/* Chat Preview Card */}
              <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-2xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                        🤖
                      </div>
                      <div>
                        <h4 className="font-semibold text-cyan-400">
                          AI Assistant
                        </h4>
                        <p className="text-sm text-gray-300">
                          Online • Ready to help
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Chat Messages Preview */}
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg rounded-br-none max-w-xs">
                        <span className="text-sm">
                          How can you help me with my project?
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="bg-gray-700 text-gray-100 px-4 py-3 rounded-lg rounded-bl-none max-w-sm">
                        <span className="text-sm">
                          I can help you with coding questions, project
                          planning, research guidance, and much more! What
                          specific area would you like assistance with?
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <div className="bg-cyan-500 text-white px-4 py-2 rounded-lg rounded-br-none max-w-xs">
                        <span className="text-sm">
                          I need help with React components
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model Selector Preview */}
                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">AI Model:</span>
                      <div className="flex gap-2">
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
                          DeepSeek R1
                        </Badge>
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          Qwen Coder
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full opacity-50 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
            Ready to Transform Your Project Management?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students and supervisors who trust Project Catalog
            for their academic success.
          </p>

          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Button
              className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
              size="lg"
              variant="secondary"
              onClick={() => navigate("/register")}
            >
              Start Your Journey
            </Button>
            <Button
              className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-8 py-3 transition-all duration-300 font-semibold"
              size="lg"
              variant="ghost"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
            Discover Amazing Projects Today
          </h3>
          <p className="text-default-600 mb-6">
            Explore our extensive collection of academic projects and get
            inspired by innovative ideas.
          </p>
          <Button
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            color="primary"
            onClick={() => navigate("/projects")}
          >
            <SearchIcon className="mr-2" />
            Browse Projects
          </Button>
        </div>
      </section>
    </DefaultLayout>
  );
}
