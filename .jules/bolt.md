## 2026-02-10 - Sequential API Calls with Fixed Delays
**Learning:** Sequential loops with fixed delays (e.g., `sleep(500)` per item) for API calls are a severe bottleneck (O(N)).
**Action:** Replace with batched concurrent execution (e.g., `Promise.all` with batch size 3) and inter-batch delays to respect rate limits while improving throughput by ~batch_size times.
