import React from "react";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6 leading-[1.1]">
          Intelligent lead scoring <br className="hidden md:block" /> for modern
          teams.
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 font-light">
          Production-grade, event-driven intelligence. Built with Node.js,
          Redis, and MongoDB for teams that need scale.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 items-center">
          <a
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-black text-white text-base font-semibold rounded-full shadow-xl shadow-black/25 hover:scale-105 transition-transform duration-200 dark:bg-white dark:text-black"
          >
            Start for free
          </a>
          <a
            href="#"
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-base font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Book a demo
          </a>
        </div>

        {/* Floating Dashboard Visual */}
        <div className="mt-20 relative mx-auto max-w-5xl">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -inset-x-20 h-96 bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 opacity-50 blur-3xl rounded-full -z-10"></div>

          <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-200/50 dark:border-gray-700 bg-white dark:bg-[#1a1a1a]">
            {/* Browser Chrome */}
            <div className="h-12 bg-gray-50 dark:bg-[#222] border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              </div>
              <div className="flex-1 text-center">
                <div className="w-48 h-6 bg-gray-200 dark:bg-gray-700 rounded-md mx-auto opacity-50"></div>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="p-8 grid grid-cols-12 gap-6 bg-white dark:bg-[#1a1a1a] min-h-[500px]">
              {/* Sidebar */}
              <div className="col-span-2 hidden md:flex flex-col gap-4 border-r border-gray-100 dark:border-gray-800 pr-4">
                <div className="h-8 w-8 bg-black dark:bg-white rounded-lg mb-6"></div>
                <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Main Area */}
              <div className="col-span-12 md:col-span-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    Lead Activity
                  </h3>
                  <div className="flex gap-2">
                    <div className="h-8 w-24 rounded-full bg-gray-100 dark:bg-gray-800"></div>
                  </div>
                </div>

                {/* Graph Area */}
                <div className="h-64 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800 mb-8 p-4 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100/50 to-transparent dark:from-gray-700/20 pointer-events-none"></div>
                  <div className="flex items-end justify-between h-full gap-2 px-4 pb-4">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t h-[30%]"></div>
                    <div className="w-full bg-gray-900 dark:bg-gray-500 rounded-t h-[55%]"></div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t h-[40%]"></div>
                    <div className="w-full bg-gray-900 dark:bg-gray-500 rounded-t h-[75%]"></div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t h-[45%]"></div>
                    <div className="w-full bg-gray-900 dark:bg-gray-500 rounded-t h-[60%]"></div>
                    <div className="w-full bg-black dark:bg-white rounded-t h-[85%] shadow-lg"></div>
                  </div>
                </div>

                {/* List Items */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-2 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-6 w-16 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs flex items-center justify-center font-medium">
                      Qualified
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                    <div className="h-6 w-16 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded-full text-xs flex items-center justify-center font-medium">
                      Pending
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
