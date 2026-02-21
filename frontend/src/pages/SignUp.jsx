import React from "react";
import SignupForm from "../components/signup/SignupForm";
import SignupVisual from "../components/signup/SignupVisual";

const SignUp = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
      <SignupForm />
      <SignupVisual />
    </div>
  );
};

export default SignUp;
