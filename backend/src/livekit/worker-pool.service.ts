import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
/**
 * WorkerPoolService
 *
 * Manages a pool of Python AI Worker instances for horizontal scaling.
 * NestJS routes each new room to the least-loaded worker that has capacity.
 *
 * Scaling guide:
 *  ≤ 15 students  → 1 bot instance + Semaphore(10) + Batched Inference(batch=8)
 *  ≤ 30 students  → 2 bot instances
 *  > 30 students  → Add instances; configure AI_WORKER_URLS in .env
 *
 * Configure via env:
 *   AI_WORKER_URLS=http://ai-worker-1:8080,http://ai-worker-2:8080
 *   AI_WORKER_MAX_LOAD=15   (rooms per worker instance)
 */
interface WorkerInstance {
  url: string;
  load: number;
  maxLoad: number;
}
@Injectable()
export class WorkerPoolService {
  private readonly logger = new Logger(WorkerPoolService.name);
  private readonly workers: WorkerInstance[];
  constructor(private readonly config: ConfigService) {
    const urlsRaw = this.config.get<string>(
      'AI_WORKER_URLS',
      'http://ai-worker:8080',
    );
    const maxLoad = this.config.get<number>('AI_WORKER_MAX_LOAD', 15);
    this.workers = urlsRaw.split(',').map((url) => ({
      url: url.trim(),
      load: 0,
      maxLoad,
    }));
    this.logger.log(
      `Worker pool initialized: ${this.workers.length} instance(s), maxLoad=${maxLoad}`,
    );
  }
  /**
   * Return the least-loaded worker that still has capacity.
   * Returns null if all workers are at maximum load.
   */
  getLeastLoadedWorker(): WorkerInstance | null {
    return (
      this.workers
        .filter((w) => w.load < w.maxLoad)
        .sort((a, b) => a.load - b.load)[0] ?? null
    );
  }
  /**
   * Dispatch a room to the least-loaded worker.
   * Increments that worker's load counter.
   * Throws if all workers are at capacity.
   */
  async dispatchToPool(roomId: string, token: string): Promise<string> {
    const worker = this.getLeastLoadedWorker();
    if (!worker) {
      throw new Error('All AI workers are at capacity — cannot dispatch bot');
    }
    await fetch(`${worker.url}/api/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_name: roomId, token }),
    });
    worker.load++;
    this.logger.log(
      `Room "${roomId}" dispatched to ${worker.url} (load: ${worker.load}/${worker.maxLoad})`,
    );
    return worker.url;
  }
  /**
   * Decrement a worker's load after a room ends.
   * @param workerUrl URL of the worker that was handling the room
   */
  releaseWorker(workerUrl: string): void {
    const w = this.workers.find((w) => w.url === workerUrl);
    if (w) {
      w.load = Math.max(0, w.load - 1);
      this.logger.log(`Released slot on ${workerUrl} (load: ${w.load}/${w.maxLoad})`);
    }
  }
  /** Return current load status for all workers (useful for health checks). */
  getPoolStatus() {
    return this.workers.map(({ url, load, maxLoad }) => ({ url, load, maxLoad }));
  }
}
