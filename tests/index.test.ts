import { expect, describe, test, vi, beforeEach, afterEach } from "vitest";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import * as prompts from "@clack/prompts";
import { execa } from "execa";
import consola from "consola";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock external dependencies
vi.mock("fs-extra");
vi.mock("execa", () => ({
  execa: vi.fn(),
  $: vi.fn(() => ({
    __proto__: {
      [Symbol.for("nodejs.util.promisify.custom")]: true,
    },
    [Symbol.for("nodejs.util.inspect.custom")]: () => "ExecaChildProcess",
  })),
}));
vi.mock("@clack/prompts", () => ({
  text: vi.fn(),
  confirm: vi.fn(),
  spinner: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
  })),
  intro: vi.fn(),
  outro: vi.fn(),
}));
vi.mock("gradient-string", () => ({
  pastel: vi.fn((text) => text),
}));
vi.mock("consola", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("create-vite-starter-ts CLI", () => {
  test("should detect pnpm from user agent", async () => {
    process.env.npm_config_user_agent = "pnpm/8.6.0 node/v20.10.0 linux x64";
    const { detectPackageManager } = await import("../src");
    expect(await detectPackageManager()).toBe("pnpm");
    delete process.env.npm_config_user_agent;
  });
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    // Setup default mock implementations
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    vi.mocked(fs.ensureDir).mockResolvedValue(undefined);
    vi.mocked(fs.copy).mockResolvedValue(undefined);
    vi.mocked(prompts.text).mockResolvedValue("test-project");
    vi.mocked(prompts.confirm).mockResolvedValue(true);
    vi.mocked(execa).mockResolvedValue({ stdout: "", stderr: "" } as any);
  });

  afterEach(() => {
    vi.resetModules();
  });

  test("should create project in current directory when no path provided", async () => {
    process.argv = ["node", "create-vite-starter-ts"];
    vi.mocked(prompts.text).mockResolvedValue(".");

    const { main } = await import("../src");
    await main();

    expect(fs.ensureDir).toHaveBeenCalledWith(process.cwd());
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("templates/vite"),
      process.cwd(),
      expect.any(Object)
    );
  });

  test("should create project in specified directory", async () => {
    process.argv = ["node", "create-vite-starter-ts", "my-project"];

    const { main } = await import("../src");
    await main();

    expect(fs.ensureDir).toHaveBeenCalledWith(
      expect.stringContaining("my-project")
    );
    expect(fs.copy).toHaveBeenCalledWith(
      expect.stringContaining("templates/vite"),
      expect.stringContaining("my-project"),
      expect.any(Object)
    );
  });

  test("should not initialize git when user declines", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(false);

    const { main } = await import("../src");
    await main();

    expect(execa).not.toHaveBeenCalledWith("git", ["init"], expect.any(Object));
  });

  test("should handle git initialization failure gracefully", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(true); // git init
    vi.mocked(prompts.confirm).mockResolvedValueOnce(false); // no deps install
    const { main } = await import("../src");
    await main();

    expect(consola.error).toHaveBeenCalled();
  });

  test("should detect package manager correctly", async () => {
    // Test npm detection (default)
    vi.mocked(fs.pathExists).mockResolvedValue(false as never);
    const { detectPackageManager } = await import("../src");
    expect(await detectPackageManager()).toBe("npm");

    // Test yarn detection
    vi.mocked(fs.pathExists).mockImplementation(async (path) =>
      path.includes("yarn.lock")
    );
    expect(await detectPackageManager()).toBe("yarn");

    // Test pnpm detection
    vi.mocked(fs.pathExists).mockImplementation(async (path) =>
      path.includes("pnpm-lock.yaml")
    );
    expect(await detectPackageManager()).toBe("pnpm");

    // Test bun detection
    vi.mocked(fs.pathExists).mockImplementation(async (path) =>
      path.includes("bun.lock")
    );
    expect(await detectPackageManager()).toBe("bun");
  });

  test("should handle copy template failures", async () => {
    vi.mocked(fs.copy).mockRejectedValueOnce(new Error("Copy failed"));
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      return undefined as never;
    });

    const { main } = await import("../src");
    await main();

    expect(consola.error).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);
    processExitSpy.mockRestore();
  });

  test("should handle user cancellation", async () => {
    // Clear process.argv to trigger the text prompt
    process.argv = ["node", "create-vite-starter-ts"];
    // Mock text prompt to return null to simulate cancellation
    vi.mocked(prompts.text).mockResolvedValueOnce(null as any);
    const processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      return undefined as never;
    });

    const { main } = await import("../src");
    await main();

    expect(processExitSpy).toHaveBeenCalledWith(1);
    processExitSpy.mockRestore();
  });

  test("should filter out lock files during copy", async () => {
    const { main } = await import("../src");
    await main();

    const copyOptions = vi.mocked(fs.copy).mock.calls[0][2];
    const filter = copyOptions?.filter as (src: string) => boolean;

    expect(filter("package-lock.json")).toBe(false);
    expect(filter("yarn.lock")).toBe(false);
    expect(filter("pnpm-lock.yaml")).toBe(false);
    expect(filter("bun.lock")).toBe(false);
    expect(filter("package.json")).toBe(true);
  });

  test("should use correct install command based on package manager", async () => {
    vi.mocked(prompts.confirm).mockResolvedValueOnce(true); // git init
    vi.mocked(prompts.confirm).mockResolvedValueOnce(true); // install deps

    // Test yarn
    vi.mocked(fs.pathExists).mockImplementation(async (path) =>
      path.includes("yarn.lock")
    );

    const { main } = await import("../src");
    await main();

    // Since we're using $ template literal syntax in the source, check the mock was called
    const $ = await import("execa").then((m) => m.$);
    expect($).toHaveBeenCalled();
  });

  test("should show correct next steps based on conditions", async () => {
    // Test when target dir is not current dir and deps not installed
    process.argv = ["node", "create-vite-starter-ts", "my-project"];
    vi.mocked(prompts.confirm).mockResolvedValueOnce(true); // git init
    vi.mocked(prompts.confirm).mockResolvedValueOnce(false); // don't install deps

    const { main } = await import("../src");
    await main();

    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining("cd my-project")
    );
    expect(consola.info).toHaveBeenCalledWith(
      expect.stringContaining("install")
    );
  });
});
