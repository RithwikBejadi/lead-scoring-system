import React from "react";

const VelocityChart = () => {
  return (
    <div className="lg:col-span-2 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg p-5 shadow-card flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          Lead Velocity & Event Volume
        </h3>
        <div className="flex gap-2">
          <button className="text-xs font-medium px-2 py-1 rounded bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-secondary-light">
            1H
          </button>
          <button className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
            24H
          </button>
          <button className="text-xs font-medium px-2 py-1 rounded bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-secondary-light">
            7D
          </button>
        </div>
      </div>
      <div className="flex-1 relative w-full h-full flex items-end gap-2 px-2 pb-2">
        {/* Simulated Chart Bars (Events) & Line (Velocity) */}
        <div className="absolute inset-0 flex flex-col justify-between text-xs text-text-secondary-light dark:text-text-secondary-dark opacity-50 pointer-events-none z-0">
          <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
          <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
          <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
          <div className="w-full border-b border-dashed border-border-light dark:border-border-dark h-0"></div>
        </div>
        {/* Bars */}
        <div className="flex-1 flex items-end justify-between gap-1 h-full z-10 pl-6">
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "30%" }}
          >
            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-dark text-white text-xs px-2 py-1 rounded shadow-lg">
              3k Events
            </div>
          </div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "45%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "35%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "60%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "50%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "75%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "65%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "80%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "55%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "40%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "70%" }}
          ></div>
          <div
            className="w-full bg-primary/20 hover:bg-primary/30 rounded-t-sm transition-all relative group"
            style={{ height: "90%" }}
          ></div>
        </div>
        {/* Line Overlay (SVG) */}
        <svg
          className="absolute inset-0 w-full h-full pl-6 pointer-events-none z-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80 Q 50 120 100 90 T 200 110 T 300 60 T 400 90 T 500 40 T 600 70 T 700 30 T 800 50"
            fill="none"
            stroke="#2b6cee"
            strokeWidth="2.5"
            className="drop-shadow-sm"
          ></path>
        </svg>
      </div>
      <div className="flex justify-between pl-6 text-xs text-text-secondary-light mt-2">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
        <span>23:59</span>
      </div>
    </div>
  );
};

export default VelocityChart;
