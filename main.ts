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

const githubToken = Deno.env.get("GH_TOKEN") || env.GH_TOKEN;

const githubQuery = Deno.env.get("GH_QUERY") || env.GH_QUERY;

const notionToken = Deno.env.get("NOTION_TOKEN") || env.NOTION_TOKEN;

const notionDatabaseId = Deno.env.get("NOTION_DATABASE_ID") ||
  env.NOTION_DATABASE_ID;

const assigneesToIgnore = Deno.env.get("ASSIGNEES_TO_IGNORE") ||
  env.ASSIGNEES_TO_IGNORE;
const assigneesToIgnoreList = assigneesToIgnore
  ? assigneesToIgnore.split(",")
  : [];

checkParam(githubToken, "GH_TOKEN");
checkParam(githubQuery, "GH_QUERY");
checkParam(notionToken, "NOTION_TOKEN");
checkParam(notionDatabaseId, "NOTION_DATABASE_ID");

const issues = await getIssues(githubToken, githubQuery);
await syncIssues(
  issues,
  notionToken,
  notionDatabaseId,
  assigneesToIgnoreList,
);

console.log("Everything is synced!");

Deno.exit(0);
