import React from "react";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-gray-100 dark:border-gray-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full"></div>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">
                Leads
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
              The open-source lead scoring infrastructure for developers who
              care about code quality and performance.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">
              Product
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">
              Resources
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4 text-gray-900 dark:text-white">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Terms
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-black dark:hover:text-white transition-colors"
                >
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2023 Leads Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="sr-only">Twitter</span>
              <span className="material-icons text-lg">rss_feed</span>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="sr-only">GitHub</span>
              <span className="material-icons text-lg">code</span>
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="sr-only">LinkedIn</span>
              <span className="material-icons text-lg">share</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
