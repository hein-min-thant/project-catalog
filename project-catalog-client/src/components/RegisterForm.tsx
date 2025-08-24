// RegisterForm.tsx
import { Button, Input, Checkbox, Link, addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

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
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onRegisterSubmit)}
    >
      <Input
        {...register("username")}
        errorMessage={errors.username?.message}
        isInvalid={!!errors.username}
        label="Username"
        placeholder="Enter your username"
        variant="bordered"
      />
      <Input
        {...register("email")}
        errorMessage={errors.email?.message}
        isInvalid={!!errors.email}
        label="Email"
        placeholder="Enter your email"
        variant="bordered"
      />
      <Input
        {...register("password")}
        endContent={
          <button type="button" onClick={() => setIsVisible(!isVisible)}>
            <Icon
              className="text-default-400 pointer-events-none text-2xl"
              icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-bold"}
            />
          </button>
        }
        errorMessage={errors.password?.message}
        isInvalid={!!errors.password}
        label="Password"
        placeholder="Enter your password"
        type={isVisible ? "text" : "password"}
        variant="bordered"
      />
      <Input
        {...register("confirmPassword")}
        endContent={
          <button
            type="button"
            onClick={() => setIsConfirmVisible(!isConfirmVisible)}
          >
            <Icon
              className="text-default-400 pointer-events-none text-2xl"
              icon={
                isConfirmVisible ? "solar:eye-closed-linear" : "solar:eye-bold"
              }
            />
          </button>
        }
        errorMessage={errors.confirmPassword?.message}
        isInvalid={!!errors.confirmPassword}
        label="Confirm Password"
        placeholder="Confirm your password"
        type={isConfirmVisible ? "text" : "password"}
        variant="bordered"
      />
      <Checkbox
        {...register("terms")}
        className="py-4"
        isInvalid={!!errors.terms}
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
      <Button color="primary" isLoading={loading} type="submit">
        Sign Up
      </Button>
    </form>
  );
}
