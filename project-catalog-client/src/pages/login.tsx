import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import CredentialsForm from "@/components/CredentailsForm";
import OTPForm from "@/components/OTPForm";

export default function LoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");

  const handleCredentialsSubmit = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("otp");
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-large flex w-full max-w-sm flex-col gap-4 px-8 pt-6 pb-10">
          <p className="pb-4 text-center text-3xl font-semibold">
            {step === "credentials" ? "Sign In" : "Verify OTP"}
          </p>
          {step === "credentials" ? (
            <CredentialsForm onCredentialsSubmit={handleCredentialsSubmit} />
          ) : (
            <OTPForm email={email} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
