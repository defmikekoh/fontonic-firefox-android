const exclusionSelectors = {
  "www.bloomberg.com": ['[data-component="subhead"]'],
};

const currentDomain = window.location.hostname;

const SKIP_SELECTOR =
  'nav,header,footer,aside,figure,figcaption,table,th,td,blockquote,i,[class*="icon"],[class*="fa-"],svg,code,pre,kbd,samp,h1,h2,h3,h4,h5,h6,button';
function shouldSkip(el) {
  if (el.closest(".app-banner")) return true;
  if (el.closest(".byline-wrapper")) return true;
  if (el.closest(".byline")) return true;
  if (el.closest(".titleContainer-DJYq5v")) return true;
  return el.matches(SKIP_SELECTOR);
}

// Global variable to store current triggers
let currentTriggers = null;

// Default triggers (fallback)
const DEFAULT_TRIGGERS = {
  sansSerifTriggers: [
    "sans-serif",
    "arial",
    "helvetica",
    "open sans",
    "open sans-fallback",
    "verdana",
  ],
  serifTriggers: ["serif", "georgia", "times", "times new roman", "mencken-std"],
  monospaceTriggers: ["monospace", "courier", "courier new"]
};

// Font cache for CSP-resistant font loading using FontFace API
let loadedFonts = new Set();

// Font URLs for direct download
const FONT_FILES = {
  'MerriweatherL': {
    file: 'merriweather.woff2',
    weight: '300 900'
  },
  'RubikL': {
    file: 'rubik.woff2',
    weight: '300 900'
  },
  'Roboto FlexL': {
    file: 'robotoflex.woff2',
    weight: '100 1000',
    stretch: '25% 151%',
    style: 'oblique 0deg 10deg'
  }
};

// Load font using FontFace API (memory efficient, CSP-safe)
const loadFontCSPSafe = async (fontName) => {
  const fontKey = fontName;
  
  if (loadedFonts.has(fontKey)) {
    console.log(`Fontonic: ${fontName} already loaded, skipping`);
    return true; // Already loaded
  }

  // Mark as loading immediately to prevent duplicate calls
  loadedFonts.add(fontKey);

  if (!FONT_FILES[fontName]) {
    console.warn(`Fontonic: Font ${fontName} not available for CSP bypass`);
    loadedFonts.delete(fontKey); // Remove from cache on failure
    return false;
  }

  try {
    console.log(`Fontonic: Loading ${fontName} from extension (CSP-safe)...`);
    
    const { file, weight, stretch, style } = FONT_FILES[fontName];
    
    // Get extension URL for the font file  
    const fontUrl = browser.runtime.getURL(`fonts/${file}`);
    console.log(`Fontonic: Font URL: ${fontUrl}`);
    
    // Add timeout to fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    // Fetch font data from extension
    const response = await fetch(fontUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    console.log(`Fontonic: Fetch response status: ${response.status}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    console.log(`Fontonic: Font data size: ${arrayBuffer.byteLength} bytes`);
    
    // Create FontFace object with variable font properties
    const fontFaceOptions = {
      weight: weight,
      display: 'swap'
    };
    
    // Add optional properties if they exist
    if (stretch) fontFaceOptions.stretch = stretch;
    if (style) fontFaceOptions.style = style;
    
    const fontFace = new FontFace(fontName, arrayBuffer, fontFaceOptions);
    console.log(`Fontonic: Created FontFace object for ${fontName}`);
    
    // Load the font
    await fontFace.load();
    console.log(`Fontonic: FontFace.load() completed for ${fontName}`);
    
    // Add to document fonts
    document.fonts.add(fontFace);
    console.log(`Fontonic: Added ${fontName} to document.fonts`);
    
    console.log(`Fontonic: Successfully loaded ${fontName} (${weight}) from extension`);
    return true;
  } catch (e) {
    console.error(`Fontonic: Error loading ${fontName}:`, e);
    loadedFonts.delete(fontKey); // Remove from cache on failure so it can be retried
    return false;
  }
};

// Helper function to generate font-variation-settings CSS
const generateFontVariationSettings = (fontType, fontData) => {
  if (!fontData) return '';
  
  const varAxes = fontData[`${fontType}_var_axes`];
  const opszControl = fontData[`${fontType}_opsz_control`];
  
  if (!varAxes || Object.keys(varAxes).length === 0) return '';
  
  const settings = [];
  
  Object.keys(varAxes).forEach(axis => {
    const value = varAxes[axis];
    
    // Skip opsz if it's set to Default (automatic)
    if (axis === 'opsz' && opszControl === 'Default') {
      return;
    }
    
    // Only include non-default values
    const defaultValues = {
      'wght': 400, 'wdth': 100, 'opsz': 14, 'GRAD': 0, 'slnt': 0,
      'XTRA': 468, 'XOPQ': 96, 'YOPQ': 79, 'YTLC': 514, 'YTUC': 712,
      'YTAS': 750, 'YTDE': -203, 'YTFI': 738
    };
    
    if (value != defaultValues[axis]) {
      settings.push(`"${axis}" ${value}`);
    }
  });
  
  return settings.length > 0 ? settings.join(', ') : '';
};

// Load triggers from storage
const loadTriggers = async () => {
  try {
    const result = await browser.storage.sync.get(['fontTriggers']);
    currentTriggers = result.fontTriggers || DEFAULT_TRIGGERS;
    console.log("Fontonic: Font triggers loaded", currentTriggers);
  } catch (e) {
    console.error("Error loading font triggers:", e);
    currentTriggers = DEFAULT_TRIGGERS;
  }
};

const changeFontFamily = (
  node,
  serif,
  sansSerif,
  monospace,
  serifWeight,
  sansSerifWeight,
  monospaceWeight,
  serifSize,
  sansSerifSize,
  monospaceSize,
  serifLineHeight,
  sansSerifLineHeight,
  monospaceLineHeight,
  serifColor,
  sansSerifColor,
  monospaceColor,
  fontData = null
) => {
  if (node.nodeType === 1) {
    if (
      (exclusionSelectors[currentDomain] &&
        exclusionSelectors[currentDomain].some((selector) =>
          node.matches(selector),
        )) ||
      shouldSkip(node)
    ) {
      return;
    }
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.getPropertyValue("font-family");
    let fontType = null;
    if (fontFamily) {
      // Normalize to lowercase for robust matching
      const fontFamilyLower = fontFamily.toLowerCase();
      // Split into array for order-sensitive matching
      const fontList = fontFamilyLower
        .split(",")
        .map((f) => f.trim().replace(/^["']|["']$/g, "")); // Remove leading/trailing quotes

      // Use dynamic triggers from storage
      const triggers = currentTriggers || DEFAULT_TRIGGERS;
      const sansSerifTriggers = triggers.sansSerifTriggers;
      const serifTriggers = triggers.serifTriggers;
      const monospaceTriggers = triggers.monospaceTriggers;

      for (const font of fontList) {
        if (sansSerifTriggers.includes(font)) {
          fontType = "sans-serif";
          break;
        } else if (serifTriggers.includes(font)) {
          fontType = "serif";
          break;
        } else if (monospaceTriggers.includes(font)) {
          fontType = "monospace";
          break;
        }
      }
    }

    // Recursively process child nodes before modifying the current node
    for (const childNode of node.childNodes) {
      changeFontFamily(
        childNode,
        serif,
        sansSerif,
        monospace,
        serifWeight,
        sansSerifWeight,
        monospaceWeight,
        serifSize,
        sansSerifSize,
        monospaceSize,
        serifLineHeight,
        sansSerifLineHeight,
        monospaceLineHeight,
        serifColor,
        sansSerifColor,
        monospaceColor,
        fontData
      );
    }

    if (fontType === "sans-serif") {
      if (sansSerif !== "Default") {
        // Try CSP-safe font loading first
        loadFontCSPSafe(sansSerif).then((loaded) => {
          if (loaded) {
            console.log(`Fontonic: Applied CSP-safe ${sansSerif} to element`);
          }
        }).catch((e) => {
          console.warn(`Fontonic: CSP-safe loading failed for ${sansSerif}, falling back to normal:`, e);
        });
        
        node.style.fontFamily = `'${sansSerif}'`;
        
        // Apply variable font axes if available
        try {
          const variationSettings = generateFontVariationSettings('sans_serif', fontData);
          if (variationSettings) {
            node.style.fontVariationSettings = variationSettings;
          }
        } catch (e) {
          console.warn('Error applying sans-serif variable font settings:', e);
        }
      }
      if (sansSerifWeight !== "Default") {
        // Preserve bold elements - only apply weight to non-bold elements
        const currentWeight = computedStyle.getPropertyValue("font-weight");
        const isBold = currentWeight >= 600 || 
                      node.matches('strong, b, [style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: 900"], [style*="font-weight:bold"], [style*="font-weight:700"], [style*="font-weight:800"], [style*="font-weight:900"]') ||
                      node.tagName === 'STRONG' || 
                      node.tagName === 'B';
        
        if (!isBold) {
          node.style.fontWeight = sansSerifWeight;
        }
      }
      if (sansSerifSize !== "Default" && sansSerifSize) {
        node.style.setProperty("font-size", `${sansSerifSize}px`, "important");
      }
      if (sansSerifLineHeight !== "Default" && sansSerifLineHeight) {
        node.style.setProperty("line-height", sansSerifLineHeight, "important");
      }
      if (sansSerifColor !== "Default" && sansSerifColor) {
        // Method 1: CSS specificity - target main text elements while preserving special element colors
        if (node.matches('body, p, div, span, h1, h2, h3, h4, h5, h6') && 
            !node.closest('a, button, input, textarea, select, option, label, code, pre, kbd, samp, mark, .btn, [class*="button"], [class*="icon"], [role="button"], [data-testid*="button"]')) {
          node.style.setProperty("color", sansSerifColor, "important");
        }
      }
    } else if (fontType === "serif") {
      if (serif !== "Default") {
        // Try CSP-safe font loading first
        loadFontCSPSafe(serif).then((loaded) => {
          if (loaded) {
            console.log(`Fontonic: Applied CSP-safe ${serif} to element`);
          }
        }).catch((e) => {
          console.warn(`Fontonic: CSP-safe loading failed for ${serif}, falling back to normal:`, e);
        });
        
        node.style.fontFamily = `'${serif}'`;
        
        // Apply variable font axes if available
        try {
          const variationSettings = generateFontVariationSettings('serif', fontData);
          if (variationSettings) {
            node.style.fontVariationSettings = variationSettings;
          }
        } catch (e) {
          console.warn('Error applying serif variable font settings:', e);
        }
      }
      if (serifWeight !== "Default") {
        // Preserve bold elements - only apply weight to non-bold elements
        const currentWeight = computedStyle.getPropertyValue("font-weight");
        const isBold = currentWeight >= 600 || 
                      node.matches('strong, b, [style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: 900"], [style*="font-weight:bold"], [style*="font-weight:700"], [style*="font-weight:800"], [style*="font-weight:900"]') ||
                      node.tagName === 'STRONG' || 
                      node.tagName === 'B';
        
        if (!isBold) {
          node.style.fontWeight = serifWeight;
        }
      }
      if (serifSize !== "Default" && serifSize) {
        node.style.setProperty("font-size", `${serifSize}px`, "important");
      }
      if (serifLineHeight !== "Default" && serifLineHeight) {
        node.style.setProperty("line-height", serifLineHeight, "important");
      }
      if (serifColor !== "Default" && serifColor) {
        // Method 1: CSS specificity - target main text elements while preserving special element colors
        if (node.matches('body, p, div, span, h1, h2, h3, h4, h5, h6') && 
            !node.closest('a, button, input, textarea, select, option, label, code, pre, kbd, samp, mark, .btn, [class*="button"], [class*="icon"], [role="button"], [data-testid*="button"]')) {
          node.style.setProperty("color", serifColor, "important");
        }
      }
    } else if (fontType === "monospace") {
      if (monospace !== "Default") {
        // Try CSP-safe font loading first
        loadFontCSPSafe(monospace).then((loaded) => {
          if (loaded) {
            console.log(`Fontonic: Applied CSP-safe ${monospace} to element`);
          }
        }).catch((e) => {
          console.warn(`Fontonic: CSP-safe loading failed for ${monospace}, falling back to normal:`, e);
        });
        
        node.style.fontFamily = `'${monospace}'`;
        
        // Apply variable font axes if available
        try {
          const variationSettings = generateFontVariationSettings('monospace', fontData);
          if (variationSettings) {
            node.style.fontVariationSettings = variationSettings;
          }
        } catch (e) {
          console.warn('Error applying monospace variable font settings:', e);
        }
      }
      if (monospaceWeight !== "Default") {
        // Preserve bold elements - only apply weight to non-bold elements
        const currentWeight = computedStyle.getPropertyValue("font-weight");
        const isBold = currentWeight >= 600 || 
                      node.matches('strong, b, [style*="font-weight: bold"], [style*="font-weight: 700"], [style*="font-weight: 800"], [style*="font-weight: 900"], [style*="font-weight:bold"], [style*="font-weight:700"], [style*="font-weight:800"], [style*="font-weight:900"]') ||
                      node.tagName === 'STRONG' || 
                      node.tagName === 'B';
        
        if (!isBold) {
          node.style.fontWeight = monospaceWeight;
        }
      }
      if (monospaceSize !== "Default" && monospaceSize) {
        node.style.setProperty("font-size", `${monospaceSize}px`, "important");
      }
      if (monospaceLineHeight !== "Default" && monospaceLineHeight) {
        node.style.setProperty("line-height", monospaceLineHeight, "important");
      }
      if (monospaceColor !== "Default" && monospaceColor) {
        // Method 1: CSS specificity - target main text elements while preserving special element colors
        if (node.matches('body, p, div, span, h1, h2, h3, h4, h5, h6') && 
            !node.closest('a, button, input, textarea, select, option, label, code, pre, kbd, samp, mark, .btn, [class*="button"], [class*="icon"], [role="button"], [data-testid*="button"]')) {
          node.style.setProperty("color", monospaceColor, "important");
        }
      }
    }
  }
};

// Store current font settings for reapplication
let currentFontSettings = null;
let mutationObserver = null;

// Performance timing test to detect slow devices
const runPerformanceTest = () => {
  const testIterations = 50;
  const start = performance.now();

  // Perform DOM operations that are heavy on slow devices
  for (let i = 0; i < testIterations; i++) {
    document.body.style.opacity = (i % 2 === 0) ? '0.99' : '1';
    document.body.offsetHeight; // Force reflow
  }

  const elapsed = performance.now() - start;
  console.log(`Fontonic: Performance test completed in ${elapsed.toFixed(2)}ms`);
  return elapsed;
};

// Performance detection for eink tablets and low-end devices
const isLowPerformanceDevice = async () => {
  // Check if we have a stored performance result
  const stored = await browser.storage.local.get(['fontonicPerformanceTest']);

  if (stored.fontonicPerformanceTest && stored.fontonicPerformanceTest.timestamp) {
    const daysSinceTest = (Date.now() - stored.fontonicPerformanceTest.timestamp) / (1000 * 60 * 60 * 24);

    // Use cached result if test was run within last 30 days
    if (daysSinceTest < 30) {
      const isLowPerf = stored.fontonicPerformanceTest.isLowPerformance;
      console.log(`Fontonic: Using cached performance result: ${isLowPerf ? 'low' : 'high'} performance`);
      return isLowPerf;
    }
  }

  // Run performance test
  const testTime = runPerformanceTest();

  // Threshold: >20ms suggests slow device (eink tablets, low-end devices)
  const isLowPerf = testTime > 20;

  // Store result in local storage
  await browser.storage.local.set({
    fontonicPerformanceTest: {
      timestamp: Date.now(),
      testTime: testTime,
      isLowPerformance: isLowPerf
    }
  });

  console.log(`Fontonic: Performance test result: ${isLowPerf ? 'low' : 'high'} performance (${testTime.toFixed(2)}ms)`);
  return isLowPerf;
};

// Initialize performance detection
let LOW_PERF_DEVICE = false;
isLowPerformanceDevice().then(result => {
  LOW_PERF_DEVICE = result;
  if (LOW_PERF_DEVICE) {
    console.log("Fontonic: Low-performance device detected, using optimized font application");
  }
});

// Function to apply fonts with retry logic
const applyFontsWithRetry = (fontData) => {
  if (!fontData) return;

  // Wait for document.body to be available
  if (!document.body) {
    setTimeout(() => applyFontsWithRetry(fontData), 50);
    return;
  }

  console.log("Applying fonts to DOM");
  changeFontFamily(
    document.body,
    fontData.serif,
    fontData.sans_serif,
    fontData.monospace,
    fontData.serif_weight || "Default",
    fontData.sans_serif_weight || "Default",
    fontData.monospace_weight || "Default",
    fontData.serif_size || "Default",
    fontData.sans_serif_size || "Default",
    fontData.monospace_size || "Default",
    fontData.serif_line_height || "Default",
    fontData.sans_serif_line_height || "Default",
    fontData.monospace_line_height || "Default",
    fontData.serif_color || "Default",
    fontData.sans_serif_color || "Default",
    fontData.monospace_color || "Default",
    fontData
  );
};

// Progressive delay application for late hydration
const applyFontsProgressive = async (fontData) => {
  currentFontSettings = fontData;

  // Apply immediately
  applyFontsWithRetry(fontData);

  // Get current performance status (may trigger test if not cached)
  const isLowPerf = await isLowPerformanceDevice();

  if (isLowPerf) {
    // Single delayed application for eink tablets and slow devices
    // Avoids multiple refresh cycles on eink displays
    setTimeout(() => applyFontsWithRetry(fontData), 3000);
    console.log("Fontonic: Using single delayed application for low-performance device");
  } else {
    // Full progressive approach for faster devices
    setTimeout(() => applyFontsWithRetry(fontData), 100);
    setTimeout(() => applyFontsWithRetry(fontData), 500);
    setTimeout(() => applyFontsWithRetry(fontData), 1000);
    setTimeout(() => applyFontsWithRetry(fontData), 2000);
    setTimeout(() => applyFontsWithRetry(fontData), 3000);
  }
};

// Set up MutationObserver to handle dynamic content changes
const setupMutationObserver = async () => {
  if (!document.body) {
    setTimeout(setupMutationObserver, 50);
    return;
  }

  if (mutationObserver) {
    mutationObserver.disconnect();
  }

  // Get current performance status for throttling
  const isLowPerf = await isLowPerformanceDevice();

  // Performance-based throttling
  const debounceDelay = isLowPerf ? 1000 : 200; // Longer delay for eink tablets
  const minContentThreshold = isLowPerf ? 50 : 10; // Higher threshold for triggering on slow devices

  mutationObserver = new MutationObserver((mutations) => {
    let shouldReapply = false;
    let significantChange = false;

    mutations.forEach((mutation) => {
      // Check if new nodes were added
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        for (let node of mutation.addedNodes) {
          // Only care about element nodes with significant content
          if (node.nodeType === 1) {
            const hasSignificantContent = node.children.length > 0 ||
                                        node.textContent.trim().length > minContentThreshold;

            if (hasSignificantContent) {
              shouldReapply = true;

              // For low-performance devices, be even more selective
              if (isLowPerf) {
                // Only trigger on really large content additions
                const hasLargeContent = node.children.length > 5 ||
                                      node.textContent.trim().length > 200;
                if (hasLargeContent) {
                  significantChange = true;
                }
              } else {
                significantChange = true;
              }
              break;
            }
          }
        }
      }
    });

    // For low-performance devices, only reapply on significant changes
    const shouldTrigger = isLowPerf ? significantChange : shouldReapply;

    if (shouldTrigger && currentFontSettings) {
      // Debounce rapid mutations with performance-based delay
      clearTimeout(window.fontonicReapplyTimeout);
      window.fontonicReapplyTimeout = setTimeout(() => {
        console.log(`Reapplying fonts due to DOM mutation (delay: ${debounceDelay}ms)`);
        applyFontsWithRetry(currentFontSettings);
      }, debounceDelay);
    }
  });

  // Start observing with performance-based options
  const observerOptions = {
    childList: true,
    subtree: true
  };

  // On low-performance devices, observe less aggressively
  if (isLowPerf) {
    observerOptions.subtree = false; // Only observe direct children, not deep tree
  }

  mutationObserver.observe(document.body, observerOptions);

  console.log(`MutationObserver set up (performance mode: ${isLowPerf ? 'low' : 'normal'})`);
};

// Additional event listeners for various DOM ready states
const addDOMReadyListeners = async (fontData) => {
  const isLowPerf = await isLowPerformanceDevice();

  if (isLowPerf) {
    // Simplified approach for eink tablets - only listen to essential events
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        setTimeout(() => applyFontsWithRetry(fontData), 500);
      });
    }
    console.log("Fontonic: Using simplified DOM ready listeners for low-performance device");
  } else {
    // Full event listening for faster devices
    // Listen for DOMContentLoaded if still loading
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => applyFontsWithRetry(fontData), 100);
      });
    }

    // Listen for full page load
    if (document.readyState !== 'complete') {
      window.addEventListener('load', () => {
        setTimeout(() => applyFontsWithRetry(fontData), 200);
      });
    }

    // Listen for readyState changes
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setTimeout(() => applyFontsWithRetry(fontData), 100);
      }
    });
  }
};

// Initialize triggers loading
loadTriggers();

// Listen for storage changes to reload triggers
browser.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.fontTriggers) {
    console.log("Fontonic: Font triggers updated, reloading...");
    loadTriggers();
  }
});

let message = {
  action: "on-page-load",
  domain: currentDomain,
};

// Tries to load font when page is loaded
browser.runtime.sendMessage(message, undefined, (response) => {
  if (response.type === "apply_font") {
    console.log("Loading fonts from storage");

    const fontData = {
      serif: response.data.serif,
      sans_serif: response.data.sans_serif,
      monospace: response.data.monospace,
      serif_weight: response.data.serif_weight || "Default",
      sans_serif_weight: response.data.sans_serif_weight || "Default",
      monospace_weight: response.data.monospace_weight || "Default",
      serif_size: response.data.serif_size || "Default",
      sans_serif_size: response.data.sans_serif_size || "Default",
      monospace_size: response.data.monospace_size || "Default",
      serif_line_height: response.data.serif_line_height || "Default",
      sans_serif_line_height: response.data.sans_serif_line_height || "Default",
      monospace_line_height: response.data.monospace_line_height || "Default",
      serif_color: response.data.serif_color || "Default",
      sans_serif_color: response.data.sans_serif_color || "Default",
      monospace_color: response.data.monospace_color || "Default",
      // Variable font axes
      serif_var_axes: response.data.serif_var_axes || {},
      sans_serif_var_axes: response.data.sans_serif_var_axes || {},
      monospace_var_axes: response.data.monospace_var_axes || {},
      // Optical size control settings
      serif_opsz_control: response.data.serif_opsz_control || 'Default',
      sans_serif_opsz_control: response.data.sans_serif_opsz_control || 'Default',
      monospace_opsz_control: response.data.monospace_opsz_control || 'Default'
    };

    // Apply fonts with progressive retries, mutation observer, and DOM ready listeners
    applyFontsProgressive(fontData);
    addDOMReadyListeners(fontData);
    setupMutationObserver();

  } else if (response.type === "none") {
    console.log("Font not set for site");
  }
});
// Listens for the popup buttons
browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    {
      if (message.type === "apply_font") {
        console.log("Request received from popup for applying fonts", message.data);

        const fontData = {
          serif: message.data.serif,
          sans_serif: message.data.sans_serif,
          monospace: message.data.monospace,
          serif_weight: message.data.serif_weight || "Default",
          sans_serif_weight: message.data.sans_serif_weight || "Default",
          monospace_weight: message.data.monospace_weight || "Default",
          serif_size: message.data.serif_size || "Default",
          sans_serif_size: message.data.sans_serif_size || "Default",
          monospace_size: message.data.monospace_size || "Default",
          serif_line_height: message.data.serif_line_height || "Default",
          sans_serif_line_height: message.data.sans_serif_line_height || "Default",
          monospace_line_height: message.data.monospace_line_height || "Default",
          serif_color: message.data.serif_color || "Default",
          sans_serif_color: message.data.sans_serif_color || "Default",
          monospace_color: message.data.monospace_color || "Default",
          // Variable font axes
          serif_var_axes: message.data.serif_var_axes || {},
          sans_serif_var_axes: message.data.sans_serif_var_axes || {},
          monospace_var_axes: message.data.monospace_var_axes || {},
          // Optical size control settings
          serif_opsz_control: message.data.serif_opsz_control || 'Default',
          sans_serif_opsz_control: message.data.sans_serif_opsz_control || 'Default',
          monospace_opsz_control: message.data.monospace_opsz_control || 'Default'
        };

        // Use progressive application for popup-triggered changes too
        applyFontsProgressive(fontData);
        addDOMReadyListeners(fontData);

        // Set up mutation observer if not already active
        if (!mutationObserver) {
          setupMutationObserver();
        }

      } else if (message.type === "restore") {
        // Clean up observer on restore
        if (mutationObserver) {
          mutationObserver.disconnect();
          mutationObserver = null;
        }
        currentFontSettings = null;
        location.reload();
      } else if (message.type === "redirect") {
        window.open(message.data.redirect_url, "_blank");
      }
    }
  });
});
