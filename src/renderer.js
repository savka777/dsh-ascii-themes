/**
 * Renderer host for the ASCII theme scenes.
 *
 * Owns canvas sizing, frame pacing, theme lookup, dark/light observation, and
 * reduced motion; the scenes in `scenes.js` only paint at a given time.
 *
 * @param {HTMLCanvasElement} canvas - Element whose CSS box defines the scene size.
 * @param {{ theme?: string, getTheme?: () => string, fps?: number, scale?: number, dpr?: number }} [options]
 * @returns {{ dispose: () => void }}
 */
export function mountScene(canvas, options = {}) {
	const getTheme = typeof options.getTheme === "function"
		? options.getTheme
		: () => options.theme ?? THEMES[0].id;
	const fps = Math.max(1, options.fps ?? 10);
	const frameInterval = 1000 / fps;
	// Supersampling: render the scene at `scale` times the CSS resolution and let
	// CSS downscale it. Small canvases use this so tiny glyphs keep real ink
	// coverage instead of fading out in the rasterizer.
	const renderScale = Math.max(1, options.scale ?? 1);
	const baseDpr = options.dpr ?? null;
	const reduceMotion = typeof window.matchMedia === "function"
		? window.matchMedia("(prefers-reduced-motion: reduce)")
		: null;
	const ctx = canvas.getContext("2d", { alpha: true });
	if (!ctx) return { dispose() {} };

	let cssWidth = 1;
	let cssHeight = 1;
	let startedAt = 0;
	let rafId = 0;
	let lastPaint = 0;
	let disposed = false;

	const isDark = () => document.body.hasAttribute("data-ds-dark-theme");

	function resize() {
		const rect = canvas.getBoundingClientRect();
		cssWidth = Math.max(1, Math.round(rect.width));
		cssHeight = Math.max(1, Math.round(rect.height));
		const dpr = (baseDpr ?? Math.min(2, Math.max(1, window.devicePixelRatio || 1))) * renderScale;
		canvas.width = Math.round(cssWidth * dpr);
		canvas.height = Math.round(cssHeight * dpr);
		if (startedAt === 0) startedAt = performance.now();
		if (reduceMotion !== null && reduceMotion.matches) {
			paint(startedAt + 900);
		} else {
			paint(performance.now());
		}
	}

	function paint(now) {
		if (disposed) return;
		const t = Math.max(0, (now - startedAt) / 1000);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		const dpr = canvas.width / cssWidth;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.textAlign = "left";
		ctx.textBaseline = "middle";
		ctx.globalAlpha = 1;
		const theme = THEMES.find((candidate) => candidate.id === getTheme()) ?? THEMES[0];
		const cell = Math.max(4, Math.min(18, Math.min(cssWidth, cssHeight) / 64));
		theme.draw(ctx, { t, w: cssWidth, h: cssHeight, cell, dark: isDark() });
	}

	function frame(now) {
		if (disposed) return;
		rafId = window.requestAnimationFrame(frame);
		if (now - lastPaint < frameInterval) return;
		lastPaint = now;
		paint(now);
	}

	function cancel() {
		if (rafId !== 0) {
			window.cancelAnimationFrame(rafId);
			rafId = 0;
		}
	}

	function start() {
		if (disposed) return;
		cancel();
		resize();
		if (reduceMotion !== null && reduceMotion.matches) {
			paint(startedAt + 900);
			return;
		}
		rafId = window.requestAnimationFrame(frame);
	}

	const observer = new MutationObserver(() => {
		if (reduceMotion !== null && reduceMotion.matches) paint(startedAt + 900);
	});
	observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });

	const onReducedMotionChange = () => start();
	if (reduceMotion !== null) {
		if (typeof reduceMotion.addEventListener === "function") {
			reduceMotion.addEventListener("change", onReducedMotionChange);
		} else if (typeof reduceMotion.addListener === "function") {
			reduceMotion.addListener(onReducedMotionChange);
		}
	}

	const resizeObserver = typeof ResizeObserver === "function" ? new ResizeObserver(() => resize()) : null;
	if (resizeObserver !== null) resizeObserver.observe(canvas);
	window.addEventListener("resize", resize);

	start();

	return {
		dispose() {
			disposed = true;
			cancel();
			observer.disconnect();
			if (resizeObserver !== null) resizeObserver.disconnect();
			window.removeEventListener("resize", resize);
			if (reduceMotion !== null) {
				if (typeof reduceMotion.removeEventListener === "function") {
					reduceMotion.removeEventListener("change", onReducedMotionChange);
				} else if (typeof reduceMotion.removeListener === "function") {
					reduceMotion.removeListener(onReducedMotionChange);
				}
			}
		},
	};
}

/** Resolve a theme id, falling back to the first scene entry. */
export function themeMeta(id) {
	return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
