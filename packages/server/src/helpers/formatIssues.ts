import { type Issues } from "valibot";

export type FormattedIssues = {
  message: string;
  validation: string;
  path: any[] | undefined;
}[];

export function formatIssues(issues: Issues) {
  return issues.map(({ message, path, validation }) => ({
    message,
    validation,
    path: path?.map(({ key }) => key)
  })) as FormattedIssues;
}
