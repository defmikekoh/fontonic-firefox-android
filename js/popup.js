var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
const settingsButton = document.getElementById("settings-btn");
const advancedButton = document.getElementById("advanced-btn");
const supportButton = document.getElementById("support-btn");
const homePage = document.getElementById("home-page");
const settingsPage = document.getElementById("settings-page");
const advancedPage = document.getElementById("advanced-page");
const wrapper = document.getElementById("wrapper");

// Font Triggers Management functionality (will be null until advanced page is loaded)
let sansSerifTriggersTextarea = null;
let serifTriggersTextarea = null;
let monospaceTriggersTextarea = null;
let saveTriggersBtn = null;
let resetTriggersBtn = null;

// Default triggers
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

// Initialize trigger elements and load data
const initializeTriggers = () => {
  // Initialize reset domain button when Advanced page is loaded
  initializeResetDomainButton();

  // Get DOM elements directly and add event listeners
  const saveBtn = document.getElementById("save-triggers-btn");
  const resetBtn = document.getElementById("reset-triggers-btn");

  if (saveBtn) {
    // Visual feedback that initialization worked
    saveBtn.textContent = "✓ Ready - Save All Triggers";
    saveBtn.addEventListener("click", () => {
      // Call function dynamically to avoid hoisting issues
      if (window.saveTriggers) {
        window.saveTriggers();
      } else {
        saveBtn.textContent = "❌ Function not ready";
        setTimeout(() => saveBtn.textContent = "Save All Triggers", 2000);
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (window.resetTriggers) {
        window.resetTriggers();
      }
    });
  }

  // Store references for other functions
  sansSerifTriggersTextarea = document.getElementById("sans-serif-triggers");
  serifTriggersTextarea = document.getElementById("serif-triggers");
  monospaceTriggersTextarea = document.getElementById("monospace-triggers");
  saveTriggersBtn = saveBtn;
  resetTriggersBtn = resetBtn;

  // Load existing data (wait longer for functions to be defined)
  const attemptLoad = () => {
    if (window.loadTriggers) {
      window.loadTriggers();
    } else {
      // Try again after more time
      setTimeout(attemptLoad, 100);
    }
  };
  setTimeout(attemptLoad, 200);
};

// Save triggers functionality (moved up to avoid loading issues)
window.saveTriggers = () => __awaiter(this, void 0, void 0, function* () {
  try {
    // Get elements directly
    const sansSerifEl = document.getElementById("sans-serif-triggers");
    const serifEl = document.getElementById("serif-triggers");
    const monospaceEl = document.getElementById("monospace-triggers");
    const saveBtn = document.getElementById("save-triggers-btn");

    if (!sansSerifEl || !serifEl || !monospaceEl || !saveBtn) {
      if (saveBtn) saveBtn.textContent = "❌ Elements Not Found";
      return;
    }

    // Visual feedback that save was called
    saveBtn.textContent = "💾 Saving...";

    const sansSerifTriggers = sansSerifEl.value
      .split('\n')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const serifTriggers = serifEl.value
      .split('\n')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const monospaceTriggers = monospaceEl.value
      .split('\n')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const triggers = {
      sansSerifTriggers,
      serifTriggers,
      monospaceTriggers
    };

    yield browser.storage.sync.set({ fontTriggers: triggers });

    // Update button text temporarily
    saveBtn.textContent = "✔ All Triggers Saved";
    setTimeout(() => {
      saveBtn.textContent = "Save All Triggers";
    }, 1500);

  } catch (e) {
    const saveBtn = document.getElementById("save-triggers-btn");
    if (saveBtn) {
      saveBtn.textContent = "❌ Save Error";
      setTimeout(() => {
        saveBtn.textContent = "Save All Triggers";
      }, 1500);
    }
  }
});

// Load existing triggers from storage (moved up to avoid loading issues)
window.loadTriggers = () => __awaiter(this, void 0, void 0, function* () {
  try {
    const result = yield browser.storage.sync.get(['fontTriggers']);
    const triggers = result.fontTriggers || DEFAULT_TRIGGERS;

    // Set values from storage (either saved data or defaults)
    const setTextareaValues = () => {
      const sansSerifEl = document.getElementById("sans-serif-triggers");
      const serifEl = document.getElementById("serif-triggers");
      const monospaceEl = document.getElementById("monospace-triggers");

      if (sansSerifEl) {
        sansSerifEl.value = triggers.sansSerifTriggers.join('\n');
        sansSerifEl.rows = Math.max(3, triggers.sansSerifTriggers.length);
      }
      if (serifEl) {
        serifEl.value = triggers.serifTriggers.join('\n');
        serifEl.rows = Math.max(3, triggers.serifTriggers.length);
      }
      if (monospaceEl) {
        monospaceEl.value = triggers.monospaceTriggers.join('\n');
        monospaceEl.rows = Math.max(3, triggers.monospaceTriggers.length);
      }

      return !!(sansSerifEl && serifEl && monospaceEl);
    };

    // Try to set values immediately
    if (!setTextareaValues()) {
      // If elements not ready, wait and try again
      let attempts = 0;
      while (attempts < 20) {
        yield new Promise(resolve => setTimeout(resolve, 100));
        if (setTextareaValues()) {
          break;
        }
        attempts++;
      }
    }

    // Store references for other functions
    sansSerifTriggersTextarea = document.getElementById("sans-serif-triggers");
    serifTriggersTextarea = document.getElementById("serif-triggers");
    monospaceTriggersTextarea = document.getElementById("monospace-triggers");

  } catch (e) {
    console.error("Error loading font triggers:", e);
  }
});

const supportPage = document.getElementById("support-page");
const restoreButton = document.getElementById("restore-btn");
const formButtons = document.getElementById("form-btns");
const applyButton = document.getElementById("apply-btn");

// Favorite fonts configuration elements
const favSerifFontSelect = document.getElementById("fav-serif-font");
const favSerifSizeSelect = document.getElementById("fav-serif-size");
const favSerifWeightSelect = document.getElementById("fav-serif-weight");
const favSansFontSelect = document.getElementById("fav-sans-font");
const favSansSizeSelect = document.getElementById("fav-sans-size");
const favSansWeightSelect = document.getElementById("fav-sans-weight");
const favSansLineHeightSelect = document.getElementById("fav-sans-line-height");
const favSansColorSelect = document.getElementById("fav-sans-color");
const favSans2FontSelect = document.getElementById("fav-sans-2-font");
const favSans2SizeSelect = document.getElementById("fav-sans-2-size");
const favSans2WeightSelect = document.getElementById("fav-sans-2-weight");
const favSans2LineHeightSelect = document.getElementById("fav-sans-2-line-height");
const favSans2ColorSelect = document.getElementById("fav-sans-2-color");
const favSerif2FontSelect = document.getElementById("fav-serif-2-font");
const favSerif2SizeSelect = document.getElementById("fav-serif-2-size");
const favSerif2WeightSelect = document.getElementById("fav-serif-2-weight");
const saveFavConfigBtn = document.getElementById("save-fav-config-btn");

// Font size validation function
function validateFontSize(input) {
    const value = input.value.trim();
    if (value === '') return true; // Empty means default
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
        input.style.borderColor = '#ff4444';
        return false;
    } else {
        input.style.borderColor = '';
        return true;
    }
}

// Add validation to all font size inputs
const fontSizeInputs = [
    favSerifSizeSelect,
    favSansSizeSelect,
    favSans2SizeSelect,
    favSerif2SizeSelect,
    document.getElementById("serif_size"),
    document.getElementById("sans_serif_size"),
    document.getElementById("monospace_size"),
    document.getElementById("global_serif_size"),
    document.getElementById("global_sans_serif_size"),
    document.getElementById("global_monospace_size")
];

// Font size preset values
const fontSizePresets = ['16', '16.25', '16.5', '16.75', '17', '17.25', '17.5', '17.75', '18', '18.5', '19', '19.5', '20', '20.5', '21', '21.5', '22'];

// Create custom dropdown functionality for font size inputs
function createFontSizeDropdown(input) {
    // Check if dropdown already exists for this input
    if (input.hasAttribute('data-dropdown-initialized')) {
        console.log('Dropdown already exists for input:', input.id);
        return;
    }

    // Mark as initialized
    input.setAttribute('data-dropdown-initialized', 'true');

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.display = 'inline-block';
    wrapper.style.width = '100%';

    // Insert wrapper before input and move input inside
    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Create dropdown button overlay
    const dropdownBtn = document.createElement('div');
    dropdownBtn.style.position = 'absolute';
    dropdownBtn.style.right = '8px';
    dropdownBtn.style.top = '50%';
    dropdownBtn.style.transform = 'translateY(-50%)';
    dropdownBtn.style.width = '24px';
    dropdownBtn.style.height = '24px';
    dropdownBtn.style.cursor = 'pointer';
    dropdownBtn.style.zIndex = '10';
    wrapper.appendChild(dropdownBtn);

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.style.position = 'absolute';
    dropdown.style.top = '100%';
    dropdown.style.left = '0';
    dropdown.style.right = '0';
    dropdown.style.backgroundColor = '#374151';
    dropdown.style.border = '1px solid #4b5563';
    dropdown.style.borderRadius = '4px';
    dropdown.style.maxHeight = '200px';
    dropdown.style.overflowY = 'auto';
    dropdown.style.zIndex = '1000';
    dropdown.style.display = 'none';
    dropdown.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    dropdown.style.color = '#e5e7eb';

    // Add preset options
    fontSizePresets.forEach(preset => {
        const option = document.createElement('div');
        option.textContent = preset;
        option.style.padding = '8px 12px';
        option.style.cursor = 'pointer';
        option.style.fontSize = '2.25rem';

        option.addEventListener('mouseenter', () => {
            option.style.backgroundColor = '#4b5563';
        });
        option.addEventListener('mouseleave', () => {
            option.style.backgroundColor = 'transparent';
        });
        option.addEventListener('click', () => {
            input.value = preset;
            dropdown.style.display = 'none';
            validateFontSize(input);
        });

        dropdown.appendChild(option);
    });

    wrapper.appendChild(dropdown);

    // Toggle dropdown on button click
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isVisible = dropdown.style.display === 'block';

        // Hide all other dropdowns
        document.querySelectorAll('[data-font-size-dropdown]').forEach(dd => {
            dd.style.display = 'none';
        });

        dropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Mark dropdown for cleanup
    dropdown.setAttribute('data-font-size-dropdown', 'true');

    // Hide dropdown when clicking outside (with cleanup)
    const outsideClickHandler = () => {
        dropdown.style.display = 'none';
    };
    document.addEventListener('click', outsideClickHandler);

    // Store handler for potential cleanup
    dropdown._outsideClickHandler = outsideClickHandler;

    // Prevent dropdown from closing when clicking inside
    dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

// Clean up any existing dropdowns
function cleanupExistingDropdowns() {
    // Remove all existing dropdown elements
    document.querySelectorAll('[data-font-size-dropdown]').forEach(dropdown => {
        // Clean up event listeners
        if (dropdown._outsideClickHandler) {
            document.removeEventListener('click', dropdown._outsideClickHandler);
        }
        dropdown.remove();
    });

    // Reset all input initialization flags
    document.querySelectorAll('input[data-dropdown-initialized]').forEach(input => {
        input.removeAttribute('data-dropdown-initialized');
    });
}

// Initialize font size inputs when DOM is ready
function initializeFontSizeInputs() {
    // Clean up any existing dropdowns first
    cleanupExistingDropdowns();

    fontSizeInputs.forEach(input => {
        if (input) {
            input.addEventListener('blur', () => validateFontSize(input));
            input.addEventListener('input', () => {
                // Remove error styling while typing
                if (input.style.borderColor === '#ff4444') {
                    input.style.borderColor = '';
                }
            });

            // Create custom dropdown for this input
            createFontSizeDropdown(input);
        }
    });
}

// Ensure DOM is fully loaded before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFontSizeInputs);
} else {
    // DOM is already loaded
    initializeFontSizeInputs();
}

// Check buttons
const globalCheck = document.getElementById("global_check");
const overrideCheck = document.getElementById("override_check");
const exemptCheck = document.getElementById("exempt_check");
const tipText = document.getElementById("tip");
const tipWhenOverrideOn = document.getElementById("tip-override-on");
const tipWhenOverrideOff = document.getElementById("tip-override-off");
const tipWhenSiteIsExempted = document.getElementById("tip-exempt");
const tipBox = document.getElementById("tip-box");
const globalNotSelectedInfoText = document.getElementById(
  "global_not_checked_info_text",
);
const globalFontsSelection = document.getElementById("global_fonts_selection");
const globalFontSelectionForm = document.forms["global_fonts"];
const globalSerifSelect = globalFontSelectionForm.elements["global_serif"];
const globalSansSerifSelect =
  globalFontSelectionForm.elements["global_sans_serif"];
const globalMonospaceSelect =
  globalFontSelectionForm.elements["global_monospace"];
const globalSerifWeightSelect =
  globalFontSelectionForm.elements["global_serif_weight"];
const globalSansSerifWeightSelect =
  globalFontSelectionForm.elements["global_sans_serif_weight"];
const globalMonospaceWeightSelect =
  globalFontSelectionForm.elements["global_monospace_weight"];
const globalSerifSizeSelect =
  globalFontSelectionForm.elements["global_serif_size"];
const globalSansSerifSizeSelect =
  globalFontSelectionForm.elements["global_sans_serif_size"];
const globalMonospaceSizeSelect =
  globalFontSelectionForm.elements["global_monospace_size"];
const globalSerifLineHeightSelect =
  globalFontSelectionForm.elements["global_serif_line_height"];
const globalSansSerifLineHeightSelect =
  globalFontSelectionForm.elements["global_sans_serif_line_height"];
const globalMonospaceLineHeightSelect =
  globalFontSelectionForm.elements["global_monospace_line_height"];
const globalSerifColorSelect =
  globalFontSelectionForm.elements["global_serif_color"];
const globalSansSerifColorSelect =
  globalFontSelectionForm.elements["global_sans_serif_color"];
const globalMonospaceColorSelect =
  globalFontSelectionForm.elements["global_monospace_color"];
const globalSerifPlaceholder = document.querySelector(
  "#global_serif_placeholder",
);
const globalSansSerifPlaceholder = document.querySelector(
  "#global_sans_serif_placeholder",
);
const globalMonospacePlaceholder = document.querySelector(
  "#global_monospace_placeholder",
);
const globalSerifWeightPlaceholder = document.querySelector(
  "#global_serif_weight_placeholder",
);
const globalSansSerifWeightPlaceholder = document.querySelector(
  "#global_sans_serif_weight_placeholder",
);
const globalMonospaceWeightPlaceholder = document.querySelector(
  "#global_monospace_weight_placeholder",
);
const favSerifWeightPlaceholder = document.querySelector(
  "#fav_serif_weight_placeholder",
);
const favSansWeightPlaceholder = document.querySelector(
  "#fav_sans_weight_placeholder",
);
const favSerif2WeightPlaceholder = document.querySelector(
  "#fav_serif_2_weight_placeholder",
);
tipWhenOverrideOn.remove();
tipWhenOverrideOff.remove();
tipWhenSiteIsExempted.remove();
const showTip = (tip) => {
  tipBox.removeChild(tipBox.children[0]);
  tipBox.appendChild(tip);
  return true;
};
const getDomain = () => {
  return new Promise((resolve, reject) => {
    browser.tabs.query(
      {
        active: true,
        lastFocusedWindow: true,
      },
      (tabs) => {
        if (tabs[0] && tabs[0].url) resolve(new URL(tabs[0].url).hostname);
        else reject(new Error("Could not return tab url"));
      },
    );
  });
};
// by default these extra pages are unmounted
settingsPage.remove();
advancedPage.remove();
supportPage.remove();
restoreButton.remove();
const goToSettings = () => {
  settingsButton.click();
};
// Check for configuration settings
browser.storage.sync.get(["global"]).then((result) =>
  __awaiter(this, void 0, void 0, function* () {
    globalCheck.checked = "global" in result && result["global"];
    if (globalCheck.checked) {
      overrideCheck.disabled = false;
      exemptCheck.disabled = false;
      globalNotSelectedInfoText.remove();
      const globalFonts = yield browser.storage.sync.get(["global_fonts"]);
      if ("global_fonts" in globalFonts) {
        const global_fonts = globalFonts["global_fonts"];
        // Placeholder text content - show current selection as status
        globalSerifPlaceholder.textContent = global_fonts.serif === "Default" ? "Default" : global_fonts.serif;
        globalSansSerifPlaceholder.textContent = global_fonts.sans_serif === "Default" ? "Default" : global_fonts.sans_serif;
        globalMonospacePlaceholder.textContent = global_fonts.monospace === "Default" ? "Default" : global_fonts.monospace;
        globalSerifWeightPlaceholder.textContent = global_fonts.serif_weight === "Default" ? "Default" : (global_fonts.serif_weight || "Default");
        globalSansSerifWeightPlaceholder.textContent = global_fonts.sans_serif_weight === "Default" ? "Default" : (global_fonts.sans_serif_weight || "Default");
        globalMonospaceWeightPlaceholder.textContent = global_fonts.monospace_weight === "Default" ? "Default" : (global_fonts.monospace_weight || "Default");

        // Make placeholder unselectable (disabled) and keep value empty
        globalSerifPlaceholder.disabled = true;
        globalSansSerifPlaceholder.disabled = true;
        globalMonospacePlaceholder.disabled = true;
        globalSerifWeightPlaceholder.disabled = true;
        globalSansSerifWeightPlaceholder.disabled = true;
        globalMonospaceWeightPlaceholder.disabled = true;

        globalSerifPlaceholder.value = "";
        globalSansSerifPlaceholder.value = "";
        globalMonospacePlaceholder.value = "";
        globalSerifWeightPlaceholder.value = "";
        globalSansSerifWeightPlaceholder.value = "";
        globalMonospaceWeightPlaceholder.value = "";
        globalSerifSizeSelect.value =
          global_fonts.serif_size && global_fonts.serif_size !== "Default"
            ? global_fonts.serif_size
            : "";
        globalSansSerifSizeSelect.value =
          global_fonts.sans_serif_size &&
          global_fonts.sans_serif_size !== "Default"
            ? global_fonts.sans_serif_size
            : "";
        globalMonospaceSizeSelect.value =
          global_fonts.monospace_size &&
          global_fonts.monospace_size !== "Default"
            ? global_fonts.monospace_size
            : "";
      }
      browser.storage.sync.get(["override"]).then((result) => {
        const willOverride = "override" in result && result["override"];
        overrideCheck.checked = willOverride;
        showTip(willOverride ? tipWhenOverrideOn : tipWhenOverrideOff);
      });
      browser.storage.sync.get(["exempts"]).then((result) =>
        __awaiter(this, void 0, void 0, function* () {
          exemptCheck.checked =
            "exempts" in result &&
            result["exempts"].includes(yield getDomain()) &&
            showTip(tipWhenSiteIsExempted);
        }),
      );
    } else {
      globalFontsSelection.remove();
    }
  }),
);

advancedButton.addEventListener("click", () => {
  console.log("Advanced button clicked, text content:", advancedButton.textContent);

  if (advancedButton.textContent.includes("Adv")) {
    console.log("Showing advanced page");
    advancedButton.textContent = "<- Go back";
    if (settingsButton.textContent.includes("G")) settingsPage.remove();
    else if (supportButton.textContent.includes("<")) supportPage.remove();
    else homePage.remove();
    settingsButton.textContent = "Settings";
    supportButton.textContent = "Support";
    wrapper.appendChild(advancedPage);

    console.log("Advanced page appended, initializing triggers in 100ms");
    // Initialize triggers when advanced page is shown
    setTimeout(() => {
      console.log("Timeout reached, calling initializeTriggers");
      initializeTriggers();
    }, 100);
  } else {
    advancedButton.textContent = "Adv";
    advancedPage.remove();
    wrapper.appendChild(homePage);
  }
});

settingsButton.addEventListener("click", () =>
  __awaiter(this, void 0, void 0, function* () {
    if (settingsButton.textContent.charAt(0) === "S") {
      settingsButton.textContent = "Go back";
      if (supportButton.textContent.includes("<")) supportPage.remove();
      else if (advancedButton.textContent.includes("<")) advancedPage.remove();
      else homePage.remove();
      supportButton.textContent = "Support";
      advancedButton.textContent = "Adv";
      wrapper.appendChild(settingsPage);
      // Check for exisitng settings
      globalCheck.addEventListener("change", () =>
        __awaiter(this, void 0, void 0, function* () {
          // enable/disable the other checkboxes
          overrideCheck.disabled = !globalCheck.checked;
          exemptCheck.disabled = !globalCheck.checked;
          // Save this setting to sync storage
          yield browser.storage.sync.set({
            global: globalCheck.checked,
          });
          if (globalCheck.checked) {
            showTip(
              overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff,
            );
            exemptCheck.checked && showTip(tipWhenSiteIsExempted);
            globalNotSelectedInfoText.remove();
            settingsPage.appendChild(globalFontsSelection);
            // check if fonts are set for the site
            const domain = yield getDomain();
            const setFonts = yield browser.storage.sync.get([domain]);
            if (domain in setFonts) {
              yield browser.storage.sync.set({
                global_fonts: setFonts[domain],
              });
            }
            const globalFonts = yield browser.storage.sync.get([
              "global_fonts",
            ]);
            if ("global_fonts" in globalFonts) {
              const global_fonts = globalFonts["global_fonts"];
              // Placeholder text content - show current selection as status
              globalSerifPlaceholder.textContent = global_fonts.serif === "Default" ? "Default" : global_fonts.serif;
              globalSansSerifPlaceholder.textContent = global_fonts.sans_serif === "Default" ? "Default" : global_fonts.sans_serif;
              globalMonospacePlaceholder.textContent = global_fonts.monospace === "Default" ? "Default" : global_fonts.monospace;
              globalSerifWeightPlaceholder.textContent = global_fonts.serif_weight === "Default" ? "Default" : (global_fonts.serif_weight || "Default");
              globalSansSerifWeightPlaceholder.textContent = global_fonts.sans_serif_weight === "Default" ? "Default" : (global_fonts.sans_serif_weight || "Default");
              globalMonospaceWeightPlaceholder.textContent = global_fonts.monospace_weight === "Default" ? "Default" : (global_fonts.monospace_weight || "Default");

              // Make placeholder unselectable (disabled) and keep value empty
              globalSerifPlaceholder.disabled = true;
              globalSansSerifPlaceholder.disabled = true;
              globalMonospacePlaceholder.disabled = true;
              globalSerifWeightPlaceholder.disabled = true;
              globalSansSerifWeightPlaceholder.disabled = true;
              globalMonospaceWeightPlaceholder.disabled = true;

              globalSerifPlaceholder.value = "";
              globalSansSerifPlaceholder.value = "";
              globalMonospacePlaceholder.value = "";
              globalSerifWeightPlaceholder.value = "";
              globalSansSerifWeightPlaceholder.value = "";
              globalMonospaceWeightPlaceholder.value = "";
              globalSerifSizeSelect.value =
                global_fonts.serif_size && global_fonts.serif_size !== "Default"
                  ? global_fonts.serif_size
                  : "";
              globalSansSerifSizeSelect.value =
                global_fonts.sans_serif_size &&
                global_fonts.sans_serif_size !== "Default"
                  ? global_fonts.sans_serif_size
                  : "";
              globalMonospaceSizeSelect.value =
                global_fonts.monospace_size &&
                global_fonts.monospace_size !== "Default"
                  ? global_fonts.monospace_size
                  : "";
            }
          } else {
            showTip(tipText);
            globalFontsSelection.remove();
            settingsPage.appendChild(globalNotSelectedInfoText);
          }
        }),
      );
      overrideCheck.addEventListener("change", () =>
        __awaiter(this, void 0, void 0, function* () {
          yield browser.storage.sync.set({
            override: overrideCheck.checked,
          });
          showTip(
            overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff,
          );
        }),
      );
      exemptCheck.addEventListener("change", () =>
        __awaiter(this, void 0, void 0, function* () {
          // Get the list of all exempted websites
          let exempted_domains = [];
          const result = yield browser.storage.sync.get(["exempts"]);
          if ("exempts" in result) exempted_domains = result["exempts"];
          const domain = yield getDomain();
          if (exemptCheck.checked && showTip(tipWhenSiteIsExempted))
            exempted_domains.push(domain);
          else {
            exempted_domains = exempted_domains.filter((el) => el !== domain);
            showTip(
              overrideCheck.checked ? tipWhenOverrideOn : tipWhenOverrideOff,
            );
          }
          yield browser.storage.sync.set({
            exempts: exempted_domains,
          });
        }),
      );
    } else {
      settingsButton.textContent = "Settings";
      settingsPage.remove();
      wrapper.appendChild(homePage);
    }
  }),
);
supportButton.addEventListener("click", () => {
  if (supportButton.textContent.includes("Supp")) {
    supportButton.textContent = "<- Go back";
    if (settingsButton.textContent.includes("G")) settingsPage.remove();
    else if (advancedButton.textContent.includes("<")) advancedPage.remove();
    else homePage.remove();
    settingsButton.textContent = "Settings";
    advancedButton.textContent = "Adv";
    wrapper.appendChild(supportPage);
  } else {
    supportButton.textContent = "Support";
    supportPage.remove();
    wrapper.appendChild(homePage);
  }
});
// For global
// For Domain specific
const fontSelectionForm = document.forms["fonts"];
const serifSelect = fontSelectionForm.elements["serif"];
const sansSerifSelect = fontSelectionForm.elements["sans_serif"];
const monospaceSelect = fontSelectionForm.elements["monospace"];
const serifWeightSelect = fontSelectionForm.elements["serif_weight"];
const sansSerifWeightSelect = fontSelectionForm.elements["sans_serif_weight"];
const monospaceWeightSelect = fontSelectionForm.elements["monospace_weight"];
const serifSizeSelect = fontSelectionForm.elements["serif_size"];
const sansSerifSizeSelect = fontSelectionForm.elements["sans_serif_size"];
const monospaceSizeSelect = fontSelectionForm.elements["monospace_size"];
const serifLineHeightSelect = fontSelectionForm.elements["serif_line_height"];
const sansSerifLineHeightSelect = fontSelectionForm.elements["sans_serif_line_height"];
const monospaceLineHeightSelect = fontSelectionForm.elements["monospace_line_height"];
const serifColorSelect = fontSelectionForm.elements["serif_color"];
const sansSerifColorSelect = fontSelectionForm.elements["sans_serif_color"];
const monospaceColorSelect = fontSelectionForm.elements["monospace_color"];
const serifPlaceholder = document.querySelector("#serif_placeholder");
const sansSerifPlaceholder = document.querySelector("#sans_serif_placeholder");
const monospacePlaceholder = document.querySelector("#monospace_placeholder");
const serifWeightPlaceholder = document.querySelector(
  "#serif_weight_placeholder",
);
const sansSerifWeightPlaceholder = document.querySelector(
  "#sans_serif_weight_placeholder",
);
const monospaceWeightPlaceholder = document.querySelector(
  "#monospace_weight_placeholder",
);
// Populating placeholder values + checkbox
const updatePlaceholders = (innerText) => {
  // Placeholder text content - show current selection as status
  serifPlaceholder.textContent = innerText.serif === "Default" ? "Default" : innerText.serif;
  sansSerifPlaceholder.textContent = innerText.sans_serif === "Default" ? "Default" : innerText.sans_serif;
  monospacePlaceholder.textContent = innerText.monospace === "Default" ? "Default" : innerText.monospace;
  serifWeightPlaceholder.textContent = innerText.serif_weight === "Default" ? "Default" : (innerText.serif_weight || "Default");
  sansSerifWeightPlaceholder.textContent = innerText.sans_serif_weight === "Default" ? "Default" : (innerText.sans_serif_weight || "Default");
  monospaceWeightPlaceholder.textContent = innerText.monospace_weight === "Default" ? "Default" : (innerText.monospace_weight || "Default");

  // Make placeholder unselectable (disabled) and keep value empty
  serifPlaceholder.disabled = true;
  sansSerifPlaceholder.disabled = true;
  monospacePlaceholder.disabled = true;
  serifWeightPlaceholder.disabled = true;
  sansSerifWeightPlaceholder.disabled = true;
  monospaceWeightPlaceholder.disabled = true;

  serifPlaceholder.value = "";
  sansSerifPlaceholder.value = "";
  monospacePlaceholder.value = "";
  serifWeightPlaceholder.value = "";
  sansSerifWeightPlaceholder.value = "";
  monospaceWeightPlaceholder.value = "";

  // Set actual form field values
  serifSelect.value = innerText.serif !== "Default" ? innerText.serif : "";
  sansSerifSelect.value = innerText.sans_serif !== "Default" ? innerText.sans_serif : "";
  monospaceSelect.value = innerText.monospace !== "Default" ? innerText.monospace : "";
  serifWeightSelect.value = innerText.serif_weight !== "Default" ? (innerText.serif_weight || "") : "";
  sansSerifWeightSelect.value = innerText.sans_serif_weight !== "Default" ? (innerText.sans_serif_weight || "") : "";
  monospaceWeightSelect.value = innerText.monospace_weight !== "Default" ? (innerText.monospace_weight || "") : "";

  serifSizeSelect.value =
    innerText.serif_size && innerText.serif_size !== "Default"
      ? innerText.serif_size
      : "";
  sansSerifSizeSelect.value =
    innerText.sans_serif_size && innerText.sans_serif_size !== "Default"
      ? innerText.sans_serif_size
      : "";
  monospaceSizeSelect.value =
    innerText.monospace_size && innerText.monospace_size !== "Default"
      ? innerText.monospace_size
      : "";

  // Set line height values
  serifLineHeightSelect.value =
    innerText.serif_line_height && innerText.serif_line_height !== "Default"
      ? innerText.serif_line_height
      : "";
  sansSerifLineHeightSelect.value =
    innerText.sans_serif_line_height && innerText.sans_serif_line_height !== "Default"
      ? innerText.sans_serif_line_height
      : "";
  monospaceLineHeightSelect.value =
    innerText.monospace_line_height && innerText.monospace_line_height !== "Default"
      ? innerText.monospace_line_height
      : "";

  // Set color values
  serifColorSelect.value =
    innerText.serif_color && innerText.serif_color !== "Default"
      ? innerText.serif_color
      : "";
  sansSerifColorSelect.value =
    innerText.sans_serif_color && innerText.sans_serif_color !== "Default"
      ? innerText.sans_serif_color
      : "";
  monospaceColorSelect.value =
    innerText.monospace_color && innerText.monospace_color !== "Default"
      ? innerText.monospace_color
      : "";

  // Load variable font axes if they exist
  if (innerText.serif_var_axes) {
    setVariableFontAxesValues('serif', innerText.serif_var_axes);
  }
  if (innerText.sans_serif_var_axes) {
    setVariableFontAxesValues('sans-serif', innerText.sans_serif_var_axes);
  }
  if (innerText.monospace_var_axes) {
    setVariableFontAxesValues('monospace', innerText.monospace_var_axes);
  }

  // Store opsz control settings for later restoration (after controls are initialized)
  window.pendingOpszControlSettings = {
    serif: innerText.serif_opsz_control,
    sans_serif: innerText.sans_serif_opsz_control,
    monospace: innerText.monospace_opsz_control
  };
};
getDomain().then((domain) => {
  browser.storage.sync.get([domain]).then((result) => {
    if (Object.keys(result).length != 0) {
      const fontData = result[domain];
      updatePlaceholders(fontData);
      formButtons.prepend(restoreButton);

      // After loading saved data, update variable font controls visibility
      setTimeout(() => {
        // Ensure variable font controls are initialized first
        if (typeof window.initializeVariableFontControls === 'function') {
          window.initializeVariableFontControls();
        }

        // Then trigger font changes to show appropriate controls
        setTimeout(() => {
          if (fontData.serif && fontData.serif !== "Default") {
            const serifSelect = document.getElementById('serif');
            if (serifSelect && window.toggleVariableFontControls) {
              window.toggleVariableFontControls('serif', fontData.serif);
            }
          }
          if (fontData.sans_serif && fontData.sans_serif !== "Default") {
            const sansSerifSelect = document.getElementById('sans_serif');
            if (sansSerifSelect && window.toggleVariableFontControls) {
              window.toggleVariableFontControls('sans-serif', fontData.sans_serif);
            }
          }
          if (fontData.monospace && fontData.monospace !== "Default") {
            const monospaceSelect = document.getElementById('monospace');
            if (monospaceSelect && window.toggleVariableFontControls) {
              window.toggleVariableFontControls('monospace', fontData.monospace);
            }
          }

          // Restore opsz control settings after controls are visible
          if (window.pendingOpszControlSettings && window.handleOpszControlChange) {
            setTimeout(() => {
              const settings = window.pendingOpszControlSettings;

              if (settings.serif) {
                const serifOpszControl = document.getElementById('serif_opsz_control');
                if (serifOpszControl) {
                  serifOpszControl.value = settings.serif;
                  window.handleOpszControlChange('serif', settings.serif);
                }
              }
              if (settings.sans_serif) {
                const sansSerifOpszControl = document.getElementById('sans_serif_opsz_control');
                if (sansSerifOpszControl) {
                  sansSerifOpszControl.value = settings.sans_serif;
                  window.handleOpszControlChange('sans-serif', settings.sans_serif);
                }
              }
              if (settings.monospace) {
                const monospaceOpszControl = document.getElementById('monospace_opsz_control');
                if (monospaceOpszControl) {
                  monospaceOpszControl.value = settings.monospace;
                  window.handleOpszControlChange('monospace', settings.monospace);
                }
              }

              // Clean up
              delete window.pendingOpszControlSettings;
            }, 50);
          }
        }, 100);
      }, 300);
    }
  });
});
// load locally installed fonts
// Load fonts into the  dropdowns
const populateFonts = (element) => {
  // Add Reset option as the first selectable option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "← Reset to Default";
  element.appendChild(defaultOption);

  [
    // high frequency
    "Merriweather",
    "MerriweatherL",
    "BBC Reith Serif",
    "Rubik",
    "RubikL",
    "ABC Ginto Normal Unlicensed Trial",
    "Roboto Serif",
    "Roboto Flex",
    "Roboto FlexL",
    // high frequency serif
    "Merriweather",
    "MerriweatherL",
    "BBC Reith Serif",
    "TiemposText",
    "TiemposText-Regular",
    "Literata",
    "Roboto Serif",
    "Roboto Slab",
    "Source Serif 4",
    "Arvo",
    "Zilla Slab",
    "Crimson Text",
    "Crimson Pro",
    "EB Garamond",
    "Charter ITC TT",
    // high frequency sans-serif
    "Montserrat",
    "Sora",
    "Poppins",
    "Inter",
    "Atkinson Hyperlegible Next",
    "DM Sans",
    "Atkinson Hyperlegible",
    "Manrope",
    "Neue Plak Text",
    "Rubik",
    "RubikL",
    "Roboto Flex",
    "Roboto FlexL",
    "ABC Ginto Normal Unlicensed Trial",
    "Merriweather Sans",
    "Roboto",
    "Neue Plak",
    "PT Sans",
    "Noto Sans",
    "Source Sans Pro",
    "Proxima Nova",
    "ABC Ginto Nord Condensed Unlicensed Trial",
    "ABC Ginto Nord Unlicensed Trial",
    "Public Sans",
    // pre-installed
    "Noto Serif",
    // other
    "Tinos",
    "Lora",
    "Open Sans",
    "Lexend",
    "Mulish",
    "Marcellus",
    "Nunito",
    "Vollkorn",
    "Playfair",
    "Source Code Pro",
    "Fira Code",
    "Comic Neue",
    "Charis SIL",
    "Fantasque Sans Mono",
    "Cutive Mono",
    "Droid Sans Mono",
    "Roboto Mono",
    "Recursive",
    "Coming Soon",
    "Dancing Script",
    "Carrois Gothic SC",
    "One UI Sans App VF",
  ].forEach((font) => {
    const option = document.createElement("option");
    option.value = font;
    option.textContent = font;
    element.appendChild(option);
  });
};
const populateWeights = (element, isVariableFont = false) => {
  // Keep the existing placeholder option, only add new options after it

  // Remove all options except the placeholder
  const allOptions = element.querySelectorAll('option');
  allOptions.forEach(option => {
    if (!option.id || !option.id.includes('_placeholder')) {
      option.remove();
    }
  });

  // Add Reset option as the first selectable option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "← Reset to Default";
  element.appendChild(defaultOption);

  if (isVariableFont) {
    // For variable fonts, add a slider option
    const sliderOption = document.createElement("option");
    sliderOption.value = "slider";
    sliderOption.textContent = "Use Slider";
    element.appendChild(sliderOption);
  }

  [
    "100",
    "200",
    "300",
    "400",
    "500",
    "550",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ].forEach((weight) => {
    const option = document.createElement("option");
    option.value = weight;
    option.textContent = weight;
    element.appendChild(option);
  });
};

const populateGlobalWeights = (element) => {
  // Keep the existing placeholder option, only add new options after it

  // Remove all options except the placeholder
  const allOptions = element.querySelectorAll('option');
  allOptions.forEach(option => {
    if (!option.id || !option.id.includes('_placeholder')) {
      option.remove();
    }
  });

  // For global settings, we want "← Reset to Default" only when the user clicks the dropdown
  // The placeholder will show "Default" when the current value is default
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "← Reset to Default";
  element.appendChild(defaultOption);

  [
    "100",
    "200",
    "300",
    "400",
    "500",
    "550",
    "600",
    "700",
    "800",
    "900",
    "1000",
  ].forEach((weight) => {
    const option = document.createElement("option");
    option.value = weight;
    option.textContent = weight;
    element.appendChild(option);
  });
};
populateFonts(serifSelect);
populateFonts(sansSerifSelect);
populateFonts(monospaceSelect);
populateWeights(serifWeightSelect);
populateWeights(sansSerifWeightSelect);
populateWeights(monospaceWeightSelect);
// for global fonts form
populateFonts(globalSerifSelect);
populateFonts(globalSansSerifSelect);
populateFonts(globalMonospaceSelect);
populateGlobalWeights(globalSerifWeightSelect);
populateGlobalWeights(globalSansSerifWeightSelect);
populateGlobalWeights(globalMonospaceWeightSelect);

// Populate favorite fonts selectors
populateFonts(favSerifFontSelect);
populateFonts(favSansFontSelect);
populateFonts(favSans2FontSelect);
populateFonts(favSerif2FontSelect);
populateGlobalWeights(favSerifWeightSelect);
populateGlobalWeights(favSansWeightSelect);
populateGlobalWeights(favSans2WeightSelect);
populateGlobalWeights(favSerif2WeightSelect);

// Default favorite fonts configuration
const DEFAULT_FAV_FONTS = {
  favSerif: {
    font: "BBC Reith Serif",
    size: "16.5",
    weight: "",
    var_axes: {},
    opsz_control: 'Default'
  },
  favSerif2: {
    font: "MerriweatherL",
    size: "16",
    weight: "",
    var_axes: {},
    opsz_control: 'Default'
  },
  favSans: {
    font: "RubikL",
    size: "17",
    weight: "",
    line_height: "",
    color: "",
    var_axes: {},
    opsz_control: 'Default'
  },
  favSans2: {
    font: "Roboto FlexL",
    size: "17",
    weight: "",
    line_height: "",
    color: "",
    var_axes: {
      'GRAD': 75
    },
    opsz_control: 'Default'
  }
};

// Load and apply favorite fonts configuration
const loadFavFontsConfig = () => __awaiter(this, void 0, void 0, function* () {
  try {
    const result = yield browser.storage.sync.get(['favFontsConfig']);
    const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

    // Set values
    favSerifFontSelect.value = config.favSerif.font;
    favSerifSizeSelect.value = config.favSerif.size;
    favSerifWeightSelect.value = config.favSerif.weight;

    favSansFontSelect.value = config.favSans.font;
    favSansSizeSelect.value = config.favSans.size;
    favSansWeightSelect.value = config.favSans.weight;
    favSansLineHeightSelect.value = config.favSans.line_height || "";
    favSansColorSelect.value = config.favSans.color || "";

    favSans2FontSelect.value = config.favSans2.font;
    favSans2SizeSelect.value = config.favSans2.size;
    favSans2WeightSelect.value = config.favSans2.weight;
    favSans2LineHeightSelect.value = config.favSans2.line_height || "";
    favSans2ColorSelect.value = config.favSans2.color || "";

    favSerif2FontSelect.value = config.favSerif2.font;
    favSerif2SizeSelect.value = config.favSerif2.size;
    favSerif2WeightSelect.value = config.favSerif2.weight;

    // Update weight placeholders to show "Default" when value is default
    favSerifWeightPlaceholder.textContent = config.favSerif.weight === "" || config.favSerif.weight === "Default" ? "Default" : (config.favSerif.weight || "Default");
    favSansWeightPlaceholder.textContent = config.favSans.weight === "" || config.favSans.weight === "Default" ? "Default" : (config.favSans.weight || "Default");
    favSerif2WeightPlaceholder.textContent = config.favSerif2.weight === "" || config.favSerif2.weight === "Default" ? "Default" : (config.favSerif2.weight || "Default");

    // Make placeholders unselectable
    favSerifWeightPlaceholder.disabled = true;
    favSansWeightPlaceholder.disabled = true;
    favSerif2WeightPlaceholder.disabled = true;

    // Load variable font axes if they exist
    if (config.favSerif.var_axes) {
      setVariableFontAxesValues('fav-serif', config.favSerif.var_axes);
    }
    if (config.favSans.var_axes) {
      setVariableFontAxesValues('fav-sans', config.favSans.var_axes);
    }
    if (config.favSans2.var_axes) {
      setVariableFontAxesValues('fav-sans-2', config.favSans2.var_axes);
    }
    if (config.favSerif2.var_axes) {
      setVariableFontAxesValues('fav-serif-2', config.favSerif2.var_axes);
    }

    // Load opsz control settings
    const favSerifOpszControl = document.getElementById('fav_serif_opsz_control');
    const favSansOpszControl = document.getElementById('fav_sans_opsz_control');
    const favSerif2OpszControl = document.getElementById('fav_serif_2_opsz_control');

    if (favSerifOpszControl && config.favSerif.opsz_control) {
      favSerifOpszControl.value = config.favSerif.opsz_control;
    }
    if (favSansOpszControl && config.favSans.opsz_control) {
      favSansOpszControl.value = config.favSans.opsz_control;
    }
    if (favSerif2OpszControl && config.favSerif2.opsz_control) {
      favSerif2OpszControl.value = config.favSerif2.opsz_control;
    }

    // Trigger variable font controls visibility for current font selections
    // Use setTimeout to ensure variable font controls are fully initialized
    setTimeout(() => {
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('fav-serif', config.favSerif.font);
        window.toggleVariableFontControls('fav-sans', config.favSans.font);
        window.toggleVariableFontControls('fav-serif-2', config.favSerif2.font);
        window.toggleVariableFontControls('fav-sans-2', config.favSans2.font);
      }

      // Re-apply variable font axes values after controls are visible
      setTimeout(() => {
        if (config.favSerif.var_axes) {
          setVariableFontAxesValues('fav-serif', config.favSerif.var_axes);
        }
        if (config.favSans.var_axes) {
          setVariableFontAxesValues('fav-sans', config.favSans.var_axes);
        }
        if (config.favSerif2.var_axes) {
          setVariableFontAxesValues('fav-serif-2', config.favSerif2.var_axes);
        }
        if (config.favSans2.var_axes) {
          setVariableFontAxesValues('fav-sans-2', config.favSans2.var_axes);
        }
      }, 300);
    }, 200);

    console.log("Favorite fonts config loaded:", config);
  } catch (e) {
    console.error("Error loading favorite fonts config:", e);
  }
});

// Save favorite fonts configuration
saveFavConfigBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  try {
    const config = {
      favSerif: {
        font: favSerifFontSelect.value || "Merriweather",
        size: favSerifSizeSelect.value || "16",
        weight: favSerifWeightSelect.value || "",
        var_axes: getVariableFontAxesValues('fav-serif'),
        opsz_control: document.getElementById('fav_serif_opsz_control')?.value || 'Default'
      },
      favSans: {
        font: favSansFontSelect.value || "RubikL",
        size: favSansSizeSelect.value || "17",
        weight: favSansWeightSelect.value || "",
        line_height: favSansLineHeightSelect.value || "",
        color: favSansColorSelect.value || "",
        var_axes: getVariableFontAxesValues('fav-sans'),
        opsz_control: document.getElementById('fav_sans_opsz_control')?.value || 'Default'
      },
      favSans2: {
        font: favSans2FontSelect.value || "Roboto FlexL",
        size: favSans2SizeSelect.value || "17",
        weight: favSans2WeightSelect.value || "",
        line_height: favSans2LineHeightSelect.value || "",
        color: favSans2ColorSelect.value || "",
        var_axes: getVariableFontAxesValues('fav-sans-2'),
        opsz_control: document.getElementById('fav_sans_2_opsz_control')?.value || 'Default'
      },
      favSerif2: {
        font: favSerif2FontSelect.value || "Merriweather",
        size: favSerif2SizeSelect.value || "16",
        weight: favSerif2WeightSelect.value || "",
        var_axes: getVariableFontAxesValues('fav-serif-2'),
        opsz_control: document.getElementById('fav_serif_2_opsz_control')?.value || 'Default'
      }
    };

    yield browser.storage.sync.set({ favFontsConfig: config });

    // Update button text temporarily
    saveFavConfigBtn.textContent = "✔ Saved";
    setTimeout(() => {
      saveFavConfigBtn.textContent = "Save Favorite Fonts";
    }, 1500);

    console.log("Favorite fonts config saved:", config);
  } catch (e) {
    console.error("Error saving favorite fonts config:", e);
    saveFavConfigBtn.textContent = "❌ Error";
    setTimeout(() => {
      saveFavConfigBtn.textContent = "Save Favorite Fonts";
    }, 1500);
  }
}));

// Load configuration on page load
loadFavFontsConfig();
fontSelectionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const serifValue = serifSelect.value;
  const sansSerifValue = sansSerifSelect.value;
  const monospaceValue = monospaceSelect.value;
  const serifWeightValue = serifWeightSelect.value;
  const sansSerifWeightValue = sansSerifWeightSelect.value;
  const monospaceWeightValue = monospaceWeightSelect.value;
  const serifSizeValue = serifSizeSelect.value;
  const sansSerifSizeValue = sansSerifSizeSelect.value;
  const monospaceSizeValue = monospaceSizeSelect.value;
  const serifLineHeightValue = serifLineHeightSelect.value;
  const sansSerifLineHeightValue = sansSerifLineHeightSelect.value;
  const monospaceLineHeightValue = monospaceLineHeightSelect.value;
  const serifColorValue = serifColorSelect.value;
  const sansSerifColorValue = sansSerifColorSelect.value;
  const monospaceColorValue = monospaceColorSelect.value;
  if (
    !serifValue.length &&
    !sansSerifValue.length &&
    !monospaceValue.length &&
    !serifWeightValue.length &&
    !sansSerifWeightValue.length &&
    !monospaceWeightValue.length &&
    !serifSizeValue.length &&
    !sansSerifSizeValue.length &&
    !monospaceSizeValue.length &&
    !serifLineHeightValue.length &&
    !sansSerifLineHeightValue.length &&
    !monospaceLineHeightValue.length &&
    !serifColorValue.length &&
    !sansSerifColorValue.length &&
    !monospaceColorValue.length
  )
    applyButton.textContent = "No Changes Made";
  else {
    applyButton.textContent = "✔ Applied";
    if (!formButtons.contains(restoreButton))
      formButtons.prepend(restoreButton);
  }
  setTimeout(() => {
    applyButton.textContent = "Apply Selection";
  }, 1500);
  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
        // telling the service worker to apply the font
        const fontData = {
          serif: serifValue.length ? serifValue : "Default",
          serif_weight: serifWeightValue.length ? serifWeightValue : "Default",
          sans_serif: sansSerifValue.length ? sansSerifValue : "Default",
          sans_serif_weight: sansSerifWeightValue.length
            ? sansSerifWeightValue
            : "Default",
          monospace: monospaceValue.length ? monospaceValue : "Default",
          monospace_weight: monospaceWeightValue.length
            ? monospaceWeightValue
            : "Default",
          serif_size: serifSizeValue.length ? serifSizeValue : "Default",
          sans_serif_size: sansSerifSizeValue.length
            ? sansSerifSizeValue
            : "Default",
          monospace_size: monospaceSizeValue.length
            ? monospaceSizeValue
            : "Default",
          serif_line_height: serifLineHeightValue.length ? serifLineHeightValue : "Default",
          sans_serif_line_height: sansSerifLineHeightValue.length ? sansSerifLineHeightValue : "Default",
          monospace_line_height: monospaceLineHeightValue.length ? monospaceLineHeightValue : "Default",
          serif_color: serifColorValue.length ? serifColorValue : "Default",
          sans_serif_color: sansSerifColorValue.length ? sansSerifColorValue : "Default",
          monospace_color: monospaceColorValue.length ? monospaceColorValue : "Default",
          // Variable font axes (safely get values)
          serif_var_axes: (() => { try { return (typeof getVariableFontAxesValues === 'function') ? getVariableFontAxesValues('serif') : {}; } catch(e) { console.warn('Error getting serif axes:', e); return {}; } })(),
          sans_serif_var_axes: (() => { try { return (typeof getVariableFontAxesValues === 'function') ? getVariableFontAxesValues('sans-serif') : {}; } catch(e) { console.warn('Error getting sans-serif axes:', e); return {}; } })(),
          monospace_var_axes: (() => { try { return (typeof getVariableFontAxesValues === 'function') ? getVariableFontAxesValues('monospace') : {}; } catch(e) { console.warn('Error getting monospace axes:', e); return {}; } })(),
          // Optical size control settings (safely get values)
          serif_opsz_control: document.getElementById('serif_opsz_control')?.value || 'Default',
          sans_serif_opsz_control: document.getElementById('sans_serif_opsz_control')?.value || 'Default',
          monospace_opsz_control: document.getElementById('monospace_opsz_control')?.value || 'Default'
        };
        browser.tabs.connect(tabs[0].id).postMessage({
          type: "apply_font",
          data: fontData,
        });
        // saving the fonts to sync storage - always save even if resetting to defaults
        const domain = new URL(tabs[0].url).hostname;
        yield browser.storage.sync.set({
          [domain]: fontData,
        });
        // if global is checked, save to global_fonts
        // don't if the site has been exempted
        const exempts_list = yield browser.storage.sync.get(["exempts"]);
        if (
          "exempts" in exempts_list &&
          exempts_list["exempts"].includes(domain)
        ) {
          console.log(
            "This site has been exempted, so don't change the global fonts",
          );
        } else {
          const result = yield browser.storage.sync.get(["global"]);
          if ("global" in result && result["global"])
            yield browser.storage.sync.set({
              global_fonts: fontData,
            });
        }
      }),
    );
  } catch (e) {
    console.error("Error applying or saving font.");
    console.error(e);
  }
});
globalFontSelectionForm.addEventListener("submit", (e) =>
  __awaiter(this, void 0, void 0, function* () {
    e.preventDefault();
    const globalSerifValue = globalSerifSelect.value;
    const globalSansSerifValue = globalSansSerifSelect.value;
    const globaMonospaceValue = globalMonospaceSelect.value;
    const globalSerifWeightValue = globalSerifWeightSelect.value;
    const globalSansSerifWeightValue = globalSansSerifWeightSelect.value;
    const globalMonospaceWeightValue = globalMonospaceWeightSelect.value;
    const globalSerifSizeValue = globalSerifSizeSelect.value;
    const globalSansSerifSizeValue = globalSansSerifSizeSelect.value;
    const globalMonospaceSizeValue = globalMonospaceSizeSelect.value;
    const globalSerifLineHeightValue = globalSerifLineHeightSelect.value;
    const globalSansSerifLineHeightValue = globalSansSerifLineHeightSelect.value;
    const globalMonospaceLineHeightValue = globalMonospaceLineHeightSelect.value;
    const globalSerifColorValue = globalSerifColorSelect.value;
    const globalSansSerifColorValue = globalSansSerifColorSelect.value;
    const globalMonospaceColorValue = globalMonospaceColorSelect.value;
    const applyButton = document.getElementById("global-apply-btn");
    if (
      !globalSerifValue.length &&
      !globalSansSerifValue.length &&
      !globaMonospaceValue.length &&
      !globalSerifWeightValue.length &&
      !globalSansSerifWeightValue.length &&
      !globalMonospaceWeightValue.length &&
      !globalSerifSizeValue.length &&
      !globalSansSerifSizeValue.length &&
      !globalMonospaceSizeValue.length &&
      !globalSerifLineHeightValue.length &&
      !globalSansSerifLineHeightValue.length &&
      !globalMonospaceLineHeightValue.length &&
      !globalSerifColorValue.length &&
      !globalSansSerifColorValue.length &&
      !globalMonospaceColorValue.length
    )
      applyButton.textContent = "No Changes Made";
    else {
      applyButton.textContent = "Global fonts modified";
    }
    setTimeout(() => {
      applyButton.textContent = "🌐 Apply to all sites";
    }, 1500);
    yield browser.storage.sync.set({
      global_fonts: {
        serif: globalSerifValue.length ? globalSerifValue : "Default",
        serif_weight: globalSerifWeightValue.length
          ? globalSerifWeightValue
          : "Default",
        sans_serif: globalSansSerifValue.length
          ? globalSansSerifValue
          : "Default",
        sans_serif_weight: globalSansSerifWeightValue.length
          ? globalSansSerifWeightValue
          : "Default",
        monospace: globaMonospaceValue.length ? globaMonospaceValue : "Default",
        monospace_weight: globalMonospaceWeightValue.length
          ? globalMonospaceWeightValue
          : "Default",
        serif_size: globalSerifSizeValue.length
          ? globalSerifSizeValue
          : "Default",
        sans_serif_size: globalSansSerifSizeValue.length
          ? globalSansSerifSizeValue
          : "Default",
        monospace_size: globalMonospaceSizeValue.length
          ? globalMonospaceSizeValue
          : "Default",
        serif_line_height: globalSerifLineHeightValue.length
          ? globalSerifLineHeightValue
          : "Default",
        sans_serif_line_height: globalSansSerifLineHeightValue.length
          ? globalSansSerifLineHeightValue
          : "Default",
        monospace_line_height: globalMonospaceLineHeightValue.length
          ? globalMonospaceLineHeightValue
          : "Default",
        serif_color: globalSerifColorValue.length
          ? globalSerifColorValue
          : "Default",
        sans_serif_color: globalSansSerifColorValue.length
          ? globalSansSerifColorValue
          : "Default",
        monospace_color: globalMonospaceColorValue.length
          ? globalMonospaceColorValue
          : "Default",
      },
    });
  }),
);
restoreButton.addEventListener("click", () =>
  __awaiter(this, void 0, void 0, function* () {
    const result = yield browser.storage.sync.get(["global"]);
    const domain = yield getDomain();
    if ("global" in result && result["global"]) {
      const is_exempted = yield browser.storage.sync.get(["exempts"]);
      if ("exempts" in is_exempted && is_exempted["exempts"].includes(domain)) {
        // Only change for the site
        // Show refresh suggesion modal
        document.getElementById("restore_modal").showModal();
        browser.storage.sync.remove(domain);
        restoreButton.remove();
      } else {
        document.getElementById("warning_modal").showModal();
        yield browser.storage.sync.set({
          global: false,
        });
        globalCheck.checked = false;
        showTip(tipText);
      }
    }
    updatePlaceholders({
      serif: "Default",
      sans_serif: "Default",
      monospace: "Default",
      serif_weight: "Default",
      sans_serif_weight: "Default",
      monospace_weight: "Default",
      serif_size: "Default",
      sans_serif_size: "Default",
      monospace_size: "Default",
      serif_line_height: "Default",
      sans_serif_line_height: "Default",
      monospace_line_height: "Default",
      serif_color: "Default",
      sans_serif_color: "Default",
      monospace_color: "Default",
      // Variable font axes - reset to defaults
      serif_var_axes: {},
      sans_serif_var_axes: {},
      monospace_var_axes: {},
      // Opsz control - reset to defaults
      serif_opsz_control: 'Default',
      sans_serif_opsz_control: 'Default',
      monospace_opsz_control: 'Default'
    });
    document.getElementById("restore_modal").showModal();
    browser.storage.sync.remove(yield getDomain());
    restoreButton.remove();
  }),
);

// Apply Fav Serif button functionality
const applyFavSerifBtn = document.getElementById("apply-fav-serif-btn");
applyFavSerifBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: config.favSerif.font,
    serif_weight: config.favSerif.weight || "Default",
    serif_size: config.favSerif.size,
    sans_serif: "Default",
    sans_serif_weight: "Default",
    sans_serif_size: "Default",
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite serif axes
    serif_var_axes: config.favSerif.var_axes || {},
    sans_serif_var_axes: {},
    monospace_var_axes: {},
    // Opsz control - use favorite serif opsz control
    serif_opsz_control: config.favSerif.opsz_control || 'Default',
    sans_serif_opsz_control: 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
        // Apply the font
        browser.tabs.connect(tabs[0].id).postMessage({
          type: "apply_font",
          data: fontData,
        });

        // Save to storage
        const domain = new URL(tabs[0].url).hostname;
        yield browser.storage.sync.set({
          [domain]: fontData,
        });

        // Update global fonts if global is enabled and site not exempted
        const exempts_list = yield browser.storage.sync.get(["exempts"]);
        if (!("exempts" in exempts_list && exempts_list["exempts"].includes(domain))) {
          const result = yield browser.storage.sync.get(["global"]);
          if ("global" in result && result["global"]) {
            yield browser.storage.sync.set({
              global_fonts: fontData,
            });
          }
        }

        // Update UI placeholders
        updatePlaceholders(fontData);
        if (window.toggleVariableFontControls) {
          window.toggleVariableFontControls('serif', config.favSerif.font);
        }
        if (!formButtons.contains(restoreButton)) {
          formButtons.prepend(restoreButton);
        }
      }),
    );

    // Update button text temporarily
    applyFavSerifBtn.textContent = "✔ Applied";
    setTimeout(() => {
      applyFavSerifBtn.textContent = "Fav Serif";
    }, 1500);

  } catch (e) {
    console.error("Error applying favorite serif font.");
    console.error(e);
  }
}));

// Apply Fav Sans button functionality
const applyFavSansBtn = document.getElementById("apply-fav-sans-btn");
applyFavSansBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: "Default",
    serif_weight: "Default",
    serif_size: "Default",
    sans_serif: config.favSans.font,
    sans_serif_weight: config.favSans.weight || "Default",
    sans_serif_size: config.favSans.size,
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite sans axes
    serif_var_axes: {},
    sans_serif_var_axes: config.favSans.var_axes || {},
    monospace_var_axes: {},
    // Opsz control - use favorite sans opsz control
    serif_opsz_control: 'Default',
    sans_serif_opsz_control: config.favSans.opsz_control || 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
      // Apply the font
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: fontData,
      });

      // Save to storage
      const domain = new URL(tabs[0].url).hostname;
      yield browser.storage.sync.set({
        [domain]: fontData,
      });

      // Update global fonts if global is enabled and site not exempted
      const exempts_list = yield browser.storage.sync.get(["exempts"]);
      if (!("exempts" in exempts_list && exempts_list["exempts"].includes(domain))) {
        const result = yield browser.storage.sync.get(["global"]);
        if ("global" in result && result["global"]) {
          yield browser.storage.sync.set({
            global_fonts: fontData,
          });
        }
      }

      // Update UI placeholders
      updatePlaceholders(fontData);
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('sans-serif', config.favSans.font);
      }
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }
    }));

    // Update button text temporarily
    applyFavSansBtn.textContent = "✔ Applied";
    setTimeout(() => {
      applyFavSansBtn.textContent = "Fav Sans";
    }, 1500);

  } catch (e) {
    console.error("Error applying favorite sans-serif font.");
    console.error(e);
  }
}));

// Apply Fav Sans 2 button functionality
const applyFavSans2Btn = document.getElementById("apply-fav-sans-2-btn");
applyFavSans2Btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: "Default",
    serif_weight: "Default",
    serif_size: "Default",
    sans_serif: config.favSans2.font,
    sans_serif_weight: config.favSans2.weight || "Default",
    sans_serif_size: config.favSans2.size,
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: config.favSans2.line_height || "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: config.favSans2.color || "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite sans 2 axes
    serif_var_axes: {},
    sans_serif_var_axes: config.favSans2.var_axes || {},
    monospace_var_axes: {},
    // Opsz control - use favorite sans 2 opsz control
    serif_opsz_control: 'Default',
    sans_serif_opsz_control: config.favSans2.opsz_control || 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
      // Apply the font
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: fontData,
      });

      // Save to storage
      const domain = new URL(tabs[0].url).hostname;
      yield browser.storage.sync.set({
        [domain]: fontData,
      });

      console.log("Favorite sans-serif 2 font applied:", fontData);

      // Update UI placeholders
      updatePlaceholders(fontData);
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('sans-serif', config.favSans2.font);
      }
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }

      // Update button text temporarily to show feedback
      applyFavSans2Btn.textContent = "✔ Applied";
      setTimeout(() => {
        applyFavSans2Btn.textContent = "Fav Sans 2";
      }, 1500);
    }));

  } catch (e) {
    console.error("Error applying favorite sans-serif 2 font.");
    console.error(e);
  }
}));

// Apply Fav Serif 2 button functionality
const applySerif2Btn = document.getElementById("apply-serif-2-btn");
applySerif2Btn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: config.favSerif2.font,
    serif_weight: config.favSerif2.weight || "Default",
    serif_size: config.favSerif2.size,
    sans_serif: "Default",
    sans_serif_weight: "Default",
    sans_serif_size: "Default",
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite serif 2 axes
    serif_var_axes: config.favSerif2.var_axes || {},
    sans_serif_var_axes: {},
    monospace_var_axes: {},
    // Opsz control - use favorite serif 2 opsz control
    serif_opsz_control: config.favSerif2.opsz_control || 'Default',
    sans_serif_opsz_control: 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
      // Apply the font
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: fontData,
      });

      // Save to storage
      const domain = new URL(tabs[0].url).hostname;
      yield browser.storage.sync.set({
        [domain]: fontData,
      });

      // Update global fonts if global is enabled and site not exempted
      const exempts_list = yield browser.storage.sync.get(["exempts"]);
      if (!("exempts" in exempts_list && exempts_list["exempts"].includes(domain))) {
        const result = yield browser.storage.sync.get(["global"]);
        if ("global" in result && result["global"]) {
          yield browser.storage.sync.set({
            global_fonts: fontData,
          });
        }
      }

      // Update UI placeholders
      updatePlaceholders(fontData);
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('serif', config.favSerif2.font);
      }
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }
    }));

    // Update button text temporarily
    applySerif2Btn.textContent = "✔ Applied";
    setTimeout(() => {
      applySerif2Btn.textContent = "Fav Serif 2";
    }, 1500);

  } catch (e) {
    console.error("Error applying Fav Serif 2 font.");
    console.error(e);
  }
}));

// Apply Fav Serif 2 to Sans button functionality
const applySerif2ToSansBtn = document.getElementById("apply-serif-2-to-sans-btn");
applySerif2ToSansBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: "Default",
    serif_weight: "Default",
    serif_size: "Default",
    sans_serif: config.favSerif2.font,
    sans_serif_weight: config.favSerif2.weight || "Default",
    sans_serif_size: config.favSerif2.size,
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite serif 2 axes for sans-serif
    serif_var_axes: {},
    sans_serif_var_axes: config.favSerif2.var_axes || {},
    monospace_var_axes: {},
    // Opsz control - use favorite serif 2 opsz control for sans-serif
    serif_opsz_control: 'Default',
    sans_serif_opsz_control: config.favSerif2.opsz_control || 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
      // Apply the font
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: fontData,
      });

      // Save to storage
      const domain = new URL(tabs[0].url).hostname;
      yield browser.storage.sync.set({
        [domain]: fontData,
      });

      // Update global fonts if global is enabled and site not exempted
      const exempts_list = yield browser.storage.sync.get(["exempts"]);
      if (!("exempts" in exempts_list && exempts_list["exempts"].includes(domain))) {
        const result = yield browser.storage.sync.get(["global"]);
        if ("global" in result && result["global"]) {
          yield browser.storage.sync.set({
            global_fonts: fontData,
          });
        }
      }

      // Update UI placeholders
      updatePlaceholders(fontData);
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('sans-serif', config.favSerif2.font);
      }
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }
    }));

    // Update button text temporarily
    applySerif2ToSansBtn.textContent = "✔ Applied";
    setTimeout(() => {
      applySerif2ToSansBtn.textContent = "Fav Serif 2 to Sans";
    }, 1500);

  } catch (e) {
    console.error("Error applying Fav Serif 2 to Sans font.");
    console.error(e);
  }
}));

// Apply Fav Serif to Sans button functionality
const applySerifToSansBtn = document.getElementById("apply-serif-to-sans-btn");
applySerifToSansBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  // Get current configuration from storage
  const result = yield browser.storage.sync.get(['favFontsConfig']);
  const config = result.favFontsConfig || DEFAULT_FAV_FONTS;

  const fontData = {
    serif: "Default",
    serif_weight: "Default",
    serif_size: "Default",
    sans_serif: config.favSerif.font,
    sans_serif_weight: config.favSerif.weight || "Default",
    sans_serif_size: config.favSerif.size,
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default",
    // Variable font axes - use favorite serif axes for sans-serif
    serif_var_axes: {},
    sans_serif_var_axes: config.favSerif.var_axes || {},
    monospace_var_axes: {},
    // Opsz control - use favorite serif opsz control for sans-serif
    serif_opsz_control: 'Default',
    sans_serif_opsz_control: config.favSerif.opsz_control || 'Default',
    monospace_opsz_control: 'Default'
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) =>
      __awaiter(this, void 0, void 0, function* () {
      // Apply the font
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: fontData,
      });

      // Save to storage
      const domain = new URL(tabs[0].url).hostname;
      yield browser.storage.sync.set({
        [domain]: fontData,
      });

      // Update global fonts if global is enabled and site not exempted
      const exempts_list = yield browser.storage.sync.get(["exempts"]);
      if (!("exempts" in exempts_list && exempts_list["exempts"].includes(domain))) {
        const result = yield browser.storage.sync.get(["global"]);
        if ("global" in result && result["global"]) {
          yield browser.storage.sync.set({
            global_fonts: fontData,
          });
        }
      }

      // Update UI placeholders
      updatePlaceholders(fontData);
      if (window.toggleVariableFontControls) {
        window.toggleVariableFontControls('sans-serif', config.favSerif.font);
      }
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }
    }));

    // Update button text temporarily
    applySerifToSansBtn.textContent = "✔ Applied";
    setTimeout(() => {
      applySerifToSansBtn.textContent = "Fav Serif to Sans";
    }, 1500);

  } catch (e) {
    console.error("Error applying Fav Serif to Sans font.");
    console.error(e);
  }
}));

// Reset Domain Settings button functionality
const initializeResetDomainButton = () => {
  console.log("Setting up reset domain button...");
  const resetDomainSettingsBtn = document.getElementById("reset-domain-settings-btn");
  console.log("Reset domain button element:", resetDomainSettingsBtn);

  if (resetDomainSettingsBtn) {
  console.log("Adding click event listener to reset domain button...");
  resetDomainSettingsBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
    console.log("RESET DOMAIN BUTTON CLICKED!");

    // Immediate visual feedback to show button was clicked
    resetDomainSettingsBtn.textContent = "Processing...";
    resetDomainSettingsBtn.style.backgroundColor = "#f59e0b";
    resetDomainSettingsBtn.style.borderColor = "#f59e0b";

    try {
      console.log("Reset Domain: Starting reset process...");

      // Get current domain
      const tabs = yield browser.tabs.query({ active: true, currentWindow: true });
      console.log("Reset Domain: Got tabs:", tabs.length);

      if (tabs.length === 0) {
        throw new Error("No active tab found");
      }

      const domain = new URL(tabs[0].url).hostname;
      console.log("Reset Domain: Domain:", domain);

      // Remove domain-specific settings from storage
      console.log("Reset Domain: Removing storage for domain...");
      yield browser.storage.sync.remove([domain]);
      console.log("Reset Domain: Storage removed successfully");

      // Clear UI placeholders to show defaults
      const defaultFontData = {
        serif: "Default",
        serif_weight: "Default",
        serif_size: "Default",
        sans_serif: "Default",
        sans_serif_weight: "Default",
        sans_serif_size: "Default",
        monospace: "Default",
        monospace_weight: "Default",
        monospace_size: "Default",
        serif_line_height: "Default",
        sans_serif_line_height: "Default",
        monospace_line_height: "Default",
        serif_color: "Default",
        sans_serif_color: "Default",
        monospace_color: "Default",
        serif_var_axes: {},
        sans_serif_var_axes: {},
        monospace_var_axes: {},
        serif_opsz_control: 'Default',
        sans_serif_opsz_control: 'Default',
        monospace_opsz_control: 'Default'
      };

      updatePlaceholders(defaultFontData);

      // Remove restore button if it exists
      if (formButtons.contains(restoreButton)) {
        formButtons.removeChild(restoreButton);
      }

      // Send reset message to content script
      console.log("Reset Domain: Sending reset message to content script...");
      browser.tabs.connect(tabs[0].id).postMessage({
        type: "apply_font",
        data: defaultFontData,
      });
      console.log("Reset Domain: Message sent successfully");

      // Update button text temporarily with enhanced visibility
      console.log("Reset Domain: Updating button to success state...");
      resetDomainSettingsBtn.textContent = "✔ Reset Complete";
      resetDomainSettingsBtn.style.backgroundColor = "#10b981";
      resetDomainSettingsBtn.style.borderColor = "#10b981";
      setTimeout(() => {
        resetDomainSettingsBtn.textContent = "Reset Domain";
        resetDomainSettingsBtn.style.backgroundColor = "#ff6b35";
        resetDomainSettingsBtn.style.borderColor = "#ff6b35";
      }, 1500);

      console.log(`Fontonic: Domain settings reset for ${domain}`);
    } catch (e) {
      console.error("Error resetting domain settings:", e);
      resetDomainSettingsBtn.textContent = "❌ Error";
      resetDomainSettingsBtn.style.backgroundColor = "#dc2626";
      resetDomainSettingsBtn.style.borderColor = "#dc2626";
      setTimeout(() => {
        resetDomainSettingsBtn.textContent = "Reset Domain";
        resetDomainSettingsBtn.style.backgroundColor = "#ff6b35";
        resetDomainSettingsBtn.style.borderColor = "#ff6b35";
      }, 1500);
    }
  }));
  } else {
    console.error("Reset domain button not found!");
  }
};

// Reset Timing Test button functionality
const resetTimingTestBtn = document.getElementById("reset-timing-test-btn");
if (resetTimingTestBtn) {
  resetTimingTestBtn.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
  try {
    // Clear the stored performance test result
    yield browser.storage.local.remove('fontonicPerformanceTest');

    // Update button text temporarily
    resetTimingTestBtn.textContent = "✔ Test Reset";
    setTimeout(() => {
      resetTimingTestBtn.textContent = "Reset Test";
    }, 1500);

    console.log("Fontonic: Performance test cache cleared");

  } catch (e) {
    console.error("Error resetting performance test:");
    console.error(e);

    resetTimingTestBtn.textContent = "❌ Error";
    setTimeout(() => {
      resetTimingTestBtn.textContent = "Reset Test";
    }, 1500);
  }
}));
}

// Reset triggers to defaults functionality
window.resetTriggers = () => __awaiter(this, void 0, void 0, function* () {
  try {
    // Retry getting DOM elements if needed
    let attempts = 0;
    while ((!sansSerifTriggersTextarea || !serifTriggersTextarea || !monospaceTriggersTextarea) && attempts < 10) {
      yield new Promise(resolve => setTimeout(resolve, 50));
      sansSerifTriggersTextarea = document.getElementById("sans-serif-triggers");
      serifTriggersTextarea = document.getElementById("serif-triggers");
      monospaceTriggersTextarea = document.getElementById("monospace-triggers");
      resetTriggersBtn = document.getElementById("reset-triggers-btn");
      attempts++;
    }

    if (!sansSerifTriggersTextarea || !serifTriggersTextarea || !monospaceTriggersTextarea || !resetTriggersBtn) {
      console.error("Trigger elements not initialized after retries");
      return;
    }

    yield browser.storage.sync.set({ fontTriggers: DEFAULT_TRIGGERS });

    // Update textareas with defaults
    sansSerifTriggersTextarea.value = DEFAULT_TRIGGERS.sansSerifTriggers.join('\n');
    serifTriggersTextarea.value = DEFAULT_TRIGGERS.serifTriggers.join('\n');
    monospaceTriggersTextarea.value = DEFAULT_TRIGGERS.monospaceTriggers.join('\n');

    // Update textarea heights to match number of default values
    sansSerifTriggersTextarea.rows = Math.max(3, DEFAULT_TRIGGERS.sansSerifTriggers.length);
    serifTriggersTextarea.rows = Math.max(3, DEFAULT_TRIGGERS.serifTriggers.length);
    monospaceTriggersTextarea.rows = Math.max(3, DEFAULT_TRIGGERS.monospaceTriggers.length);

    // Update button text temporarily
    resetTriggersBtn.textContent = "✔ All Reset";
    setTimeout(() => {
      resetTriggersBtn.textContent = "Reset All to Defaults";
    }, 1500);

    console.log("Fontonic: Font triggers reset to defaults - textareas updated");

  } catch (e) {
    console.error("Error resetting font triggers:", e);

    if (resetTriggersBtn) {
      resetTriggersBtn.textContent = "❌ Error";
      setTimeout(() => {
        resetTriggersBtn.textContent = "Reset All to Defaults";
      }, 1500);
    }
  }
});

// Configuration for each axis
const getAxisConfig = (axis) => {
  const configs = {
    'wght': { label: 'Weight', min: 100, max: 1000, default: 400 },
    'wdth': { label: 'Width', min: 25, max: 151, default: 100 },
    'opsz': { label: 'Optical Size', min: 8, max: 144, default: 14 },
    'GRAD': { label: 'Grade', min: -200, max: 150, default: 0 },
    'slnt': { label: 'Slant', min: -15, max: 0, default: 0 },
    'XTRA': { label: 'XTRA', min: 323, max: 603, default: 468 },
    'XOPQ': { label: 'XOPQ', min: 27, max: 175, default: 96 },
    'YOPQ': { label: 'YOPQ', min: 25, max: 135, default: 79 },
    'YTLC': { label: 'YTLC', min: 416, max: 570, default: 514 },
    'YTUC': { label: 'YTUC', min: 497, max: 1000, default: 712 },
    'YTAS': { label: 'YTAS', min: 649, max: 854, default: 750 },
    'YTDE': { label: 'YTDE', min: -305, max: -98, default: -203 },
    'YTFI': { label: 'YTFI', min: 560, max: 788, default: 738 },
    'CASL': { label: 'Casual', min: 0, max: 1, default: 0 },
    'MONO': { label: 'Monospace', min: 0, max: 1, default: 0 },
    'CRSV': { label: 'Cursive', min: 0, max: 1, default: 0 }
  };
  return configs[axis] || { label: axis, min: 0, max: 100, default: 50 };
};

// DRY function to handle axis control state changes
const handleAxisControlChange = (fontType, axis, value, slider, valueSpan) => {
  const axisConfig = getAxisConfig(axis);
  
  if (value === 'Default') {
    // Gray out and disable slider, show actual default value
    slider.disabled = true;
    slider.style.opacity = '0.5';
    valueSpan.style.opacity = '0.5';
    valueSpan.textContent = axisConfig.default;
    // Reset slider to default value visually
    slider.value = axisConfig.default;
  } else {
    // Enable slider, restore normal appearance
    slider.disabled = false;
    slider.style.opacity = '1';
    valueSpan.style.opacity = '1';
    valueSpan.textContent = slider.value;
  }
  // Parameters fontType and axis kept for potential future use
};

// Variable Font Axis Controls
const initializeVariableFontControls = () => {
  // Define which fonts support variable axes
  const variableFonts = {
    'Roboto Flex': ['wght', 'wdth', 'opsz', 'GRAD', 'slnt', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI'],
    'Roboto FlexL': ['wght', 'wdth', 'opsz', 'GRAD', 'slnt', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI'],
    'Roboto Serif': ['wght', 'wdth', 'opsz', 'GRAD'],
    'Merriweather': ['wght', 'wdth', 'opsz'],
    'MerriweatherL': ['wght', 'wdth', 'opsz'],
    'Rubik': ['wght'],
    'RubikL': ['wght'],
    'Roboto Mono': ['wght'],
    'Recursive': ['wght', 'slnt', 'CASL', 'MONO', 'CRSV']
  };

  // Function to show/hide variable font controls
  const toggleVariableFontControls = (fontType, selectedFont) => {
    const axesContainer = document.getElementById(`${fontType}-var-axes`);
    const isVariableFont = variableFonts[selectedFont];
    const hasOpszAxis = isVariableFont && variableFonts[selectedFont].includes('opsz');

    if (axesContainer) {
      if (isVariableFont) {
        axesContainer.style.display = 'block';
        // Set up sliders for this specific font
        setupSlidersForFont(fontType, selectedFont, variableFonts[selectedFont]);
      } else {
        axesContainer.style.display = 'none';
      }
    }

    // Show/hide opsz control dropdown
    const opszControl = document.getElementById(`${fontType.replace('-', '_')}_opsz_control`);
    if (opszControl) {
      if (hasOpszAxis) {
        opszControl.style.visibility = 'visible';
      } else {
        opszControl.style.visibility = 'hidden';
      }
    }

    // Update weight dropdown for variable fonts (all font types)
    updateWeightDropdown(fontType, isVariableFont);
  };

  // Make toggleVariableFontControls globally available
  window.toggleVariableFontControls = toggleVariableFontControls;

  // Function to update weight dropdown based on font type
  const updateWeightDropdown = (fontType, isVariableFont) => {
    let weightSelect;

    if (fontType === 'serif') {
      weightSelect = serifWeightSelect;
    } else if (fontType === 'sans-serif') {
      weightSelect = sansSerifWeightSelect;
    } else if (fontType === 'monospace') {
      weightSelect = monospaceWeightSelect;
    } else if (fontType === 'fav-serif') {
      weightSelect = favSerifWeightSelect;
    } else if (fontType === 'fav-sans') {
      weightSelect = favSansWeightSelect;
    } else if (fontType === 'fav-serif-2') {
      weightSelect = favSerif2WeightSelect;
    }

    if (weightSelect) {
      // Store current value
      const currentValue = weightSelect.value;

      // Repopulate with or without slider option
      populateWeights(weightSelect, isVariableFont);

      // Restore previous value if it still exists
      if (currentValue && Array.from(weightSelect.options).some(opt => opt.value === currentValue)) {
        weightSelect.value = currentValue;
      }

      // Add event listener for "Use Slider" option
      if (isVariableFont) {
        weightSelect.addEventListener('change', (e) => {
          if (e.target.value === 'slider') {
            // When "Use Slider" is selected, the weight will be controlled by the variable font weight slider
            console.log(`Using slider for ${fontType} weight`);
          }
        });
      }
    }
  };

  // Function to set up sliders for a specific font
  const setupSlidersForFont = (fontType, _fontName, supportedAxes) => {
    const axesContainer = document.getElementById(`${fontType}-var-axes`);
    const collapseContent = axesContainer?.querySelector('.collapse-content');
    
    if (!collapseContent) {
      console.warn(`No collapse content found for ${fontType}`);
      return;
    }
    
    // Always use dynamic approach - clear and recreate sliders
    collapseContent.innerHTML = '<div class="grid gap-4 text-4xl"></div>';
    const container = collapseContent.querySelector('.grid');
    
    // Create sliders for each supported axis
    supportedAxes.forEach(axis => {
      createSliderForAxis(container, fontType, axis);
    });
  };

  // Helper function to create a slider for a specific axis
  const createSliderForAxis = (container, fontType, axis) => {
    const axisConfig = getAxisConfig(axis);
    
    const sliderRow = document.createElement('div');
    sliderRow.className = 'flex items-center gap-4';
    
    // All axes now have Default/Override dropdown pattern
    const controlId = `${fontType.replace('-', '_')}_${axis}_control`;
    sliderRow.innerHTML = `
      <label class="w-32">${axisConfig.label}:</label>
      <select class="text-2xl" id="${controlId}" name="${controlId}">
        <option value="Default">Default</option>
        <option value="Override">Override</option>
      </select>
      <input type="range" id="${fontType}-${axis}-slider" min="${axisConfig.min}" max="${axisConfig.max}" value="${axisConfig.default}" class="flex-1" />
      <span id="${fontType}-${axis}-value" class="w-16 text-center">${axisConfig.default}</span>
    `;
    
    container.appendChild(sliderRow);
    
    // Add event listeners
    const slider = sliderRow.querySelector('input[type="range"]');
    const valueSpan = sliderRow.querySelector('span');
    const dropdown = sliderRow.querySelector('select');
    
    // Update value display when slider changes
    slider.addEventListener('input', (e) => {
      valueSpan.textContent = e.target.value;
    });
    
    // Handle Default/Override dropdown changes
    dropdown.addEventListener('change', (e) => {
      handleAxisControlChange(fontType, axis, e.target.value, slider, valueSpan);
    });
    
    // Initialize with Default state (grayed out and disabled)
    handleAxisControlChange(fontType, axis, 'Default', slider, valueSpan);
  };


  // Add event listeners to font selects
  const fontSelects = [
    { select: serifSelect, type: 'serif' },
    { select: sansSerifSelect, type: 'sans-serif' },
    { select: monospaceSelect, type: 'monospace' }
  ];

  fontSelects.forEach(({ select, type }) => {
    select.addEventListener('change', (e) => {
      window.toggleVariableFontControls(type, e.target.value);
    });
  });

  // Add event listeners to favorite font selects
  const favFontSelects = [
    { select: favSerifFontSelect, type: 'fav-serif' },
    { select: favSansFontSelect, type: 'fav-sans' },
    { select: favSans2FontSelect, type: 'fav-sans-2' },
    { select: favSerif2FontSelect, type: 'fav-serif-2' }
  ];

  favFontSelects.forEach(({ select, type }) => {
    select.addEventListener('change', (e) => {
      window.toggleVariableFontControls(type, e.target.value);
    });
  });

  // Add event listeners for opsz control dropdowns
  const opszControls = [
    { select: document.getElementById('serif_opsz_control'), type: 'serif' },
    { select: document.getElementById('sans_serif_opsz_control'), type: 'sans-serif' },
    { select: document.getElementById('monospace_opsz_control'), type: 'monospace' },
    { select: document.getElementById('fav_serif_opsz_control'), type: 'fav-serif' },
    { select: document.getElementById('fav_sans_opsz_control'), type: 'fav-sans' },
    { select: document.getElementById('fav_serif_2_opsz_control'), type: 'fav-serif-2' }
  ];

  opszControls.forEach(({ select, type }) => {
    if (select) {
      select.addEventListener('change', (e) => {
        handleOpszControlChange(type, e.target.value);
      });
    }
  });

  // Add event listeners to all sliders for real-time value updates
  const addSliderEventListeners = (fontType) => {
    const allAxes = ['wght', 'wdth', 'opsz', 'GRAD', 'slnt', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI'];

    allAxes.forEach(axis => {
      const slider = document.getElementById(`${fontType}-${axis}-slider`);
      const valueDisplay = document.getElementById(`${fontType}-${axis}-value`);

      if (slider && valueDisplay) {
        slider.addEventListener('input', (e) => {
          valueDisplay.textContent = e.target.value;
          // Update font preview if needed
          updateFontPreview(fontType);
        });
      }
    });
  };

  // Function to update font preview with variable axes
  const updateFontPreview = (fontType) => {
    // This could be expanded to show live preview of font changes
    console.log(`Font preview updated for ${fontType}`);
  };

  // Function to generate font-variation-settings CSS
  const generateFontVariationSettings = (fontType) => {
    const selectedFont = fontSelects.find(f => f.type === fontType)?.select.value;
    if (!variableFonts[selectedFont]) return '';

    const settings = [];
    const supportedAxes = variableFonts[selectedFont];

    supportedAxes.forEach(axis => {
      const slider = document.getElementById(`${fontType}-${axis}-slider`);
      const control = document.getElementById(`${fontType.replace('-', '_')}_${axis}_control`);
      
      if (slider && control) {
        // Skip axes that are set to "Default" - applies to all axes now
        if (control.value === 'Default') {
          return;
        }

        // Only include axes set to "Override"
        const value = slider.value;
        settings.push(`"${axis}" ${value}`);
      }
    });

    return settings.length > 0 ? `font-variation-settings: ${settings.join(', ')};` : '';
  };

  // Initialize slider event listeners for all font types
  addSliderEventListeners('serif');
  addSliderEventListeners('sans-serif');
  addSliderEventListeners('monospace');
  addSliderEventListeners('fav-serif');
  addSliderEventListeners('fav-sans');
  addSliderEventListeners('fav-serif-2');

  // Function to handle opsz control changes
  const handleOpszControlChange = (fontType, value) => {
    const opszSlider = document.getElementById(`${fontType}-opsz-slider`);

    if (opszSlider) {
      if (value === 'Default') {
        // Hide the opsz slider when using automatic
        const opszSliderRow = opszSlider.closest('.flex');
        if (opszSliderRow) {
          opszSliderRow.style.opacity = '0.5';
          opszSlider.disabled = true;
        }
      } else if (value === 'override') {
        // Show and enable the opsz slider for manual control
        const opszSliderRow = opszSlider.closest('.flex');
        if (opszSliderRow) {
          opszSliderRow.style.opacity = '1';
          opszSlider.disabled = false;
        }
      }
    }
  };

  // Store the function globally for use in other parts of the code
  window.generateFontVariationSettings = generateFontVariationSettings;
  window.handleOpszControlChange = handleOpszControlChange;
  window.toggleVariableFontControls = toggleVariableFontControls;
};

// Store the initialization function globally so it can be called from the data loading section
window.initializeVariableFontControls = initializeVariableFontControls;

// Function to get current variable font axes values for saving
const getVariableFontAxesValues = (fontType) => {
  const axes = {};
  const allAxes = ['wght', 'wdth', 'opsz', 'GRAD', 'slnt', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI', 'CASL', 'MONO', 'CRSV'];

  allAxes.forEach(axis => {
    const slider = document.getElementById(`${fontType}-${axis}-slider`);
    const control = document.getElementById(`${fontType.replace('-', '_')}_${axis}_control`);
    
    // Only include axes that are set to "Override" (not "Default")
    if (slider && control && control.value === 'Override') {
      axes[axis] = slider.value;
    }
  });

  return axes;
};

// Function to set variable font axes values when loading saved settings
const setVariableFontAxesValues = (fontType, axesData) => {
  if (!axesData) return;

  const allAxes = ['wght', 'wdth', 'opsz', 'GRAD', 'slnt', 'XTRA', 'XOPQ', 'YOPQ', 'YTLC', 'YTUC', 'YTAS', 'YTDE', 'YTFI', 'CASL', 'MONO', 'CRSV'];
  
  allAxes.forEach(axis => {
    const slider = document.getElementById(`${fontType}-${axis}-slider`);
    const control = document.getElementById(`${fontType.replace('-', '_')}_${axis}_control`);
    const valueDisplay = document.getElementById(`${fontType}-${axis}-value`);

    if (slider && control && valueDisplay) {
      if (axesData[axis] !== undefined) {
        // Axis has a saved value - set to Override and restore value
        control.value = 'Override';
        slider.value = axesData[axis];
        handleAxisControlChange(fontType, axis, 'Override', slider, valueDisplay);
      } else {
        // Axis doesn't have a saved value - set to Default
        control.value = 'Default';
        handleAxisControlChange(fontType, axis, 'Default', slider, valueDisplay);
      }
    }
  });
};

// Initialize variable font controls when the page loads
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initializeVariableFontControls, 100);
});

