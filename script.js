
"use strict";
document.addEventListener("DOMContentLoaded", function () {

  document.querySelectorAll('a[href^="http"], a[href^="mailto:"], a[href^="tel:"] ').forEach(link => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});
