import { describe, expect, it, vi } from "vitest";
import type { ResolvedRingCentralAccount } from "./accounts.js";
import { downloadRingCentralAttachment } from "./api.js";
import * as auth from "./auth.js";
import { Readable } from "stream";

// Mock the auth module
vi.mock("./auth.js", () => ({
  getRingCentralPlatform: vi.fn(),
}));

const mockAccount: ResolvedRingCentralAccount = {
  accountId: "test",
  enabled: true,
  credentialSource: "config",
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  jwt: "test-jwt",
  server: "https://platform.ringcentral.com",
  config: {},
};

describe("downloadRingCentralAttachment Security", () => {
  it("should enforce maxBytes check using Content-Length before downloading", async () => {
    const hugeSize = 10 * 1024 * 1024; // 10 MB
    const maxBytes = 1 * 1024 * 1024; // 1 MB limit

    const arrayBufferMock = vi.fn().mockResolvedValue(new ArrayBuffer(hugeSize));

    // Mock response with Content-Length header
    const mockResponse = {
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-length" ? String(hugeSize) : null),
      },
      arrayBuffer: arrayBufferMock,
      body: {
        // Mock stream if needed later
      }
    };

    const mockPlatform = {
      get: vi.fn().mockResolvedValue(mockResponse),
    };

    vi.spyOn(auth, "getRingCentralPlatform").mockResolvedValue(mockPlatform as any);

    await expect(
      downloadRingCentralAttachment({
        account: mockAccount,
        contentUri: "https://example.com/huge-file",
        maxBytes,
      })
    ).rejects.toThrow(/exceeds max bytes/);

    // CRITICAL: Ensure we didn't try to download the whole body
    expect(arrayBufferMock).not.toHaveBeenCalled();
  });

  it("should download file correctly when size is within limits (Node stream)", async () => {
    const content = Buffer.from("Hello World");
    const maxBytes = 1024;

    // Create a Node.js Readable stream
    const stream = Readable.from([content]);

    const mockResponse = {
      headers: {
        get: (name: string) => (name.toLowerCase() === "content-length" ? String(content.length) : null),
      },
      arrayBuffer: vi.fn(),
      body: stream
    };

    const mockPlatform = {
      get: vi.fn().mockResolvedValue(mockResponse),
    };

    vi.spyOn(auth, "getRingCentralPlatform").mockResolvedValue(mockPlatform as any);

    const result = await downloadRingCentralAttachment({
      account: mockAccount,
      contentUri: "https://example.com/small-file",
      maxBytes,
    });

    expect(result.buffer).toEqual(content);
  });

  it("should enforce maxBytes check during streaming when Content-Length is missing", async () => {
    const maxBytes = 1 * 1024 * 1024; // 1 MB limit

    // Create a generator that yields chunks exceeding 1MB
    async function* generateHugeContent() {
      // Yield 1.5MB in chunks (15 * 100KB)
      for (let i = 0; i < 15; i++) {
        yield Buffer.alloc(100 * 1024); // 100KB each
      }
    }

    const stream = Readable.from(generateHugeContent());

    const mockResponse = {
      headers: {
        get: (name: string) => null, // No Content-Length
      },
      arrayBuffer: vi.fn(),
      body: stream
    };

    const mockPlatform = {
      get: vi.fn().mockResolvedValue(mockResponse),
    };

    vi.spyOn(auth, "getRingCentralPlatform").mockResolvedValue(mockPlatform as any);

    await expect(
      downloadRingCentralAttachment({
        account: mockAccount,
        contentUri: "https://example.com/huge-stream",
        maxBytes,
      })
    ).rejects.toThrow(/exceeds max bytes/);
  });
});
