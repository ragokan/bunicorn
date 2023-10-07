import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Bunicorn",
  description:
    "Bunicorn - Fast and type safe Bun/Deno/Edge/Node backend framework!",
  head: [["link", { rel: "icon", href: "./assets/logo.svg" }]],
  lang: "en-US",
  lastUpdated: true,
  themeConfig: {
    siteTitle: "Bunicorn",
    search: { provider: "local", options: { detailedView: true } },
    logo: "./assets/logo.svg",
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" }
    ],
    sidebar: [
      {
        text: "Examples",
        items: [
          { text: "Markdown Examples", link: "/markdown-examples" },
          { text: "Runtime API Examples", link: "/api-examples" }
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
