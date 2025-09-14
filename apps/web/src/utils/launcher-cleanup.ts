/**
 * Utility to clean up duplicate launcher elements and ensure proper positioning
 */

export function cleanupDuplicateLaunchers() {
  // Remove any existing launcher elements that are not in the correct position
  const launchers = document.querySelectorAll('[class*="launcher"], .global-launcher, [data-launcher]');
  
  launchers.forEach((launcher) => {
    const element = launcher as HTMLElement;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // Check if element is positioned at bottom-left or has incorrect positioning
    const isBottomLeft = style.bottom !== 'auto' && style.left !== 'auto';
    const isNotTopRight = style.top === 'auto' || style.right === 'auto';
    
    if (isBottomLeft || (isNotTopRight && style.position === 'fixed')) {
      console.log('Removing duplicate/misplaced launcher:', element);
      element.remove();
    }
  });
  
  // Force correct positioning for any remaining launchers
  const remainingLaunchers = document.querySelectorAll('[class*="launcher"], .global-launcher');
  remainingLaunchers.forEach((launcher) => {
    const element = launcher as HTMLElement;
    if (element.style.position === 'fixed') {
      element.style.top = '16px';
      element.style.right = '16px';
      element.style.bottom = 'auto';
      element.style.left = 'auto';
      element.style.zIndex = '40';
    }
  });
}

// Auto-cleanup on DOM changes
export function setupLauncherCleanup() {
  // Initial cleanup
  cleanupDuplicateLaunchers();
  
  // Watch for new elements being added
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if the added element is a launcher or contains launchers
          const isLauncher = element.classList.toString().includes('launcher') ||
                           element.getAttribute('data-launcher') !== null;
          
          const containsLaunchers = element.querySelectorAll('[class*="launcher"], .global-launcher, [data-launcher]').length > 0;
          
          if (isLauncher || containsLaunchers) {
            setTimeout(cleanupDuplicateLaunchers, 100); // Small delay to let element fully render
          }
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
}
