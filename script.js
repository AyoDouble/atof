const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isExpanded));
    menuToggle.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
    primaryNav.classList.toggle("is-open", !isExpanded);
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
      primaryNav.classList.remove("is-open");
    }
  });
}

const copyStatus = document.querySelector(".copy-status");

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      if (copyStatus) copyStatus.textContent = "Account number copied.";
    } catch {
      if (copyStatus) copyStatus.textContent = "Copy unavailable. Please select and copy the account number.";
    }
  });
});

const revealElements = document.querySelectorAll(
  ".hero-copy > *, .hero-art, .story-grid > *, .mission-band > *, .founder-grid > *, .support-heading > *, .support-card, .exam-strip > *, .students-heading > *, .student-card, .gallery-heading > *, .photo-carousel, .join-grid > *, .footer-main > *",
);
const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !motionPreference.matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 90}ms`);
    revealObserver.observe(element);
  });
}

document.querySelectorAll(".photo-carousel").forEach((carousel) => {
  const track = carousel.querySelector(".carousel-track");
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const previousButton = carousel.querySelector(".carousel-previous");
  const nextButton = carousel.querySelector(".carousel-next");
  const toggleButton = carousel.querySelector(".carousel-toggle");
  const status = carousel.querySelector(".carousel-status");

  if (!track || !slides.length || !previousButton || !nextButton || !toggleButton || !status) return;

  let activeIndex = 0;
  let autoplayTimer;
  let userPaused = motionPreference.matches;
  let isHovered = false;
  let isFocused = false;
  const updateAutoplay = () => {
    window.clearInterval(autoplayTimer);
    toggleButton.disabled = motionPreference.matches;
    toggleButton.textContent = userPaused ? "Resume" : "Pause";
    toggleButton.setAttribute(
      "aria-label",
      motionPreference.matches
        ? "Automatic slideshow disabled by reduced motion preference"
        : userPaused ? "Resume automatic slideshow" : "Pause automatic slideshow",
    );
    toggleButton.setAttribute("aria-pressed", String(userPaused));

    if (!userPaused && !isHovered && !isFocused && !motionPreference.matches) {
      autoplayTimer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
    }
  };
  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${activeIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== activeIndex));
    });
    status.textContent = `${activeIndex + 1} of ${slides.length}`;
  };

  const moveSlide = (index) => {
    userPaused = true;
    showSlide(index);
    updateAutoplay();
  };

  previousButton.addEventListener("click", () => moveSlide(activeIndex - 1));
  nextButton.addEventListener("click", () => moveSlide(activeIndex + 1));
  toggleButton.addEventListener("click", () => {
    userPaused = !userPaused;
    updateAutoplay();
  });
  carousel.addEventListener("pointerenter", () => {
    isHovered = true;
    updateAutoplay();
  });
  carousel.addEventListener("pointerleave", () => {
    isHovered = false;
    updateAutoplay();
  });
  carousel.addEventListener("focusin", () => {
    isFocused = true;
    updateAutoplay();
  });
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      isFocused = false;
      updateAutoplay();
    }
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveSlide(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      moveSlide(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      moveSlide(0);
    } else if (event.key === "End") {
      event.preventDefault();
      moveSlide(slides.length - 1);
    }
  });
  showSlide(0);
  updateAutoplay();

  const handleMotionPreferenceChange = (event) => {
    if (event.matches) userPaused = true;
    updateAutoplay();
  };

  if (typeof motionPreference.addEventListener === "function") {
    motionPreference.addEventListener("change", handleMotionPreferenceChange);
  } else {
    motionPreference.addListener(handleMotionPreferenceChange);
  }
});
