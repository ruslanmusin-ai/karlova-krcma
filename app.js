const content = {
  hero: {
    title: "Karlova Krčma",
    subtitle: "Traditional Czech brewing technology"
  }
};

const heroVideoConfig = {
  videoSrc: "",
  fallbackVideoSrc: "",
  posterSrc: "assets/hero-poster.webp",
  isPlaceholder: false
};

function populateHero() {
  document.getElementById("heroTitle").textContent = content.hero.title;
  document.getElementById("heroSubtitle").textContent = content.hero.subtitle;
}

function setupHeroVideo() {
  const hero = document.getElementById("hero");
  const video = document.getElementById("heroVideo");
  const mediaWrap = video.closest(".hero__media-wrap");
  const placeholder = document.getElementById("videoPlaceholder");
  const playButton = document.getElementById("heroPlayButton");

  if (heroVideoConfig.posterSrc) {
    video.poster = heroVideoConfig.posterSrc;
    if (mediaWrap) mediaWrap.style.backgroundImage = `url("${heroVideoConfig.posterSrc}")`;
  }

  const hasNativeSource = Boolean(video.getAttribute("src") || video.querySelector("source[src]"));
  if ((!heroVideoConfig.videoSrc && !hasNativeSource) || heroVideoConfig.isPlaceholder) {
    placeholder.style.display = "flex";
    return;
  }

  if (!hasNativeSource && heroVideoConfig.videoSrc) video.src = heroVideoConfig.videoSrc;

  const showPlayButton = () => {
    if (playButton) playButton.hidden = false;
  };
  const hidePlayButton = () => {
    if (playButton) playButton.hidden = true;
  };
  let hasAnnouncedBuffered = false;
  let hasAnnouncedPlaying = false;
  const announceBuffered = () => {
    if (hasAnnouncedBuffered) return;
    hasAnnouncedBuffered = true;
    window.dispatchEvent(new Event("hero-video-buffered"));
  };
  const revealHeroVideo = () => {
    hero?.classList.add("is-video-playing");
    video.style.transition = "none";
    video.style.opacity = "1";
    hidePlayButton();
    if (!hasAnnouncedPlaying) {
      hasAnnouncedPlaying = true;
      window.dispatchEvent(new Event("hero-video-playing"));
    }
    if (video.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) announceBuffered();
  };
  const attemptPlayback = () => video.play().then(revealHeroVideo).catch(showPlayButton);

  video.addEventListener("playing", revealHeroVideo);
  video.addEventListener("canplaythrough", announceBuffered, { once: true });
  attemptPlayback();
  playButton?.addEventListener("click", attemptPlayback);
  window.setTimeout(() => {
    if (video.paused) showPlayButton();
  }, 1200);
  if (heroVideoConfig.fallbackVideoSrc) {
    video.onerror = () => {
      if (video.src.includes(heroVideoConfig.fallbackVideoSrc)) return;
      video.src = heroVideoConfig.fallbackVideoSrc;
      video.load();
      attemptPlayback();
    };
  }
  video.addEventListener("canplay", () => {
    placeholder.style.display = "none";
  });
  video.addEventListener("loadeddata", () => {
    placeholder.style.display = "none";
  });
}

function setupCardGallery() {
  const gallery = document.getElementById("expanding-cards");
  const modal = document.getElementById("cardModal");
  const modalClose = document.getElementById("cardModalClose");
  const modalImage = document.getElementById("cardModalImage");
  const modalTitle = document.getElementById("cardModalTitle");
  const modalSubtitle = document.getElementById("cardModalSubtitle");
  const modalText = document.getElementById("cardModalText");
  const cards = Array.from(gallery?.querySelectorAll(".expanding-card") ?? []);
  const cardVideos = cards
    .map((card) => card.querySelector("video.expanding-card__image"))
    .filter(Boolean);
  const startedCardVideos = new Set();
  let activeCardPreloads = 0;
  let hasStartedCardQueue = false;
  const maxConcurrentCardPreloads = 2;

  if (
    !gallery || !modal || !modalClose || !modalImage ||
    !modalTitle || !modalSubtitle || !modalText || cards.length === 0
  ) return;

  const isFullyBuffered = (video) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.buffered.length === 0) {
      return false;
    }
    return video.buffered.end(video.buffered.length - 1) >= video.duration - 0.25;
  };

  const pumpCardQueue = () => {
    if (!hasStartedCardQueue) return;
    while (activeCardPreloads < maxConcurrentCardPreloads) {
      const nextVideo = cardVideos.find((video) => !startedCardVideos.has(video));
      if (!nextVideo) return;
      startCardLoad(nextVideo);
    }
  };

  const startCardLoad = (video) => {
    if (startedCardVideos.has(video) || !video.dataset.src) return;

    startedCardVideos.add(video);
    activeCardPreloads += 1;
    video.preload = "auto";
    video.src = video.dataset.src;

    let hasFinishedSlot = false;
    let slotTimeout;
    const finishSlot = () => {
      if (hasFinishedSlot) return;
      hasFinishedSlot = true;
      activeCardPreloads = Math.max(0, activeCardPreloads - 1);
      video.removeEventListener("progress", checkBuffer);
      video.removeEventListener("canplaythrough", checkBuffer);
      video.removeEventListener("error", finishSlot);
      window.clearTimeout(slotTimeout);
      pumpCardQueue();
    };
    const checkBuffer = () => {
      if (isFullyBuffered(video)) finishSlot();
    };

    slotTimeout = window.setTimeout(finishSlot, 20000);
    video.addEventListener("progress", checkBuffer);
    video.addEventListener("canplaythrough", checkBuffer);
    video.addEventListener("error", finishSlot, { once: true });
    video.load();
  };

  const startCardQueue = () => {
    if (hasStartedCardQueue) return;
    hasStartedCardQueue = true;
    pumpCardQueue();
  };

  const openCard = (card) => {
    const image = card.querySelector(".expanding-card__image");
    const title = card.querySelector(".expanding-card__title");
    const subtitle = card.querySelector(".expanding-card__panel-title");
    const text = card.querySelector(".expanding-card__panel-text");

    modalImage.src = image.currentSrc || image.src;
    modalImage.alt = image.alt;
    modalTitle.textContent = title.textContent;
    modalSubtitle.textContent = subtitle.textContent;
    modalText.textContent = text.textContent.trim();
    document.body.classList.add("modal-open");
    modal.showModal();
  };

  cards.forEach((card) => {
    const hoverVideo = card.querySelector("video.expanding-card__image");

    if (hoverVideo) {
      if (hoverVideo.poster) card.style.backgroundImage = `url("${hoverVideo.poster}")`;
      card.tabIndex = 0;
      card.setAttribute("aria-label", hoverVideo.getAttribute("aria-label"));
      const isTouchFirst = window.matchMedia("(hover: none), (pointer: coarse)").matches;

      const playVideo = () => {
        cardVideos.forEach((video) => {
          if (video === hoverVideo || video.paused) return;
          video.pause();
          video.currentTime = 0;
          video.style.removeProperty("opacity");
          video.style.removeProperty("transition");
          video.closest(".expanding-card")?.classList.remove("is-video-playing");
        });
        startCardLoad(hoverVideo);
        hoverVideo.play().catch(() => {});
      };
      const resetVideo = () => {
        hoverVideo.pause();
        hoverVideo.currentTime = 0;
        hoverVideo.style.removeProperty("opacity");
        hoverVideo.style.removeProperty("transition");
        card.classList.remove("is-video-playing");
      };

      hoverVideo.addEventListener("playing", () => {
        card.classList.add("is-video-playing");
        hoverVideo.style.transition = "none";
        hoverVideo.style.opacity = "1";
      });
      hoverVideo.addEventListener("error", () => {
        hoverVideo.style.removeProperty("opacity");
        hoverVideo.style.removeProperty("transition");
        card.classList.remove("is-video-playing");
      });

      card.addEventListener("mouseenter", playVideo);
      card.addEventListener("mouseleave", resetVideo);
      card.addEventListener("click", () => {
        if (hoverVideo.paused) playVideo();
        else if (isTouchFirst) resetVideo();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        if (hoverVideo.paused) playVideo();
        else resetVideo();
      });
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
    document.body.classList.remove("modal-open");
  });

  const heroVideo = document.getElementById("heroVideo");
  if (heroVideo && !heroVideo.paused && heroVideo.currentTime > 0) startCardQueue();
  else window.addEventListener("hero-video-playing", startCardQueue, { once: true });

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
