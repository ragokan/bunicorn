import { describe, expect, it } from "bun:test";
import * as v from "valibot";
import * as z from "zod";
import { HttpValidationError } from "../error/index.ts";
import { __validate } from "./validate.ts";

// Mock schema for Valibot
const valibotSchema = v.string();

// Mock schema for Zod
const zodSchema = z.string();

describe("__validate", () => {
	it("should validate using Valibot schema", () => {
		const input = "valid string";
		const result = __validate(valibotSchema, input);
		expect(result).toBe(input);
	});

	it("should throw HttpValidationError for invalid Valibot input", () => {
		const input = 123;
		expect(() => __validate(valibotSchema, input)).toThrow(HttpValidationError);
	});

	it("should validate using Zod schema", () => {
		const input = "valid string";
		const result = __validate(zodSchema, input);
		expect(result).toBe(input);
	});

	it("should throw HttpValidationError for invalid Zod input", () => {
		const input = 123;
		expect(() => __validate(zodSchema, input)).toThrow(HttpValidationError);
	});

	it("should validate using raw schema", () => {
		const rawSchema = (input: unknown) => {
			if (typeof input !== "string") {
				throw new Error("Must be a string");
			}
			return input;
		};
		const input = "valid string";
		const result = __validate(rawSchema, input);
		expect(result).toBe(input);
	});

	it("should throw HttpValidationError for invalid raw schema input", () => {
		const rawSchema = (input: unknown) => {
			if (typeof input !== "string") {
				throw new Error("Must be a string");
			}
			return input;
		};
		const input = 123;
		expect(() => __validate(rawSchema, input)).toThrow(HttpValidationError);
	});
});
