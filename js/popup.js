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
const favSerifToSansFontSelect = document.getElementById("fav-serif-to-sans-font");
const favSerifToSansSizeSelect = document.getElementById("fav-serif-to-sans-size");
const favSerifToSansWeightSelect = document.getElementById("fav-serif-to-sans-weight");
const saveFavConfigBtn = document.getElementById("save-fav-config-btn");
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
};
getDomain().then((domain) => {
  browser.storage.sync.get([domain]).then((result) => {
    if (Object.keys(result).length != 0) {
      const fontData = result[domain];
      updatePlaceholders(fontData);
      formButtons.prepend(restoreButton);
    }
  });
});
// load locally installed fonts
// Load fonts into the  dropdowns
const populateFonts = (element) => {
  // Add Default option as the first selectable option
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "← Reset to Default";
  element.appendChild(defaultOption);

  [
    // high frequency serif
    "Merriweather",
    "TiemposText",
    "TiemposText-Regular",
    "Literata",
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
const populateWeights = (element) => {
  // Add Default option as the first selectable option
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
populateWeights(globalSerifWeightSelect);
populateWeights(globalSansSerifWeightSelect);
populateWeights(globalMonospaceWeightSelect);

// Populate favorite fonts selectors
populateFonts(favSerifFontSelect);
populateFonts(favSansFontSelect);
populateFonts(favSerifToSansFontSelect);
populateWeights(favSerifWeightSelect);
populateWeights(favSansWeightSelect);
populateWeights(favSerifToSansWeightSelect);

// Default favorite fonts configuration
const DEFAULT_FAV_FONTS = {
  favSerif: { font: "Merriweather", size: "16", weight: "" },
  favSans: { font: "Rubik", size: "17", weight: "" },
  favSerifToSans: { font: "Merriweather", size: "16", weight: "" }
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
    
    favSerifToSansFontSelect.value = config.favSerifToSans.font;
    favSerifToSansSizeSelect.value = config.favSerifToSans.size;
    favSerifToSansWeightSelect.value = config.favSerifToSans.weight;
    
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
        weight: favSerifWeightSelect.value || ""
      },
      favSans: {
        font: favSansFontSelect.value || "Rubik",
        size: favSansSizeSelect.value || "17",
        weight: favSansWeightSelect.value || ""
      },
      favSerifToSans: {
        font: favSerifToSansFontSelect.value || "Merriweather",
        size: favSerifToSansSizeSelect.value || "16",
        weight: favSerifToSansWeightSelect.value || ""
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
    monospace_color: "Default"
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => __awaiter(this, void 0, void 0, function* () {
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
      if (!formButtons.contains(restoreButton)) {
        formButtons.prepend(restoreButton);
      }
    }));

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
    monospace_color: "Default"
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => __awaiter(this, void 0, void 0, function* () {
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
    sans_serif: config.favSerifToSans.font,
    sans_serif_weight: config.favSerifToSans.weight || "Default",
    sans_serif_size: config.favSerifToSans.size,
    monospace: "Default",
    monospace_weight: "Default",
    monospace_size: "Default",
    serif_line_height: "Default",
    sans_serif_line_height: "Default",
    monospace_line_height: "Default",
    serif_color: "Default",
    sans_serif_color: "Default",
    monospace_color: "Default"
  };

  try {
    browser.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => __awaiter(this, void 0, void 0, function* () {
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
    console.error("Error applying serif to sans-serif font.");
    console.error(e);
  }
}));

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

