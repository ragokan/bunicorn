import type * as v from "valibot";
import type * as z from "zod";

export type FormattedIssue = {
  message: string;
  validation: string;
  path: string[];
};

function __isPathItem(item: any): item is v.PathItem {
  return typeof item === "object" && item.key !== undefined;
}

export function __formatIssues(
  issues: v.Issues | z.ZodIssue[] | FormattedIssue[]
): FormattedIssue[] {
  return issues.map(issue => ({
    message: issue.message,
    validation:
      (issue as v.Issues[number]).validation ??
      (issue as z.ZodIssue).code ??
      "",
    path: issue.path?.map(k => (__isPathItem(k) ? k.key : k)) ?? []
  }));
}
