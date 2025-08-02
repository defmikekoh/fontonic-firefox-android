const changeFontFamily = (
  node,
  serif,
  sansSerif,
  monospace,
  serifWeight,
  sansSerifWeight,
  monospaceWeight
) => {
  if (node.nodeType === 1) {
    const computedStyle = window.getComputedStyle(node);
    const fontFamily = computedStyle.getPropertyValue("font-family");
    if (fontFamily) {
      if (
        (fontFamily.includes("sans-serif") ||
          fontFamily.includes("Open Sans-fallback")) &&
        sansSerif != "Default"
      ) {
        node.style.fontFamily = `'${sansSerif}'`;
        if (sansSerifWeight !== "Default")
          node.style.fontWeight = sansSerifWeight;
        else node.style.fontWeight = "";
      } else if (fontFamily.includes("serif") && serif != "Default") {
        node.style.fontFamily = `'${serif}'`;
        if (serifWeight !== "Default")
          node.style.fontWeight = serifWeight;
        else node.style.fontWeight = "";
      } else if (fontFamily.includes("monospace") && monospace != "Default") {
        node.style.fontFamily = `'${monospace}'`;
        if (monospaceWeight !== "Default")
          node.style.fontWeight = monospaceWeight;
        else node.style.fontWeight = "";
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
      monospaceWeight
    );
  }
};

let message = {
  action: "on-page-load",
  domain: window.location.hostname,
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
      monospace_weight
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
          monospace_weight
        );
      } else if (message.type === "restore") {
        location.reload();
      } else if (message.type === "redirect") {
        window.open(message.data.redirect_url, "_blank");
      }
    }
  });
});
