import React from "react";

const SigninVisual = () => {
  return (
    <div className="hidden lg:flex w-[55%] h-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-[#222] dark:via-background-dark dark:to-[#111] relative items-center justify-center overflow-hidden">
      {/* Abstract background decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-slate-200 dark:bg-slate-800 rounded-full blur-[80px] opacity-50"></div>

      {/* Floating Card Container */}
      <div className="relative w-[480px] h-[360px] transform transition-transform hover:scale-[1.01] duration-500">
        {/* Main Intelligence Card */}
        <div className="absolute inset-0 bg-surface-light dark:bg-[#222] rounded-[2rem] shadow-2xl overflow-hidden border border-border-light dark:border-border-dark flex flex-col">
          {/* Card Header */}
          <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-surface-light/50 dark:bg-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="text-xs font-medium text-text-secondary-light dark:text-gray-400 tracking-wider uppercase">
              Lead Velocity
            </div>
          </div>

          {/* Card Body / Chart */}
          <div className="flex-1 p-8 relative flex flex-col justify-end">
            {/* Abstract Grid Background */}
            <div className="absolute inset-0 p-8 grid grid-cols-6 gap-4 opacity-[0.03] pointer-events-none">
              <div className="h-full border-r border-black dark:border-white"></div>
              <div className="h-full border-r border-black dark:border-white"></div>
              <div className="h-full border-r border-black dark:border-white"></div>
              <div className="h-full border-r border-black dark:border-white"></div>
              <div className="h-full border-r border-black dark:border-white"></div>
            </div>

            {/* Chart Bars */}
            <div className="flex items-end justify-between h-40 gap-3 px-2 z-10">
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-[40%] relative group">
                <div className="absolute bottom-0 left-0 w-full bg-primary/10 dark:bg-white/10 rounded-t-lg h-0 group-hover:h-full transition-all duration-500"></div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-[65%] relative group">
                <div className="absolute bottom-0 left-0 w-full bg-primary/20 dark:bg-white/20 rounded-t-lg h-0 group-hover:h-full transition-all duration-500 delay-75"></div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-[50%] relative group">
                <div className="absolute bottom-0 left-0 w-full bg-primary/10 dark:bg-white/10 rounded-t-lg h-0 group-hover:h-full transition-all duration-500 delay-100"></div>
              </div>
              <div className="w-full bg-primary dark:bg-white rounded-t-lg h-[85%] relative shadow-lg shadow-primary/20 dark:shadow-white/20">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-1 rounded shadow-lg">
                  +124%
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-[60%]"></div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg h-[45%]"></div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-4 text-[10px] text-text-secondary-light dark:text-gray-400 font-medium uppercase tracking-wide">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span className="text-primary dark:text-white font-bold">
                Thu
              </span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
        </div>

        {/* Floating Badge Overlay */}
        <div className="absolute -right-6 top-24 bg-surface-light dark:bg-[#333] pl-3 pr-5 py-3 rounded-full shadow-soft flex items-center gap-3 border border-slate-100 dark:border-gray-600 animate-[bounce_4s_infinite]">
          <div className="relative">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-text-secondary-light dark:text-gray-400 font-semibold">
              Status
            </span>
            <span className="text-xs font-semibold text-text-primary-light dark:text-text-white whitespace-nowrap">
              Real-time velocity tracking enabled
            </span>
          </div>
        </div>

        {/* Decorative card behind */}
        <div className="absolute -inset-4 bg-slate-200/50 dark:bg-white/5 rounded-[2.5rem] -z-10 rotate-3 scale-95 opacity-60"></div>
      </div>

      {/* Texture Overlay */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E\")",
        }}
      ></div>
    </div>
  );
};

export default SigninVisual;
