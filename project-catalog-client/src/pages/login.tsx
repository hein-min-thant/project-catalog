import { useState } from "react";

import DefaultLayout from "@/layouts/default";
import CredentialsForm from "@/components/CredentailsForm";
import OTPForm from "@/components/OTPForm";

export default function LoginPage() {
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [, setPassword] = useState("");

  const handleCredentialsSubmit = (
    submittedEmail: string,
    submittedPassword: string
  ) => {
    setEmail(submittedEmail);
    setPassword(submittedPassword);
    setStep("otp");
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {step === "credentials" ? (
            <CredentialsForm onCredentialsSubmit={handleCredentialsSubmit} />
          ) : (
            <OTPForm email={email} onBack={handleBackToCredentials} />
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
