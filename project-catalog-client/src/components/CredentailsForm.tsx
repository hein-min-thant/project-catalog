import React, { useState } from "react";
import { Loader2 } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const requestOTP = async () => {
    setLoading(true);
    try {
      await api.post("/users/login/request-code", {
        email,
        password,
      });
      alert("Verification code sent to your email.");
      onCredentialsSubmit(email, password);
    } catch (err: any) {
      alert(err.response?.data?.email || "Failed to send code");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestOTP();
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to receive a verification code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              required
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={loading} // Use 'disabled' prop
            type="submit"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Code
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
