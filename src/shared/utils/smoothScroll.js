export const smoothScrollTo = (elementId) => {
  const element = document.querySelector(elementId);
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
};
