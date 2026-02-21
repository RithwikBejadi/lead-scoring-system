import React from "react";
import SigninForm from "../components/signin/SigninForm";
import SigninVisual from "../components/signin/SigninVisual";

const SignIn = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
      <SigninForm />
      <SigninVisual />
    </div>
  );
};

export default SignIn;
