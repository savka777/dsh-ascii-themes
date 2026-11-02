#!/usr/bin/env node
/**
 * Verify a Web UI plugin in a real page: authenticate a headless Chromium with a
 * derived DSH browser cookie, load the app, inspect the DOM, and capture a
 * screenshot.
 *
 *   node verify-web-ui.mjs --selector "[data-dsh-backdrop]" --screenshot /tmp/backdrop.png
 *   node verify-web-ui.mjs --url http://127.0.0.1:54911/ --theme light --click Continue
 *
 * Cookie derivation reads the owner-scoped `client-connection/browser-session`
 * secret from `$DSH_HOME/.credentials.yaml` and signs the same v1 payload the
 * Host writes, so the request passes browser authentication without touching the
 * user's browser. Prints one JSON summary on stdout; diagnostics go to stderr.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { createHash, createHmac } from "node:crypto";
import { homedir } from "node:os";
import { join } from "node:path";

function parseArgs(argv) {
	const options = {
		url: process.env.DSH_WEB_URL ?? "http://127.0.0.1:54393/",
		selector: "[data-dsh-backdrop]",
		screenshot: undefined,
		width: 1440,
		height: 900,
		wait: 8000,
		theme: undefined,
		click: undefined,
		json: true,
	};
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		const next = () => argv[++i];
		if (arg === "--url") options.url = next();
		else if (arg === "--selector") options.selector = next();
		else if (arg === "--screenshot") options.screenshot = next();
		else if (arg === "--width") options.width = Number(next());
		else if (arg === "--height") options.height = Number(next());
		else if (arg === "--wait") options.wait = Number(next());
		else if (arg === "--theme") options.theme = next();
		else if (arg === "--click") options.click = next();
		else if (arg === "--help" || arg === "-h") {
			console.log("usage: node verify-web-ui.mjs [--url URL] [--selector CSS] [--screenshot PATH] [--width N] [--height N] [--wait MS] [--theme light|dark] [--click TEXT]");
			process.exit(0);
		} else throw new Error(`unknown argument: ${arg}`);
	}
	return options;
}

const options = parseArgs(process.argv.slice(2));
const url = new URL(options.url);
const base64url = (buffer) => Buffer.from(buffer).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");

function deriveCookie() {
	const home = process.env.DSH_HOME ?? join(homedir(), ".dsh");
	const credentials = readFileSync(join(home, ".credentials.yaml"), "utf8");
	const lines = credentials.split("\n");
	const recordAt = lines.findIndex((line) => line.includes("client-connection/browser-session"));
	if (recordAt < 0) throw new Error("browser-session credential record not found; open the Web UI once");
	const secretLine = lines.slice(recordAt, recordAt + 12).find((line) => /^\s+secret:\s*\S+/.test(line));
	if (!secretLine) throw new Error("browser-session record has no secret");
	const encoded = secretLine.replace(/^\s+secret:\s*/, "").trim().replace(/^["']|["']$/g, "");
	const secret = Buffer.from(encoded.replaceAll("-", "+").replaceAll("_", "/"), "base64");
	if (secret.length !== 32) throw new Error("browser-session secret is not 32 bytes");
	const now = Date.now();
	const payload = { version: 1, authority: url.host, issuedAt: now, expiresAt: now + 30 * 86_400_000 };
	const body = base64url(JSON.stringify(payload));
	const signature = createHmac("sha256", secret).update(body).digest();
	const name = `dsh-auth-${base64url(createHash("sha256").update(url.host).digest())}`;
	return { name, value: `v1.${body}.${base64url(signature)}` };
}

function findBrowser() {
	if (process.env.BROWSER_BIN && existsSync(process.env.BROWSER_BIN)) return process.env.BROWSER_BIN;
	const candidates = [];
	const playwrightRoots = [
		join(homedir(), "Library", "Caches", "ms-playwright"),
		join(homedir(), ".cache", "ms-playwright"),
	];
	for (const root of playwrightRoots) {
		if (!existsSync(root)) continue;
		const versions = readdirSync(root).filter((entry) => /^chromium-\d+$/.test(entry)).sort().reverse();
		for (const version of versions) {
			candidates.push(join(root, version, "chrome-mac-arm64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"));
			candidates.push(join(root, version, "chrome-mac", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"));
			candidates.push(join(root, version, "chrome-mac-arm64", "Chromium.app", "Contents", "MacOS", "Chromium"));
			candidates.push(join(root, version, "chrome-linux", "chrome"));
		}
	}
	candidates.push(
		"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
		"/Applications/Chromium.app/Contents/MacOS/Chromium",
		"/usr/bin/google-chrome",
		"/usr/bin/chromium",
		"/usr/bin/chromium-browser",
	);
	const found = candidates.find((candidate) => existsSync(candidate));
	if (!found) throw new Error("no Chromium found; set BROWSER_BIN to a Chrome/Chromium executable");
	return found;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
	const cookie = deriveCookie();
	const browser = findBrowser();
	const port = Number(process.env.CDP_PORT ?? 9391);
	const profileDir = join(process.env.TMPDIR ?? "/tmp", `dsh-verify-${process.pid}-${port}`);
	const proc = spawn(browser, [
		"--headless=new",
		"--no-sandbox",
		"--disable-gpu",
		"--disable-crash-reporter",
		"--disable-breakpad",
		"--no-first-run",
		"--no-default-browser-check",
		"--hide-scrollbars",
		"--use-mock-keychain",
		"--password-store=basic",
		"--remote-allow-origins=*",
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${profileDir}`,
		`--window-size=${options.width},${options.height}`,
		"about:blank",
	], { stdio: ["ignore", "ignore", "pipe"] });
	let stderr = "";
	proc.stderr.on("data", (chunk) => { stderr += chunk.toString(); });

	let endpoint;
	for (let i = 0; i < 150; i += 1) {
		try {
			const response = await fetch(`http://127.0.0.1:${port}/json/version`);
			if (response.ok) { endpoint = await response.json(); break; }
		} catch {}
		await sleep(100);
	}
	if (!endpoint) throw new Error(`Chromium DevTools endpoint did not start:\n${stderr.slice(-2000)}`);

	const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
	const page = targets.find((target) => target.type === "page");
	if (!page) throw new Error("no page target");
	const ws = new WebSocket(page.webSocketDebuggerUrl);
	ws.onerror = (event) => console.error("websocket error:", event.message ?? event);
	await new Promise((resolve, reject) => {
		ws.onopen = resolve;
		setTimeout(() => reject(new Error("websocket open timeout")), 5000);
	});

	let nextId = 0;
	const pending = new Map();
	const consoleErrors = [];
	ws.onmessage = (event) => {
		const message = JSON.parse(event.data);
		if (message.id && pending.has(message.id)) {
			const { resolve, reject } = pending.get(message.id);
			pending.delete(message.id);
			if (message.error) reject(new Error(JSON.stringify(message.error)));
			else resolve(message.result);
			return;
		}
		if (message.method === "Runtime.exceptionThrown") {
			consoleErrors.push(message.params.exceptionDetails?.exception?.description ?? message.params.exceptionDetails?.text);
		}
		if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
			consoleErrors.push((message.params.args ?? []).map((arg) => arg.value ?? arg.description ?? "").join(" "));
		}
	};
	const send = (method, params = {}) => {
		const id = ++nextId;
		ws.send(JSON.stringify({ id, method, params }));
		return Promise.race([
			new Promise((resolve, reject) => pending.set(id, { resolve, reject })),
			new Promise((_, reject) => setTimeout(() => reject(new Error(`CDP timeout: ${method}`)), 15000)),
		]);
	};

	await send("Page.enable");
	await send("Runtime.enable");
	await send("Network.enable");
	await send("Emulation.setDeviceMetricsOverride", { width: options.width, height: options.height, deviceScaleFactor: 2, mobile: false });
	if (options.theme) {
		await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: options.theme }] });
	}
	const setCookie = await send("Network.setCookie", { name: cookie.name, value: cookie.value, url: url.origin + "/", path: "/" });
	if (!setCookie.success) throw new Error(`cookie rejected: ${JSON.stringify(setCookie)}`);

	await send("Page.navigate", { url: url.toString() });
	await sleep(options.wait);
	if (options.click) {
		await send("Runtime.evaluate", {
			expression: `(() => { const label = ${JSON.stringify(options.click)}; const elements = [...document.querySelectorAll("button,[role=button],a")]; const hit = elements.find((el) => (el.textContent || "").trim().toLowerCase().includes(label.toLowerCase())); if (hit) hit.click(); return Boolean(hit); })()`,
			returnByValue: true,
		});
		await sleep(1200);
	}

	const evaluation = await send("Runtime.evaluate", {
		returnByValue: true,
		awaitPromise: true,
		expression: `(async () => {
			const selector = ${JSON.stringify(options.selector)};
			const element = document.querySelector(selector);
			const canvas = element ? element.querySelector("canvas") : null;
			const result = {
				selector,
				present: Boolean(element),
				canvas: Boolean(canvas),
				ariaHidden: element ? element.getAttribute("aria-hidden") : null,
				pointerEvents: element ? getComputedStyle(element).pointerEvents : null,
				blend: canvas ? getComputedStyle(canvas).mixBlendMode : null,
				size: canvas ? canvas.width + "x" + canvas.height : null,
				litPixels: null,
				centerHit: null,
				darkTheme: document.body.hasAttribute("data-ds-dark-theme"),
			};
			if (canvas) {
				const ctx = canvas.getContext("2d");
				const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
				let lit = 0;
				for (let i = 3; i < data.length; i += 4) if (data[i] > 0) lit += 1;
				result.litPixels = lit;
			}
			const rect = canvas ? canvas.getBoundingClientRect() : null;
			if (rect) {
				const hit = document.elementFromPoint(rect.width / 2, rect.height * 0.75);
				result.centerHit = hit ? hit.tagName + (hit === canvas ? " (canvas)" : "") : null;
			}
			return result;
		})()`,
	});

	let screenshotBytes;
	if (options.screenshot) {
		const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
		writeFileSync(options.screenshot, Buffer.from(shot.data, "base64"));
		screenshotBytes = Buffer.from(shot.data, "base64").length;
	}

	ws.close();
	proc.kill("SIGKILL");
	const summary = {
		url: url.toString(),
		browser,
		...evaluation.result.value,
		screenshot: options.screenshot ?? null,
		screenshotBytes: screenshotBytes ?? null,
		consoleErrors: consoleErrors.filter((line) => !/deepseek-account/.test(line)),
	};
	if (options.json) console.log(JSON.stringify(summary, null, 2));
	return summary.present && (summary.litPixels === null || summary.litPixels > 0) ? 0 : 1;
}

main()
	.then((code) => process.exit(code))
	.catch((error) => {
		console.error(String(error?.stack ?? error));
		process.exit(2);
	});
