import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react";

import api from "../config/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface CredentialsFormProps {
  onCredentialsSubmit: (email: string, password: string) => void;
}

export default function CredentialsForm({
  onCredentialsSubmit,
}: CredentialsFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const requestOTP = async () => {
    setLoading(true);
    try {
      await api.post("/users/login/request-code", {
        email,
        password,
      });
      onCredentialsSubmit(email, password);
    } catch (err: any) {
      throw new Error(err.response?.data?.email || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestOTP();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Card className="w-[400px] bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl">
            <Mail className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base">
            Sign in to your account to continue
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              required
              id="email"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </Label>
            <div className="relative">
              <Input
                required
                id="password"
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-blue-200 dark:border-blue-800 focus:border-blue-500 focus:ring-blue-500/20 h-11 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-default-500" />
                ) : (
                  <Eye className="h-4 w-4 text-default-500" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-default-600">
                Don't have an account?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}