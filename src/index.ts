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
  // 1. Check environment variable
  const userAgent = process.env.npm_config_user_agent || "";
  if (userAgent.includes("pnpm")) return "pnpm";
  if (userAgent.includes("yarn")) return "yarn";
  if (userAgent.includes("bun")) return "bun";

  // 2. Fallback to lockfile detection in cwd
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

  // Check if directory exists and is not empty
  if (await fs.pathExists(targetDir)) {
    const files = await fs.readdir(targetDir);
    if (files.length > 0) {
      consola.error(
        `Aborting: The target directory '${targetDir}' already exists and is not empty. Please choose a different directory or remove the existing one.`
      );
      process.exit(1);
    }
  }
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
          filename !== "node_modules" &&
          !filename.endsWith("lock.json") &&
          !filename.endsWith(".lock") &&
          !filename.endsWith(".yaml")
        );
      },
    });
    // Handle git-ignore.txt: copy its content to .gitignore and then remove the .txt file
    const sourceGitignoreTxtPath = path.join(targetDir, "git-ignore.txt");
    const targetGitignorePath = path.join(targetDir, ".gitignore");

    if (await fs.pathExists(sourceGitignoreTxtPath)) {
      const gitignoreContent = await fs.readFile(
        sourceGitignoreTxtPath,
        "utf8"
      );
      await fs.writeFile(targetGitignorePath, gitignoreContent);
      await fs.remove(sourceGitignoreTxtPath); // Remove the .txt file
    }
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
    consola.info(`Detected package manager: ${packageManager}`);
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
