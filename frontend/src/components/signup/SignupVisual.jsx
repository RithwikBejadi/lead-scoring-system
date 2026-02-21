import React from "react";

const SignupVisual = () => {
  return (
    <div className="hidden lg:flex w-[55%] h-full bg-background-light dark:bg-background-dark relative items-center justify-center p-12 overflow-hidden">
      {/* Pattern Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `
                radial-gradient(circle at 10% 20%, rgba(0,0,0,0.03) 0%, transparent 20%),
                radial-gradient(circle at 90% 80%, rgba(0,0,0,0.03) 0%, transparent 20%),
                linear-gradient(#e5e5e5 1px, transparent 1px),
                linear-gradient(90deg, #e5e5e5 1px, transparent 1px)
            `,
          backgroundSize: "100% 100%, 100% 100%, 40px 40px, 40px 40px",
          backgroundPosition: "0 0, 0 0, -1px -1px, -1px -1px",
        }}
      ></div>

      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent dark:from-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/5 to-transparent dark:from-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

      <div className="max-w-lg w-full relative z-10 flex flex-col items-center">
        {/* Feature Card */}
        <div className="bg-surface-light/70 dark:bg-surface-dark/70 backdrop-blur-xl border border-white/50 dark:border-white/10 w-full p-8 rounded-[2rem] shadow-2xl shadow-primary/5 dark:shadow-black/20 mb-12 transform transition-all hover:-translate-y-1 duration-500">
          <div className="flex flex-col gap-6">
            {/* Dynamic Visual Area */}
            <div className="h-40 bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark flex items-center justify-center overflow-hidden relative group">
              {/* Code Snippet Visual */}
              <div className="absolute inset-0 p-4 font-mono text-xs text-text-secondary-light dark:text-text-secondary-dark flex flex-col gap-1 opacity-80">
                <div className="flex gap-2">
                  <span className="text-blue-500">const</span>
                  <span className="text-purple-500">event</span>
                  <span>=</span>
                  <span className="text-warning">{"{"}</span>
                </div>
                <div className="pl-4 flex gap-2">
                  <span className="text-text-primary-light dark:text-text-secondary-dark">
                    type:
                  </span>
                  <span className="text-success">'lead.captured'</span>,
                </div>
                <div className="pl-4 flex gap-2">
                  <span className="text-text-primary-light dark:text-text-secondary-dark">
                    source:
                  </span>
                  <span className="text-success">'api'</span>,
                </div>
                <div className="pl-4 flex gap-2">
                  <span className="text-text-primary-light dark:text-text-secondary-dark">
                    timestamp:
                  </span>
                  <span className="text-blue-500">Date.now()</span>
                </div>
                <div>
                  <span className="text-warning">{"}"}</span>;
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-blue-500">await</span>
                  <span className="text-purple-500">engine</span>.
                  <span className="text-yellow-600">process</span>(event);
                </div>
              </div>

              {/* Floating Icon */}
              <div className="absolute bottom-3 right-3 bg-primary dark:bg-white text-white dark:text-primary rounded-lg p-2 shadow-lg">
                <span className="material-icons-outlined text-sm">code</span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium uppercase tracking-wider text-text-secondary-light dark:text-gray-400">
                  Architecture
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-primary dark:text-white">
                Event-Driven by Default
              </h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                Built for scale from day one. Ingest millions of events without
                blocking your main application thread.
              </p>
            </div>

            {/* Pagination Dots */}
            <div className="flex gap-2 pt-2">
              <div className="h-1.5 w-6 bg-primary dark:bg-white rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-border-light dark:bg-border-dark rounded-full"></div>
              <div className="h-1.5 w-1.5 bg-border-light dark:bg-border-dark rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Trusted By Strip */}
        <div className="text-center w-full">
          <p className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-widest mb-6">
            Trusted by engineering teams at
          </p>
          <div className="flex justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Abstract Company Logos */}
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-5 h-5 bg-text-primary-light dark:bg-white rounded rotate-45"></div>
              <span className="font-bold text-lg font-display text-text-primary-light dark:text-white">
                Acme
              </span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-5 h-5 rounded-full border-4 border-text-primary-light dark:border-white"></div>
              <span className="font-bold text-lg font-display text-text-primary-light dark:text-white">
                Orbit
              </span>
            </div>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-t-[15px] border-t-text-primary-light dark:border-t-white border-r-[10px] border-r-transparent"></div>
              <span className="font-bold text-lg font-display text-text-primary-light dark:text-white">
                Vertex
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupVisual;
