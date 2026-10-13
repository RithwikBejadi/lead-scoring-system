import React from "react";
import SigninForm from "../../components/auth/SigninForm";
import SigninVisual from "../../components/auth/SigninVisual";

const SignInPage = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark font-display text-text-primary-light dark:text-text-primary-dark">
      <SigninForm />
      <SigninVisual />
    </div>
  );
};

export default SignInPage;
