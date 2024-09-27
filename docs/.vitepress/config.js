import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: "Bunicorn",
	description:
		"Bunicorn - Fast and type safe Bun, Deno and Edge backend framework!",
	head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
	lang: "en-US",
	lastUpdated: true,
	themeConfig: {
		siteTitle: "Bunicorn",
		search: { provider: "local", options: { detailedView: true } },
		logo: "/logo.svg",
		nav: [
			{ text: "Quick Start", link: "/quick-start", activeMatch: "^/$" },
			{ text: "Introduction", link: "/introduction" },
		],
		sidebar: [
			{
				text: "Introduction",
				items: [
					{ text: "Why Bunicorn?", link: "/introduction" },
					{ text: "Quick Start", link: "/quick-start" },
					{ text: "Roadmap", link: "/roadmap" },
					{ text: "Benchmark 🚀", link: "/benchmark" },
				],
			},
			{
				text: "Server",
				items: [
					{
						text: "Routes",
						link: "/server/routes",
						items: [
							{
								text: "Dynamic Routes",
								link: "/server/routes#dynamic-routes",
							},
							{
								text: "Match All",
								link: "/server/routes#match-all",
							},
							{
								text: "Edge Router",
								link: "/server/routes#edge-router",
							},
						],
					},
					{ text: "Validators", link: "/server/validators" },
					{ text: "Grouping routes", link: "/server/group-routes" },
					{ text: "Context", link: "/server/context" },
					{
						text: "Middleware",
						link: "/server/middleware",
						items: [
							{
								text: "Local",
								link: "/server/middleware#local-middleware",
							},
							{
								text: "Global",
								link: "/server/middleware#global-middleware",
							},
							{
								text: "Wrapper",
								link: "/server/middleware#wrapper-middleware",
							},
							{
								text: "Authentication",
								link: "/server/middleware#authentication",
							},
						],
					},
					{
						text: "Handlers",
						link: "/server/handlers",
						items: [
							{
								text: "Cors Handler",
								link: "/server/handlers#cors-handler",
							},
							{
								text: "Static Handler",
								link: "/server/handlers#static-handler",
							},
							{
								text: "Create a Handler",
								link: "/server/handlers#create-a-handler",
							},
						],
					},
					{
						text: "OpenAPI",
						link: "/server/openapi",
						items: [
							{
								text: "OpenAPI JSON",
								link: "/server/openapi#openapi-json",
							},
							{
								text: "Swagger UI",
								link: "/server/openapi#swagger-ui",
							},
						
						],
					},
					{
						text: "Dependency Injection",
						link: "/server/di",
					},
					{
						text: "Errors",
						link: "/server/errors",
						items: [
							{
								text: "Custom Errors",
								link: "/server/errors#custom-errors",
							},
						]
					},
				],
			},
			{
				text: "Client",
				items: [
					{
						text: "Usage",
						link: "/client/usage",
						items: [
							{
								text: "Installation",
								link: "/client/usage#installation",
							},
							{
								text: "Create a client",
								link: "/client/usage#create-a-client",
							},
							{
								text: "Sharing server types",
								link: "/client/usage#sharing-server-types",
							},
						],
					},
					{
						text: "Headers",
						link: "/client/headers",
						items: [
							{
								text: "Global",
								link: "/client/headers#global-headers",
							},
							{
								text: "Local",
								link: "/client/headers#local-headers",
							},
						],
					},
					{
						text: "Errors",
						link: "/client/errors",
					},
				],
			},
		],
		footer: {
			copyright:
				"Copyright © 2023-present  <a href='https://github.com/ragokan' target='_external'>Ragokan</a>",
		},
		socialLinks: [
			{ icon: "github", link: "https://github.com/ragokan/bunicorn" },
		],
	},
});
