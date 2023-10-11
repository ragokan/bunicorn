import type * as v from "valibot";
import type * as z from "zod";

export type RawSchema<Output = any> = (input: unknown) => Output;

export type BunicornSchema = v.BaseSchema<any> | z.ZodSchema<any> | RawSchema;

export type __InferBunicornInput<TSchema> = TSchema extends v.BaseSchema
  ? v.Input<TSchema>
  : TSchema extends z.ZodSchema
  ? z.input<TSchema>
  : TSchema extends RawSchema<infer Input>
  ? Input
  : never;

export type __InferBunicornOutput<
  TSchema,
  Out = never
> = unknown extends TSchema
  ? Out
  : TSchema extends v.BaseSchema
  ? v.Output<TSchema>
  : TSchema extends z.ZodSchema
  ? z.output<TSchema>
  : TSchema extends RawSchema
  ? ReturnType<TSchema>
  : Out;

export type __ValidateOptions = Pick<
  v.ParseInfo,
  "abortEarly" | "abortPipeEarly" | "skipPipe"
>;
