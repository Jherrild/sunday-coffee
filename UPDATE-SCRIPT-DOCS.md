# Sunday Coffee Status Update Script

This script automates the process of updating the Sunday Coffee status page.

## Features

- **Automatic Date Calculation**: Always calculates the next Sunday (if run on Sunday, it targets the following week)
- **Status Update**: Updates the page to show coffee is ON or OFF
- **Automated Git Operations**: Creates a branch, commits, and pushes changes
- **GitHub Actions Integration**: Can be triggered via webhook for Google Assistant or Home Assistant integration

## Local Usage

### Prerequisites

- Node.js installed on your system
- Git repository cloned and configured

### Running the Script

You can use either the Node.js script directly or the convenient shell wrapper:

#### Using the shell wrapper (recommended):
```bash
# To mark coffee as ON for next Sunday
./update-status.sh on

# To mark coffee as OFF for next Sunday
./update-status.sh off
```

#### Using Node.js directly:
```bash
# To mark coffee as ON for next Sunday
node update-status.js true

# To mark coffee as OFF for next Sunday
node update-status.js false
```

The script will:
1. Calculate the next Sunday date (always at least 7 days in the future if run on Sunday)
2. Create a new branch named with the date (e.g., `2025-12-14`)
3. Update `index.html` with:
   - Body class: `status-on` or `status-off`
   - Sunday date in the format: "Sunday, Month Day, Year"
   - Last updated timestamp with current date
4. Commit and push the changes

**Note**: The script creates and pushes a branch but does not automatically create or merge the PR. For full automation, use the GitHub Actions workflow.

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow that handles the complete automation including PR creation and merging.

### Triggering via GitHub UI

1. Go to the **Actions** tab in your GitHub repository
2. Select the **Update Coffee Status** workflow
3. Click **Run workflow**
4. Select the coffee status (true/false)
5. Click **Run workflow**

The workflow will:
- Run the update script
- Create a pull request
- Automatically merge it to main
- Trigger the GitHub Pages deployment

### Triggering via Webhook (for Google Assistant/Home Assistant)

You can trigger the workflow using the GitHub API:

```bash
# Using curl
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/Jherrild/sunday-coffee/actions/workflows/update-coffee-status.yml/dispatches \
  -d '{"ref":"main","inputs":{"coffee_status":"true"}}'
```

#### Setting up with Home Assistant

Add this to your Home Assistant configuration:

```yaml
rest_command:
  coffee_on:
    url: https://api.github.com/repos/Jherrild/sunday-coffee/actions/workflows/update-coffee-status.yml/dispatches
    method: POST
    headers:
      Accept: application/vnd.github+json
      Authorization: Bearer YOUR_GITHUB_TOKEN
    payload: '{"ref":"main","inputs":{"coffee_status":"true"}}'
    
  coffee_off:
    url: https://api.github.com/repos/Jherrild/sunday-coffee/actions/workflows/update-coffee-status.yml/dispatches
    method: POST
    headers:
      Accept: application/vnd.github+json
      Authorization: Bearer YOUR_GITHUB_TOKEN
    payload: '{"ref":"main","inputs":{"coffee_status":"false"}}'
```

Then create automations or scripts that call `rest_command.coffee_on` or `rest_command.coffee_off`.

#### Setting up with Google Assistant (via IFTTT)

1. Create a GitHub Personal Access Token with `repo` and `workflow` permissions
2. Create an IFTTT applet:
   - **This**: Google Assistant trigger with a phrase like "Turn coffee on"
   - **That**: Webhooks action with:
     - URL: `https://api.github.com/repos/Jherrild/sunday-coffee/actions/workflows/update-coffee-status.yml/dispatches`
     - Method: POST
     - Headers: 
       ```
       Accept: application/vnd.github+json
       Authorization: Bearer YOUR_GITHUB_TOKEN
       ```
     - Body: `{"ref":"main","inputs":{"coffee_status":"true"}}`

### Required GitHub Token Permissions

For the GitHub Actions workflow to work properly, ensure the workflow has these permissions:
- `contents: write` - To create branches and commits
- `pull-requests: write` - To create and merge PRs

These are already configured in the workflow file.

## How It Works

### Date Calculation

The script uses this logic to always get the next Sunday:
- If today is Sunday (day 0): Returns 7 days from now (next Sunday)
- If today is Monday-Saturday: Returns the upcoming Sunday

This ensures that if you run it on Sunday afternoon, it updates for the following week, not the same day.

### File Updates

The script modifies three parts of `index.html`:

1. **Body class** (line 247):
   ```html
   <body class="status-on">  <!-- or status-off -->
   ```

2. **Date display** (line 264):
   ```html
   <div class="date">Sunday, December 14, 2025</div>
   ```

3. **Last updated footer** (line 276):
   ```html
   <strong>Last updated:</strong> December 7, 2025
   ```

## Troubleshooting

### Script fails with "Usage: node update-status.js <true|false>"

Make sure you're providing the status parameter:
```bash
node update-status.js true
```

### Git operations fail

Ensure:
- You have git configured with user name and email
- You have proper permissions to push to the repository
- You're on the main branch before running the script

### GitHub Actions workflow fails

Check:
- The `GITHUB_TOKEN` has the required permissions
- The repository settings allow GitHub Actions to create PRs
- The main branch is not protected in a way that blocks automated merges

## License

Same as the repository license.
