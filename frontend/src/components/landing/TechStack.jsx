import React from "react";

const TechStack = () => {
  return (
    <section className="py-24 border-t border-gray-200 dark:border-gray-800 bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-16 tracking-tight text-gray-900 dark:text-white">
          The stack you trust.
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Node.js */}
          <div className="flex flex-col items-center justify-center gap-4 group cursor-default">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-[#339933]/10">
              <span className="material-icons text-4xl text-gray-400 group-hover:text-[#339933] transition-colors">
                javascript
              </span>
            </div>
            <span className="font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Node.js
            </span>
          </div>
          {/* MongoDB */}
          <div className="flex flex-col items-center justify-center gap-4 group cursor-default">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-[#47A248]/10">
              <span className="material-icons text-4xl text-gray-400 group-hover:text-[#47A248] transition-colors">
                storage
              </span>
            </div>
            <span className="font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              MongoDB
            </span>
          </div>
          {/* Redis */}
          <div className="flex flex-col items-center justify-center gap-4 group cursor-default">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-[#DC382D]/10">
              <span className="material-icons text-4xl text-gray-400 group-hover:text-[#DC382D] transition-colors">
                memory
              </span>
            </div>
            <span className="font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              Redis
            </span>
          </div>
          {/* BullMQ */}
          <div className="flex flex-col items-center justify-center gap-4 group cursor-default">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center transition-colors group-hover:bg-[#FF0000]/10">
              <span className="material-icons text-4xl text-gray-400 group-hover:text-[#FF0000] transition-colors">
                queue
              </span>
            </div>
            <span className="font-medium text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              BullMQ
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
