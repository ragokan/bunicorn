import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Bunicorn",
  description:
    "Bunicorn - Fast and type safe Bun/Deno/Edge/Node backend framework!",
  head: [["link", { rel: "icon", type: "image/svg+xml", href: "/logo.svg" }]],
  lang: "en-US",
  lastUpdated: true,
  themeConfig: {
    siteTitle: "Bunicorn",
    search: { provider: "local", options: { detailedView: true } },
    logo: "/logo.svg",
    nav: [
      { text: "Quick Start", link: "/quick-start", activeMatch: "^/$" },
      { text: "Introduction", link: "/introduction" }
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Why Bunicorn?", link: "/introduction" },
          { text: "Quick Start", link: "/quick-start" }
        ]
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
                link: "/server/routes#dynamic-routes"
              },
              {
                text: "Match All",
                link: "/server/routes#match-all"
              },
              {
                text: "Edge Router",
                link: "/server/routes#edge-router"
              }
            ]
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
                link: "/server/middleware#local-middleware"
              },
              {
                text: "Global",
                link: "/server/middleware#global-middleware"
              },
              {
                text: "Authentication",
                link: "/server/middleware#authentication"
              }
            ]
          },
          {
            text: "Handlers",
            link: "/server/handlers",
            items: [
              {
                text: "Cors Handler",
                link: "/server/handlers#cors-handler"
              },
              {
                text: "Static Handler",
                link: "/server/handlers#static-handler"
              },
              {
                text: "Create a Handler",
                link: "/server/handlers#create-a-handler"
              }
            ]
          },
          {
            text: "Dependency Injection",
            link: "/server/di"
          },
          {
            text: "Errors",
            link: "/server/errors"
          }
        ]
      }
    ],
    footer: {
      copyright:
        "Copyright © 2023-present  <a href='https://github.com/ragokan' target='_external'>Ragokan</a>"
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/ragokan/bunicorn" }
    ]
  }
});
