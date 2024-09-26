interface MemoryData {
	data: string;
	contentType: string;
}

export abstract class CacheStore {
	abstract get(key: string): Promise<Response | void>;
	abstract set(key: string, value: Response, ttl?: number): Promise<void>;
}

export class MemoryStore extends CacheStore {
	private store = new Map<string, MemoryData>();

	async get(key: string): Promise<Response | void> {
		const value = this.store.get(key);
		if (!value) {
			return;
		}
		const { data, contentType } = value;
		return new Response(data, { headers: { "content-type": contentType } });
	}

	async set(key: string, value: Response): Promise<void> {
		const contentType = value.headers.get("content-type") || "";
		const data = await value.clone().text();
		this.store.set(key, { data, contentType });
	}
}
