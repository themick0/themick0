import PhotoSwipeLightbox from 'photoswipe/lightbox';

export function initProjectGallery(gallery: HTMLElement) {
  const viewport = gallery.querySelector<HTMLElement>(
    '[data-gallery-viewport]',
  )!;
  const slides = [
    ...gallery.querySelectorAll<HTMLElement>('[data-gallery-slide]'),
  ];
  const images = [
    ...gallery.querySelectorAll<HTMLImageElement>('[data-gallery-image]'),
  ];
  const enlarge = [
    ...gallery.querySelectorAll<HTMLButtonElement>('[data-gallery-enlarge]'),
  ];
  const previous = gallery.querySelector<HTMLButtonElement>(
    '[data-gallery-prev]',
  )!;
  const next = gallery.querySelector<HTMLButtonElement>('[data-gallery-next]')!;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let scrollTimer: ReturnType<typeof setTimeout>;
  let rotationTimer: ReturnType<typeof setTimeout>;
  let playing = !reducedMotion.matches;
  let hovered = false;
  let visible = false;

  function scheduleRotation() {
    clearTimeout(rotationTimer);
    if (
      !playing ||
      reducedMotion.matches ||
      hovered ||
      !visible ||
      document.hidden
    )
      return;
    rotationTimer = setTimeout(() => {
      if (reducedMotion.matches) {
        stopRotation();
        return;
      }
      goTo((current + 1) % slides.length);
      scheduleRotation();
    }, 5000);
  }

  function stopRotation() {
    playing = false;
    scheduleRotation();
  }

  gallery.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    scheduleRotation();
  });
  gallery.addEventListener('pointerleave', () => {
    hovered = false;
    scheduleRotation();
  });
  gallery.addEventListener('focusin', stopRotation);
  viewport.addEventListener('pointerdown', stopRotation, { passive: true });
  viewport.addEventListener(
    'wheel',
    (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) stopRotation();
    },
    { passive: true },
  );
  new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
      scheduleRotation();
    },
    { threshold: 0.25 },
  ).observe(viewport);
  document.addEventListener('visibilitychange', scheduleRotation);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) stopRotation();
  });

  function update(index: number) {
    current = ((index % slides.length) + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.setAttribute('aria-hidden', String(i !== current));
      enlarge[i].tabIndex = i === current ? 0 : -1;
    });
  }

  function goTo(index: number, animate = true) {
    clearTimeout(scrollTimer);
    update(index);
    viewport.scrollTo({
      left: current * viewport.clientWidth,
      behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
    });
  }

  previous.addEventListener('click', () => {
    stopRotation();
    goTo(current - 1);
  });
  next.addEventListener('click', () => {
    stopRotation();
    goTo(current + 1);
  });

  // Native scrolling preserves touch swipes, vertical page scrolling and pinch zoom.
  viewport.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        update(Math.round(viewport.scrollLeft / viewport.clientWidth));
      }, 100);
    },
    { passive: true },
  );

  gallery.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    const destination = {
      ArrowLeft: current - 1,
      ArrowRight: current + 1,
      Home: 0,
      End: slides.length - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    stopRotation();
    const moveFocus = enlarge.includes(event.target as HTMLButtonElement);
    goTo(destination);
    if (moveFocus) enlarge[current].focus({ preventScroll: true });
  });

  let width = viewport.clientWidth;
  new ResizeObserver(() => {
    if (width === viewport.clientWidth) return;
    width = viewport.clientWidth;
    goTo(current, false);
  }).observe(viewport);

  const lightbox = new PhotoSwipeLightbox({
    dataSource: images.map((image) => ({
      src: image.src,
      msrc: image.src,
      width: Number(image.getAttribute('width')),
      height: Number(image.getAttribute('height')),
      alt: image.alt,
    })),
    pswpModule: () => import('photoswipe'),
    mainClass: 'project-lightbox',
    bgOpacity: 0.96,
    loop: true,
    showAnimationDuration: 280,
    hideAnimationDuration: 240,
    zoomAnimationDuration: 240,
    paddingFn: ({ x }) => ({
      top: 24,
      bottom: 24,
      left: x < 768 ? 12 : 40,
      right: x < 768 ? 12 : 40,
    }),
    initialZoomLevel: 'fit',
    secondaryZoomLevel: (zoom) => Math.min(1, zoom.fit * 2.5),
    maxZoomLevel: 1,
    allowPanToNext: false,
    wheelToZoom: false,
    pinchToClose: false,
    closeOnVerticalDrag: false,
    imageClickAction: () => requestClose(),
    bgClickAction: () => requestClose(),
    tapAction: () => requestClose(),
    doubleTapAction: false,
    close: false,
    zoom: false,
    counter: false,
    arrowPrev: false,
    arrowNext: false,
    trapFocus: false,
    returnFocus: false,
  });
  lightbox.addFilter('thumbEl', (_element, _data, index) => images[index]);

  let background: HTMLElement[] = [];
  let originalOverflow = '';
  let originalPadding = '';
  let closeRequested = false;

  function requestClose() {
    const viewer = lightbox.pswp;
    if (viewer?.opener.isOpening) {
      closeRequested = true;
    } else {
      viewer?.close();
    }
  }

  lightbox.on('openingAnimationEnd', () => {
    if (closeRequested) queueMicrotask(requestClose);
  });
  lightbox.on('afterInit', () => {
    const dialog = lightbox.pswp!.element!;
    dialog.setAttribute('aria-label', `${gallery.dataset.name} screenshots`);
    dialog.setAttribute('aria-modal', 'true');
    const instructions = document.createElement('p');
    instructions.id = `${gallery.id}-instructions`;
    instructions.hidden = true;
    instructions.textContent =
      'Use left and right arrow keys to change screenshots. Click the image or press Escape to close.';
    dialog.append(instructions);
    dialog.setAttribute('aria-describedby', instructions.id);
    // Keep Tab inside the viewer from the first frame of its opening animation.
    dialog.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        requestClose();
        return;
      }
      if (event.key !== 'Tab') return;
      event.preventDefault();
      dialog.focus({ preventScroll: true });
    });
    lightbox.pswp!.scrollWrap!.setAttribute(
      'aria-label',
      'Enlarged screenshots',
    );
    background = [...document.body.children].filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && element !== dialog && !element.inert,
    );
    background.forEach((element) => {
      element.inert = true;
    });
    const root = document.documentElement;
    originalOverflow = root.style.overflow;
    originalPadding = root.style.paddingRight;
    const scrollbar = innerWidth - root.clientWidth;
    const padding = parseFloat(getComputedStyle(root).paddingRight);
    root.style.overflow = 'hidden';
    root.style.paddingRight = `${padding + scrollbar}px`;
    dialog.focus({ preventScroll: true });
  });
  lightbox.on('change', () => goTo(lightbox.pswp!.currIndex, false));
  lightbox.on('destroy', () => {
    background.forEach((element) => {
      element.inert = false;
    });
    document.documentElement.style.overflow = originalOverflow;
    document.documentElement.style.paddingRight = originalPadding;
    closeRequested = false;
    // Restore focus after the viewer has been removed from the document.
    requestAnimationFrame(() =>
      enlarge[current].focus({ preventScroll: true }),
    );
  });
  lightbox.init();
  enlarge.forEach((button, i) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      stopRotation();
      // Read the preference on every opening, including changes made during the visit.
      lightbox.options.showHideAnimationType = reducedMotion.matches
        ? 'none'
        : 'zoom';
      lightbox.options.zoomAnimationDuration = reducedMotion.matches ? 0 : 240;
      button.focus({ preventScroll: true });
      lightbox.loadAndOpen(i);
    });
  });
  gallery
    .querySelectorAll<HTMLElement>('[data-gallery-controls]')
    .forEach((element) => {
      element.hidden = false;
    });
  gallery.dataset.ready = '';
  update(0);
  scheduleRotation();
}
