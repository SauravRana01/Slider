
/**
 * BMW M5 Image Slider
 * Vanilla JavaScript
 *
 * Features:
 * - Infinite looping
 * - Navigation arrows
 * - Clickable indicator dots
 * - Keyboard navigation
 * - Responsive resizing
 * - Optional autoplay
 */

class ImageSlider {
  constructor(options = {}) {
    this.sliderEl = document.getElementById(
      options.sliderId || "slider"
    );

    this.trackEl = document.getElementById(
      options.trackId || "sliderTrack"
    );

    this.dotsEl = document.getElementById(
      options.dotsId || "dots"
    );

    this.prevBtn = document.getElementById(
      options.prevId || "prevBtn"
    );

    this.nextBtn = document.getElementById(
      options.nextId || "nextBtn"
    );

    // WebP image paths
    this.images = options.images || [
      "images/bmw-m5-1.webp",
      "images/bmw-m5-2.webp",
      "images/bmw-m5-3.webp",
      "images/bmw-m5-4.webp",
      "images/bmw-m5-5.webp"
    ];

    this.total = this.images.length;
    this.currentIndex = 0;
    this.isTransitioning = false;

    // Set to 0 to disable autoplay
    this.autoPlayDelay = options.autoPlayDelay || 0;
    this.autoPlayTimer = null;

    // Check that all required elements exist
    if (
      !this.sliderEl ||
      !this.trackEl ||
      !this.dotsEl ||
      !this.prevBtn ||
      !this.nextBtn ||
      this.total === 0
    ) {
      console.error(
        "ImageSlider: Required HTML elements or images are missing."
      );
      return;
    }

    this.init();
  }

  // ===== Initialize Slider =====
  init() {
    this.buildSlides();
    this.buildDots();
    this.bindEvents();
    this.goTo(0, false);
  }

  // ===== Build Slides =====
  buildSlides() {
    this.trackEl.innerHTML = "";

    /*
     * Track structure:
     * [last clone] [slide 1] ... [slide N] [first clone]
     */

    // Clone the last slide at the beginning
    this.trackEl.appendChild(
      this.createSlide(
        this.images[this.total - 1],
        -1
      )
    );

    // Add all real slides
    this.images.forEach((src, index) => {
      this.trackEl.appendChild(
        this.createSlide(src, index)
      );
    });

    // Clone the first slide at the end
    this.trackEl.appendChild(
      this.createSlide(
        this.images[0],
        this.total
      )
    );
  }

  // ===== Create Individual Slide =====
  createSlide(src, index) {
    const slide = document.createElement("div");

    slide.className = "slide";
    slide.dataset.index = index;

    const img = document.createElement("img");

    img.src = src;

    const imageNumber =
      ((index % this.total) + this.total) % this.total + 1;

    img.alt = `BMW M5 - Image ${imageNumber}`;
    img.loading = "eager";
    img.decoding = "async";
    img.draggable = false;

    // Report missing images in the browser console
    img.addEventListener(
      "error",
      () => {
        console.error(
          `ImageSlider: Could not load "${src}". Check the filename and folder path.`
        );
      },
      { once: true }
    );

    slide.appendChild(img);

    return slide;
  }

  // ===== Build Indicator Dots =====
  buildDots() {
    this.dotsEl.innerHTML = "";

    for (let i = 0; i < this.total; i++) {
      const dot = document.createElement("button");

      dot.type = "button";
      dot.className = "dot";
      dot.dataset.index = i;

      dot.setAttribute(
        "aria-label",
        `Go to slide ${i + 1}`
      );

      dot.setAttribute(
        "aria-current",
        i === 0 ? "true" : "false"
      );

      if (i === 0) {
        dot.classList.add("active");
      }

      this.dotsEl.appendChild(dot);
    }
  }

  // ===== Event Listeners =====
  bindEvents() {
    // Previous and next buttons
    this.prevBtn.addEventListener("click", () => {
      this.prev();
    });

    this.nextBtn.addEventListener("click", () => {
      this.next();
    });

    // Indicator dot navigation
    this.dotsEl.addEventListener("click", (event) => {
      const dot = event.target.closest(".dot");

      if (!dot || !this.dotsEl.contains(dot)) {
        return;
      }

      const index = Number(dot.dataset.index);

      this.goTo(index);
    });

    // Handle transition completion
    this.trackEl.addEventListener(
      "transitionend",
      (event) => {
        if (
          event.target === this.trackEl &&
          event.propertyName === "transform"
        ) {
          this.onTransitionEnd();
        }
      }
    );

    // Keyboard navigation
    document.addEventListener("keydown", (event) => {
      const target = event.target;

      const isTyping =
        target instanceof HTMLElement &&
        (
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(
            target.tagName
          )
        );

      if (
        isTyping ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      ) {
        return;
      }

      if (event.key === "ArrowLeft") {
        this.prev();
      } else if (event.key === "ArrowRight") {
        this.next();
      }
    });

    // Optional autoplay
    if (this.autoPlayDelay > 0) {
      this.sliderEl.addEventListener(
        "mouseenter",
        () => this.stopAutoPlay()
      );

      this.sliderEl.addEventListener(
        "mouseleave",
        () => this.startAutoPlay()
      );

      this.sliderEl.addEventListener(
        "focusin",
        () => this.stopAutoPlay()
      );

      this.sliderEl.addEventListener(
        "focusout",
        (event) => {
          if (
            !this.sliderEl.contains(event.relatedTarget)
          ) {
            this.startAutoPlay();
          }
        }
      );

      this.startAutoPlay();
    }

    // Keep the current slide positioned on resize
    window.addEventListener("resize", () => {
      this.goTo(this.currentIndex, false);
    });
  }

  // ===== Navigate to a Slide =====
  goTo(index, animate = true) {
    if (animate && this.isTransitioning) {
      return;
    }

    this.currentIndex = index;

    // Account for the cloned slide at the beginning
    const physicalIndex = index + 1;
    const offset = -physicalIndex * 100;

    if (animate) {
      this.isTransitioning = true;
      this.trackEl.classList.remove("no-transition");
    } else {
      this.trackEl.classList.add("no-transition");
    }

    this.trackEl.style.transform =
      `translateX(${offset}%)`;

    this.updateDots();

    if (!animate) {
      // Force browser reflow before restoring transitions
      void this.trackEl.offsetHeight;

      this.trackEl.classList.remove("no-transition");
    }
  }

  // ===== Next Slide =====
  next() {
    if (this.isTransitioning) {
      return;
    }

    this.goTo(this.currentIndex + 1);
  }

  // ===== Previous Slide =====
  prev() {
    if (this.isTransitioning) {
      return;
    }

    this.goTo(this.currentIndex - 1);
  }

  // ===== Handle Infinite Loop =====
  onTransitionEnd() {
    this.isTransitioning = false;

    // If we reached the clone of the last slide,
    // jump to the real last slide without animation.
    if (this.currentIndex === -1) {
      this.goTo(this.total - 1, false);
    }

    // If we reached the clone of the first slide,
    // jump to the real first slide without animation.
    else if (this.currentIndex === this.total) {
      this.goTo(0, false);
    }
  }

  // ===== Update Active Indicator Dot =====
  updateDots() {
    const dots = this.dotsEl.querySelectorAll(".dot");

    const activeIndex =
      ((this.currentIndex % this.total) + this.total) %
      this.total;

    dots.forEach((dot, index) => {
      const isActive = index === activeIndex;

      dot.classList.toggle("active", isActive);

      dot.setAttribute(
        "aria-current",
        isActive ? "true" : "false"
      );
    });
  }

  // ===== Start Autoplay =====
  startAutoPlay() {
    if (this.autoPlayDelay <= 0) {
      return;
    }

    this.stopAutoPlay();

    this.autoPlayTimer = setInterval(() => {
      this.next();
    }, this.autoPlayDelay);
  }

  // ===== Stop Autoplay =====
  stopAutoPlay() {
    if (this.autoPlayTimer !== null) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }
}

// ===== Initialize Slider =====
document.addEventListener("DOMContentLoaded", () => {
  new ImageSlider({
    // Uncomment the next line to enable autoplay:
    // autoPlayDelay: 4000
  });
});
