/**
 * Micro-animations utility for adding products to cart
 */

export const animateFloatingNumber = (startElement: HTMLElement, quantity: number = 1) => {
  const startRect = startElement.getBoundingClientRect();

  // Create floating number indicator element
  const flyer = document.createElement('div');
  flyer.innerText = `+${quantity}`;
  flyer.style.position = 'fixed';
  flyer.style.zIndex = '99999';
  flyer.style.pointerEvents = 'none';
  flyer.style.fontSize = '24px';
  flyer.style.fontWeight = '900';
  flyer.style.color = '#f43f5e'; // primary brand color (Rose-500)
  flyer.style.textShadow = '0 2px 10px rgba(244, 63, 94, 0.5), 0 0 1px #ffffff';
  flyer.style.left = `${startRect.left + startRect.width / 2 - 15}px`;
  flyer.style.top = `${startRect.top - 15}px`;
  flyer.style.opacity = '1';
  flyer.style.transform = 'translateY(0) scale(1)';
  flyer.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

  document.body.appendChild(flyer);

  // Trigger animation transition in the next paint frame
  requestAnimationFrame(() => {
    flyer.style.top = `${startRect.top - 75}px`; // float up
    flyer.style.opacity = '0';
    flyer.style.transform = 'translateY(-20px) scale(1.35)'; // scale up and float up
  });

  // Cleanup element after animation finishes
  setTimeout(() => {
    if (flyer.parentNode) {
      flyer.parentNode.removeChild(flyer);
    }
  }, 800);
};
