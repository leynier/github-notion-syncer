// deno-lint-ignore-file no-explicit-any
import { Octokit } from "https://cdn.skypack.dev/octokit?dts";

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

function parseIssuesFromResponse(response: any): Issue[] {
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

async function getIssues(
  githubToken: string,
  githubQuery: string,
): Promise<Issue[]> {
  const octokit = new Octokit({ auth: githubToken });
  let issues: Issue[] = [];
  let page = 1;
  while (true) {
    const response = await octokit.rest.search.issuesAndPullRequests({
      q: githubQuery,
      page: page,
    });
    const currentIssues = parseIssuesFromResponse(response);
    if (currentIssues.length === 0) {
      break;
    }
    page++;
    issues = issues.concat(currentIssues);
  }
  return issues;
}

export { getIssues, Issue };
