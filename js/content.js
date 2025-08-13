const exclusionSelectors = {
  "www.bloomberg.com": ['[data-component="subhead"]'],
};

const currentDomain = window.location.hostname;

const SKIP_SELECTOR =
  'i,[class*="icon"],[class*="fa-"],svg,code,pre,kbd,samp,h1,h2,h3,h4,h5,h6,button';
function shouldSkip(el) {
  if (el.closest(".app-banner")) return true;
  if (el.closest(".byline-wrapper")) return true;
  if (el.closest(".byline")) return true;
  if (el.closest(".titleContainer-DJYq5v")) return true;
  return el.matches(SKIP_SELECTOR);
}

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

      // Define triggers for each type
      const sansSerifTriggers = [
        "sans-serif",
        "arial",
        "helvetica",
        "open sans",
        "open sans-fallback",
        "verdana",
      ];
      const serifTriggers = ["serif", "georgia", "times", "times new roman"];
      const monospaceTriggers = ["monospace", "courier", "courier new"];

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
      );
    }

    if (fontType === "sans-serif") {
      if (sansSerif !== "Default") {
        node.style.fontFamily = `'${sansSerif}'`;
      }
      if (sansSerifWeight !== "Default") {
        node.style.fontWeight = sansSerifWeight;
      }
      if (sansSerifSize !== "Default" && sansSerifSize) {
        node.style.setProperty("font-size", `${sansSerifSize}px`, "important");
      }
    } else if (fontType === "serif") {
      if (serif !== "Default") {
        node.style.fontFamily = `'${serif}'`;
      }
      if (serifWeight !== "Default") {
        node.style.fontWeight = serifWeight;
      }
      if (serifSize !== "Default" && serifSize) {
        node.style.setProperty("font-size", `${serifSize}px`, "important");
      }
    } else if (fontType === "monospace") {
      if (monospace !== "Default") {
        node.style.fontFamily = `'${monospace}'`;
      }
      if (monospaceWeight !== "Default") {
        node.style.fontWeight = monospaceWeight;
      }
      if (monospaceSize !== "Default" && monospaceSize) {
        node.style.setProperty("font-size", `${monospaceSize}px`, "important");
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
    // Conservative approach for eink tablets and slow devices
    // Only 2 additional retries with longer delays
    setTimeout(() => applyFontsWithRetry(fontData), 1000);
    setTimeout(() => applyFontsWithRetry(fontData), 3000);
    console.log("Fontonic: Using low-performance progressive delays");
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
        console.log("Request received from popup for applying fonts");
        
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
