import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const scene = await readFile(new URL("../src/experience/ArchitecturalScene.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/pages/ExperiencePage.tsx", import.meta.url), "utf8");
const styles = await readFile(new URL("../src/styles.css", import.meta.url), "utf8");

test("waits for a rendered WebGL frame before marking the experience ready", () => {
  assert.match(scene, /gl\.info\.render\.frame > initialFrame\.current/);
  assert.match(scene, /gl\.info\.render\.calls > 0/);
  assert.match(page, /Math\.min\(99,/);
});

test("handles renderer initialization and WebGL context failure", () => {
  assert.match(scene, /webglcontextlost/);
  assert.match(scene, /webglcontextrestored/);
  assert.match(page, /WebGL renderer initialization timed out/);
  assert.match(page, /ExperienceErrorBoundary/);
  assert.match(page, /experience-static-fallback/);
});

test("uses runtime adaptation instead of CPU or memory heuristics", () => {
  assert.doesNotMatch(page, /deviceMemory|hardwareConcurrency/);
  assert.match(scene, /PerformanceMonitor/);
  assert.match(scene, /frameloop=\{props\.visible/);
});

test("ships the complete mobile architectural asset profile", async () => {
  const assets = [
    "villa-mobile.glb",
    "quiver-tree-mobile.glb",
    "shrub-mobile.glb",
    "fern-mobile.glb",
  ];
  await Promise.all(assets.map((asset) => access(new URL(`../public/experience/models/${asset}`, import.meta.url))));
  assert.match(scene, /villa-mobile\.glb/);
  assert.match(scene, /eilenriede_park_1k\.hdr/);
});

test("uses stable mobile viewport units", () => {
  assert.match(styles, /100svh/);
  assert.match(styles, /100dvh/);
});
