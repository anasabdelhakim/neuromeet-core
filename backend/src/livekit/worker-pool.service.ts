import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
  
  getLeastLoadedWorker(): WorkerInstance | null {
    return (
      this.workers
        .filter((w) => w.load < w.maxLoad)
        .sort((a, b) => a.load - b.load)[0] ?? null
    );
  }
  
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
  
  releaseWorker(workerUrl: string): void {
    const w = this.workers.find((w) => w.url === workerUrl);
    if (w) {
      w.load = Math.max(0, w.load - 1);
      this.logger.log(
        `Released slot on ${workerUrl} (load: ${w.load}/${w.maxLoad})`,
      );
    }
  }
  
  getPoolStatus() {
    return this.workers.map(({ url, load, maxLoad }) => ({
      url,
      load,
      maxLoad,
    }));
  }
}
