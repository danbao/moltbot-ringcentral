## 2026-02-10 - Missing Sensitive Data Redaction
**Vulnerability:** The application was logging full objects (WebSocket events, chat info) containing PII and potentially sensitive data without redaction, despite memory indicating `redactSensitive` should be used.
**Learning:** Security utilities mentioned in documentation/memory might not actually exist in the codebase. Always verify the existence of security controls before relying on them.
**Prevention:** Implemented `redactSensitive` utility in `src/monitor.ts` to recursively redact specific keys (text, name, email, tokens) and handle circular references. Added comprehensive unit tests in `src/monitor-security.test.ts`.
