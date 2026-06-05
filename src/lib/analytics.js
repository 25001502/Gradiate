const cleanParameters = (parameters = {}) =>
  Object.entries(parameters).reduce((cleaned, [key, value]) => {
    if (value === undefined || value === null || value === "") {
      return cleaned;
    }

    if (typeof value === "boolean") {
      cleaned[key] = value ? "true" : "false";
      return cleaned;
    }

    if (["string", "number"].includes(typeof value)) {
      cleaned[key] = value;
    }

    return cleaned;
  }, {});

export const trackEvent = (eventName, parameters = {}) => {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, cleanParameters(parameters));
};
