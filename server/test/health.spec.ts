import { ConfigService } from "@nestjs/config";
import { HealthController } from "../src/modules/health/health.controller";

describe("HealthController", () => {
  const healthy = {
    status: "ok",
    info: { database: { status: "up" }, memory_heap: { status: "up" } },
    error: {},
    details: { database: { status: "up" }, memory_heap: { status: "up" } },
  };

  function controller(commit?: string) {
    const health = { check: jest.fn().mockResolvedValue(healthy) };
    const prismaIndicator = { pingCheck: jest.fn() };
    const memory = { checkHeap: jest.fn() };
    const config = {
      get: jest.fn((key: string, fallback?: unknown) =>
        key === "RAILWAY_GIT_COMMIT_SHA" ? commit : fallback,
      ),
    };

    return new HealthController(
      health as never,
      {} as never,
      memory as never,
      prismaIndicator as never,
      {} as never,
      config as unknown as ConfigService,
    );
  }

  it("publishes the Railway commit without exposing other environment values", async () => {
    const result = await controller("281ac37d9ce8a20529b3af24a6b4e98160b43df2").check();

    expect(result.release).toEqual({
      commit: "281ac37d9ce8a20529b3af24a6b4e98160b43df2",
    });
  });

  it("uses null when Railway does not provide a valid commit", async () => {
    await expect(controller("not-a-commit").check()).resolves.toMatchObject({
      release: { commit: null },
    });
    await expect(controller().check()).resolves.toMatchObject({
      release: { commit: null },
    });
  });
});
