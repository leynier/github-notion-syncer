// deno-lint-ignore-file no-explicit-any
import { config, DotenvConfig } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";
import { Client } from "https://deno.land/x/notion_sdk@v1.0.4/src/mod.ts";

async function syncSchema(client: Client, envConfig: DotenvConfig) {
  const properties = new Map([
    ["Id", { type: "rich_text" }],
    ["Title", { type: "title" }],
    ["Repo", { type: "select" }],
    ["Url", { type: "url" }],
    ["Assignees", { type: "multi_select" }],
    ["Labels", { type: "multi_select" }],
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

const envConfig = config();

const notion = new Client({ auth: envConfig.NOTION_TOKEN });

await syncSchema(notion, envConfig);

Deno.exit(0);
