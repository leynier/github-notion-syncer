// deno-lint-ignore-file no-explicit-any
import { Octokit } from "https://cdn.skypack.dev/octokit?dts";
import { config } from "https://deno.land/x/dotenv@v3.2.0/mod.ts";

class Assignee {
  username: string;
  url: string;

  constructor(arg: {
    username: string;
    url: string;
  }) {
    this.username = arg.username;
    this.url = arg.url;
  }
}

class Issue {
  id: string;
  title: string;
  repo: string;
  url: string;
  assignees: Assignee[];
  labels: string[];

  constructor(arg: {
    id: string;
    title: string;
    repo: string;
    url: string;
    assignees: Assignee[];
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
const githubToken = envConfig.GITHUB_TOKEN;

const octokit = new Octokit({ auth: githubToken });

function getIssues(response: any) {
  const issues: Issue[] = response.data.items.map((item: any) =>
    new Issue({
      id: item.id.toString(),
      title: item.title,
      repo: item.repository_url.split("/").slice(-1)[0],
      url: item.html_url,
      assignees: item.assignees.map((assignee: any) =>
        new Assignee({
          username: assignee.login,
          url: assignee.html_url,
        })
      ),
      labels: item.labels.map((label: any) => label.name),
    })
  );
  return issues;
}

let issues: Issue[] = [];
let page = 1;
while (true) {
  const response = await octokit.rest.search.issuesAndPullRequests({
    q: "is:open is:issue assignee:leynier archived:false user:educup",
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
