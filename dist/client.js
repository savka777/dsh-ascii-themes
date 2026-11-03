window.__ModuleLoader__.load({
	id: "@local/dsh-ascii-themes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;

		/**
 * Scene library for the ASCII themes backdrop.
 *
 * Each theme is a pure draw function over a sized 2D context. The renderer owns
 * timing, sizing, theme selection, dark/light observation, and reduced motion, so
 * a scene only decides what is lit at time `t` in a `w`x`h` box.
 *
 * Scene signature: `draw(ctx, env)` where env is
 * `{ t, w, h, cell, dark }` — `cell` is a base character-cell size in CSS px.
 *
 * Every periodic term runs a whole number of cycles per scene loop, so the
 * motion has no seam.
 */

const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';
const TAU = Math.PI * 2;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
const mono = (px) => `${Math.max(1, px).toFixed(2)}px ${MONO}`;
const ink = (dark) => (dark ? 1 : 0.85);

function smoothstep(edge0, edge1, x) {
	const k = clamp((x - edge0) / (edge1 - edge0), 0, 1);
	return k * k * (3 - 2 * k);
}

/** Stable 32-bit hash folded to [0, 1). */
function hash2(x, y) {
	let n = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263);
	n = Math.imul(n ^ (n >>> 13), 1274126177);
	n = n ^ (n >>> 16);
	return (n >>> 0) / 4294967295;
}

/** Smooth value noise in [0, 1] on the integer lattice of `hash2`. */
function noise2(x, y) {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	let fx = x - ix;
	let fy = y - iy;
	fx = fx * fx * (3 - 2 * fx);
	fy = fy * fy * (3 - 2 * fy);
	const a = hash2(ix, iy);
	const b = hash2(ix + 1, iy);
	const c = hash2(ix, iy + 1);
	const d = hash2(ix + 1, iy + 1);
	return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
}

function setFont(ctx, px, align = "left") {
	ctx.font = mono(px);
	ctx.textAlign = align;
	ctx.textBaseline = "middle";
}

/** Paint flat `[char, x, y, ...]` triples in one colour. */
function paintGlyphs(ctx, list, rgb, alpha) {
	if (list.length === 0) return;
	ctx.fillStyle = rgba(rgb, alpha);
	for (let i = 0; i < list.length; i += 3) ctx.fillText(list[i], list[i + 1], list[i + 2]);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Glyph Drift — a ring of shuffling characters. Once per loop a front of glyphs
 * sweeps in around it, leaves the ring's core hollow, and drains away.
 * ──────────────────────────────────────────────────────────────────────────── */

const DRIFT_RAMP = "+=xX0S8#@";
const DRIFT_LOOP = 40;

function drawDrift(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const cw = cell * 0.8;
	const ch = cell * 1.32;
	const cols = Math.ceil(w / cw);
	const rows = Math.ceil(h / ch);
	const m = Math.min(w, h);
	const phase = ((t / DRIFT_LOOP) % 1) * TAU;
	const cx = w * 0.62 + Math.cos(phase) * m * 0.03;
	const cy = h * 0.5 + Math.sin(phase * 2) * m * 0.025;
	const radius = m * (0.31 + 0.02 * Math.sin(phase * 3));
	const band = m * 0.075;
	const front = (0.5 - 0.5 * Math.cos(phase)) * 1.5 - 0.25;
	const nx = Math.cos(phase) * 2.5;
	const ny = Math.sin(phase) * 2.5;
	const bright = [];
	const dim = [];
	const accent = [];
	for (let row = 0; row < rows; row += 1) {
		const y = (row + 0.5) * ch;
		for (let col = 0; col < cols; col += 1) {
			const x = (col + 0.5) * cw;
			const seed = hash2(col, row);
			// Each cell re-rolls on its own clock, so the field shuffles instead of strobing.
			const tick = Math.floor(t * (0.8 + seed * 1.8) + seed * 7);
			const roll = hash2(col * 31 + tick, row * 17 - tick);
			const d = Math.hypot(x - cx, y - cy);
			const ring = Math.exp(-(((d - radius) / band) ** 2));
			const n = noise2(col * 0.085 + nx, row * 0.15 + ny);
			const u = (x / w) * 0.62 + (y / h) * 0.38;
			const fill = smoothstep(-0.06, 0.06, front - u + (n - 0.5) * 0.3) * smoothstep(radius * 0.6, radius * 0.85, d);
			const islands = (n - 0.6) * 2.4;
			const v = Math.max(ring, fill * 0.66, islands) + (roll - 0.5) * 0.34;
			if (v < 0.52) continue;
			const level = clamp((v - 0.52) / 0.48, 0, 1);
			const char = DRIFT_RAMP[Math.min(DRIFT_RAMP.length - 1, Math.floor((level * 0.7 + roll * 0.3) * DRIFT_RAMP.length))];
			if (roll > 0.972) accent.push(char, x, y);
			else (level > 0.42 ? bright : dim).push(char, x, y);
		}
	}
	const k = ink(dark);
	setFont(ctx, cw * 1.32, "center");
	paintGlyphs(ctx, dim, dark ? [150, 144, 180] : [112, 104, 142], 0.22 * k);
	paintGlyphs(ctx, bright, dark ? [226, 220, 244] : [52, 46, 82], 0.36 * k);
	paintGlyphs(ctx, accent, dark ? [255, 118, 214] : [206, 36, 150], 0.5 * k);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Signal Blocks — tall pixel blocks. Three comets of blue, cyan and white run
 * round a ring at different speeds; sparks blink on and off around them.
 * ──────────────────────────────────────────────────────────────────────────── */

const SIGNAL_LOOP = 30;
const SIGNAL_STEP = 5; // blocks move in discrete 1/5 s steps
const COMETS = [
	{ cycles: 1, offset: 0, length: 0.42, swell: 1.2 },
	{ cycles: -2, offset: 0.38, length: 0.26, swell: 0.8 },
	{ cycles: 3, offset: 0.7, length: 0.16, swell: 0.6 },
];

function drawSignal(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const bw = cell * 1.3;
	const bh = cell * 2.1;
	const cols = Math.ceil(w / bw);
	const rows = Math.ceil(h / bh);
	const m = Math.min(w, h);
	const step = Math.floor(t * SIGNAL_STEP);
	const ts = step / SIGNAL_STEP;
	const cx = w * 0.62;
	const cy = h * 0.5;
	const radius = m * 0.34;
	const band = Math.max(m * 0.045, bh * 0.7);
	const heads = COMETS.map((comet) => TAU * (comet.cycles * ts / SIGNAL_LOOP + comet.offset));
	const tiers = [[], [], [], []]; // blue, cyan, white, accent
	for (let row = 0; row < rows; row += 1) {
		const y = (row + 0.5) * bh;
		for (let col = 0; col < cols; col += 1) {
			const x = (col + 0.5) * bw;
			const dx = x - cx;
			const dy = y - cy;
			const dr = (Math.hypot(dx, dy) - radius) / band;
			const roll = hash2(col * 13 + step, row * 7 - step * 3);
			let energy = 0;
			if (Math.abs(dr) < 4) {
				const angle = Math.atan2(dy, dx);
				for (let i = 0; i < COMETS.length; i += 1) {
					const comet = COMETS[i];
					// Distance behind the head, measured along the comet's direction of travel.
					let lag = (heads[i] - angle) * Math.sign(comet.cycles);
					lag = ((lag % TAU) + TAU) % TAU;
					const tail = lag / (comet.length * TAU);
					if (tail >= 1) continue;
					const thick = comet.swell * (1 - tail) + 0.45;
					energy = Math.max(energy, Math.exp(-((dr / thick) ** 2)) * (1 - tail) ** 1.4);
				}
			}
			energy += (roll - 0.5) * 0.42;
			let tier = energy > 0.84 ? 2 : energy > 0.6 ? 1 : energy > 0.3 ? 0 : -1;
			if (tier < 0) {
				const near = Math.exp(-(dr * dr) / 10);
				if (roll > 0.006 + 0.05 * near) continue;
				const pick = hash2(col + step * 101, row);
				tier = pick < 0.04 ? 3 : pick < 0.1 ? 2 : pick < 0.32 ? 1 : 0;
			}
			tiers[tier].push(col * bw, row * bh);
		}
	}
	const k = ink(dark);
	const colors = dark
		? [[52, 58, 255, 0.62], [40, 246, 236, 0.46], [255, 255, 255, 0.34], [255, 44, 226, 0.62]]
		: [[44, 52, 240, 0.3], [0, 178, 186, 0.3], [24, 26, 52, 0.28], [226, 0, 168, 0.36]];
	for (let i = 0; i < tiers.length; i += 1) {
		const list = tiers[i];
		if (list.length === 0) continue;
		const [r, g, b, a] = colors[i];
		ctx.fillStyle = rgba([r, g, b], a * k);
		for (let j = 0; j < list.length; j += 2) {
			// Snap edges so neighbouring blocks meet without seams.
			const x0 = Math.round(list[j]);
			const y0 = Math.round(list[j + 1]);
			ctx.fillRect(x0, y0, Math.round(list[j] + bw) - x0, Math.round(list[j + 1] + bh) - y0);
		}
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Orrery — dithered pixel art. A sun-orb with turning rays, three rune
 * medallions in orbit inside it, two moons on dotted tracks, ember dust, and
 * sparks rising. Drawn into a small pixel buffer and scaled up without smoothing.
 * ──────────────────────────────────────────────────────────────────────────── */

const ORRERY_LOOP = 60;
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

const RUNES = [
	["..###..", ".#...#.", "#..#..#", "#.###.#", "#..#..#", ".#...#.", "..###.."],
	["#..#..#", "#..#..#", ".#.#.#.", "..###..", "...#...", "...#...", "..###.."],
	["..###..", ".##....", "##.....", "##.....", "##.....", ".##....", "..###.."],
	["...#...", "#..#..#", ".#.#.#.", "..###..", ".#.#.#.", "#..#..#", "...#..."],
	["..###..", ".#...#.", "..###..", "...#...", ".#####.", "...#...", "...#..."],
	["#######", ".#...#.", "..#.#..", "...#...", "..#.#..", ".#...#.", "#######"],
	["#######", "#......", "#.####.", "#.#..#.", "#.##.#.", "#....#.", "######."],
	[".......", "..###..", "#######", ".#####.", "#######", "..###..", "......."],
];

const ORRERY_DARK = {
	ember: [232, 100, 42], gold: [244, 198, 78], cream: [246, 234, 196],
	pale: [170, 210, 236], blue: [86, 152, 214], white: [255, 255, 255], crimson: [232, 24, 64],
};
const ORRERY_LIGHT = {
	ember: [206, 80, 30], gold: [210, 148, 24], cream: [186, 156, 110],
	pale: [112, 162, 206], blue: [40, 100, 168], white: [92, 60, 40], crimson: [200, 10, 50],
};

const pixelBuffers = new Map();

/** Reusable offscreen pixel buffer of `gw`x`gh`, keyed by size. */
function pixelBuffer(gw, gh) {
	const key = `${gw}x${gh}`;
	let buffer = pixelBuffers.get(key);
	if (!buffer) {
		const canvas = document.createElement("canvas");
		canvas.width = gw;
		canvas.height = gh;
		const context = canvas.getContext("2d");
		const image = context.createImageData(gw, gh);
		buffer = { canvas, context, image, data: new Uint32Array(image.data.buffer) };
		if (pixelBuffers.size > 8) pixelBuffers.clear();
		pixelBuffers.set(key, buffer);
	}
	return buffer;
}

/** RGBA packed for a little-endian Uint32 view of ImageData. */
const pack = (rgb, alpha) => ((Math.round(clamp(alpha, 0, 1) * 255) << 24) | (rgb[2] << 16) | (rgb[1] << 8) | rgb[0]) >>> 0;

function drawOrrery(ctx, env) {
	const { t, w, h, dark } = env;
	const dpr = ctx.getTransform().a || 1;
	const m = Math.min(w, h);
	// About 200 pixels across the short side full-size; never finer than 1 CSS px.
	const across = clamp(m / 4.5, 55, 200);
	const px = Math.max(1, Math.round((m / across) * dpr)) / dpr;
	const gw = Math.ceil(w / px);
	const gh = Math.ceil(h / px);
	const buffer = pixelBuffer(gw, gh);
	const out = buffer.data;
	out.fill(0);

	const pal = dark ? ORRERY_DARK : ORRERY_LIGHT;
	const k = ink(dark);
	const phase = ((t / ORRERY_LOOP) % 1) * TAU;
	const tick = Math.floor(t * 3);
	const cx = gw * 0.62;
	const cy = gh * 0.5;
	const R = Math.min(gw, gh) * 0.36;
	const put = (x, y, color) => {
		x = Math.floor(x);
		y = Math.floor(y);
		if (x >= 0 && y >= 0 && x < gw && y < gh) out[y * gw + x] = color;
	};

	// Ember dust: sparse rust speckle in slow clumps, re-rolled three times a second.
	const dust = pack(pal.ember, 0.24 * k);
	const nx = Math.cos(phase) * 3;
	const ny = Math.sin(phase) * 3;
	for (let y = 0; y < gh; y += 1) {
		for (let x = 0; x < gw; x += 1) {
			const clump = noise2(x * 0.05 + nx, y * 0.05 + ny);
			if (hash2(x + tick * 7919, y - tick * 3571) < 0.03 + 0.2 * clump * clump * clump) out[y * gw + x] = dust;
		}
	}

	// Sun-orb: hot core to cool rim, Bayer-dithered, with 8 turning rays and a fixed crosshair.
	const orb = {
		ember: pack(pal.ember, 0.36 * k), gold: pack(pal.gold, 0.34 * k), cream: pack(pal.cream, 0.32 * k),
		pale: pack(pal.pale, 0.3 * k), blue: pack(pal.blue, 0.3 * k), rim: pack(pal.pale, 0.42 * k),
		ray: pack(pal.cream, 0.5 * k), core: pack(pal.white, 0.7 * k),
	};
	const x0 = Math.max(0, Math.floor(cx - R));
	const x1 = Math.min(gw - 1, Math.ceil(cx + R));
	const y0 = Math.max(0, Math.floor(cy - R));
	const y1 = Math.min(gh - 1, Math.ceil(cy + R));
	for (let y = y0; y <= y1; y += 1) {
		for (let x = x0; x <= x1; x += 1) {
			const dx = x + 0.5 - cx;
			const dy = y + 0.5 - cy;
			const rho = Math.hypot(dx, dy) / R;
			if (rho > 1) continue;
			const i = y * gw + x;
			if (rho > 0.965) { out[i] = orb.rim; continue; }
			if (rho < 0.035) { out[i] = orb.core; continue; }
			const grain = hash2(x * 3 + tick, y * 5 - tick);
			if (((Math.abs(dx) < 0.6 || Math.abs(dy) < 0.6) && ((x + y) & 1) === 0)) { out[i] = orb.ray; continue; }
			const theta = Math.atan2(dy, dx);
			const ray = Math.abs(Math.cos(4 * (theta - phase))) ** 80 * (1 - rho);
			if (ray > 0.25 + grain * 0.3) { out[i] = orb.ray; continue; }
			if (grain < 0.08) continue; // dark specks keep the surface grainy
			const heat = 1.02 - rho + 0.07 * Math.sin(rho * 14 - phase * 4) + 0.05 * Math.sin(phase * 2);
			const level = heat + (BAYER4[(y & 3) * 4 + (x & 3)] - 0.5) * 0.32 + (grain - 0.5) * 0.2;
			out[i] = level > 0.66 ? orb.ember : level > 0.5 ? orb.gold : level > 0.36 ? orb.cream : level > 0.2 ? orb.pale : orb.blue;
		}
	}

	// Dotted orbit tracks, then the moons that ride them.
	const track = pack(pal.pale, 0.34 * k);
	const tracks = [R * 1.22, R * 1.58];
	for (const radius of tracks) {
		const count = Math.round((TAU * radius) / 3);
		for (let i = 0; i < count; i += 1) {
			const a = (i / count) * TAU;
			put(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius * 0.92, track);
		}
	}
	const moons = [
		{ radius: tracks[0], size: Math.max(1.6, R * 0.05), angle: -phase * 2 + 0.6 },
		{ radius: tracks[1], size: Math.max(2.2, R * 0.13), angle: phase - 0.9 },
	];
	const moonLit = pack(pal.cream, 0.62 * k);
	const moonMid = pack(pal.pale, 0.5 * k);
	const moonDark = pack(pal.blue, 0.46 * k);
	for (const moon of moons) {
		const mx = cx + Math.cos(moon.angle) * moon.radius;
		const my = cy + Math.sin(moon.angle) * moon.radius * 0.92;
		// Lit from the orb: the side facing the centre is bright.
		const lx = (cx - mx) / moon.radius;
		const ly = (cy - my) / moon.radius;
		const s = moon.size;
		for (let y = Math.floor(my - s); y <= Math.ceil(my + s); y += 1) {
			for (let x = Math.floor(mx - s); x <= Math.ceil(mx + s); x += 1) {
				const dx = (x + 0.5 - mx) / s;
				const dy = (y + 0.5 - my) / s;
				if (dx * dx + dy * dy > 1) continue;
				const lit = dx * lx + dy * ly + (BAYER4[(y & 3) * 4 + (x & 3)] - 0.5) * 0.5;
				put(x, y, lit > 0.25 ? moonLit : lit > -0.25 ? moonMid : moonDark);
			}
		}
	}

	// Rune medallions orbit inside the orb: a cut-out disc, an ember ring, a cycling rune.
	const ringColor = pack(pal.ember, 0.66 * k);
	const runeColor = pack(pal.ember, 0.74 * k);
	const rm = R * 0.21;
	const scale = Math.floor(((rm - 4) * 1.5) / 7);
	for (let n = 0; n < 3; n += 1) {
		const a = phase + (n * TAU) / 3 + 0.5;
		const mx = cx + Math.cos(a) * R * 0.6;
		const my = cy + Math.sin(a) * R * 0.6;
		for (let y = Math.floor(my - rm - 2); y <= Math.ceil(my + rm + 2); y += 1) {
			for (let x = Math.floor(mx - rm - 2); x <= Math.ceil(mx + rm + 2); x += 1) {
				const r = Math.hypot(x + 0.5 - mx, y + 0.5 - my);
				if (r > rm + 1.5) continue;
				put(x, y, r > rm - 0.5 || r < rm - 2.5 ? 0 : ringColor);
			}
		}
		if (scale < 1) continue;
		const clock = t / 4 + n * 0.37;
		const rune = RUNES[(Math.floor(clock) + n * 3) % RUNES.length];
		const settle = clock % 1; // a new rune assembles from scattered pixels
		const left = Math.round(mx - 3.5 * scale);
		const top = Math.round(my - 3.5 * scale);
		for (let ry = 0; ry < 7; ry += 1) {
			for (let rx = 0; rx < 7; rx += 1) {
				if (rune[ry][rx] !== "#") continue;
				if (settle < 0.12 && hash2(rx + Math.floor(clock) * 9, ry + n * 17) > settle / 0.12) continue;
				for (let sy = 0; sy < scale; sy += 1) {
					for (let sx = 0; sx < scale; sx += 1) put(left + rx * scale + sx, top + ry * scale + sy, runeColor);
				}
			}
		}
	}

	// Sparks rise from below and fade; a rare few burn crimson.
	for (let i = 0; i < 44; i += 1) {
		const seed = hash2(i, 77);
		const cycles = 1 + Math.floor(hash2(i, 5) * 3);
		const age = (cycles * t / ORRERY_LOOP + seed) % 1;
		const sx = hash2(i, 13) * gw + Math.sin(age * TAU * 2 + seed * TAU) * 3;
		const sy = gh * (1.04 - age * 1.08);
		const fade = Math.sin(Math.PI * age);
		const rgb = hash2(i, 29) < 0.06 ? pal.crimson : hash2(i, 31) < 0.5 ? pal.gold : pal.ember;
		put(sx, sy, pack(rgb, 0.7 * fade * k));
		put(sx, sy + 1, pack(rgb, 0.35 * fade * k));
	}

	buffer.context.putImageData(buffer.image, 0, 0);
	ctx.save();
	ctx.imageSmoothingEnabled = false;
	ctx.drawImage(buffer.canvas, 0, 0, gw * px, gh * px);
	ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Theme table
 * ──────────────────────────────────────────────────────────────────────────── */

const THEMES = [
	{ id: "drift", title: "Glyph Drift", accent: "#c8b8ff", draw: drawDrift },
	{ id: "signal", title: "Signal Blocks", accent: "#3f4dff", draw: drawSignal },
	{ id: "orrery", title: "Orrery", accent: "#e8642c", draw: drawOrrery },
	{ id: "none", title: "None", accent: "#8a8fa3", draw() {} },
];


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
function mountScene(canvas, options = {}) {
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
function themeMeta(id) {
	return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}


		const STORAGE_KEY = "dsh.ascii-themes.active";
		const DEFAULT_THEME = "drift";

		function loadTheme() {
			try {
				const stored = window.localStorage.getItem(STORAGE_KEY);
				if (stored && THEMES.some((theme) => theme.id === stored)) return stored;
			} catch {}
			return DEFAULT_THEME;
		}

		function saveTheme(id) {
			try {
				window.localStorage.setItem(STORAGE_KEY, id);
			} catch {}
		}

		/** One animated thumbnail inside the gallery. */
		function ThemeThumb({ id }) {
			const canvasRef = React.useRef(null);
			React.useEffect(() => {
				const canvas = canvasRef.current;
				if (!canvas) return;
				const handle = mountScene(canvas, { theme: id, fps: 6, scale: 4, dpr: 1 });
				return () => handle.dispose();
			}, [id]);
			if (id === "none") {
				return h("div", { className: "dsh-at-off" }, "OFF");
			}
			return h("canvas", { ref: canvasRef, className: "dsh-at-thumb" });
		}

		/** Full-window backdrop plus the floating theme gallery. */
		function ThemedBackdrop() {
			const [theme, setTheme] = React.useState(loadTheme);
			const [open, setOpen] = React.useState(false);
			const canvasRef = React.useRef(null);
			const panelRef = React.useRef(null);
			const triggerRef = React.useRef(null);
			const themeRef = React.useRef(theme);
			themeRef.current = theme;

			React.useEffect(() => {
				const canvas = canvasRef.current;
				if (!canvas) return;
				const handle = mountScene(canvas, { getTheme: () => themeRef.current, fps: 10 });
				return () => handle.dispose();
			}, []);

			React.useEffect(() => {
				saveTheme(theme);
			}, [theme]);

			React.useEffect(() => {
				if (!open) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") setOpen(false);
				};
				const onPointerDown = (event) => {
					const target = event.target;
					if (panelRef.current && panelRef.current.contains(target)) return;
					if (triggerRef.current && triggerRef.current.contains(target)) return;
					setOpen(false);
				};
				window.addEventListener("keydown", onKeyDown);
				window.addEventListener("pointerdown", onPointerDown, true);
				return () => {
					window.removeEventListener("keydown", onKeyDown);
					window.removeEventListener("pointerdown", onPointerDown, true);
				};
			}, [open]);

			React.useEffect(() => {
				const onStorage = (event) => {
					if (event.key !== STORAGE_KEY || !event.newValue) return;
					if (THEMES.some((candidate) => candidate.id === event.newValue)) setTheme(event.newValue);
				};
				window.addEventListener("storage", onStorage);
				return () => window.removeEventListener("storage", onStorage);
			}, []);

			const active = themeMeta(theme);

			return h("div", { className: "dsh-at-root", "data-dsh-ascii-themes": "", "aria-hidden": "true" },
				h("style", null, CSS_TEXT),
				h("canvas", { ref: canvasRef, className: "dsh-at-canvas" }),
				h("div", { className: "dsh-at-controls" },
					h("button", {
						ref: triggerRef,
						type: "button",
						className: "dsh-at-trigger",
						title: `ASCII theme: ${active.title}`,
						"aria-label": "Choose an ASCII theme",
						"aria-expanded": open,
						style: { "--dsh-at-accent": active.accent },
						onClick: () => setOpen((value) => !value),
					},
						h("svg", { viewBox: "0 0 24 24", width: 18, height: 18, "aria-hidden": true, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" },
							h("path", { d: "M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.8-1.8 0-.6-.3-1-.3-1.6 0-.9.7-1.6 1.7-1.6H17a4 4 0 0 0 4-4c0-4-4-8-9-8Z" }),
							h("circle", { cx: 8, cy: 10, r: 1 }),
							h("circle", { cx: 12, cy: 7.5, r: 1 }),
							h("circle", { cx: 16, cy: 10, r: 1 }),
						),
						h("span", { className: "dsh-at-trigger-dot" }),
					),
					open && h("div", { ref: panelRef, className: "dsh-at-panel", role: "dialog", "aria-label": "ASCII themes" },
						h("div", { className: "dsh-at-head" },
							h("div", { className: "dsh-at-heading" },
								h("span", { className: "dsh-at-heading-title" }, "ASCII themes"),
								h("span", { className: "dsh-at-heading-sub" }, "wallpapers painted in characters"),
							),
							h("button", { type: "button", className: "dsh-at-close", onClick: () => setOpen(false), title: "Close (Esc)", "aria-label": "Close theme gallery" }, "esc"),
						),
						h("div", { className: "dsh-at-cards" },
							THEMES.map((entry) => h("button", {
								key: entry.id,
								type: "button",
								className: "dsh-at-card",
								"data-active": entry.id === theme,
								"aria-pressed": entry.id === theme,
								style: { "--dsh-at-accent": entry.accent },
								onClick: () => setTheme(entry.id),
								title: entry.title,
							},
								h("span", { className: "dsh-at-frame" },
									h(ThemeThumb, { id: entry.id }),
									entry.id === theme && h("span", { className: "dsh-at-check", "aria-hidden": true }, "✓"),
								),
								h("span", { className: "dsh-at-label" },
									h("span", { className: "dsh-at-dot" }),
									h("span", { className: "dsh-at-label-text" }, entry.title),
								),
							)),
						),
						h("div", { className: "dsh-at-foot" }, "click a card to apply · saved in this browser · Esc to close"),
					),
				),
			);
		}

		const CSS_TEXT = [
			".dsh-at-root{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}",
			".dsh-at-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;pointer-events:none;mix-blend-mode:multiply;-webkit-mask-image:linear-gradient(to right,rgba(0,0,0,.28),rgba(0,0,0,.4) 17%,#000 27%);mask-image:linear-gradient(to right,rgba(0,0,0,.28),rgba(0,0,0,.4) 17%,#000 27%)}",
			"body[data-ds-dark-theme] .dsh-at-canvas{mix-blend-mode:plus-lighter}",
			".dsh-at-controls{position:absolute;right:18px;bottom:18px;display:flex;flex-direction:column;align-items:flex-end;gap:10px;pointer-events:auto}",
			".dsh-at-trigger{position:relative;width:38px;height:38px;display:grid;place-items:center;border-radius:999px;cursor:pointer;color:var(--dsw-alias-label-primary,rgba(240,242,248,.9));background:var(--dsw-specific-menu,rgba(26,27,33,.9));border:1px solid var(--dsw-alias-border-l3,rgba(255,255,255,.14));box-shadow:var(--dsw-elevation-prominent,0 8px 24px rgba(0,0,0,.35));backdrop-filter:blur(16px);transition:transform .15s ease,border-color .15s ease}",
			".dsh-at-trigger:hover{transform:translateY(-1px);border-color:var(--dsh-at-accent)}",
			".dsh-at-trigger:focus-visible{outline:2px solid var(--dsh-at-accent);outline-offset:2px}",
			".dsh-at-trigger-dot{position:absolute;right:5px;top:5px;width:7px;height:7px;border-radius:999px;background:var(--dsh-at-accent);box-shadow:0 0 10px var(--dsh-at-accent)}",
			".dsh-at-panel{position:absolute;right:0;bottom:48px;width:min(1100px,calc(100vw - 36px));padding:12px 14px 10px;border-radius:14px;background:var(--dsw-specific-menu,rgba(24,25,31,.94));border:1px solid var(--dsw-alias-border-l3,rgba(255,255,255,.14));box-shadow:var(--dsw-elevation-prominent,0 22px 60px rgba(0,0,0,.45));backdrop-filter:blur(20px);color:var(--dsw-alias-label-primary,inherit);box-sizing:border-box}",
			".dsh-at-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}",
			".dsh-at-heading{display:flex;flex-direction:column;gap:2px}",
			".dsh-at-heading-title{font-family:var(--dsw-font-family,ui-sans-serif,system-ui,sans-serif);font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;opacity:.85}",
			".dsh-at-heading-sub{font-size:11px;opacity:.45}",
			".dsh-at-close{cursor:pointer;font:11px ui-monospace,monospace;padding:2px 7px;border-radius:6px;color:inherit;opacity:.5;background:transparent;border:1px solid var(--dsw-alias-border-l3,rgba(255,255,255,.16))}",
			".dsh-at-close:hover{opacity:.9}",
			".dsh-at-cards{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 4px;scrollbar-width:thin}",
			".dsh-at-card{all:unset;display:flex;flex-direction:column;gap:6px;cursor:pointer;flex:0 0 auto;width:96px;border-radius:10px}",
			".dsh-at-card:focus-visible{outline:2px solid var(--dsh-at-accent);outline-offset:2px}",
			".dsh-at-frame{position:relative;display:block;width:96px;height:55px;border-radius:8px;overflow:hidden;background:rgba(10,11,15,.55);border:1px solid var(--dsw-alias-border-l3,rgba(255,255,255,.14));transition:border-color .15s ease,box-shadow .15s ease}",
			".dsh-at-card:hover .dsh-at-frame{border-color:var(--dsh-at-accent)}",
			".dsh-at-card[data-active='true'] .dsh-at-frame{border-color:var(--dsh-at-accent);box-shadow:0 0 0 1px var(--dsh-at-accent),0 0 20px color-mix(in srgb,var(--dsh-at-accent) 45%,transparent)}",
			".dsh-at-thumb{display:block;width:100%;height:100%}",
			".dsh-at-off{display:grid;place-items:center;height:100%;font:11px ui-monospace,monospace;letter-spacing:.18em;opacity:.35}",
			".dsh-at-check{position:absolute;right:5px;top:4px;font-size:10px;line-height:1;padding:2px 4px;border-radius:5px;background:rgba(0,0,0,.55);color:var(--dsh-at-accent)}",
			".dsh-at-label{display:flex;align-items:center;gap:5px;min-width:0}",
			".dsh-at-dot{width:6px;height:6px;border-radius:999px;background:var(--dsh-at-accent);flex:0 0 auto;box-shadow:0 0 8px var(--dsh-at-accent)}",
			".dsh-at-label-text{font-size:11px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:.8}",
			".dsh-at-card[data-active='true'] .dsh-at-label-text{opacity:1;font-weight:600}",
			".dsh-at-foot{margin-top:8px;font-size:10.5px;opacity:.38;letter-spacing:.01em}",
			"@media (prefers-reduced-motion:reduce){.dsh-at-trigger,.dsh-at-frame{transition:none}}",
		].join("\n");

		const inject = ["slots"];

		/**
		 * Occupy `shell.overlay` with the selected ASCII scene and its gallery.
		 * @param ctx - Client root context.
		 */
		function apply(ctx) {
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "ascii-themes",
				order: 50,
			}, ThemedBackdrop));
		}

		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	},
});
