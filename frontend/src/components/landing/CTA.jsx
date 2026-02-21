import React from "react";

const CTA = () => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-[#111]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold tracking-tight mb-6 text-gray-900 dark:text-white">
          Ready to qualify your leads?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-10 text-lg">
          Join high-growth teams using our platform to prioritize their most
          valuable users.
        </p>
        <form
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="flex-1 px-6 py-4 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-shadow"
            placeholder="work@email.com"
            required
            type="email"
          />
          <button
            className="px-8 py-4 bg-black text-white font-medium rounded-full hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 transition-colors shadow-lg shadow-black/20 dark:shadow-white/20 whitespace-nowrap"
            type="submit"
          >
            Get Access
          </button>
        </form>
        <p className="mt-4 text-xs text-gray-400">
          14-day free trial. No credit card required.
        </p>
      </div>
    </section>
  );
};

export default CTA;
