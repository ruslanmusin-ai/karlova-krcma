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
  const cards = Array.from(gallery?.querySelectorAll(".expanding-card") ?? []);
  const descriptions = {
    "Full-bodied lager": "A full-bodied Czech lager with balanced malt character, gentle hop bitterness, and a clean finish.",
    "Pale beer": "A crisp and refreshing pale beer with a light malt body and pleasant Czech hop bitterness.",
    "Amber lager": "An unfiltered amber lager with a fuller malt profile, warm caramel notes, and a gentle hoppy finish.",
    "Velvety wheat": "A velvety wheat beer with natural haze, soft fruit notes, and a lightly spiced finish.",
    "Semi-dark lager": "A balanced semi-dark lager with a smooth body, caramel character, and restrained bitterness.",
    "Smooth dark lager": "A smooth dark lager with roasted malt, caramel notes, and a rounded, velvety finish.",
    "Alcohol-free": "A clean and refreshing alcohol-free beer with a light malt profile and gentle hop bitterness."
  };

  if (
    !gallery || !modal || !modalClose || !modalImage || !modalVideo ||
    !modalTitle || cards.length === 0
  ) return;

  const openCard = (card) => {
    const image = card.querySelector(".expanding-card__image");
    const title = card.querySelector(".expanding-card__title");
    const videoSrc = card.dataset.modalVideo;

    if (videoSrc) {
      modalImage.hidden = true;
      modalVideo.hidden = false;
      modalVideo.src = videoSrc;
      modalVideo.play().catch(() => {});
    } else {
      modalVideo.pause();
      modalVideo.removeAttribute("src");
      modalVideo.load();
      modalVideo.hidden = true;
      modalImage.hidden = false;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
    }
    modalTitle.textContent = title.textContent;
    if (modalSubtitle) modalSubtitle.hidden = true;
    if (modalText) {
      modalText.hidden = false;
      modalText.textContent = descriptions[title.textContent.trim()] || "";
    }
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
