import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { getIssues } from "./github.ts";
import { syncIssues } from "./notion.ts";

const env = config();

function checkParam(param: string | undefined, name: string) {
  if (!param) {
    console.error(`${name} is required`);
    Deno.exit(1);
  }
}

const githubToken = Deno.env.get("GITHUB_TOKEN") || env.GITHUB_TOKEN;

const githubQuery = Deno.env.get("GITHUB_QUERY") || env.GITHUB_QUERY;

const notionToken = Deno.env.get("NOTION_TOKEN") || env.NOTION_TOKEN;

const notionDatabaseId = Deno.env.get("NOTION_DATABASE_ID") ||
  env.NOTION_DATABASE_ID;

const assigneesToIgnore = Deno.env.get("ASSIGNEES_TO_IGNORE") ||
  env.ASSIGNEES_TO_IGNORE;
const assigneesToIgnoreList = assigneesToIgnore
  ? assigneesToIgnore.split(",")
  : [];

checkParam(githubToken, "GITHUB_TOKEN");
checkParam(githubQuery, "GITHUB_QUERY");
checkParam(notionToken, "NOTION_TOKEN");
checkParam(notionDatabaseId, "NOTION_DATABASE_ID");

const issues = await getIssues(githubToken, githubQuery);
await syncIssues(
  issues,
  notionToken,
  notionDatabaseId,
  assigneesToIgnoreList,
);

Deno.exit(0);
