const content = {
  hero: {
    title: "Karlova Krčma",
    subtitle: "Traditional Czech brewing technology"
  },
  production: [
    {
      id: "tank",
      label: "Танки",
      title: "Варочные и бродильные ёмкости",
      text: "Экран построен так, чтобы показывать несколько типов производственных узлов. Пользователь нажимает на ёмкость и получает короткое видео с конкретным этапом.",
      fact: "На сайте бренд делает акцент на традиционных чешских технологиях и натуральной воде. Этот блок логично раскрывает именно качество процесса.",
      eyebrow: "Точка 01 / Основа вкуса",
      metrics: ["чешский хмель", "чешский солод", "природная вода"],
      videoSrc: "assets/hero.mp4"
    },
    {
      id: "can",
      label: "Банка",
      title: "Линия баночного розлива",
      text: "Отдельный сценарий для демонстрации баночного формата, который особенно важен для выставок, полки и быстрой партнёрской презентации.",
      fact: "В продуктовой линейке сайта отдельно показан формат can 0.5, поэтому в pitch-версии есть смысл выделить его как самостоятельный носитель бренда.",
      eyebrow: "Точка 02 / Современный формат",
      metrics: ["0.5 can", "retail ready", "hero pack"],
      videoSrc: "assets/hero.mp4"
    },
    {
      id: "bottle",
      label: "Бутылка",
      title: "Классическая бутылка для HoReCa и retail",
      text: "В бутылке продукт считывается как более классический, а сама подача позволяет раскрыть детали этикетки, стекла и качества бренда.",
      fact: "На странице продукции отдельно указаны форматы 0.33 и 0.5 bottle. Это удобно использовать как аргумент для разных каналов сбыта.",
      eyebrow: "Точка 03 / Классика бренда",
      metrics: ["0.33 bottle", "0.5 bottle", "classic presentation"],
      videoSrc: "assets/hero.mp4"
    },
    {
      id: "keg",
      label: "Бочка",
      title: "Кеги для заведений и драфтового канала",
      text: "Финальный тип ёмкости показывает масштаб и гибкость поставки: бренд может звучать не только как упаковка на полке, но и как продукт для розлива.",
      fact: "На сайте указаны кеги 20L, 30L и 50L. Это сильный аргумент для переговоров с ресторанами, барами и дистрибьюторами.",
      eyebrow: "Точка 04 / Формат для партнёров",
      metrics: ["20L", "30L", "50L"],
      videoSrc: "assets/hero.mp4"
    }
  ],
  partners: {
    email: "info@karlu-pivovar.cz",
    reasons: [
      {
        title: "Быстрый вход в бренд",
        text: "За 15–30 секунд партнёр понимает продукт, визуальный уровень и позиционирование без длинной PDF-презентации."
      },
      {
        title: "Готово для встреч и выставок",
        text: "Сценарий одинаково хорошо работает на ноутбуке, телефоне, стойке выставки и в отправке по ссылке или QR-коду."
      },
      {
        title: "Показывает не только вкус, но и процесс",
        text: "Линейка продукта соединена с историей производства, поэтому бренд выглядит убедительнее и профессиональнее."
      }
    ],
    usage: [
      "на выставках",
      "на личных встречах",
      "в переписке с потенциальными партнёрами",
      "в презентации продукта через QR-код",
      "как быстрый digital-материал вместо PDF-презентации"
    ]
  }
};

const heroVideoConfig = {
  videoSrc: "assets/hero-background.mp4",
  fallbackVideoSrc: "",
  posterSrc: "",
  isPlaceholder: false
};

let activeProductionId = content.production[0].id;

function populateHero() {
  document.getElementById("heroTitle").textContent = content.hero.title;
  document.getElementById("heroSubtitle").textContent = content.hero.subtitle;
}

function populatePartnerSection() {
  const email = document.getElementById("partnersJoinEmail");
  email.textContent = content.partners.email;
  email.href = `mailto:${content.partners.email}`;

  const reasonsRoot = document.getElementById("partnerReasons");
  reasonsRoot.innerHTML = "";

  content.partners.reasons.forEach((reason, index) => {
    const card = document.createElement("article");
    card.className = "reason-card reveal";
    card.style.transitionDelay = `${index * 80}ms`;
    card.innerHTML = `
      <span class="reason-card__index">0${index + 1}</span>
      <h3 class="reason-card__title">${reason.title}</h3>
      <p class="reason-card__text">${reason.text}</p>
    `;
    reasonsRoot.appendChild(card);
  });

  const usageRoot = document.getElementById("partnerUsage");
  usageRoot.innerHTML = "";

  content.partners.usage.forEach((item) => {
    const pill = document.createElement("div");
    pill.className = "usage-pill reveal";
    pill.textContent = item;
    usageRoot.appendChild(pill);
  });
}

function renderProductionStage(stageId) {
  const stage = content.production.find((item) => item.id === stageId);
  if (!stage) return;

  activeProductionId = stageId;
  document.querySelectorAll(".production-chip").forEach((button) => {
    const isActive = button.dataset.stageId === stageId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  document.getElementById("productionEyebrow").textContent = stage.eyebrow;
  document.getElementById("productionTitle").textContent = stage.title;
  document.getElementById("productionText").textContent = stage.text;
  document.getElementById("productionFact").textContent = stage.fact;

  const metricsRoot = document.getElementById("productionMetrics");
  metricsRoot.innerHTML = "";
  stage.metrics.forEach((metric) => {
    const item = document.createElement("span");
    item.className = "production-metric";
    item.textContent = metric;
    metricsRoot.appendChild(item);
  });

  const video = document.getElementById("productionVideo");
  const placeholder = document.getElementById("productionPlaceholder");

  if (!stage.videoSrc) {
    video.removeAttribute("src");
    placeholder.style.display = "grid";
    return;
  }

  video.src = stage.videoSrc;
  video.load();
  video.play().then(() => {
    placeholder.style.display = "none";
  }).catch(() => {
    placeholder.style.display = "grid";
  });
}

function setupProduction() {
  const selector = document.getElementById("productionSelector");
  selector.innerHTML = "";

  content.production.forEach((stage, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "production-chip reveal";
    button.dataset.stageId = stage.id;
    button.style.transitionDelay = `${index * 70}ms`;
    button.innerHTML = `
      <span class="production-chip__label">${stage.label}</span>
      <span class="production-chip__title">${stage.title}</span>
    `;
    button.addEventListener("click", () => renderProductionStage(stage.id));
    selector.appendChild(button);
  });

  renderProductionStage(activeProductionId);
}

function setupHeroVideo() {
  const video = document.getElementById("heroVideo");
  const placeholder = document.getElementById("videoPlaceholder");

  if (heroVideoConfig.posterSrc) {
    video.poster = heroVideoConfig.posterSrc;
  }

  if (!heroVideoConfig.videoSrc || heroVideoConfig.isPlaceholder) {
    placeholder.style.display = "flex";
    return;
  }

  video.src = heroVideoConfig.videoSrc;
  if (heroVideoConfig.fallbackVideoSrc) {
    video.onerror = () => {
      if (video.src.includes(heroVideoConfig.fallbackVideoSrc)) return;
      video.src = heroVideoConfig.fallbackVideoSrc;
      video.load();
      video.play().catch(() => {});
    };
  }
  video.addEventListener("canplay", () => {
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

  if (
    !gallery || !modal || !modalClose || !modalImage ||
    !modalTitle || !modalSubtitle || !modalText || cards.length === 0
  ) return;

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
    document.body.classList.remove("modal-open");
  });
}

function setupScrollMotion() {
  const heroContent = document.querySelector(".hero__content");
  const revealItems = Array.from(document.querySelectorAll(".reveal, .section-head, .production-stage"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
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
populatePartnerSection();
setupProduction();
setupHeroVideo();
setupCardGallery();
setupScrollMotion();
