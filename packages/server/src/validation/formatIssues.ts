import * as v from "valibot";
import type * as z from "zod";

export type FormattedIssue = {
  message: string;
  validation: string;
  path: string[];
};

function __isPathItem(item: any): item is { key: string } {
  return typeof item == "object" && item.key !== undefined;
}

export function __formatIssues(
  issues: v.BaseIssue<any>[] | z.ZodIssue[] | FormattedIssue[]
): FormattedIssue[] {
  return issues.map(issue => ({
    message: issue.message,
    validation:
      (issue as v.BaseIssue<any>).kind ?? (issue as z.ZodIssue).code ?? "",
    path: issue.path?.map(k => (__isPathItem(k) ? k.key : (k as string))) ?? []
  }));
}
