import { useState } from "react";

import RegisterForm from "@/components/RegisterForm";
import DefaultLayout from "@/layouts/default";
import VerifyForm from "@/components/VerifyForm";

export default function RegisterPage() {
  const [step, setStep] = useState<"register" | "verify">("register");
  const [registeredEmail, setRegisteredEmail] = useState<string>("");

  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setStep("verify");
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-large flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
          <p className="pb-4 text-left text-3xl font-semibold">
            {step === "register" ? "Sign Up" : "Verify Email"}
          </p>
          {step === "register" ? (
            <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
          ) : (
            <VerifyForm email={registeredEmail} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
