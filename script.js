"use strict";

document.addEventListener("DOMContentLoaded", function () {
  document
    .querySelectorAll('a[href^="http"], a[href^="mailto:"], a[href^="tel:"]')
    .forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
});

(function () {
  // Helpers para GA4
  function track(eventName, params) {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, params || {});
    }
  }
  function setUserProps(props) {
    if (typeof window.gtag === "function") {
      window.gtag("set", "user_properties", props || {});
    }
  }

  // Detección de device / OS / browser / tamaños
  function getDeviceCategory() {
    try {
      if (
        navigator.userAgentData &&
        navigator.userAgentData.mobile !== undefined
      ) {
        return navigator.userAgentData.mobile ? "mobile" : "desktop";
      }
    } catch (_) {}
    const ua = navigator.userAgent.toLowerCase();
    const isMobile =
      /iphone|ipod|android(?!.*tablet)|blackberry|windows phone|opera mini|mobile/i.test(
        ua
      );
    const isTablet = /ipad|tablet|kindle|silk/i.test(ua);
    if (isTablet) return "tablet";
    return isMobile ? "mobile" : "desktop";
  }
  function getOS() {
    const ua = navigator.userAgent;
    if (/Windows NT/i.test(ua)) return "Windows";
    if (/Mac OS X/i.test(ua) && !/like Mac OS X/i.test(ua)) return "macOS";
    if (/like Mac OS X|iPhone|iPad|iPod/i.test(ua)) return "iOS";
    if (/Android/i.test(ua)) return "Android";
    if (/Linux/i.test(ua)) return "Linux";
    return "Other";
  }
  function getBrowser() {
    const ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return "Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Chrome\//.test(ua) && !/Edg\//.test(ua) && !/OPR\//.test(ua))
      return "Chrome";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    return "Other";
  }
  function getViewport() {
    return `${window.innerWidth}x${window.innerHeight}`;
  }
  function getScreenRes() {
    return `${window.screen.width}x${window.screen.height}`;
  }

  // Enviar info de dispositivo una vez por sesión
  function sendDeviceInfoOnce() {
    try {
      const key = "ga4_device_info_sent";
      if (sessionStorage.getItem(key)) return;
      const payload = {
        device_category: getDeviceCategory(),
        os: getOS(),
        browser: getBrowser(),
        viewport: getViewport(),
        screen_resolution: getScreenRes(),
      };
      setUserProps(payload);
      track("device_info", payload);
      sessionStorage.setItem(key, "1");
    } catch (_) {}
  }

  //control de clicks
  function setupClickTracking() {
    document.querySelectorAll("nav.menu-bar .menu-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        track("menu_click", {
          menu_item: (btn.textContent || "").trim(),
          location: "header",
        });
      });
    });

    document.querySelectorAll("nav.menu-bar .submenu a").forEach((a) => {
      a.addEventListener("click", () => {
        const text = (a.textContent || "").trim();
        const url = a.href;

        track("nav_link_click", {
          link_text: text,
          link_url: url,
          location: "header",
          target: a.getAttribute("target") || "_self",
        });

        const lang = /cv\-en\.html/i.test(url)
          ? "en"
          : /cv\-es\.html/i.test(url)
          ? "es"
          : "other";
        if (lang !== "other") {
          track("cv_open", {
            language: lang,
            link_url: url,
            source: "menu_submenu",
          });
        }
      });
    });

    document.querySelectorAll(".lang-switcher .flag-link").forEach((a) => {
      a.addEventListener("click", () => {
        const lang =
          a.querySelector("span")?.textContent?.trim() ||
          a.getAttribute("aria-label") ||
          "unknown";
        track("language_switch", {
          language: lang, // SPA / PT
          link_url: a.href,
        });
      });
    });

    const cta = document.querySelector('.hero .btn-common[href^="#"]');
    if (cta) {
      cta.addEventListener("click", () => {
        track("cta_click", {
          cta_text: (cta.textContent || "").trim(),
          destination: cta.getAttribute("href"),
        });
      });
    }

    document
      .querySelectorAll(
        ".project-card a.btn-common, .project-card a.btn-project"
      )
      .forEach((a) => {
        a.addEventListener("click", () => {
          const card = a.closest(".project-card");
          const project =
            card?.querySelector("img")?.getAttribute("alt") ||
            "unknown_project";
          track("project_demo_click", {
            project: project,
            link_url: a.href,
          });
        });
      });

    document.querySelectorAll(".contact .social-icons a").forEach((a) => {
      a.addEventListener("click", () => {
        track("social_click", {
          network: a.getAttribute("aria-label") || a.href,
          link_url: a.href,
        });
      });
    });
  }

  //cvs descarga
  document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.querySelector(".download-container button");
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        if (typeof window.gtag === "function") {
          const lang = document.documentElement.lang || "unknown";

          const file =
            lang === "es"
              ? "Guzman-Lucia-CV-ES.pdf"
              : lang === "en"
              ? "Guzman-Lucia-CV-EN.pdf"
              : "other";

          window.gtag("event", "cv_download", {
            language: lang,
            file: file,
            location: window.location.pathname,
          });
        }
      });
    }
  });

  function setupSectionViews() {
    const seen = new Set();
    const sectionSelectors = [
      ".hero",
      ".about-me",
      "#backend-projects",
      "#web-proyects",
      "#contact",
    ];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id =
              entry.target.getAttribute("id") ||
              entry.target.getAttribute("class") ||
              "section";
            if (!seen.has(id)) {
              seen.add(id);
              track("section_view", { section: id });
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    sectionSelectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) io.observe(el);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (typeof window.gtag !== "function") return; // si GA no cargó, no hacemos nada
    sendDeviceInfoOnce();
    setupClickTracking();
    setupSectionViews();
  });

  window.addEventListener("resize", function () {
    try {
      setUserProps({ viewport: `${window.innerWidth}x${window.innerHeight}` });
    } catch (_) {}
  });
})();
