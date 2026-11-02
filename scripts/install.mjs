#!/usr/bin/env node
/**
 * Install (or remove) the built plugin as a local bundle in a DSH profile.
 *
 *   node scripts/install.mjs [--profile-dir <dir>] [--remove] [--dry-run]
 *
 * The profile is `$DSH_PROFILE_DIR` when set, else `~/.dsh/profiles/desktop`.
 * Installation links `dist/` into the profile's `node_modules`, records a `link:`
 * dependency, and selects the bundle in `dsh.profile.bundles` — the same three
 * effects as installing through Plugin Manager, without a registry round-trip.
 *
 * The writes land outside the session workspace, so a sandboxed agent must run
 * this with the wider permission its environment offers. The app hot-applies a
 * newly selected bundle; reload the page to see it.
 */
import { readFile, writeFile, mkdir, symlink, lstat, rm, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const templateRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
	const options = { profileDir: undefined, dist: join(templateRoot, "dist"), remove: false, dryRun: false };
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === "--profile-dir") options.profileDir = argv[++i];
		else if (arg === "--dist") options.dist = resolve(argv[++i]);
		else if (arg === "--remove") options.remove = true;
		else if (arg === "--dry-run") options.dryRun = true;
		else if (arg === "--help" || arg === "-h") {
			console.log("usage: node scripts/install.mjs [--profile-dir <dir>] [--dist <dir>] [--remove] [--dry-run]");
			process.exit(0);
		} else throw new Error(`unknown argument: ${arg}`);
	}
	return options;
}

const options = parseArgs(process.argv.slice(2));
const profileDir = resolve(
	options.profileDir ?? process.env.DSH_PROFILE_DIR ?? join(homedir(), ".dsh", "profiles", "desktop"),
);
const manifestPath = join(profileDir, "package.json");
if (!existsSync(manifestPath)) {
	throw new Error(
		`${manifestPath} not found. Open DeepSeek Harness Desktop once to initialize its profile, ` +
		`or pass --profile-dir <profile> for another profile.`,
	);
}

const distManifest = JSON.parse(await readFile(join(options.dist, "package.json"), "utf8"));
const name = distManifest.name;
if (typeof name !== "string" || name.length === 0) throw new Error("dist/package.json has no package name");
if (distManifest.dsh?.bundle?.patch === undefined) throw new Error("dist/package.json has no dsh.bundle.patch");
const linkPath = join(profileDir, "node_modules", name);
const target = relative(dirname(linkPath), options.dist);

const profile = JSON.parse(await readFile(manifestPath, "utf8"));
profile.dependencies ??= {};
profile.dsh ??= {};
profile.dsh.profile ??= {};
profile.dsh.profile.bundles ??= [];
const hadDependency = Object.hasOwn(profile.dependencies, name);
const hadBundle = profile.dsh.profile.bundles.includes(name);

function plannedActions() {
	if (options.remove) {
		return [
			`remove symlink ${linkPath}`,
			`drop dependency ${name}`,
			`drop bundle ${name} from dsh.profile.bundles`,
		];
	}
	return [
		`link ${linkPath} -> ${target}`,
		`set dependency ${name} = link:${options.dist}`,
		`append ${name} to dsh.profile.bundles`,
	];
}

if (options.dryRun) {
	console.log(`profile: ${profileDir}`);
	console.log(plannedActions().map((line) => `  - ${line}`).join("\n"));
	process.exit(0);
}

if (options.remove) {
	await rm(linkPath, { force: true });
	delete profile.dependencies[name];
	profile.dsh.profile.bundles = profile.dsh.profile.bundles.filter((bundle) => bundle !== name);
} else {
	await mkdir(dirname(linkPath), { recursive: true });
	try {
		const existing = await lstat(linkPath);
		if (existing.isSymbolicLink() || existing.isDirectory() || existing.isFile()) await rm(linkPath, { recursive: true, force: true });
	} catch {}
	await symlink(target, linkPath, "dir");
	profile.dependencies[name] = `link:${options.dist}`;
	if (!hadBundle) profile.dsh.profile.bundles.push(name);
}

const tempPath = `${manifestPath}.tmp`;
await writeFile(tempPath, `${JSON.stringify(profile, null, 2)}\n`, { mode: 0o600 });
await rename(tempPath, manifestPath);

console.log(`${options.remove ? "removed" : "installed"} ${name} in ${profileDir}`);
if (!options.remove) {
	console.log(`bundles: ${profile.dsh.profile.bundles.join(", ")}`);
	console.log(`\nReload the Web UI page. The row id is declared in dist/cordis.patch.yml.`);
} else if (!hadDependency && !hadBundle) {
	console.log("nothing was installed under that name");
}
