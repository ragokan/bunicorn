# Introduction

## Why another framework?

Firstly, typed backend frameworks are awesome! There are some alternatives such as tRPC or Elysia but they have some limitations, I believe.

- **tRPC**: It is a great framework but it does not use direct HTTP methods, instead it uses query/mutation/subscription. That is simple to write, yes. But when consuming with a non TS client, things are going to be a little bit harder.

- **Elysia**: It is amazing! But comes with some caveats. It only supports Bun, which is totally okay but it also forces Typebox for validation. Instead, we support many validation libraries such as zod, valibot, typia and even a simple function schema. Soon, there will be many more adapters.

## What is good about this framework?

- **TypeScript**: It is written in TypeScript, it has full type safety.
- **Typed client**: We have client types for Typescript/Javascript. You don't need to generate anything!
- **Tree Shakable**: You can import only the things you need. It is tree shakable. Even reading body, parsing search params, everything is optional to use.
- **Fast**: It is fast! We have low overhead and zero dependency. Focus on speed!
- **Secure**: Things are tested, supports many validation libraries, everything is type safe.
- **Easy to use**: It is easy to use and easy to learn.
- **Router**: Our router depends only on raw regexp, it is fast and extensible.
- **Handlers and middlewares**: Everything is extensible and adoptable according to your needs.

## What does Bunicorn aim?

We aim to be a fast, secure, typed and easy to use backend framework. We want to be a good alternative to other frameworks.

While doing these, main aim is to keep everything simple and do most things with Typescript types. We don't want to use decorators, we don't want to use any magic. We want to keep everything simple and easy to understand yet powerful.

According to ChatGPT, _"Bunicorn" is a creative and catchy name that combines "Bun" with "Unicorn," which could imply uniqueness or magical qualities in addition to speed and performance. It's a strong choice if you're looking for a name that stands out._
