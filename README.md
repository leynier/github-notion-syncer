# Syncer of GitHub Issues and Notion

The goal is that from a search on GitHub Issues (<https://github.com/issues>) synchronize them with a Notion database (<https://www.notion.so/>).

## How to use

1. Star this repository 😁
2. Clone this repository
3. Create a .env file or set the environment variables with the following names and respective values:
    - `GH_TOKEN`: GitHub token with access to all issues that you want to sync
    - `GH_QUERY`: GitHub query to get the issues that you want to sync
    - `NOTION_TOKEN`: Notion token with access to the database that you want to sync
    - `NOTION_DATABASE_ID`: Notion database ID that you want to sync
    - `ASSIGNEES_TO_IGNORE`: GitHub usernames to ignore (optional)
4. Run in your terminal: `make`
5. Done! The syncronization is ready 😎

### Run using GitHub Actions

1. Star this repository 😁
2. Fork this repository
3. Create GitHub Secrets with the following names and respective values:
    - `GH_TOKEN`: GitHub token with access to all issues that you want to sync
    - `GH_QUERY`: GitHub query to get the issues that you want to sync
    - `NOTION_TOKEN`: Notion token with access to the database that you want to sync
    - `NOTION_DATABASE_ID`: Notion database ID that you want to sync
    - `ASSIGNEES_TO_IGNORE`: GitHub usernames to ignore (optional)
4. Done! The syncronization will run every day 5 minutes 😎
5. (Optional) If you want to change the schedule, edit the file `.github/workflows/sync.yml`

**Note: Please, if this repository has been helpful to you, consider giving it a star ⭐. Thanks in advance.**
