import { describe, expect, it } from "bun:test";
import type * as v from "valibot";
import type * as z from "zod";
import { type FormattedIssue, __formatIssues } from "./formatIssues.ts";

describe("formatIssues", () => {
	it("should format valibot issues correctly", () => {
		const valibotIssues: v.BaseIssue<any>[] = [
			{
				kind: "schema",
				type: "string",
				input: undefined,
				expected: "string",
				received: "undefined",
				message: 'Value of "key" is missing.',
				path: [
					{
						value: undefined,
						type: "object",
						origin: "value",
						input: { nested: {} },
						key: "key",
					},
				],
			},
		];

		const expected: FormattedIssue[] = [
			{
				message: 'Value of "key" is missing.',
				validation: "schema",
				path: ["key"],
			},
		];

		expect(__formatIssues(valibotIssues)).toEqual(expected);
	});

	it("should format zod issues correctly", () => {
		const zodIssues: z.ZodIssue[] = [
			{
				code: "invalid_type",
				expected: "string",
				received: "undefined",
				path: ["key"],
				message: "Expected string, received undefined",
			},
		];

		const expected: FormattedIssue[] = [
			{
				message: "Expected string, received undefined",
				validation: "invalid_type",
				path: ["key"],
			},
		];

		expect(__formatIssues(zodIssues)).toEqual(expected);
	});

	it("should format mixed issues correctly", () => {
		const mixedIssues: (v.BaseIssue<any> | z.ZodIssue)[] = [
			{
				kind: "schema",
				type: "string",
				input: undefined,
				expected: "string",
				received: "undefined",
				message: 'Value of "key" is missing.',
				path: [
					{
						value: undefined,
						type: "object",
						origin: "value",
						input: { nested: {} },
						key: "key",
					},
				],
			},
			{
				code: "invalid_type",
				expected: "string",
				received: "undefined",
				path: ["anotherKey"],
				message: "Expected string, received undefined",
			},
		];

		const expected: FormattedIssue[] = [
			{
				message: 'Value of "key" is missing.',
				validation: "schema",
				path: ["key"],
			},
			{
				message: "Expected string, received undefined",
				validation: "invalid_type",
				path: ["anotherKey"],
			},
		];

		expect(__formatIssues(mixedIssues as any)).toEqual(expected);
	});
});
