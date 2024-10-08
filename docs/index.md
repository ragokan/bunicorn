---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Bunicorn"
  tagline: Fast and type safe Bun, Deno and Edge backend and client framework!
  image:
    src: /logo.svg
    alt: Bunicorn-Logo
  actions:
    - theme: brand
      text: Quick Start
      link: /quick-start
    - theme: alt
      text: ⭐ Star at Github
      link: https://github.com/ragokan/bunicorn

features:
  - title: Soo fast
    icon: 🚀
    link: /benchmark
    details: Thanks to Bun and many performance optimizations, Bunicorn is so fast!
  - title: Easy to use
    icon: 👌
    details: Usage is very similar to popular backend frameworks such as Express and tRPC
  - title: Type safe
    icon: 🔒
    details: Everything is strictly typed and does not require you to do anything!
  - title: Amazing client
    icon: 🎉
    details: Bunicorn comes with its own RPC client for type safety and auto completion
    link: /client/usage
  - title: Validation
    icon: 🪖
    details: Use zod, valibot, typia or others. If you want, you can create your validation!
  - title: Framework agnostic
    icon: 🦖
    details: Use with Bun, Deno and Edge, we even have EdgeApp for lazy evaluation
  - title: Lightweight
    icon: 🌱
    details: Zero dependencies, raw JavaScript and nothing else that affects performance
  - title: OpenApi Support
    icon: 🧰
    details: Bunicorn provides built in OpenApi and SwaggerUI generators
    link: /server/openapi
---
