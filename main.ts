import { getIssues } from "./github.ts";
import { syncIssues } from "./notion.ts";

const issues = await getIssues();
await syncIssues(issues);

Deno.exit(0);
