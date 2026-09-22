import type { Alpine as AlpineType } from "alpinejs";

export function registerAlpineComponents(Alpine: AlpineType) {
	Alpine.data("carousel", () => ({
		current: 0,
		total: 0,
		isAnimating: false,

		startX: 0,
		currentX: 0,

		init() {
			this.total = this.$root.querySelectorAll(".carousel-slide").length;
			if (this.total <= 1) return;

			const slides = Array.from(
				this.$root.querySelectorAll(".carousel-slide"),
			) as HTMLElement[];
			slides.forEach((slide, i) => {
				slide.style.position = "absolute";
				slide.style.top = "0";
				slide.style.left = "0";
				slide.style.width = "100%";
				slide.style.height = "100%";
				slide.classList.remove("hidden");

				if (i === 0) {
					slide.style.transform = "translateX(0)";
					slide.style.zIndex = "10";
				} else {
					slide.style.transform = "translateX(100%)";
					slide.style.zIndex = "1";
				}
			});

			this.$root.addEventListener("touchstart", this.onTouchStart.bind(this), {
				passive: true,
			});
			this.$root.addEventListener("touchmove", this.onTouchMove.bind(this), {
				passive: true,
			});
			this.$root.addEventListener("touchend", this.onTouchEnd.bind(this), {
				passive: true,
			});
		},

		onTouchStart(e: TouchEvent) {
			this.startX = e.touches[0].clientX;
			this.currentX = this.startX;
		},

		onTouchMove(e: TouchEvent) {
			this.currentX = e.touches[0].clientX;
		},

		onTouchEnd() {
			const diff = this.startX - this.currentX;
			if (Math.abs(diff) > 50) {
				if (diff > 0) {
					this.next();
				} else {
					this.prev();
				}
			}
		},

		next() {
			if (this.total <= 1) return;
			const nextIndex = this.current === this.total - 1 ? 0 : this.current + 1;
			this.goTo(nextIndex, "right");
		},

		prev() {
			if (this.total <= 1) return;
			const prevIndex = this.current === 0 ? this.total - 1 : this.current - 1;
			this.goTo(prevIndex, "left");
		},

		goToTarget(index: number) {
			if (index > this.current) this.goTo(index, "right");
			else if (index < this.current) this.goTo(index, "left");
		},

		goTo(nextIndex: number, direction: "right" | "left") {
			if (this.isAnimating || nextIndex === this.current) return;
			this.isAnimating = true;

			const slides = Array.from(
				this.$root.querySelectorAll(".carousel-slide"),
			) as HTMLElement[];
			const currentSlide = slides[this.current];
			const nextSlide = slides[nextIndex];

			nextSlide.style.transition = "none";
			nextSlide.style.transform = `translateX(${direction === "right" ? "100%" : "-100%"})`;
			nextSlide.style.zIndex = "20";
			currentSlide.style.zIndex = "10";

			nextSlide.offsetHeight; // force reflow

			const prefersReducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			const duration = prefersReducedMotion ? "0s" : "0.5s";

			nextSlide.style.transition = `transform ${duration} ease-out`;
			currentSlide.style.transition = `transform ${duration} ease-out`;

			nextSlide.style.transform = "translateX(0)";
			currentSlide.style.transform = `translateX(${direction === "right" ? "-100%" : "100%"})`;

			this.current = nextIndex;

			setTimeout(
				() => {
					currentSlide.style.zIndex = "1";
					nextSlide.style.zIndex = "10";
					this.isAnimating = false;
				},
				prefersReducedMotion ? 0 : 500,
			);
		},
	}));

	Alpine.data("cursor", () => ({
		mouseX: 0,
		mouseY: 0,
		circleX: 0,
		circleY: 0,
		scale: 1,
		opacity: 0,
		hideTimeout: undefined as ReturnType<typeof setTimeout> | undefined,
		reqId: undefined as number | undefined,

		init() {
			const prefersReducedMotion = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			const supportsHover = window.matchMedia("(hover: hover)").matches;
			if (prefersReducedMotion || !supportsHover) return;

			this.reqId = requestAnimationFrame(this.animate.bind(this));
		},

		destroy() {
			if (this.reqId) cancelAnimationFrame(this.reqId);
			if (this.hideTimeout) clearTimeout(this.hideTimeout);
		},

		show() {
			this.opacity = 1;
			if (this.hideTimeout) clearTimeout(this.hideTimeout);
			this.hideTimeout = setTimeout(() => {
				this.opacity = 0;
			}, 2000);
		},

		onMouseMove(e: MouseEvent) {
			this.mouseX = e.clientX;
			this.mouseY = e.clientY;
			this.show();

			const target = e.target as HTMLElement;
			if (target?.closest?.("a, button, .hoverable")) {
				this.scale = 2;
			} else {
				this.scale = 1;
			}
		},

		onMouseEnter() {
			this.show();
		},

		onMouseLeave() {
			if (this.hideTimeout) clearTimeout(this.hideTimeout);
			this.opacity = 0;
		},

		animate() {
			this.circleX += (this.mouseX - this.circleX) * 0.15;
			this.circleY += (this.mouseY - this.circleY) * 0.15;

			const el = this.$el;
			el.style.left = `${this.circleX}px`;
			el.style.top = `${this.circleY}px`;
			el.style.transform = `translate(-50%, -50%) scale(${this.scale})`;
			el.style.opacity = this.opacity.toString();

			this.reqId = requestAnimationFrame(this.animate.bind(this));
		},
	}));

	Alpine.directive("reveal", (el, _options, { cleanup }) => {
		const prefersReducedMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (prefersReducedMotion) return;

		el.classList.add("reveal-up");
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						el.classList.add("is-visible");
						observer.unobserve(el);
					}
				});
			},
			{ threshold: 0.1, rootMargin: "0px" },
		);

		observer.observe(el);
		cleanup(() => observer.disconnect());
	});
}
