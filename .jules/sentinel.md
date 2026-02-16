## 2026-02-10 - Unbounded Memory Consumption in Attachment Downloads
**Vulnerability:** The `downloadRingCentralAttachment` function was using `response.arrayBuffer()` to read the entire response body into memory before checking the `maxBytes` limit. This could allow an attacker (or a large file) to cause an Out-Of-Memory (OOM) crash (DoS).
**Learning:** `response.arrayBuffer()` consumes the entire stream. Always check `Content-Length` headers first, and consume streams chunk-by-chunk when enforcing size limits.
**Prevention:** Use a streaming approach with a byte counter to enforce `maxBytes` limits during download, not after.
