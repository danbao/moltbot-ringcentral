# Bolt's Journal

## 2026-02-10 - [Chat Cache Sync Bottleneck]
**Learning:** The initial implementation of `chat-cache` used synchronous `fs.readFileSync` and `fs.writeFileSync` for cache persistence. This blocked the event loop, particularly during startup (`startChatCacheSync`) and refresh (`refreshChatCache`). Additionally, `resolvePersonName` was fetching users sequentially with a 500ms delay to avoid rate limits, causing significant delays (20+ seconds for 40 chats) during sync.
**Action:** Always prefer `fs.promises` for file I/O in Node.js applications, especially for potentially large files like chat caches. For API rate limiting, use batched concurrency (e.g., batch size 3 with 200ms delay) instead of purely sequential execution to balance throughput and safety.
