const exclusionSelectors = {
  "www.bloomberg.com": ['[data-component="subhead"]'],
};

const currentDomain = window.location.hostname;

const SKIP_SELECTOR =
  'i,[class*="icon"],[class*="fa-"],svg,code,pre,kbd,samp,h1,h2,h3,h4,h5,h6,button';
function shouldSkip(el) {
  if (el.closest('.app-banner')) return true;
  if (el.closest('.byline-wrapper')) return true;
  if (el.closest('.byline')) return true;
  if (el.closest('.titleContainer-DJYq5v')) return true;
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
    if (fontFamily) {
      // Normalize to lowercase for robust matching
      const fontFamilyLower = fontFamily.toLowerCase();
      // Split into array for order-sensitive matching
      const fontList = fontFamilyLower
        .split(",")
        .map(f => f.trim().replace(/^["']|["']$/g, "")); // Remove leading/trailing quotes

      // Define triggers for each type
      const sansSerifTriggers = [
        "sans-serif",
        "arial",
        "helvetica",
        "open sans",
        "open sans-fallback",
        "verdana"
      ];
      const serifTriggers = [
        "serif",
        "georgia",
        "times",
        "times new roman"
      ];
      const monospaceTriggers = [
        "monospace",
        "courier",
        "courier new"
      ];

      let applied = false;
      for (const font of fontList) {
        if (!applied && sansSerifTriggers.includes(font) && sansSerif != "Default") {
          node.style.fontFamily = `'${sansSerif}'`;
          node.style.fontWeight = sansSerifWeight !== "Default" ? sansSerifWeight : "";
          node.style.fontSize =
            sansSerifSize !== "Default" ? `${sansSerifSize}px` : "";
          applied = true;
        } else if (!applied && serifTriggers.includes(font) && serif != "Default") {
          node.style.fontFamily = `'${serif}'`;
          node.style.fontWeight = serifWeight !== "Default" ? serifWeight : "";
          node.style.fontSize =
            serifSize !== "Default" ? `${serifSize}px` : "";
          applied = true;
        } else if (!applied && monospaceTriggers.includes(font) && monospace != "Default") {
          node.style.fontFamily = `'${monospace}'`;
          node.style.fontWeight =
            monospaceWeight !== "Default" ? monospaceWeight : "";
          node.style.fontSize =
            monospaceSize !== "Default" ? `${monospaceSize}px` : "";
          applied = true;
        }
      }
    }
  }
  // Recursively process child nodes
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
};

let message = {
  action: "on-page-load",
  domain: currentDomain,
};
// Tries to load font when page is loaded
browser.runtime.sendMessage(message, undefined, (response) => {
  if (response.type === "apply_font") {
    console.log("Loading fonts from storage");
    const serif = response.data.serif;
    const sans_serif = response.data.sans_serif;
    const monospace = response.data.monospace;
    const serif_weight = response.data.serif_weight || "Default";
    const sans_serif_weight = response.data.sans_serif_weight || "Default";
    const monospace_weight = response.data.monospace_weight || "Default";
    const serif_size = response.data.serif_size || "Default";
    const sans_serif_size = response.data.sans_serif_size || "Default";
    const monospace_size = response.data.monospace_size || "Default";
    changeFontFamily(
      document.body,
      serif,
      sans_serif,
      monospace,
      serif_weight,
      sans_serif_weight,
      monospace_weight,
      serif_size,
      sans_serif_size,
      monospace_size,
    );
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
        const serif = message.data.serif;
        const sans_serif = message.data.sans_serif;
        const monospace = message.data.monospace;
        const serif_weight = message.data.serif_weight || "Default";
        const sans_serif_weight = message.data.sans_serif_weight || "Default";
        const monospace_weight = message.data.monospace_weight || "Default";
        const serif_size = message.data.serif_size || "Default";
        const sans_serif_size = message.data.sans_serif_size || "Default";
        const monospace_size = message.data.monospace_size || "Default";
        changeFontFamily(
          document.body,
          serif,
          sans_serif,
          monospace,
          serif_weight,
          sans_serif_weight,
          monospace_weight,
          serif_size,
          sans_serif_size,
          monospace_size,
        );
      } else if (message.type === "restore") {
        location.reload();
      } else if (message.type === "redirect") {
        window.open(message.data.redirect_url, "_blank");
      }
    }
  });
});
