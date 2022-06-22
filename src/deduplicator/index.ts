export class Deduplicator {
  private readonly store: Record<string, number> = {};

  constructor(private readonly timeout: number) {}

  isFresh(address: string): boolean {
    const isInCache = Boolean(this.store[address]);
    return !isInCache;
  }

  hit(address: string) {
    if (!this.isFresh(address))
      throw new Error(
        `Tried to registed an address that is not fresh. Now: ${Date.now()}. In store: ${
          this.store[address]
        }`
      );

    this.store[address] = Date.now();

    setTimeout(() => {
      delete this.store[address];
    }, this.timeout);
  }
}
