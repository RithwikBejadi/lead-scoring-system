import React from "react";

const Features = () => {
  return (
    <section
      id="features"
      className="py-24 bg-background-light dark:bg-background-dark"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
            Engineered for reliability.
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl">
            Every component is designed to handle scale without compromising on
            speed or accuracy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-6 gap-6 h-auto">
          {/* Large Tile: Real-time Event Processing */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-lg p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-black dark:bg-white rounded-full flex items-center justify-center mb-6 text-white dark:text-black">
                  <span className="material-icons">flash_on</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Real-time Event Processing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Process thousands of signals per second with sub-millisecond
                  latency.
                </p>
              </div>

              {/* Visual: Code Snippet */}
              <div className="mt-8 bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 shadow-inner overflow-hidden border border-gray-700">
                <div className="flex gap-1.5 mb-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                </div>
                <p>
                  <span className="text-purple-400">const</span>{" "}
                  <span className="text-blue-400">processEvent</span> ={" "}
                  <span className="text-purple-400">async</span> (event) =&gt;{" "}
                  {"{"}
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">const</span> score ={" "}
                  <span className="text-purple-400">await</span> model.
                  <span className="text-blue-400">predict</span>(event.payload);
                </p>
                <p className="pl-4">
                  <span className="text-gray-500">// Real-time ingestion</span>
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">await</span> redis.
                  <span className="text-blue-400">zadd</span>(
                  <span className="text-green-400">'leads:live'</span>, score,
                  event.userId);
                </p>
                <p className="pl-4">
                  <span className="text-purple-400">return</span> {"{"} status:{" "}
                  <span className="text-green-400">'processed'</span>, score{" "}
                  {"}"};
                </p>
                <p>{"}"}</p>
              </div>
            </div>
          </div>

          {/* Small Tile: Idempotency */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-lg p-8 border border-gray-200 dark:border-gray-800 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-black dark:text-white">
                <span className="material-icons">shield</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Idempotency by design
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Never double-count an event. Guaranteed exactly-once processing.
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>{" "}
                Safe
              </span>
            </div>
          </div>

          {/* Small Tile: Identity Resolution */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-white dark:bg-[#1a1a1a] rounded-lg p-8 border border-gray-200 dark:border-gray-800 flex flex-col justify-between group hover:shadow-lg transition-shadow duration-300">
            <div>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-black dark:text-white">
                <span className="material-icons">fingerprint</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Identity Resolution
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically merge anonymous sessions with identified users.
              </p>
            </div>
            {/* Abstract Visual */}
            <div className="flex -space-x-3 mt-4">
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-300"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-400"></div>
              <div className="w-8 h-8 rounded-full border-2 border-white dark:border-[#1a1a1a] bg-gray-800 dark:bg-white flex items-center justify-center text-[10px] text-white dark:text-black font-bold">
                +
              </div>
            </div>
          </div>

          {/* Medium Tile: Automation Engine */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4 bg-white dark:bg-[#1a1a1a] rounded-lg p-8 border border-gray-200 dark:border-gray-800 relative overflow-hidden group hover:shadow-lg transition-shadow duration-300">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6 text-black dark:text-white">
                  <span className="material-icons">account_tree</span>
                </div>
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                  Automation Engine
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Build complex workflows with a visual editor. Route leads to
                  Slack, CRM, or email sequences instantly.
                </p>
              </div>
              {/* Visual: Workflow Connector */}
              <div className="mt-8 flex items-center gap-4 opacity-80">
                <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  New Lead
                </div>
                <div className="h-px w-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm font-medium dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300">
                  Score &gt; 80
                </div>
                <div className="h-px w-8 bg-gray-300 dark:bg-gray-600"></div>
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center dark:bg-white dark:text-black">
                  <span className="material-icons text-sm">send</span>
                </div>
              </div>
            </div>
            {/* Background Pattern */}
            <div className="absolute right-0 bottom-0 w-1/3 h-full bg-gradient-to-l from-gray-50 to-transparent dark:from-gray-800/20 pointer-events-none"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
