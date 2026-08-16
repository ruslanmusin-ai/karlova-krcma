const content = {
  hero: {
    title: "Karlova Krčma",
    subtitle: "Traditional Czech brewing technology"
  }
};

const heroVideoConfig = {
  videoSrc: "",
  fallbackVideoSrc: "",
  posterSrc: "",
  isPlaceholder: false
};

function populateHero() {
  document.getElementById("heroTitle").textContent = content.hero.title;
  document.getElementById("heroSubtitle").textContent = content.hero.subtitle;
}

function setupHeroVideo() {
  const video = document.getElementById("heroVideo");
  const placeholder = document.getElementById("videoPlaceholder");
  const hasNativeSource = Boolean(video.getAttribute("src") || video.querySelector("source[src]"));

  if (heroVideoConfig.posterSrc) {
    video.poster = heroVideoConfig.posterSrc;
  }

  if ((!heroVideoConfig.videoSrc && !hasNativeSource) || heroVideoConfig.isPlaceholder) {
    placeholder.style.display = "flex";
    return;
  }

  if (!hasNativeSource && heroVideoConfig.videoSrc) video.src = heroVideoConfig.videoSrc;
  if (heroVideoConfig.fallbackVideoSrc) {
    video.onerror = () => {
      if (video.src.includes(heroVideoConfig.fallbackVideoSrc)) return;
      video.src = heroVideoConfig.fallbackVideoSrc;
      video.load();
      video.play().catch(() => {});
    };
  }
  const playHero = () => video.play().catch(() => {});
  video.addEventListener("loadeddata", playHero, { once: true });
  video.addEventListener("canplay", () => {
    placeholder.style.display = "none";
    playHero();
  });
  playHero();
}

function setupCardGallery() {
  const gallery = document.getElementById("expanding-cards");
  const modal = document.getElementById("cardModal");
  const modalClose = document.getElementById("cardModalClose");
  const modalImage = document.getElementById("cardModalImage");
  const modalVideo = document.getElementById("cardModalVideo");
  const modalTitle = document.getElementById("cardModalTitle");
  const modalSubtitle = document.getElementById("cardModalSubtitle");
  const modalText = document.getElementById("cardModalText");
  const modalSpecs = document.getElementById("cardModalSpecs");
  const cards = Array.from(gallery?.querySelectorAll(".expanding-card") ?? []);
  const products = {
    "Full-bodied lager": {
      description: "A full-bodied Czech lager with balanced malt character, gentle hop bitterness, and a clean finish.",
      specs: [["percent", "4.8%", "ABV"], ["wheat", "12°", "Plato"], ["gauge", "Balanced", "Bitterness"], ["palette", "Golden", "Colour"], ["thermometer", "6–8°C", "Serve at"], ["sparkles", "Malt & hops", "Taste"]]
    },
    "Pale beer": {
      description: "A crisp and refreshing pale beer with a light malt body and pleasant Czech hop bitterness.",
      specs: [["percent", "4.0%", "ABV"], ["wheat", "10°", "Plato"], ["gauge", "Gentle", "Bitterness"], ["palette", "Pale gold", "Colour"], ["thermometer", "5–7°C", "Serve at"], ["sparkles", "Crisp & clean", "Taste"]]
    },
    "Amber lager": {
      description: "An unfiltered amber lager with a fuller malt profile, warm caramel notes, and a gentle hoppy finish.",
      specs: [["percent", "5.2%", "ABV"], ["wheat", "12°", "Plato"], ["gauge", "Balanced", "Bitterness"], ["palette", "Warm amber", "Colour"], ["thermometer", "7–9°C", "Serve at"], ["sparkles", "Caramel & malt", "Taste"]]
    },
    "Velvety wheat": {
      description: "A velvety wheat beer with natural haze, soft fruit notes, and a lightly spiced finish.",
      specs: [["beer", "Wheat", "Style"], ["wheat", "12°", "Plato"], ["gauge", "Mild", "Bitterness"], ["palette", "Cloudy gold", "Colour"], ["thermometer", "6–8°C", "Serve at"], ["sparkles", "Fruit & spice", "Taste"]]
    },
    "Semi-dark lager": {
      description: "A balanced semi-dark lager with a smooth body, caramel character, and restrained bitterness.",
      specs: [["percent", "4.6%", "ABV"], ["wheat", "11°", "Plato"], ["gauge", "Restrained", "Bitterness"], ["palette", "Ruby amber", "Colour"], ["thermometer", "7–9°C", "Serve at"], ["sparkles", "Toasted caramel", "Taste"]]
    },
    "Smooth dark lager": {
      description: "A smooth dark lager with roasted malt, caramel notes, and a rounded, velvety finish.",
      specs: [["percent", "4.4%", "ABV"], ["wheat", "11°", "Plato"], ["gauge", "Soft", "Bitterness"], ["palette", "Deep dark", "Colour"], ["thermometer", "7–9°C", "Serve at"], ["sparkles", "Roasted malt", "Taste"]]
    },
    "Alcohol-free": {
      description: "A clean and refreshing alcohol-free beer with a light malt profile and gentle hop bitterness.",
      specs: [["percent", "0.0%", "ABV"], ["beer", "Alcohol-free", "Style"], ["gauge", "Gentle", "Bitterness"], ["palette", "Pale gold", "Colour"], ["thermometer", "4–6°C", "Serve at"], ["sparkles", "Light & crisp", "Taste"]]
    }
  };

  if (
    !gallery || !modal || !modalClose || !modalImage || !modalVideo ||
    !modalTitle || !modalSpecs || cards.length === 0
  ) return;

  const openCard = (card) => {
    const image = card.querySelector(".expanding-card__image");
    const title = card.dataset.productTitle;
    const videoSrc = card.dataset.modalVideo;

    if (videoSrc) {
      modalImage.hidden = true;
      modalVideo.hidden = false;
      modalVideo.classList.toggle("card-modal__video--slow-zoom", videoSrc.includes("modal-premium-12.mp4"));
      modalVideo.src = videoSrc;
      // Restart the first product's zoom every time its modal opens.
      if (modalVideo.classList.contains("card-modal__video--slow-zoom")) {
        modalVideo.style.animation = "none";
        void modalVideo.offsetWidth;
        modalVideo.style.animation = "";
      }
      modalVideo.play().catch(() => {});
    } else {
      modalVideo.classList.remove("card-modal__video--slow-zoom");
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
      modalVideo.hidden = true;
      modalImage.hidden = false;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
    }
    const product = products[title];
    modalTitle.textContent = title;
    if (modalSubtitle) modalSubtitle.hidden = true;
    if (modalText) {
      modalText.hidden = false;
      modalText.textContent = product?.description || "";
    }
    modalSpecs.replaceChildren();
    (product?.specs || []).forEach(([icon, value, label]) => {
      const item = document.createElement("div");
      item.className = "card-modal__spec";
      item.innerHTML = `<span class="card-modal__spec-icon" aria-hidden="true"><i data-lucide="${icon}"></i></span><span><strong>${value}</strong><small>${label}</small></span>`;
      modalSpecs.append(item);
    });
    window.lucide?.createIcons({ attrs: { "stroke-width": 1.5 } });
    document.body.classList.add("modal-open");
    modal.showModal();
  };

  cards.forEach((card) => {
    const hoverVideo = card.querySelector("video.expanding-card__image");

    if (hoverVideo) {
      card.tabIndex = 0;
      card.setAttribute("aria-label", hoverVideo.getAttribute("aria-label"));

      const playVideo = () => hoverVideo.play().catch(() => {});
      const resetVideo = () => {
        hoverVideo.pause();
        hoverVideo.currentTime = 0;
      };

      card.addEventListener("mouseenter", playVideo);
      card.addEventListener("mouseleave", resetVideo);
      card.addEventListener("focus", playVideo);
      card.addEventListener("blur", resetVideo);
      return;
    }

    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Open ${card.dataset.productTitle} details`);
    card.addEventListener("click", () => openCard(card));
    card.addEventListener("keydown", (event) => {
      if (event.target !== card || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault();
      openCard(card);
    });
  });

  modalClose.addEventListener("click", () => modal.close());
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.close();
  });
  modal.addEventListener("close", () => {
    modalVideo.pause();
    modalVideo.currentTime = 0;
    document.body.classList.remove("modal-open");
    window.requestAnimationFrame(() => {
      cards.forEach((card) => card.blur());
    });
  });
}

function setupPartnerInquiry() {
  const form = document.getElementById("partnerInquiryForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const button = form.querySelector(".contact-form__submit");
    const buttonLabel = button?.querySelector("span");
    const status = form.querySelector(".contact-form__status");

    if (button) button.disabled = true;
    if (buttonLabel) buttonLabel.textContent = "Sending…";
    if (status) {
      status.textContent = "";
      status.className = "contact-form__status";
    }

    try {
      const endpoint = form.action.replace("formsubmit.co/", "formsubmit.co/ajax/");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      });

      if (!response.ok) throw new Error("Request failed");

      form.reset();
      if (status) {
        status.textContent = "Thank you. Your message has been sent.";
        status.classList.add("is-success");
      }
    } catch {
      if (status) {
        status.textContent = "We couldn’t send your message. Please email Evg.Grigoriev@karluv-pivovar.cz.";
        status.classList.add("is-error");
      }
    } finally {
      if (button) button.disabled = false;
      if (buttonLabel) buttonLabel.textContent = "Submit Inquiry";
    }
  });
}

function setupPremiumMotion() {
  const body = document.body;
  const beerCards = Array.from(document.querySelectorAll(".expanding-card"));
  const teamCards = Array.from(document.querySelectorAll(".team-contact"));
  const contactForm = document.querySelector(".contact-form-wrap");

  body.classList.add("motion-enabled");

  beerCards.forEach((card, index) => {
    card.style.setProperty("--motion-index", index);
  });

  teamCards.forEach((card, index) => {
    card.dataset.motionDelay = String(index * 70);
  });

  if (contactForm) contactForm.dataset.motionDelay = "190";

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => body.classList.add("motion-ready"));
  });
}

function setupScrollMotion() {
  const heroContent = document.querySelector(".hero__content");
  const revealItems = Array.from(document.querySelectorAll(".reveal, .section-head, .production-stage"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = Number(entry.target.dataset.motionDelay || 0);
          window.setTimeout(() => entry.target.classList.add("is-visible"), delay);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(() => {
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      heroContent.style.transform = `translateY(${p * -34}px) scale(${1 - p * 0.04})`;
      heroContent.style.opacity = `${1 - p * 0.38}`;
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
}

populateHero();
setupHeroVideo();
setupCardGallery();
setupPartnerInquiry();
setupPremiumMotion();
setupScrollMotion();
