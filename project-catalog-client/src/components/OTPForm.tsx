import React, { useState } from "react";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface OTPFormProps {
  email: string;
  onBack?: () => void;
}

export default function OTPForm({ email, onBack }: OTPFormProps) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const res = await api.post("/users/login/verify", {
        email,
        code: otp,
      });

      const token = res.data.jwtToken;
      localStorage.setItem("jwt", token);

      navigate("/about");
    } catch (err: any) {
      throw new Error(err.response?.data || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyOTP();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <Card className="w-[400px] bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border-border/50">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex justify-center">
          <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl">
            <CheckCircle className="h-6 w-6 text-green-500" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Verify Your Code
          </CardTitle>
          <CardDescription className="text-base">
            We've sent a verification code to
          </CardDescription>
          <p className="font-medium text-green-600">{email}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="otp" className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verification Code
            </Label>
            <Input
              required
              id="otp"
              placeholder="Enter 6-digit code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="border-green-200 dark:border-green-800 focus:border-green-500 focus:ring-green-500/20 h-11 text-center text-lg tracking-widest"
              maxLength={6}
            />
            <p className="text-xs text-default-500 text-center">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11"
              disabled={loading || otp.length !== 6}
              type="submit"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify & Sign In
                </>
              )}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-green-500/20 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/50"
                onClick={onBack}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}