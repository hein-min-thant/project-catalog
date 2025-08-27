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

  const handleBackToRegister = () => {
    setStep("register");
  };

  return (
    <DefaultLayout>
      <div className="flex h-full w-full items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {step === "register" ? (
            <div className="bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border border-border/50 rounded-2xl p-8">
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl">
                    <svg className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Create Account
                  </h1>
                  <p className="text-default-600 mt-2">
                    Join our community and start sharing your projects
                  </p>
                </div>
              </div>
              <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
            </div>
          ) : (
            <div className="bg-gradient-to-br from-background via-background to-gray-50/30 dark:to-gray-800/30 border border-border/50 rounded-2xl p-8">
              <VerifyForm email={registeredEmail} />
              <div className="mt-6 text-center">
                <button
                  onClick={handleBackToRegister}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium hover:underline"
                >
                  ← Back to Registration
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}