import type { IncomingMessage, ServerResponse } from "node:http";
import type { Readable } from "node:stream";
import type { BunicornApp } from "./index.ts";

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

export default async function createNodeServer(
	handleRequest: BunicornApp<any>["handleRequest"],
) {
	// NodeJS HTTP Server
	const { createServer } = await import("node:http");
	const server = createServer(async (req, res) => {
		// Call the handleRequest function
		try {
			const webRequest = nodeToWebRequest(req);
			const webResponse = await handleRequest(webRequest);
			await webToNodeResponse(webResponse, res);
		} catch (error) {
			console.error("Error handling request:", error);
			res.statusCode = 500;
			res.end("Internal Server Error");
		}
	});

	return server;
}
