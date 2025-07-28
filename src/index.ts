#!/usr/bin/env node

import { intro, outro, confirm, text, spinner } from "@clack/prompts";
import { $ } from "execa";
import { pastel } from "gradient-string";
import fs from "fs-extra";
import path from "node:path";
import consola from "consola";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATE_DIR = path.join(__dirname, "templates", "vite");

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export async function detectPackageManager(): Promise<PackageManager> {
  try {
    if (await fs.pathExists("pnpm-lock.yaml")) return "pnpm";
    if (await fs.pathExists("yarn.lock")) return "yarn";
    if (await fs.pathExists("bun.lock")) return "bun";
    return "npm";
  } catch (_error) {
    return "npm";
  }
}

export async function main(): Promise<void> {
  // Display a fancy intro
  intro(pastel("Create Vite Starter"));

  // Get project name from args or prompt
  let targetDir = process.argv[2];
  if (!targetDir) {
    const response = await text({
      message: "Where would you like to create your project?",
      placeholder: ".",
    });
    if (!response || typeof response === "symbol") process.exit(1);
    targetDir = response;
  }

  // Resolve to absolute path
  targetDir = path.resolve(targetDir);

  // Create directory if it doesn't exist
  await fs.ensureDir(targetDir);

  // Git init prompt
  const shouldGitInit = await confirm({
    message: "Would you like to initialize a git repository?",
  });

  // Install dependencies prompt
  const shouldInstall = await confirm({
    message: "Would you like to install dependencies?",
  });

  // Copy template
  const s = spinner();
  s.start("Creating project structure");

  try {
    await fs.copy(TEMPLATE_DIR, targetDir, {
      filter: (src: string) => {
        // Don't copy package-lock.json, pnpm-lock.yaml, yarn.lock, or bun.lock
        const filename = path.basename(src);
        return (
          !filename.endsWith("lock.json") &&
          !filename.endsWith(".lock") &&
          !filename.endsWith(".yaml")
        );
      },
    });
    s.stop("Project structure created");
  } catch (error) {
    s.stop("Failed to create project structure");
    consola.error(error);
    process.exit(1);
  }

  // Git init if requested
  if (shouldGitInit) {
    s.start("Initializing git repository");
    try {
      await $`git init ${targetDir}`;
      s.stop("Git repository initialized");
    } catch (error) {
      s.stop("Failed to initialize git repository");
      consola.error(error);
    }
  }

  // Install dependencies if requested
  if (shouldInstall) {
    const packageManager = await detectPackageManager();
    s.start(`Installing dependencies with ${packageManager}`);

    try {
      const installCommand = packageManager === "yarn" ? "add" : "install";
      await $({ cwd: targetDir })`${packageManager} ${installCommand}`;
      s.stop("Dependencies installed");
    } catch (error) {
      s.stop("Failed to install dependencies");
      consola.error(error);
    }
  }

  // Display completion message
  outro(pastel("Project created successfully! 🎉"));

  // Show next steps
  consola.info(`\nNext steps:`);
  if (targetDir !== ".") {
    consola.info(`  cd ${path.relative(process.cwd(), targetDir)}`);
  }
  if (!shouldInstall) {
    consola.info(`  ${await detectPackageManager()} install`);
  }
  consola.info(`  ${await detectPackageManager()} run dev\n`);
}

main().catch(console.error);
