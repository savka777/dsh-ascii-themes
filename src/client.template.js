window.__ModuleLoader__.load({
	id: "@local/dsh-ascii-themes",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		const React = require("react");
		const h = React.createElement;

		__THEME_SCENES__

		__THEME_RENDERER__

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
