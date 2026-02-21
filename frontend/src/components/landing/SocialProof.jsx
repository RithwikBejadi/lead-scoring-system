import React from "react";

const SocialProof = () => {
  return (
    <section className="border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-background-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-gray-400 font-medium mb-8 uppercase tracking-widest">
          Trusted by engineering teams at
        </p>
        <div className="flex flex-wrap justify-center gap-12 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-bold font-display text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-default">
            <span className="material-icons">architecture</span> ACME Corp
          </div>
          <div className="text-xl font-bold font-display text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-default">
            <span className="material-icons">bolt</span> BoltShift
          </div>
          <div className="text-xl font-bold font-display text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-default">
            <span className="material-icons">all_inclusive</span> Infinite
          </div>
          <div className="text-xl font-bold font-display text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-default">
            <span className="material-icons">code</span> DevSpace
          </div>
          <div className="text-xl font-bold font-display text-gray-800 dark:text-gray-200 flex items-center gap-2 cursor-default">
            <span className="material-icons">polyline</span> Globals
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
