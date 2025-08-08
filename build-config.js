// Build configuration for browser extension
module.exports = {
  browsers: ['firefox', 'chrome'],
  sourceDir: '.',
  
  // Files to copy during build
  filesToCopy: [
    'bg.js',
    'browser-polyfill.js',
    'content.js',
    'icon.svg',
    'icon16.png',
    'icon32.png',
    'icon64.png',
    'icon256.png',
    'icon_dark.svg',
    'img.html',
    'img.js',
    'inline.css',
    'inline.html',
    'inline.js',
    'options.html',
    'options.js',
    '_locales'
  ],

  // Base manifest for both browsers
  manifest: {
    manifest_version: 3,
    default_locale: "en",
    name: "__MSG_extensionName__",
    version: "0.2.21",
    description: "__MSG_extensionDescription__",
    permissions: [
      "tabs",
      "contextMenus",
      "storage"
    ],
    host_permissions: ["<all_urls>"],
    optional_permissions: [
      "history"
    ],
    content_scripts: [
      {
        matches: ["<all_urls>"],
        js: [
          "browser-polyfill.js",
          "content.js"
        ]
      }
    ],
    options_ui: {
      page: "options.html"
    },
    icons: {
      "16": "icon16.png",
      "32": "icon32.png",
      "64": "icon64.png",
      "256": "icon256.png"
    },
    browser_specific_settings: {
      gecko: {
        id: "{d6005a62-1fdb-4cf2-b5ef-21b865d894f7}"
      }
    }
  },

  // Browser-specific configurations
  browserConfigs: {
    firefox: {
      background: {
        scripts: [
          "browser-polyfill.js",
          "bg.js"
        ]
      }
    },
    chrome: {
      background: {
        service_worker: "bg.js"
      }
    }
  }
}; 
