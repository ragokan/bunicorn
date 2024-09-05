import type * as v from "valibot";
import type * as z from "zod";

export type RawSchema<Output = any> = (input: unknown) => Output;

export type BunicornSchema =
  | z.ZodSchema<any>
  | RawSchema
  | v.BaseSchema<any, any, any>;

export type __InferBunicornInput<TSchema> = TSchema extends z.ZodSchema
  ? z.input<TSchema>
  : TSchema extends v.BaseSchema<any, any, any>
    ? v.InferInput<TSchema>
    : TSchema extends RawSchema<infer Input>
      ? Input
      : never;

export type __InferBunicornOutput<
  TSchema,
  Out = never
> = unknown extends TSchema
  ? Out
  : TSchema extends z.ZodSchema
    ? z.output<TSchema>
    : TSchema extends v.BaseSchema<any, any, any>
      ? v.InferOutput<TSchema>
      : TSchema extends RawSchema
        ? ReturnType<TSchema>
        : Out;

export type __ValidateOptions = v.Config<any>;
