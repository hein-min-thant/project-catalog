/* eslint-disable jsx-a11y/label-has-associated-control */
// RegisterForm.tsx
import { Button, Checkbox, Link, addToast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react";

import api from "@/config/api";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    terms: z.literal(true).refine((val) => val === true, {
      message: "You must agree",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegistrationSuccess: (email: string) => void;
}

export default function RegisterForm({
  onRegistrationSuccess,
}: RegisterFormProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await api.post("/users/register/request-code", {
        name: data.username,
        email: data.email,
        password: data.password,
      });
      addToast({
        title: "Success",
        description: "Verification code sent to your email.",
        color: "primary",
      });
      onRegistrationSuccess(data.email);
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.response?.data?.email || "Error sending code",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Username Field */}
      <div className="space-y-2">
        <label className="font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Username
        </label>
        <input
          {...register("username")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.username
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-background`}
          placeholder="Choose a username"
        />
        {errors.username && (
          <p className="text-red-500 text-sm">{errors.username.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <label className="font-medium flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Email Address
        </label>
        <input
          {...register("email")}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            errors.email
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-600"
          } bg-background`}
          placeholder="Enter your email address"
          type="email"
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label className="font-medium flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.password
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-background`}
            placeholder="Create a strong password"
            type={isVisible ? "text" : "password"}
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label className="font-medium flex items-center gap-2">
          <Lock className="h-4 w-4" />
          Confirm Password
        </label>
        <div className="relative">
          <input
            {...register("confirmPassword")}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
              errors.confirmPassword
                ? "border-red-500"
                : "border-gray-300 dark:border-gray-600"
            } bg-background`}
            placeholder="Confirm your password"
            type={isConfirmVisible ? "text" : "password"}
          />
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            type="button"
            onClick={() => setIsConfirmVisible(!isConfirmVisible)}
          >
            {isConfirmVisible ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="space-y-2">
        <Checkbox
          {...register("terms")}
          className={`py-4 ${errors.terms ? "text-red-500" : ""}`}
          size="sm"
        >
          I agree with the&nbsp;
          <Link href="#" size="sm">
            Terms
          </Link>
          &nbsp; and&nbsp;
          <Link href="#" size="sm">
            Privacy Policy
          </Link>
        </Checkbox>
        {errors.terms && (
          <p className="text-red-500 text-sm">{errors.terms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        className="w-full"
        color="primary"
        isLoading={loading}
        type="submit"
        onClick={handleSubmit(onRegisterSubmit)}
      >
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </div>
  );
}
