const exclusionSelectors = {
  "www.bloomberg.com": ['[data-component="subhead"]'],
};

const currentDomain = window.location.hostname;

const changeFontFamily = (
  node,
  serif,
  sansSerif,
  monospace,
  serifWeight,
  sansSerifWeight,
  monospaceWeight,
) => {
  if (
    node.nodeType === 1 &&
    exclusionSelectors[currentDomain] &&
    exclusionSelectors[currentDomain].some((selector) => node.matches(selector))
  ) {
    return;
  }
  if (node.nodeType === 1) {
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
          applied = true;
        } else if (!applied && serifTriggers.includes(font) && serif != "Default") {
          node.style.fontFamily = `'${serif}'`;
          node.style.fontWeight = serifWeight !== "Default" ? serifWeight : "";
          applied = true;
        } else if (!applied && monospaceTriggers.includes(font) && monospace != "Default") {
          node.style.fontFamily = `'${monospace}'`;
          node.style.fontWeight = monospaceWeight !== "Default" ? monospaceWeight : "";
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
    changeFontFamily(
      document.body,
      serif,
      sans_serif,
      monospace,
      serif_weight,
      sans_serif_weight,
      monospace_weight,
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
        changeFontFamily(
          document.body,
          serif,
          sans_serif,
          monospace,
          serif_weight,
          sans_serif_weight,
          monospace_weight,
        );
      } else if (message.type === "restore") {
        location.reload();
      } else if (message.type === "redirect") {
        window.open(message.data.redirect_url, "_blank");
      }
    }
  });
});
