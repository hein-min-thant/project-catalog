import React, { useState } from "react";
import { Loader2 } from "lucide-react";
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
}

export default function OTPForm({ email }: OTPFormProps) {
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

      alert("Login successful 🎉");
      navigate("/about");
    } catch (err: any) {
      alert(err.response?.data || "Invalid code");
      console.error(err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOTP();
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Verify Your Code</CardTitle>
        <CardDescription>
          Please enter the verification code sent to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              required
              id="otp"
              placeholder="Enter the OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <Button className="w-full" disabled={loading} type="submit">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify & Log In
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
