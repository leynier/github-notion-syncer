// deno-lint-ignore-file no-explicit-any
import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

class Issue {
  id: string;
  title: string;
  repo: string;
  url: string;
  assignees: string[];
  labels: string[];

  constructor(arg: {
    id: string;
    title: string;
    repo: string;
    url: string;
    assignees: string[];
    labels: string[];
  }) {
    this.id = arg.id;
    this.title = arg.title;
    this.repo = arg.repo;
    this.url = arg.url;
    this.assignees = arg.assignees;
    this.labels = arg.labels;
  }
}

const envConfig = config();
const octokit = new Octokit({ auth: envConfig.GITHUB_TOKEN });

function getIssues(response: any) {
  const issues: Issue[] = response.data.items.map((item: any) =>
    new Issue({
      id: item.id.toString(),
      title: item.title,
      repo: item.repository_url.split("/").slice(-1)[0],
      url: item.html_url,
      assignees: item.assignees.map((assignee: any) => assignee.login),
      labels: item.labels.map((label: any) => label.name),
    })
  );
  return issues;
}

let issues: Issue[] = [];
let page = 1;
while (true) {
  const response = await octokit.rest.search.issuesAndPullRequests({
    q: envConfig.GITHUB_QUERY,
    page: page,
  });
  const currentIssues = getIssues(response);
  if (currentIssues.length === 0) {
    break;
  }
  page++;
  issues = issues.concat(currentIssues);
}

export { issues };
