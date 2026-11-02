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
 * a scene only decides what glyphs exist at time `t` in a `w`x`h` box.
 *
 * Scene signature: `draw(ctx, env)` where env is
 * `{ t, w, h, cell, dark }` — `cell` is a base character-cell size in CSS px.
 */

// Injected by scripts/build.mjs from src/whale-mask.txt.
const WHALE_MASK = ["0000000000000000000000000000000000000000000000000000000000000000000009900000000000000000000000000000","0000000000000000000000000000000000000000000009999999900000000000000099900000000000000000000000000000","0000000000000000000000000000000000000000999999035999000000000000000990990000000000000000000000000000","0000000000000000000099999999999999999999905355500900000000000000000950599000000000000000000000000000","0000000000000009999993053503033303053300505350533900000000000000000900509999000000000000000000009999","0000000000000999303535350505035335003530003330500900000000000000000950030009999000000000000000099009","0000000000999900353000003003335003355333030000533990000000000000000900550550039900000099999999990099","0000000009953300505300033003035305330300000033350099900000000000000933050335350990099993303300030090","0000000999330000300030333005030300305303350003300300999900000000000990033505055099990005503505000990","0000009933330050300003030003035503030305003530030055035990000000000099303000030030503053303035009900","0000099350035030003303353050050000050005003535003000053099900000000009950000050050000033333033099000","0000993350300503533355000035000333355033500300533300053333999000000000999035303530053033050000990000","0009935030030330303033305033030303350053030533055350353030059990000000009990303305305033003999900000","0099500303303050030050003333000050033055053333005003350300000099000000000099305530003000999900000000","0090000030300300035003005053000350000053535303035005300053535539990000000009350053399999900000000000","0993539999999999999993003550305335330303003330333003050030555350399900000099030050090000000000000000","0950009000000000000099999900005300003350330300050500530530330353353999900090050000390000000000000000","9953339000000000000000000999903553050000505030305039999999993350003350999990033503390000000000000000","9305359000000000000000000000999930353035050333003009000000099900303500300305330053990000000000000000","9000039000000000000000000000000999303300335050530509999000000999330030333303330503900000000000000000","9353009000000000000000000000000009999330303000033350999990000009905003030033503003900000000000000000","9533059900000000000000000000000000009933335000055350900990000000990035053055530359900000000000000000","9333033900000000000000000000000000000999503300335350999990000000099500035050005539000000000000000000","9933335900000000000000000000000000000009930003053003500090000000009033053353050099000000000000000000","0903035990000000000000000000000000000000999330035305330399000000009003533503503090000000000000000000","0900500399000000000000000000000000000000009905030003330039999000099035333000330990000000000000000000","0990053339000000000000000000000000000000000995000000333550339999990335300035309900000000000000000000","0090333059900000000000000000000000000000000099303335350000303550000330005305099000000000000000000000","0099300550990000000000000000000000000000000009950000000550033003330003355500990000000000000000000000","0009903005399000000000000000000000000000000000999533305503303000330000355539900000000000000000000000","0000990350339900000000000000000000000000000000009933000035053000500305353399000000000000000000000000","0000099000005990000000000000000000000000000000000993333033300033050030003990000000000000000000000000","0000009900300399900000000000000009990000000000000099300000055303050005599900000000000000000000000000","0000000993550033990000000000000099099990000000000009993300005050303353990000000000000000000000000000","0000000099330350099900000000000009950399990000000000099300530303500009900000000000000000000000000000","0000000009990030033999000000000000935330599900000000009990535330053009000000000000000000000000000000","0000000000099900055339999000000000933503300999000000000099903300333359999900000000000000000000000000","0000000000000990330505509999900009955035000339999000000000999303350305505999990000000000000000000000","0000000000000099990000333053999999333033503000009999000000009999035000053053599000000000000000000000","0000000000000000099953330050035555033300030003005009999999999909999999999999990000000000000000000000","0000000000000000000999900000550005033505505300050505330399990000000000000000000000000000000000000000","0000000000000000000000999900053505003335000355300000399990000000000000000000000000000000000000000000","0000000000000000000000000999999935553030053503039999990000000000000000000000000000000000000000000000","0000000000000000000000000000000999999999999999999000000000000000000000000000000000000000000000000000"];

const MONO = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace';
const RAMP = " .:-=+*#%@";
const SPECK = [".", ".", ":", "o", "O", "0", "*", "+", "'", "`"];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha.toFixed(3)})`;
const mono = (px) => `${Math.max(1, px).toFixed(2)}px ${MONO}`;
const ink = (dark) => (dark ? 1 : 0.55);

/** Stable 32-bit hash folded to [0, 1). */
function hash2(x, y) {
	let n = Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263);
	n = Math.imul(n ^ (n >>> 13), 1274126177);
	n = n ^ (n >>> 16);
	return (n >>> 0) / 4294967295;
}

function glyph(ctx, char, x, y, rgb, alpha) {
	ctx.fillStyle = rgba(rgb, alpha);
	ctx.fillText(char, x, y);
}

function setFont(ctx, px, align = "left") {
	ctx.font = mono(px);
	ctx.textAlign = align;
	ctx.textBaseline = "middle";
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Whale — the DeepSeek mark as a breathing ASCII field.
 * ──────────────────────────────────────────────────────────────────────────── */

function drawWhale(ctx, env) {
	const { t, w, h, dark } = env;
	const rows = WHALE_MASK.length;
	const columns = WHALE_MASK[0].length;
	const cw = Math.max(0.9, Math.min((w * 0.55) / columns, (h * 0.68) / (rows * 1.66)));
	const ch = cw * 1.66;
	const tint = dark ? [128, 162, 255] : [42, 70, 158];
	const base = dark ? 1 : 0.8;
	setFont(ctx, cw * 1.4, "center");
	ctx.save();
	ctx.translate(
		w / 2 + Math.min(w * 0.075, 128) + Math.sin(t * 0.23) * cw * 2,
		h * 0.485 + Math.sin(t * 0.37) * cw * 1.2,
	);
	ctx.rotate(Math.sin(t * 0.31) * 0.012);
	const originX = -(columns * cw) / 2;
	const originY = -(rows * ch) / 2;
	const scan = ((t * 0.16) % 1.3 - 0.15) * rows;
	for (let row = 0; row < rows; row += 1) {
		const line = WHALE_MASK[row];
		const scanBoost = Math.exp(-((row - scan) ** 2) / 26);
		const y = originY + (row + 0.5) * ch;
		for (let col = 0; col < columns; col += 1) {
			const maskValue = (line.charCodeAt(col) - 48) / 9;
			if (maskValue < 0.2) continue;
			const noise = hash2(col, row);
			const wave = 0.5 + 0.5 * Math.sin(
				col * 0.19 - t * 1.55 + row * 0.31 + Math.sin(t * 0.55 + col * 0.03) * 1.1,
			);
			if (maskValue >= 0.85) {
				const char = RAMP[Math.min(RAMP.length - 1, 7 + Math.floor(wave * 3))];
				glyph(ctx, char, originX + (col + 0.5) * cw, y, tint, (0.18 + 0.18 * wave + scanBoost * 0.14) * base);
				continue;
			}
			const twinkle = 0.5 + 0.5 * Math.sin(t * 1.7 + noise * 18 + row * 0.6 + col * 0.2);
			if (twinkle < 0.55) continue;
			const value = Math.min(1, maskValue * twinkle + scanBoost * 0.2);
			const char = RAMP[Math.min(RAMP.length - 1, Math.floor(value * RAMP.length))];
			if (char === " ") continue;
			glyph(ctx, char, originX + (col + 0.5) * cw, y, tint, (0.024 + 0.12 * value) * base);
		}
	}
	ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Toxic Skull — acid-green pixel skulls, spores, and dripping rain.
 * ──────────────────────────────────────────────────────────────────────────── */

const SKULL = [
	"....########....",
	"..############..",
	".##############.",
	"################",
	"###..######..###",
	"##....####....##",
	"##....####....##",
	"###..######..###",
	"################",
	".##############.",
	"..####..##..####",
	"...##########...",
	"....########....",
	"....###..###....",
	"....###..###....",
	".....#....#.....",
];

const SKULLS = [
	{ fx: 0.5, fy: 0.5, scale: 0.021, alpha: 0.07, drift: 0, phase: 0.5 },
	{ fx: 0.5, fy: 0.47, scale: 0.0148, alpha: 0.52, drift: 4, phase: 0.2 },
	{ fx: 0.74, fy: 0.24, scale: 0.0064, alpha: 0.52, drift: 9, phase: 1.7 },
	{ fx: 0.16, fy: 0.32, scale: 0.005, alpha: 0.46, drift: 7, phase: 3.1 },
	{ fx: 0.72, fy: 0.76, scale: 0.0074, alpha: 0.5, drift: 11, phase: 5.2 },
	{ fx: 0.32, fy: 0.8, scale: 0.0046, alpha: 0.4, drift: 6, phase: 2.4 },
	{ fx: 0.9, fy: 0.58, scale: 0.0038, alpha: 0.36, drift: 5, phase: 4.4 },
];

function drawSkull(ctx, cx, cy, px, tint, alpha, echo) {
	// A faint chromatic echo reads as a signal glitch and thickens the silhouette.
	if (echo) {
		setFont(ctx, px * 1.7, "center");
		for (let row = 0; row < SKULL.length; row += 1) {
			const line = SKULL[row];
			for (let col = 0; col < 16; col += 1) {
				if (line[col] !== "#") continue;
				glyph(ctx, "#", cx + (col - 7.5) * px + px * 0.3, cy + (row - 7.5) * px * 1.02 + px * 0.12, echo, alpha * 0.28);
			}
		}
	}
	setFont(ctx, px * 1.7, "center");
	for (let row = 0; row < SKULL.length; row += 1) {
		const line = SKULL[row];
		for (let col = 0; col < 16; col += 1) {
			if (line[col] !== "#") continue;
			glyph(ctx, "#", cx + (col - 7.5) * px, cy + (row - 7.5) * px * 1.02, tint, alpha * (0.78 + 0.22 * hash2(col, row + 9)));
		}
	}
}

function drawSkulls(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const bright = dark ? [186, 255, 142] : [36, 120, 60];
	const main = dark ? [124, 255, 96] : [22, 100, 46];
	const dim = dark ? [70, 190, 92] : [26, 90, 54];
	const sizeBase = Math.min(w, h);
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	for (const skull of SKULLS) {
		const px = clamp(sizeBase * skull.scale, 1.4, 30);
		const travel = (w + 260) * ((t * skull.drift * 0.0021 + skull.phase * 0.12) % 1);
		const x = skull.drift === 0 ? w * skull.fx : travel - 130;
		const y = h * skull.fy + Math.sin(t * 0.35 + skull.phase) * sizeBase * 0.02;
		drawSkull(ctx, x, y, px, bright, skull.alpha * k, dark ? [90, 230, 255] : null);
	}

	// Spores rising from the toxic floor.
	for (let i = 0; i < 90; i += 1) {
		const n1 = hash2(i * 3 + 1, 7);
		const n2 = hash2(i * 11 + 5, 13);
		const speed = 8 + n1 * 30;
		const span = h + 80;
		let y = (n2 * span - t * speed) % span;
		if (y < 0) y += span;
		y -= 40;
		const x = n1 * w + Math.sin(t * 0.6 + i) * 12;
		const alpha = (0.06 + n2 * 0.3) * (0.55 + 0.45 * Math.sin(t * 1.3 + i)) * k;
		if (alpha < 0.02) continue;
		setFont(ctx, cell * (0.9 + n1 * 1.2), "center");
		glyph(ctx, SPECK[i % SPECK.length], x, y, n2 > 0.7 ? bright : main, alpha);
	}

	// Acid rain.
	for (let i = 0; i < 40; i += 1) {
		const n1 = hash2(i * 5 + 2, 21);
		const span = h + 120;
		const y = (n1 * span + t * (40 + n1 * 60)) % span;
		const x = hash2(i * 9 + 4, 31) * w;
		setFont(ctx, cell * 0.95, "center");
		for (let j = 0; j < 3; j += 1) {
			glyph(ctx, "|", x, y - j * cell * 1.9, dim, (0.16 - j * 0.04) * k);
		}
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Koi Lagoon — emerald water bands, coral koi, fireflies, ripples.
 * ──────────────────────────────────────────────────────────────────────────── */

const KOI = ["><(((('>", "><((('>", "><((((('>"];

function drawLagoon(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const waterTop = h * 0.56;
	const sizeBase = Math.min(w, h);
	const emerald = dark ? [92, 246, 205] : [18, 120, 96];
	const deep = dark ? [45, 170, 168] : [14, 82, 92];
	const bright = dark ? [170, 255, 226] : [30, 140, 110];
	const coral = dark ? [255, 150, 106] : [150, 60, 40];

	// Water layers, farthest first.
	for (let layer = 0; layer < 6; layer += 1) {
		const baseY = waterTop + (h - waterTop) * (layer / 5.2);
		const amp = sizeBase * (0.008 + layer * 0.0045);
		const step = Math.max(3, cell * (0.82 + layer * 0.05));
		setFont(ctx, step * 1.28, "center");
		for (let x = 0; x < w + step; x += step) {
			const phase = x * 0.016 + t * (0.45 + layer * 0.2) + layer * 1.7;
			const y = baseY + Math.sin(phase) * amp + Math.sin(phase * 0.47) * amp * 0.4;
			const wave = Math.sin(phase);
			const char = wave > 0.55 ? "~" : wave < -0.55 ? "_" : wave > 0 ? "-" : "=";
			const alpha = (0.2 + layer * 0.04 + (wave + 1) * 0.11) * k;
			glyph(ctx, char, x, y, layer % 2 === 0 ? emerald : deep, alpha);
		}
	}

	// Moon low over the water and a bright horizon band.
	const moonX = w * 0.82;
	const moonY = h * 0.28;
	const moonR = sizeBase * 0.095;
	for (let y = -moonR; y <= moonR; y += cell * 1.1) {
		const half = Math.sqrt(Math.max(0, moonR * moonR - y * y));
		setFont(ctx, cell * 1.1, "center");
		for (let x = -half; x <= half; x += cell * 1.05) {
			const falloff = 1 - Math.sqrt(x * x + y * y) / moonR;
			if (falloff < 0.05) continue;
			glyph(ctx, RAMP[clamp(Math.floor(falloff * 8) + 2, 2, RAMP.length - 1)], moonX + x, moonY + y, bright, (0.18 + falloff * 0.4) * k);
		}
	}
	for (let x = 0; x < w + cell; x += cell * 1.5) {
		setFont(ctx, cell * 1.25, "center");
		glyph(ctx, "~", x, waterTop + Math.sin(x * 0.02 + t * 0.5) * sizeBase * 0.006, bright, 0.4 * k);
	}
	// Moon reflection: a shimmering column of dots on the water.
	setFont(ctx, cell * 0.85, "center");
	for (let y = waterTop; y < h; y += cell * 1.3) {
		const depth = (y - waterTop) / Math.max(1, h - waterTop);
		const spread = moonR * (0.25 + depth * 1.4);
		for (let x = -spread; x <= spread; x += cell * 1.4) {
			if (hash2(Math.round(x), Math.round(y)) < 0.45) continue;
			glyph(ctx, hash2(Math.round(x), Math.round(y) + 5) > 0.7 ? "'" : ".", moonX + x + Math.sin(y * 0.08 + t * 0.8) * 6, y, bright, (0.22 - depth * 0.14) * k);
		}
	}

	// Koi crossing the pond.
	for (let i = 0; i < 4; i += 1) {
		const seed = i * 13 + 5;
		const speed = 9 + hash2(seed, 1) * 12;
		const dir = hash2(seed, 2) > 0.5 ? 1 : -1;
		const span = w + 380;
		const progress = (hash2(seed, 3) * span + t * speed) % span;
		const x = dir > 0 ? progress - 190 : w + 190 - progress;
		const y = waterTop + (h - waterTop) * (0.16 + hash2(seed, 4) * 0.62) + Math.sin(t * 0.8 + i * 2) * sizeBase * 0.012;
		const font = cell * (1.7 + hash2(seed, 5) * 1.0);
		setFont(ctx, font, "center");
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(Math.sin(t * 0.9 + i) * 0.05);
		if (dir < 0) ctx.scale(-1, 1);
		glyph(ctx, KOI[i % KOI.length], 0, 0, coral, 0.95 * k);
		ctx.restore();
	}

	// Ripple trail under each koi is part of the fish pass above.

	// Fireflies above the water.
	for (let i = 0; i < 34; i += 1) {
		const n1 = hash2(i * 7 + 1, 3);
		const n2 = hash2(i * 5 + 2, 9);
		const x = n1 * w + Math.sin(t * 0.5 + i) * 18;
		const y = h * (0.12 + n2 * 0.42) + Math.cos(t * 0.4 + i * 1.3) * 14;
		const alpha = (0.14 + 0.4 * (0.5 + 0.5 * Math.sin(t * 1.6 + i * 2.2))) * k;
		setFont(ctx, cell * (0.8 + n1 * 0.6), "center");
		glyph(ctx, i % 3 === 0 ? "*" : ".", x, y, bright, alpha);
	}

	// Ripples.
	for (let i = 0; i < 4; i += 1) {
		const seed = i * 17 + 9;
		const cx = w * (0.18 + hash2(seed, 1) * 0.64);
		const cy = waterTop + (h - waterTop) * (0.2 + hash2(seed, 2) * 0.55);
		const progress = (t * (0.12 + hash2(seed, 3) * 0.08) + hash2(seed, 4)) % 1;
		const radius = progress * sizeBase * 0.15;
		setFont(ctx, cell * 0.85, "center");
		for (let j = 0; j < 26; j += 1) {
			const angle = (j / 26) * Math.PI * 2;
			const x = cx + Math.cos(angle) * radius;
			const y = cy + Math.sin(angle) * radius * 0.3;
			glyph(ctx, j % 3 === 0 ? "." : "'", x, y, emerald, (1 - progress) * 0.36 * k);
		}
	}

	// Lily pads.
	for (let i = 0; i < 2; i += 1) {
		const seed = i * 23 + 11;
		const cx = w * (0.2 + hash2(seed, 1) * 0.6);
		const cy = waterTop + (h - waterTop) * (0.28 + hash2(seed, 2) * 0.45);
		const rx = sizeBase * 0.042 * (0.8 + hash2(seed, 3) * 0.6);
		setFont(ctx, cell * 0.9, "center");
		for (let j = 0; j < 28; j += 1) {
			const angle = (j / 28) * Math.PI * 2;
			glyph(ctx, j % 2 === 0 ? "_" : "(", cx + Math.cos(angle) * rx, cy + Math.sin(angle) * rx * 0.34, deep, 0.3 * k);
		}
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Neon Jelly — magenta bells and flowing tentacles in a violet current.
 * ──────────────────────────────────────────────────────────────────────────── */

const JELLIES = [
	{ fx: 0.17, fy: 0.34, scale: 0.15, speed: 0.05, alpha: 0.7, phase: 0.4 },
	{ fx: 0.6, fy: 0.6, scale: 0.105, speed: 0.075, alpha: 0.64, phase: 2.2 },
	{ fx: 0.86, fy: 0.26, scale: 0.078, speed: 0.06, alpha: 0.58, phase: 4.1 },
	{ fx: 0.38, fy: 0.82, scale: 0.062, speed: 0.09, alpha: 0.5, phase: 5.6 },
	{ fx: 0.74, fy: 0.88, scale: 0.048, speed: 0.11, alpha: 0.44, phase: 3.0 },
];

function drawJellyfish(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const sizeBase = Math.min(w, h);
	const bell = dark ? [255, 126, 224] : [160, 40, 130];
	const tentacle = dark ? [182, 140, 255] : [80, 50, 150];
	const plankton = dark ? [204, 232, 255] : [60, 80, 120];

	// Plankton field.
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let i = 0; i < 120; i += 1) {
		const n1 = hash2(i * 3 + 1, 5);
		const n2 = hash2(i * 7 + 3, 11);
		const x = n1 * w + Math.sin(t * 0.2 + i) * 8;
		const y = n2 * h + Math.cos(t * 0.17 + i * 1.7) * 8;
		const alpha = (0.08 + n2 * 0.28) * (0.5 + 0.5 * Math.sin(t * 1.1 + i)) * k;
		if (alpha < 0.02) continue;
		setFont(ctx, cell * (0.7 + n1 * 0.5), "center");
		glyph(ctx, i % 5 === 0 ? "*" : ".", x, y, plankton, alpha);
	}

	for (let index = 0; index < JELLIES.length; index += 1) {
		const jelly = JELLIES[index];
		const size = sizeBase * jelly.scale;
		const travel = h + size * 7;
		let y = (h * jelly.fy - t * size * jelly.speed * 6) % travel;
		if (y < 0) y += travel;
		y -= size * 2.5;
		const x = w * jelly.fx + Math.sin(t * 0.25 + jelly.phase) * sizeBase * 0.035;
		const rx = size;
		const ry = size * 0.5;
		const phase = jelly.phase;

		// Soft halo.
		const halo = ctx.createRadialGradient(x, y - ry * 0.2, 0, x, y - ry * 0.2, rx * 2.2);
		halo.addColorStop(0, rgba(bell, 0.1 * k));
		halo.addColorStop(1, rgba(bell, 0));
		ctx.fillStyle = halo;
		ctx.fillRect(x - rx * 2.2, y - ry * 0.2 - rx * 2.2, rx * 4.4, rx * 4.4);

		// Bell: dotted fill under a brighter rim.
		setFont(ctx, cell * (0.9 + jelly.scale * 3.2), "center");
		for (let row = 0; row < 7; row += 1) {
			const vy = y - ry * (0.95 - row * 0.15);
			const half = rx * Math.sqrt(Math.max(0, 1 - ((vy - y) / ry) ** 2));
			for (let vx = -half; vx <= half; vx += cell * 1.25) {
				glyph(ctx, hash2(row, Math.round(vx)) > 0.55 ? "o" : ".", x + vx, vy, bell, jelly.alpha * 0.45 * k);
			}
		}
		for (let a = 0; a <= Math.PI + 0.001; a += 0.1) {
			const bx = x + Math.cos(a) * rx;
			const by = y - Math.sin(a) * ry;
			const char = Math.sin(a) > 0.82 ? "~" : Math.sin(a) > 0.45 ? "-" : ".";
			glyph(ctx, char, bx, by, bell, jelly.alpha * (0.7 + 0.3 * Math.sin(a)) * k);
		}

		// Tentacles.
		for (let strand = 0; strand < 8; strand += 1) {
			const startX = x + (strand / 7 - 0.5) * rx * 1.55;
			const length = size * (2 + hash2(strand, index) * 1.8);
			const steps = Math.max(7, Math.round(length / (cell * 1.2)));
			for (let step = 0; step < steps; step += 1) {
				const progress = step / steps;
				const ty = y + ry * 0.35 + progress * length;
				const tx = startX + Math.sin(t * 1.3 + step * 0.32 + phase + strand * 0.7) * rx * 0.3 * progress;
				const char = step % 4 === 0 ? "|" : step % 4 === 1 ? "~" : step % 4 === 2 ? "'" : ".";
				glyph(ctx, char, tx, ty, tentacle, jelly.alpha * 1.2 * (1 - progress) * k);
			}
		}
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Synth Sunset — striped sun, neon ridges, scrolling perspective grid.
 * ──────────────────────────────────────────────────────────────────────────── */

function drawSynthwave(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const horizon = h * 0.62;
	const sizeBase = Math.min(w, h);
	const cyan = dark ? [86, 244, 240] : [10, 120, 140];
	const violet = dark ? [170, 130, 255] : [70, 50, 160];
	const pink = dark ? [255, 86, 176] : [170, 30, 110];

	// Stars.
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	for (let i = 0; i < 90; i += 1) {
		const x = hash2(i * 3 + 1, 2) * w;
		const y = hash2(i * 5 + 2, 4) * horizon;
		const twinkle = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.3);
		setFont(ctx, cell * (0.8 + hash2(i, 7) * 0.5), "center");
		glyph(ctx, i % 9 === 0 ? "+" : ".", x, y, cyan, (0.15 + twinkle * 0.35) * k);
	}

	// Sun: striped half disc sitting on the horizon.
	const radius = sizeBase * 0.225;
	const sunX = w * 0.5;
	const sunY = horizon + 1;
	for (let y = -radius; y <= 0; y += cell * 1.1) {
		const row = Math.round((y + radius) / (cell * 1.1));
		if (row % 3 === 0 && y > -radius * 0.62) continue;
		const half = Math.sqrt(Math.max(0, radius * radius - y * y));
		const t01 = (y + radius) / radius;
		const tint = [255, Math.round(232 - t01 * 170), Math.round(130 - t01 * 60)];
		for (let x = -half; x <= half; x += cell * 1.15) {
			const edge = Math.abs(x) / Math.max(1, half);
			if (edge > 0.9 && hash2(Math.round(x), Math.round(y)) < 0.5) continue;
			setFont(ctx, cell * 1.25, "center");
			glyph(ctx, edge > 0.78 ? "+" : "#", sunX + x, sunY + y, tint, (0.2 + (1 - edge) * 0.3) * k);
		}
	}

	// Horizon glow.
	for (let x = 0; x <= w; x += cell * 1.5) {
		setFont(ctx, cell * 1.2, "center");
		glyph(ctx, "-", x, horizon, pink, 0.45 * k);
	}

	// Neon ridges.
	for (let layer = 0; layer < 2; layer += 1) {
		const depth = 1 - layer * 0.4;
		const amp = sizeBase * 0.1 * depth;
		for (let x = 0; x <= w; x += cell * 2.1) {
			const ridge = horizon - amp * (0.5 + 0.5 * Math.sin(x * 0.006 + layer * 3.1 + t * 0.03))
				- amp * 0.45 * Math.sin(x * 0.018 + layer * 1.7);
			for (let y = ridge; y < horizon; y += cell * 2.1) {
				setFont(ctx, cell * 1.5, "center");
				glyph(ctx, layer === 0 ? ":" : ".", x, y, layer === 0 ? violet : pink, (0.36 + 0.2 * depth) * k);
			}
		}
	}

	// Perspective grid.
	for (let i = -10; i <= 10; i += 1) {
		const xBottom = w / 2 + i * (w / 10);
		for (let step = 1; step <= 16; step += 1) {
			const p = step / 16;
			const y = horizon + (h - horizon) * p * p;
			const x = w / 2 + (xBottom - w / 2) * p;
			setFont(ctx, cell * 0.95, "center");
			glyph(ctx, ".", x, y, cyan, (0.16 + p * 0.34) * k);
		}
	}
	for (let row = 0; row < 12; row += 1) {
		const p = ((row / 12) + (t * 0.08) % (1 / 12)) % 1;
		const y = horizon + (h - horizon) * p * p;
		for (let x = 0; x <= w; x += cell * 2.1) {
			glyph(ctx, "-", x, y, pink, (0.14 + p * 0.38) * k);
		}
	}

	// Scanline shimmer.
	const shimmer = ((t * 0.2) % 1.6 - 0.2) * h;
	for (let i = 0; i < 30; i += 1) {
		const x = hash2(i, 17) * w;
		setFont(ctx, cell * 0.9, "center");
		glyph(ctx, "+", x, shimmer, cyan, 0.12 * k);
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Shared scenic helpers
 * ──────────────────────────────────────────────────────────────────────────── */

function cloudValue(x, y, cx, cy, rx, ry) {
	const lobes = [
		[-0.52, 0.1, 0.55],
		[0, -0.14, 0.9],
		[0.52, 0.1, 0.55],
		[0, 0.3, 0.78],
	];
	let value = 0;
	for (const [ox, oy, scale] of lobes) {
		const dx = (x - (cx + ox * rx)) / (rx * scale);
		const dy = (y - (cy + oy * ry)) / (ry * scale * 0.7);
		value = Math.max(value, 1 - (dx * dx + dy * dy));
	}
	if (y > cy + ry * 0.6) value *= 0.3;
	return value;
}

function paintCloud(ctx, cx, cy, rx, ry, tint, alpha, sizeBase) {
	const step = Math.max(5, sizeBase / 82);
	setFont(ctx, step * 1.4, "center");
	for (let y = cy - ry * 1.7; y <= cy + ry * 1.2; y += step * 1.55) {
		for (let x = cx - rx * 1.5; x <= cx + rx * 1.5; x += step) {
			const value = cloudValue(x, y, cx, cy, rx, ry);
			if (value <= 0.07) continue;
			const noise = hash2(Math.round(x / step) + Math.round(cx), Math.round(y / step) + Math.round(cy));
			const density = value * (0.6 + 0.4 * noise);
			const char = RAMP[clamp(Math.floor(density * RAMP.length), 1, RAMP.length - 1)];
			glyph(ctx, char, x, y, tint, alpha * (0.4 + 0.8 * value));
		}
	}
}

const lerpTint = (from, to, t) => [
	Math.round(from[0] + (to[0] - from[0]) * t),
	Math.round(from[1] + (to[1] - from[1]) * t),
	Math.round(from[2] + (to[2] - from[2]) * t),
];

/* ─────────────────────────────────────────────────────────────────────────────
 * Azure Peaks — receding blue ranges, hazy valley light, a still lake.
 * ──────────────────────────────────────────────────────────────────────────── */

/** Build a triangular-peak skyline for a layer; sharp summits, straight slopes. */
function makeRidge(seed, count, w, horizon, baseFrac, heightScale, halfMin, halfMax, wiggle = 0.006) {
	const peaks = [];
	for (let i = 0; i < count; i += 1) {
		const s = seed * 13 + i * 7;
		peaks.push({
			x: (0.06 + hash2(s, 1) * 0.88) * w,
			height: horizon * heightScale * (0.55 + hash2(s, 2) * 0.7),
			half: w * (halfMin + hash2(s, 3) * (halfMax - halfMin)),
		});
	}
	const base = horizon * baseFrac;
	return (x) => {
		let rise = 0;
		for (const peak of peaks) {
			const d = Math.abs(x - peak.x) / peak.half;
			if (d < 1) rise = Math.max(rise, peak.height * (1 - d));
		}
		return base - rise + Math.sin(x * 0.01 + seed) * horizon * wiggle;
	};
}

const PEAK_LAYERS = [
	{ base: 0.5, amp: 0.13, peaks: 3, alpha: 0.26, tint: [168, 214, 255], seed: 3, snow: true },
	{ base: 0.58, amp: 0.16, peaks: 3, alpha: 0.3, tint: [116, 176, 248], seed: 7, snow: true },
	{ base: 0.66, amp: 0.19, peaks: 2, alpha: 0.34, tint: [72, 132, 216], seed: 11, snow: false },
	{ base: 0.74, amp: 0.22, peaks: 2, alpha: 0.38, tint: [42, 88, 178], seed: 17, snow: false },
];

function drawPeaks(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const horizon = h * 0.73;
	const sizeBase = Math.min(w, h);
	const ridgeInk = cell * 1.3;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Sky: a dither gradient that thickens toward the horizon.
	for (let y = 0; y < horizon; y += cell * 1.55) {
		const t01 = y / horizon;
		const tint = lerpTint(dark ? [24, 52, 132] : [42, 82, 158], dark ? [132, 200, 255] : [150, 205, 245], t01);
		for (let x = 0; x < w; x += cell * 1.2) {
			const n = hash2(Math.round(x / cell), Math.round(y / cell));
			if (n > 0.14 + t01 * 0.32) continue;
			setFont(ctx, cell * (0.9 + n * 0.8), "center");
			glyph(ctx, n > 0.3 ? "." : "'", x, y, tint, (0.05 + t01 * 0.2) * k);
		}
	}

	// Low sun with a halo.
	const sunX = w * 0.72;
	const sunY = h * 0.22;
	const sunR = sizeBase * 0.055;
	const halo = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 5);
	halo.addColorStop(0, rgba(dark ? [255, 250, 235] : [140, 140, 120], 0.16 * k));
	halo.addColorStop(1, rgba(dark ? [255, 250, 235] : [140, 140, 120], 0));
	ctx.fillStyle = halo;
	ctx.fillRect(sunX - sunR * 5, sunY - sunR * 5, sunR * 10, sunR * 10);
	setFont(ctx, cell * 0.95, "center");
	for (let y = -sunR; y <= sunR; y += cell * 0.72) {
		const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
		for (let x = -half; x <= half; x += cell * 0.68) {
			const falloff = 1 - Math.sqrt(x * x + y * y) / sunR;
			if (falloff < 0.05) continue;
			glyph(ctx, RAMP[clamp(Math.floor(falloff * 8) + 2, 2, RAMP.length - 1)], sunX + x, sunY + y, dark ? [255, 250, 235] : [150, 150, 130], (0.35 + falloff * 0.45) * k);
		}
	}

	// Ranges: a bright ridge line per layer over a diagonal hatch body.
	for (const layer of PEAK_LAYERS) {
		const ridgeAt = makeRidge(layer.seed, layer.peaks, w, horizon, layer.base, layer.amp, 0.14, 0.3);

		setFont(ctx, ridgeInk, "center");
		for (let x = 0; x <= w; x += cell * 1.05) {
			const y = ridgeAt(x);
			const slope = (ridgeAt(x + cell * 1.05) - ridgeAt(x - cell * 1.05)) / (cell * 2.1);
			const char = slope < -0.08 ? "/" : slope > 0.08 ? "\\" : "^";
			glyph(ctx, char, x, y, layer.tint, 0.58 * k);
			glyph(ctx, char, x, y + cell * 1.2, layer.tint, 0.26 * k);
		}

		setFont(ctx, cell * 1.1, "center");
		for (let row = 0; ; row += 1) {
			const y = row * cell * 1.5;
			if (y > horizon) break;
			for (let col = 0; ; col += 1) {
				const x = col * cell * 1.5;
				if (x > w) break;
				if (y < ridgeAt(x) + cell * 2.4) continue;
				if ((col + row * 2) % 5 !== 0) continue;
				glyph(ctx, (col + row) % 3 === 0 ? ":" : ".", x, y, layer.tint, 0.15 * k);
			}
		}
	}

	// Valley haze.
	setFont(ctx, cell * 1.05, "center");
	for (let y = horizon - cell * 3; y < horizon + cell * 2; y += cell * 1.1) {
		for (let x = 0; x < w; x += cell * 1.6) {
			glyph(ctx, "-", x, y, dark ? [200, 235, 255] : [120, 170, 210], 0.11 * k);
		}
	}

	// Lake: shimmering lines and faint vertical drifts under the ranges.
	for (let y = horizon; y < h; y += cell * 1.25) {
		const t01 = (y - horizon) / Math.max(1, h - horizon);
		for (let x = 0; x < w; x += cell * 2) {
			if (hash2(Math.round(x) + 3, Math.round(y) + 5) > 0.3) continue;
			setFont(ctx, cell * 1.15, "center");
			glyph(ctx, t01 < 0.12 ? "~" : "-", x, y, dark ? [116, 196, 245] : [70, 130, 190], (0.27 - t01 * 0.12) * k);
		}
	}
	for (let x = 0; x < w; x += cell * 3.2) {
		const tint = lerpTint(dark ? [90, 150, 235] : [60, 110, 180], dark ? [150, 215, 255] : [110, 170, 220], hash2(Math.round(x), 9));
		for (let y = horizon + cell * 2; y < h; y += cell * 2.2) {
			if (hash2(Math.round(x), Math.round(y)) > 0.35) continue;
			setFont(ctx, cell * 0.95, "center");
			glyph(ctx, ".", x + Math.sin(y * 0.05 + t * 0.4) * cell, y, tint, (0.14 - ((y - horizon) / Math.max(1, h - horizon)) * 0.08) * k);
		}
	}

	// Birds.
	for (let i = 0; i < 3; i += 1) {
		const x = ((t * (5 + i * 4) + i * 380) % (w + 200)) - 100;
		const y = h * (0.16 + i * 0.07) + Math.sin(t * 0.6 + i * 2) * 8;
		setFont(ctx, cell * 1.1, "center");
		glyph(ctx, i % 2 === 0 ? "^" : "~", x, y, dark ? [200, 225, 255] : [90, 120, 150], 0.3 * k);
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Eden Falls — twin waterfalls into a pool between cypress and foliage.
 * ──────────────────────────────────────────────────────────────────────────── */

function drawCypress(ctx, x, baseY, height, width, tint, alpha) {
	setFont(ctx, Math.max(4, width * 0.55), "center");
	for (let y = baseY; y > baseY - height; y -= width * 0.45) {
		const t01 = (baseY - y) / height;
		const half = width * (1 - t01) * 0.5;
		for (let dx = -half; dx <= half; dx += width * 0.28) {
			if (hash2(Math.round(x + dx), Math.round(y)) > 0.72) continue;
			glyph(ctx, t01 < 0.3 ? "^" : ":", x + dx, y, tint, alpha * (0.5 + t01 * 0.5));
		}
	}
}

function drawFalls(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const sizeBase = Math.min(w, h);
	const waterY = h * 0.72;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Distant blue range and sky wash.
	for (let y = 0; y < waterY; y += cell * 1.7) {
		const t01 = y / waterY;
		const tint = lerpTint(dark ? [34, 70, 160] : [50, 90, 160], dark ? [150, 210, 255] : [150, 200, 240], t01);
		for (let x = 0; x < w; x += cell * 1.3) {
			if (hash2(Math.round(x), Math.round(y)) > 0.12 + t01 * 0.26) continue;
			setFont(ctx, cell * 1.1, "center");
			glyph(ctx, RAMP[1 + Math.floor(hash2(Math.round(x) + 5, Math.round(y)) * 4)], x, y, tint, (0.07 + t01 * 0.2) * k);
		}
	}
	for (let x = 0; x <= w; x += cell * 1.1) {
		const ridge = waterY - sizeBase * (0.1 + 0.03 * Math.sin(x * 0.006) + 0.02 * Math.sin(x * 0.017 + 2));
		for (let y = ridge; y < waterY; y += cell * 1.3) {
			if (hash2(Math.round(x), Math.round(y)) > 0.8) continue;
			setFont(ctx, cell * 1.05, "center");
			glyph(ctx, ":", x, y, dark ? [150, 200, 255] : [100, 140, 190], 0.26 * k);
		}
	}

	// Cliff walls left and right, with jagged inner edges.
	for (const side of [-1, 1]) {
		const edge = w * (0.5 + side * 0.34);
		for (let y = w * 0.02; y < waterY; y += cell * 1.1) {
			const jag = edge + side * sizeBase * 0.05 * (0.5 + 0.5 * Math.sin(y * 0.02 + side));
			for (let x = 0; x < w; x += cell * 1.1) {
				const inside = side > 0 ? x > jag : x < jag;
				if (!inside) continue;
				if (hash2(Math.round(x), Math.round(y)) > 0.72) continue;
				setFont(ctx, cell * 1.05, "center");
				glyph(ctx, hash2(Math.round(x) + 4, Math.round(y)) > 0.6 ? "%" : ":", x, y, dark ? [60, 130, 150] : [40, 90, 80], 0.3 * k);
			}
		}
	}

	// Two waterfalls: bright threads with a soft core and mist.
	for (const falls of [{ fx: 0.4, width: 0.045, top: 0.2 }, { fx: 0.54, width: 0.028, top: 0.28 }]) {
		const cx = w * falls.fx;
		const halfW = w * falls.width;
		const top = h * falls.top;
		for (let y = top; y < waterY; y += cell * 0.95) {
			const sway = Math.sin(y * 0.02 + t * 0.7 + falls.fx * 20) * cell * 1.4;
			const spread = halfW * (0.6 + 0.4 * (y - top) / (waterY - top));
			for (let dx = -spread; dx <= spread; dx += cell * 0.8) {
				if (hash2(Math.round(dx), Math.round(y)) > 0.62) continue;
				const edge = Math.abs(dx) / Math.max(1, spread);
				setFont(ctx, cell * (edge < 0.3 ? 1.2 : 1.0), "center");
				glyph(ctx, edge < 0.3 ? "|" : edge < 0.7 ? ":" : "'", cx + dx + sway, y, dark ? [235, 250, 255] : [90, 140, 170], (0.42 + (1 - edge) * 0.3) * k);
			}
		}
		// Base mist and splash.
		for (let i = 0; i < 40; i += 1) {
			const a = hash2(i, 3) * Math.PI * 2;
			const r = hash2(i, 5) * halfW * 2.2;
			setFont(ctx, cell * 1.1, "center");
			glyph(ctx, hash2(i, 7) > 0.5 ? "*" : ".", cx + Math.cos(a) * r, waterY - Math.abs(Math.sin(a)) * halfW * 0.6, dark ? [235, 250, 255] : [80, 130, 160], 0.3 * k);
		}
	}

	// Pool: ripples and reflections.
	for (let y = waterY; y < h; y += cell * 1.2) {
		const t01 = (y - waterY) / Math.max(1, h - waterY);
		for (let x = 0; x < w; x += cell * 1.9) {
			if (hash2(Math.round(x) + 2, Math.round(y) + 4) > 0.4) continue;
			setFont(ctx, cell * 1.15, "center");
			glyph(ctx, t01 < 0.2 ? "~" : "-", x, y, dark ? [120, 200, 235] : [60, 120, 160], (0.27 - t01 * 0.12) * k);
		}
	}
	for (const fx of [0.4, 0.54]) {
		for (let y = waterY + cell * 2; y < h; y += cell * 1.9) {
			const t01 = (y - waterY) / Math.max(1, h - waterY);
			setFont(ctx, cell * 1.0, "center");
			glyph(ctx, ":", w * fx + Math.sin(y * 0.07 + t) * cell * 1.2, y, dark ? [220, 245, 255] : [100, 150, 180], (0.24 - t01 * 0.12) * k);
		}
	}

	// Cypress silhouettes and foreground foliage.
	drawCypress(ctx, w * 0.13, waterY, sizeBase * 0.34, sizeBase * 0.05, dark ? [52, 130, 96] : [30, 80, 60], 0.3 * k);
	drawCypress(ctx, w * 0.2, waterY, sizeBase * 0.24, sizeBase * 0.035, dark ? [46, 118, 88] : [28, 74, 56], 0.26 * k);
	drawCypress(ctx, w * 0.88, waterY, sizeBase * 0.3, sizeBase * 0.045, dark ? [48, 124, 92] : [28, 78, 58], 0.28 * k);
	for (let y = h * 0.82; y < h; y += cell * 1.15) {
		const t01 = (y - h * 0.82) / (h * 0.18);
		for (let x = 0; x < w; x += cell * 1.1) {
			if (hash2(Math.round(x), Math.round(y)) > 0.3 + t01 * 0.35) continue;
			setFont(ctx, cell * 1.15, "center");
			glyph(ctx, hash2(Math.round(x) + 6, Math.round(y)) > 0.6 ? "*" : "%", x, y, dark ? [72, 170, 106] : [30, 90, 60], (0.28 + t01 * 0.3) * k);
		}
	}
	for (let i = 0; i < 9; i += 1) {
		const x = hash2(i * 3 + 1, 11) * w;
		const y = h * (0.84 + hash2(i * 5 + 2, 13) * 0.13);
		setFont(ctx, cell * 1.2, "center");
		glyph(ctx, i % 3 === 0 ? "*" : "o", x, y, dark ? [255, 150, 180] : [160, 50, 90], 0.55 * k);
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Eden Orchard — apple tree, a watcher, and a serpent in the grass.
 * ──────────────────────────────────────────────────────────────────────────── */

const FIGURE = [
	"   o   ",
	"  /|\\  ",
	"   |   ",
	"  ###  ",
	" ##### ",
	"#######",
];

function drawEden(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const sizeBase = Math.min(w, h);
	const groundY = h * 0.62;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Blue distance: sky wash, far water, a low mountain line.
	for (let y = 0; y < groundY; y += cell * 1.7) {
		const t01 = y / groundY;
		const tint = lerpTint(dark ? [30, 64, 150] : [50, 90, 160], dark ? [140, 205, 255] : [150, 200, 240], t01);
		for (let x = 0; x < w; x += cell * 1.35) {
			if (hash2(Math.round(x), Math.round(y)) > 0.04 + t01 * 0.16) continue;
			setFont(ctx, cell * 1.1, "center");
			glyph(ctx, RAMP[1 + Math.floor(hash2(Math.round(x) + 3, Math.round(y)) * 4)], x, y, tint, (0.05 + t01 * 0.13) * k);
		}
	}
	for (let x = 0; x <= w; x += cell * 1.2) {
		const ridge = groundY - sizeBase * (0.07 + 0.025 * Math.sin(x * 0.005 + 1) + 0.015 * Math.sin(x * 0.019));
		for (let y = ridge; y < groundY; y += cell * 1.3) {
			if (hash2(Math.round(x), Math.round(y)) > 0.45) continue;
			setFont(ctx, cell * 1.05, "center");
			glyph(ctx, ":", x, y, dark ? [120, 180, 245] : [90, 140, 190], 0.15 * k);
		}
	}
	for (let y = groundY - cell * 4; y < groundY; y += cell * 1.2) {
		for (let x = 0; x < w; x += cell * 1.8) {
			setFont(ctx, cell * 1.05, "center");
			glyph(ctx, "-", x, y, dark ? [200, 235, 255] : [120, 170, 210], 0.1 * k);
		}
	}

	// Cumulus banks in the blue distance.
	paintCloud(ctx, w * 0.24, groundY * 0.42, w * 0.13, sizeBase * 0.045, dark ? [236, 248, 255] : [120, 160, 205], 0.34 * k, sizeBase);
	paintCloud(ctx, w * 0.46, groundY * 0.3, w * 0.09, sizeBase * 0.032, dark ? [228, 244, 255] : [115, 155, 200], 0.26 * k, sizeBase);

	// Meadow: a green dither that darkens toward the viewer.
	for (let y = groundY; y < h; y += cell * 1.1) {
		const t01 = (y - groundY) / Math.max(1, h - groundY);
		for (let x = 0; x < w; x += cell * 1.05) {
			if (hash2(Math.round(x), Math.round(y)) > 0.35 + t01 * 0.35) continue;
			const tint = lerpTint(dark ? [70, 170, 90] : [30, 100, 60], dark ? [34, 110, 70] : [20, 70, 45], t01);
			setFont(ctx, cell * 1.15, "center");
			glyph(ctx, hash2(Math.round(x) + 8, Math.round(y)) > 0.6 ? "," : "'", x, y, tint, (0.22 + t01 * 0.3) * k);
		}
	}
	for (let i = 0; i < 26; i += 1) {
		const x = hash2(i * 3 + 1, 21) * w;
		const y = groundY + (h - groundY) * (0.15 + hash2(i * 7 + 3, 23) * 0.8);
		setFont(ctx, cell * 1.1, "center");
		glyph(ctx, i % 4 === 0 ? "*" : ".", x, y, i % 3 === 0 ? (dark ? [255, 190, 120] : [170, 110, 40]) : (dark ? [255, 150, 180] : [160, 60, 100]), 0.32 * k);
	}

	// Overhanging leaves framing the top corners.
	for (let side = 0; side < 2; side += 1) {
		for (let i = 0; i < 260; i += 1) {
			const x = side === 0 ? hash2(i, 51) * w * 0.2 : w - hash2(i, 53) * w * 0.2;
			const y = hash2(i * 3 + 1, 55) * h * 0.14;
			if (hash2(i * 7 + 2, 57) > 0.55) continue;
			setFont(ctx, cell * (0.9 + hash2(i, 59) * 0.7), "center");
			glyph(ctx, hash2(i, 61) > 0.5 ? "%" : "*", x, y, dark ? [46, 120, 70] : [26, 80, 50], 0.24 * k);
		}
	}

	// Apple tree: trunk, branches, canopy, fruit.
	const treeX = w * 0.68;
	const trunkTop = h * 0.36;
	const canopyRx = sizeBase * 0.19;
	const canopyRy = sizeBase * 0.13;
	for (let y = h * 0.9; y > trunkTop; y -= cell * 1.0) {
		const t01 = (h * 0.9 - y) / (h * 0.9 - trunkTop);
		const half = sizeBase * (0.026 - t01 * 0.014);
		setFont(ctx, cell * 1.15, "center");
		for (let dx = -half; dx <= half; dx += cell * 0.62) {
			glyph(ctx, Math.abs(dx) > half - cell * 0.7 ? "#" : "|", treeX + dx, y, dark ? [170, 128, 82] : [90, 60, 40], 0.5 * k);
		}
	}
	for (const branch of [{ dir: -1, y: 0.46 }, { dir: 1, y: 0.44 }, { dir: -1, y: 0.4 }]) {
		for (let s = 0; s < 1; s += 0.05) {
			const x = treeX + branch.dir * s * canopyRx * 0.9;
			const y = h * branch.y - s * canopyRy * 0.7;
			setFont(ctx, cell * 1.0, "center");
			glyph(ctx, branch.dir > 0 ? "\\" : "/", x, y, dark ? [150, 110, 70] : [85, 55, 35], 0.4 * k);
		}
	}
	for (let y = -canopyRy; y <= canopyRy; y += cell * 1.15) {
		const half = canopyRx * Math.sqrt(Math.max(0, 1 - (y / canopyRy) ** 2));
		for (let x = -half; x <= half; x += cell * 0.95) {
			const flicker = 0.5 + 0.5 * Math.sin(t * 0.8 + Math.round(x) * 0.13 + Math.round(y) * 0.19);
			if (hash2(Math.round(x), Math.round(y)) > 0.55 + flicker * 0.2) continue;
			setFont(ctx, cell * 1.2, "center");
			glyph(ctx, hash2(Math.round(x) + 2, Math.round(y)) > 0.62 ? "%" : "*", treeX + x, trunkTop + y, dark ? [72, 172, 96] : [30, 100, 55], 0.38 * k);
		}
	}
	for (let i = 0; i < 22; i += 1) {
		const angle = hash2(i * 3 + 5, 31) * Math.PI * 2;
		const radius = hash2(i * 7 + 2, 37) ** 0.6;
		const x = treeX + Math.cos(angle) * canopyRx * radius;
		const y = trunkTop + Math.sin(angle) * canopyRy * radius;
		setFont(ctx, cell * 1.25, "center");
		glyph(ctx, i % 3 === 0 ? "@" : "o", x, y, dark ? [255, 100, 100] : [160, 30, 40], 0.78 * k);
	}

	// Watcher beneath the tree, reaching up.
	const figureX = w * 0.55;
	const figureY = h * 0.6;
	setFont(ctx, cell * 1.15, "center");
	for (let row = 0; row < FIGURE.length; row += 1) {
		for (let col = 0; col < 7; col += 1) {
			const char = FIGURE[row][col];
			if (char === " ") continue;
			glyph(ctx, char, figureX + (col - 3) * cell * 1.1, figureY + (row - 2) * cell * 1.25, dark ? [255, 240, 214] : [150, 120, 80], 0.55 * k);
		}
	}

	// Serpent: a bright winding line through the foreground grass.
	for (let i = 0; i < 46; i += 1) {
		const s = i / 45;
		const x = w * 0.06 + s * w * 0.34;
		const y = h * (0.85 - s * 0.02) + Math.sin(s * 14 + t * 0.6) * h * 0.025;
		setFont(ctx, cell * (1.1 + s * 0.5), "center");
		const char = i % 5 === 0 ? "o" : i % 2 === 0 ? "~" : "-";
		glyph(ctx, char, x, y, dark ? [214, 234, 132] : [100, 110, 40], 0.6 * k);
	}
	// Head and tongue.
	setFont(ctx, cell * 1.3, "center");
	glyph(ctx, "^", w * 0.4, h * 0.83 + Math.sin(14 + t * 0.6) * h * 0.025, dark ? [230, 245, 160] : [110, 120, 50], 0.72 * k);
	glyph(ctx, "~", w * 0.415, h * 0.828 + Math.sin(14 + t * 0.6) * h * 0.025, dark ? [255, 130, 150] : [150, 60, 80], 0.55 * k);
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Golden Valley — warm layered hills, low sun, light shafts, wildflowers.
 * ──────────────────────────────────────────────────────────────────────────── */

const VALLEY_LAYERS = [
	{ base: 0.62, amp: 0.07, peaks: 2, alpha: 0.2, tint: [255, 214, 150], seed: 5 },
	{ base: 0.7, amp: 0.08, peaks: 2, alpha: 0.25, tint: [232, 180, 110], seed: 9 },
	{ base: 0.78, amp: 0.09, peaks: 2, alpha: 0.3, tint: [190, 146, 84], seed: 13 },
	{ base: 0.86, amp: 0.1, peaks: 2, alpha: 0.34, tint: [150, 112, 62], seed: 21 },
];

function drawValley(ctx, env) {
	const { t, w, h, cell, dark } = env;
	const k = ink(dark);
	const sizeBase = Math.min(w, h);
	const ridgeInk = cell * 1.3;
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";

	// Warm sky dither.
	for (let y = 0; y < h * 0.58; y += cell * 1.55) {
		const t01 = y / (h * 0.58);
		const tint = lerpTint(dark ? [58, 46, 96] : [150, 120, 120], dark ? [255, 214, 150] : [230, 190, 140], t01);
		for (let x = 0; x < w; x += cell * 1.2) {
			const n = hash2(Math.round(x / cell), Math.round(y / cell));
			if (n > 0.13 + t01 * 0.3) continue;
			setFont(ctx, cell * (0.9 + n * 0.7), "center");
			glyph(ctx, n > 0.3 ? "." : "'", x, y, tint, (0.05 + t01 * 0.18) * k);
		}
	}

	// Low sun, halo, and diagonal light shafts.
	const sunX = w * 0.3;
	const sunY = h * 0.36;
	const sunR = sizeBase * 0.08;
	const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4);
	glow.addColorStop(0, rgba(dark ? [255, 226, 160] : [190, 140, 60], 0.18 * k));
	glow.addColorStop(1, rgba(dark ? [255, 226, 160] : [190, 140, 60], 0));
	ctx.fillStyle = glow;
	ctx.fillRect(sunX - sunR * 4, sunY - sunR * 4, sunR * 8, sunR * 8);
	setFont(ctx, cell * 0.95, "center");
	for (let y = -sunR; y <= sunR; y += cell * 0.78) {
		const half = Math.sqrt(Math.max(0, sunR * sunR - y * y));
		for (let x = -half; x <= half; x += cell * 0.74) {
			const falloff = 1 - Math.sqrt(x * x + y * y) / sunR;
			if (falloff < 0.05) continue;
			glyph(ctx, RAMP[clamp(Math.floor(falloff * 8) + 2, 2, RAMP.length - 1)], sunX + x, sunY + y, dark ? [255, 236, 170] : [180, 130, 50], (0.4 + falloff * 0.5) * k);
		}
	}
	for (let i = 0; i < 7; i += 1) {
		const angle = Math.PI * (0.12 + i * 0.12);
		for (let r = sunR * 1.2; r < sizeBase * 0.95; r += cell * 2.0) {
			const x = sunX + Math.cos(angle) * r;
			const y = sunY + Math.sin(angle) * r;
			if (x < 0 || x > w || y > h) break;
			setFont(ctx, cell * 1.0, "center");
			glyph(ctx, i % 2 === 0 ? "/" : "\\", x, y, dark ? [255, 226, 170] : [190, 150, 80], 0.1 * k);
		}
	}

	// Layered hills: bright ridge line over diagonal hatch.
	for (const layer of VALLEY_LAYERS) {
		const ridgeAt = makeRidge(layer.seed, layer.peaks, w, h, layer.base, layer.amp, 0.28, 0.52, 0.01);

		setFont(ctx, ridgeInk, "center");
		for (let x = 0; x <= w; x += cell * 1.05) {
			const y = ridgeAt(x);
			const slope = (ridgeAt(x + cell * 1.05) - ridgeAt(x - cell * 1.05)) / (cell * 2.1);
			const char = slope < -0.06 ? "/" : slope > 0.06 ? "\\" : "^";
			glyph(ctx, char, x, y, layer.tint, 0.52 * k);
			glyph(ctx, char, x, y + cell * 1.2, layer.tint, 0.24 * k);
		}

		setFont(ctx, cell * 1.1, "center");
		for (let row = 0; ; row += 1) {
			const y = row * cell * 1.5;
			if (y > h) break;
			for (let col = 0; ; col += 1) {
				const x = col * cell * 1.5;
				if (x > w) break;
				if (y < ridgeAt(x) + cell * 2.2) continue;
				if ((col + row * 2) % 5 !== 0) continue;
				glyph(ctx, (col + row) % 3 === 0 ? ":" : ".", x, y, layer.tint, 0.14 * k);
			}
		}
	}

	// Wildflowers in the near fields.
	for (let i = 0; i < 44; i += 1) {
		const x = hash2(i * 3 + 1, 41) * w;
		const y = h * (0.66 + hash2(i * 7 + 2, 43) * 0.3);
		const colour = i % 4 === 0
			? (dark ? [255, 240, 200] : [170, 150, 100])
			: i % 4 === 1
				? (dark ? [255, 170, 190] : [170, 90, 110])
				: (dark ? [255, 210, 120] : [180, 130, 50]);
		setFont(ctx, cell * (0.9 + hash2(i, 47) * 0.6), "center");
		glyph(ctx, i % 3 === 0 ? "*" : ".", x, y, colour, 0.32 * k);
	}

	// Birds against the light.
	for (let i = 0; i < 4; i += 1) {
		const x = ((t * (6 + i * 3) + i * 320) % (w + 200)) - 100;
		const y = h * (0.18 + i * 0.05) + Math.sin(t * 0.6 + i * 2) * 10;
		setFont(ctx, cell * 1.1, "center");
		glyph(ctx, i % 2 === 0 ? "~" : "^", x, y, dark ? [255, 230, 190] : [150, 110, 50], 0.3 * k);
	}
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Theme table
 * ──────────────────────────────────────────────────────────────────────────── */

const THEMES = [
	{ id: "whale", title: "Whale", accent: "#7da2ff", draw: drawWhale },
	{ id: "skull", title: "Toxic Skull", accent: "#7cff60", draw: drawSkulls },
	{ id: "peaks", title: "Azure Peaks", accent: "#8fd0ff", draw: drawPeaks },
	{ id: "falls", title: "Eden Falls", accent: "#6fe6d8", draw: drawFalls },
	{ id: "eden", title: "Eden Orchard", accent: "#ffb4c8", draw: drawEden },
	{ id: "valley", title: "Golden Valley", accent: "#ffd28a", draw: drawValley },
	{ id: "lagoon", title: "Koi Lagoon", accent: "#4fe0c0", draw: drawLagoon },
	{ id: "jelly", title: "Neon Jelly", accent: "#ff7ad9", draw: drawJellyfish },
	{ id: "synth", title: "Synth Sunset", accent: "#ff4fa3", draw: drawSynthwave },
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
		: () => options.theme ?? "whale";
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
		const DEFAULT_THEME = "whale";

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
