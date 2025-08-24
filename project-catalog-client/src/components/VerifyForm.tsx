// VerifyForm.tsx
import { Button, Input, addToast } from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import api from "@/config/api";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().min(4, "Code must be at least 4 digits"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyFormProps {
  email: string;
}

export default function VerifyForm({ email }: VerifyFormProps) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { email: email },
  });

  useEffect(() => {
    setValue("email", email);
  }, [email, setValue]);

  const onVerifySubmit = async (data: VerifyFormData) => {
    setLoading(true);
    try {
      const res = await api.post("/users/register/verify-and-create", {
        email: data.email,
        code: data.code,
      });

      if (res.status === 200 || res.status === 201) {
        addToast({
          title: "Success",
          description: "Account created successfully! You can now log in.",
          color: "success",
        });
        navigate("/login");
      }
    } catch (err: any) {
      addToast({
        title: "Error",
        description: err.response?.data?.message || "Invalid code or email",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onVerifySubmit)}
    >
      <Input
        {...register("code")}
        errorMessage={errors.code?.message}
        isInvalid={!!errors.code}
        label="Verification Code"
        placeholder="Enter the code sent to your email"
        variant="bordered"
      />
      <Input {...register("email")} type="hidden" />
      <Button color="primary" isLoading={loading} type="submit">
        Verify & Create Account
      </Button>
    </form>
  );
}
