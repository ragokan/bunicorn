import type * as v from "valibot";
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
	issues: v.BaseIssue<any>[] | z.ZodIssue[] | FormattedIssue[],
): FormattedIssue[] {
	return issues.map((issue) => ({
		message: issue.message,
		validation:
			(issue as z.ZodIssue).code ?? (issue as v.BaseIssue<any>).kind ?? "",
		path:
			issue.path?.map((k) => (__isPathItem(k) ? k.key : (k as string))) ?? [],
	}));
}
