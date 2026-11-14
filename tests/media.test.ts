import test from "node:test";
import assert from "node:assert/strict";
import { detectUploadType, signCloudinary } from "../src/lib/media-store";
import { GET, PATCH, DELETE } from "../src/app/api/admin/media/route";
import { POST } from "../src/app/api/admin/upload/route";

test("upload validation rejects active content and MIME spoofing", () => {
  assert.equal(detectUploadType(Buffer.from('<svg onload="alert(1)"/>'), "image/svg+xml"), null);
  assert.equal(detectUploadType(Buffer.from('<html>malicious</html>'), "image/jpeg"), null);
  assert.equal(detectUploadType(Buffer.alloc(0), "image/png"), null);
  assert.equal(detectUploadType(Buffer.from([0xff, 0xd8, 0xff, 0xe0]), "video/mp4"), null);
});
test("supported formats require their matching file signature", () => {
  assert.equal(detectUploadType(Buffer.from([137,80,78,71,13,10,26,10,0]), "image/png"), "image");
  assert.equal(detectUploadType(Buffer.from("RIFF1234WEBPdata"), "image/webp"), "image");
  assert.equal(detectUploadType(Buffer.from("1234ftypisom"), "video/mp4"), "video");
  assert.equal(detectUploadType(Buffer.from([26,69,223,163,0]), "video/webm"), "video");
});
test("cloud upload signatures do not depend on parameter insertion order", () => {
  assert.equal(signCloudinary({ public_id: "atelier/example", timestamp: "123456" }, "test-secret"), signCloudinary({ timestamp: "123456", public_id: "atelier/example" }, "test-secret"));
  assert.notEqual(signCloudinary({ public_id: "atelier/example", timestamp: "123456" }, "test-secret"), signCloudinary({ public_id: "atelier/example", timestamp: "123457" }, "test-secret"));
});
test("all media operations reject unauthenticated callers before touching storage", async () => {
  for (const [method, handler] of [["GET", GET], ["PATCH", PATCH], ["DELETE", DELETE], ["POST", POST]] as const) {
    const response = await handler(new Request("https://atelier.example/api/admin/media", { method }));
    assert.equal(response.status, 401, `${method} must require a session`);
    assert.match(response.headers.get("cache-control") || "", /no-store/);
    assert.equal((await response.json()).ok, false);
  }
});
