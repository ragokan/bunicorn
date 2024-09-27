import type { IncomingMessage, ServerResponse } from "node:http";
import { createServer } from "node:http";
import type { Readable } from "node:stream";
import { Router } from "../router/base.ts";
import type { Route } from "../router/route.ts";
import type { BasePath, BunicornResponse } from "../router/types.ts";
import { BunicornApp } from "./index.ts";

// Convert Node.js Readable to Web API ReadableStream
function nodeReadableToWebReadableStream(
	nodeReadable: Readable,
): ReadableStream {
	return new ReadableStream({
		start(controller) {
			nodeReadable.on("data", (chunk) => {
				controller.enqueue(chunk);
			});
			nodeReadable.on("end", () => {
				controller.close();
			});
			nodeReadable.on("error", (err) => {
				controller.error(err);
			});
		},
		cancel() {
			nodeReadable.destroy();
		},
	});
}

// Convert Node.js IncomingMessage to Web API Request
function nodeToWebRequest(req: IncomingMessage): Request {
	const url = new URL(req.url || "", `http://${req.headers.host}`);

	const headers = new Headers();
	Object.entries(req.headers).forEach(([key, value]) => {
		if (value) {
			headers.set(key, Array.isArray(value) ? value.join(", ") : value);
		}
	});

	return new Request(url.toString(), {
		method: req.method,
		headers: headers,
		body:
			req.method !== "GET" && req.method !== "HEAD"
				? nodeReadableToWebReadableStream(req)
				: null,
	});
}

// Convert Web API Response to Node.js response
async function webToNodeResponse(
	webResponse: Response,
	nodeResponse: ServerResponse,
): Promise<void> {
	nodeResponse.statusCode = webResponse.status;
	webResponse.headers.forEach((value, key) => {
		nodeResponse.setHeader(key, value);
	});

	if (webResponse.body) {
		const reader = webResponse.body.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (done) {
				break;
			}
			nodeResponse.write(value);
		}
	}
	nodeResponse.end();
}

export default function createNodeServer(app: BunicornApp<any>) {
	// Wrapper for static routes
	const router = new Router();
	const routes: Route[] = [];
	for (const [path, response] of Object.entries(app.staticRoutes)) {
		const route = router.get(
			path as BasePath,
			() => response as BunicornResponse<any>,
		);
		routes.push(route);
	}
	app.addRoutes(routes);

	// NodeJS HTTP Server
	const server = createServer(async (req, res) => {
		// Call the handleRequest function
		try {
			const webRequest = nodeToWebRequest(req);
			const webResponse = await app.handleRequest(webRequest);
			await webToNodeResponse(webResponse, res);
		} catch (error) {
			if (error instanceof Error) {
				BunicornApp.onGlobalError(error);
			}
			res.statusCode = 500;
			res.end("Internal Server Error");
		}
	});

	return server;
}
