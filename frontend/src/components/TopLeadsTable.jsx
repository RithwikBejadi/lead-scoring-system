import React from "react";

const TopLeadsTable = () => {
  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg shadow-card overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/30">
        <h3 className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          Top Scoring Leads
        </h3>
        <a
          href="#"
          className="text-xs font-medium text-primary hover:text-primary-dark"
        >
          View All
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-light dark:divide-border-dark">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider w-10"
              >
                #
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
              >
                Lead Info
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-left text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
              >
                Score
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-right text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider"
              >
                Stage
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface-light dark:bg-surface-dark divide-y divide-border-light dark:divide-border-dark">
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-5 py-3 whitespace-nowrap text-sm text-text-secondary-light">
                1
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                    JD
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      John Doe
                    </div>
                    <div className="text-xs text-text-secondary-light">
                      Acme Corp
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-primary">98</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-right">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-success/10 text-success border border-success/20">
                  Qualified
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-5 py-3 whitespace-nowrap text-sm text-text-secondary-light">
                2
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-bold">
                    SM
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      Sarah Miller
                    </div>
                    <div className="text-xs text-text-secondary-light">
                      TechFlow Inc
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-primary">92</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-right">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                  Hot
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-5 py-3 whitespace-nowrap text-sm text-text-secondary-light">
                3
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                    MK
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      Mike K.
                    </div>
                    <div className="text-xs text-text-secondary-light">
                      Global Systems
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-primary">85</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-right">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Warm
                </span>
              </td>
            </tr>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-5 py-3 whitespace-nowrap text-sm text-text-secondary-light">
                4
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xs font-bold">
                    EL
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                      Emily Liu
                    </div>
                    <div className="text-xs text-text-secondary-light">
                      StartUp.io
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap">
                <div className="text-sm font-bold text-primary">81</div>
              </td>
              <td className="px-5 py-3 whitespace-nowrap text-right">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  Warm
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopLeadsTable;
