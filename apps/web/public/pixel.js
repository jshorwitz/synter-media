// Synter Conversion Tracking Pixel
(function(window, document) {
  'use strict';

  // Get tracking ID from script src
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const src = currentScript.src;
  const urlParams = new URLSearchParams(src.split('?')[1]);
  const trackingId = urlParams.get('id');

  if (!trackingId) {
    console.error('Synter: No tracking ID provided');
    return;
  }

  // Initialize Synter object
  window.synter = window.synter || {};

  // Track function
  window.synter.track = function(event, properties) {
    properties = properties || {};

    // Capture URL parameters for attribution
    const urlParams = new URLSearchParams(window.location.search);
    const attribution = {
      gclid: urlParams.get('gclid') || getCookie('synter_gclid'),
      utm_source: urlParams.get('utm_source') || getCookie('synter_utm_source'),
      utm_medium: urlParams.get('utm_medium') || getCookie('synter_utm_medium'),
      utm_campaign: urlParams.get('utm_campaign') || getCookie('synter_utm_campaign'),
      utm_term: urlParams.get('utm_term') || getCookie('synter_utm_term'),
      utm_content: urlParams.get('utm_content') || getCookie('synter_utm_content'),
      referrer: document.referrer,
      page_url: window.location.href,
      page_title: document.title,
    };

    // Store attribution in cookies (90 days)
    if (urlParams.get('gclid')) setCookie('synter_gclid', urlParams.get('gclid'), 90);
    if (urlParams.get('utm_source')) setCookie('synter_utm_source', urlParams.get('utm_source'), 90);
    if (urlParams.get('utm_medium')) setCookie('synter_utm_medium', urlParams.get('utm_medium'), 90);
    if (urlParams.get('utm_campaign')) setCookie('synter_utm_campaign', urlParams.get('utm_campaign'), 90);

    // Send to Synter
    const endpoint = currentScript.src.split('/pixel.js')[0] + '/api/conversions/track';
    
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tracking_id: trackingId,
        event: event,
        properties: Object.assign({}, properties, attribution),
      }),
    }).catch(function(err) {
      console.error('Synter tracking error:', err);
    });
  };

  // Auto-track page views
  window.synter.track('pageview');

  // Helper functions
  function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax';
  }

  function getCookie(name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  console.log('Synter conversion tracking initialized:', trackingId);
})(window, document);
