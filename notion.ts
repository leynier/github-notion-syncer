// deno-lint-ignore-file no-explicit-any
import { config, DotenvConfig } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Client } from "https://deno.land/x/notion_sdk@v1.0.4/src/mod.ts";
import { Issue } from "./github.ts";

async function syncSchema(client: Client, envConfig: DotenvConfig) {
  const properties = new Map([
    ["Id", { type: "rich_text" }],
    ["Title", { type: "title" }],
    ["Repo", { type: "select" }],
    ["Url", { type: "url" }],
    ["Assignees", { type: "multi_select" }],
    ["Labels", { type: "multi_select" }],
    ["Priority", { type: "number" }],
  ]);
  let finalProperties = new Map<string, any>();
  let database = await client.databases.retrieve({
    database_id: envConfig.NOTION_DATABASE_ID,
  });
  let currentProperties = database.properties;
  let currentPropertyNames = Object.keys(currentProperties);
  const propertiesToRemoveNames = currentPropertyNames.filter(
    (name) =>
      !properties.has(name) ||
      properties.get(name)?.type !== currentProperties[name].type,
  );
  propertiesToRemoveNames.forEach((name) => {
    finalProperties.set(name, null);
  });
  await client.databases.update({
    database_id: envConfig.NOTION_DATABASE_ID,
    properties: Object.fromEntries(finalProperties),
  });
  finalProperties = new Map<string, any>();
  database = await client.databases.retrieve({
    database_id: envConfig.NOTION_DATABASE_ID,
  });
  currentProperties = database.properties;
  currentPropertyNames = Object.keys(currentProperties);
  const propertiesToAddNames = Array.from(properties.keys()).filter(
    (name) => !currentPropertyNames.includes(name),
  );
  propertiesToAddNames.forEach((name) => {
    finalProperties.set(name, {
      type: properties.get(name)?.type,
      ...Object.fromEntries([[properties.get(name)?.type, {}]]),
    });
  });
  await client.databases.update({
    database_id: envConfig.NOTION_DATABASE_ID,
    properties: Object.fromEntries(finalProperties),
  });
}

async function getPages(
  client: Client,
  envConfig: DotenvConfig,
): Promise<any[]> {
  let cursor: string | undefined = undefined;
  let pages = <any> [];
  while (true) {
    const response: any = await client.databases.query({
      database_id: envConfig.NOTION_DATABASE_ID,
      start_cursor: cursor,
    });
    cursor = response.next_cursor;
    pages = pages.concat(response.results);
    if (!cursor) {
      break;
    }
  }
  return pages;
}

async function syncIssues(issues: Issue[]): Promise<void> {
  const issuesDict = new Map<string, Issue>(
    issues.map((issue) => [issue.id, issue]),
  );
  const envConfig = config();
  const client = new Client({ auth: envConfig.NOTION_TOKEN });
  await syncSchema(client, envConfig);
  const assigneesToIgnore = new Set<string>(
    envConfig.ASSIGNEE_IGNORE_LIST.split(","),
  );
  const pages = await getPages(client, envConfig);
  const pagesIdsDict = new Map<string, any>(
    pages.map((page) => [page.properties.Id.rich_text[0].text.content, page]),
  );
  const pagesIdsToDelete = new Set<string>();
  for (const [pageId, page] of pagesIdsDict) {
    if (!issuesDict.has(pageId)) {
      pagesIdsToDelete.add(page.id);
    }
  }
  for (const id of pagesIdsToDelete) {
    await client.pages.update({
      page_id: id,
      archived: true,
    });
  }
  const pagesIdsToCreate = new Set<string>();
  for (const [issueId, _] of issuesDict) {
    if (!pagesIdsDict.has(issueId)) {
      pagesIdsToCreate.add(issueId);
    }
  }
  for (const id of pagesIdsToCreate) {
    const issue = issuesDict.get(id);
    if (!issue) {
      continue;
    }
    await client.pages.create({
      parent: { database_id: envConfig.NOTION_DATABASE_ID },
      properties: {
        Id: { rich_text: [{ text: { content: issue.id } }] },
        Title: { title: [{ text: { content: issue.title } }] },
        Repo: { select: { name: issue.repo } },
        Url: { url: issue.url },
        Assignees: {
          multi_select: issue.assignees.filter(
            (assignee) => !assigneesToIgnore.has(assignee),
          ).map((assignee) => ({
            name: assignee,
          })),
        },
        Labels: {
          multi_select: issue.labels.map((label) => ({
            name: label,
          })),
        },
        Priority: { number: 0 },
      },
    });
  }
  const pagesIdsToUpdate = new Set<string>();
  for (const [issueId, _] of issuesDict) {
    if (pagesIdsDict.has(issueId)) {
      pagesIdsToUpdate.add(issueId);
    }
  }
  for (const id of pagesIdsToUpdate) {
    const issue = issuesDict.get(id);
    if (!issue) {
      continue;
    }
    const page = pagesIdsDict.get(id);
    if (!page) {
      continue;
    }
    const titleIsEqual =
      page.properties.Title.title[0].plain_text === issue.title;
    const repoIsEqual = page.properties.Repo.select.name === issue.repo;
    const urlIsEqual = page.properties.Url.url === issue.url;
    const assigneesIsEqual = page.properties.Assignees.multi_select.map(
      (assignee: any) => assignee.name,
    ).sort().join(",") === issue.assignees.filter(
      (assignee) => !assigneesToIgnore.has(assignee),
    ).sort().join(",");
    const labelsIsEqual = page.properties.Labels.multi_select.map(
      (label: any) => label.name,
    ).sort().join(",") === issue.labels.sort().join(",");
    if (
      titleIsEqual && repoIsEqual && urlIsEqual && assigneesIsEqual &&
      labelsIsEqual
    ) {
      continue;
    }
    await client.pages.update({
      page_id: page.id,
      properties: {
        Id: { rich_text: [{ text: { content: issue.id } }] },
        Title: { title: [{ text: { content: issue.title } }] },
        Repo: { select: { name: issue.repo } },
        Url: { url: issue.url },
        Assignees: {
          multi_select: issue.assignees.filter(
            (assignee) => !assigneesToIgnore.has(assignee),
          ).map((assignee) => ({
            name: assignee,
          })),
        },
        Labels: {
          multi_select: issue.labels.map((label) => ({
            name: label,
          })),
        },
      },
    });
  }
}

export { syncIssues };
