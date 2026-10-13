import React from "react";
import SignupForm from "../../components/auth/SignupForm";
import SignupVisual from "../../components/auth/SignupVisual";

const SignUpPage = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
      <SignupForm />
      <SignupVisual />
    </div>
  );
};

export default SignUpPage;
