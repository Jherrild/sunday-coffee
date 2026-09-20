# Sunday Coffee Status Update Script

This script automates the process of updating the Sunday Coffee status page.

## Features

- **Pacific Date Calculation**: Targets the upcoming Sunday; Sunday before 9:30 AM Pacific targets today, and at/after 9:30 AM targets next week
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
1. Calculate the coffee Sunday using Pacific time and the Sunday 9:30 AM cutoff
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

##### Option 1: HACS Integration (Recommended)

The easiest way to integrate with Home Assistant is using the HACS custom integration:

1. **Install via HACS:**
   - Open HACS in your Home Assistant instance
   - Go to "Integrations"
   - Click the three dots menu → "Custom repositories"
   - Add: `https://github.com/Jherrild/sunday-coffee` as an "Integration"
   - Search for "Sunday Coffee Status" and install
   - Restart Home Assistant

2. **Configure:**
   - Go to Settings → Devices & Services → Add Integration
   - Search for "Sunday Coffee Status"
   - Enter your GitHub Personal Access Token (with `repo` and `workflow` permissions)
   - The integration will create two button entities:
     - `button.sunday_coffee_on` - Turn coffee ON
     - `button.sunday_coffee_off` - Turn coffee OFF

3. **Use in Dashboard:**
   ```yaml
   type: entities
   title: Sunday Coffee
   entities:
     - button.sunday_coffee_on
     - button.sunday_coffee_off
   ```

4. **Use in Automations:**
   ```yaml
   automation:
     - alias: "Coffee reminder"
       trigger:
         - platform: time
           at: "08:00:00"
       action:
         - service: button.press
           target:
             entity_id: button.sunday_coffee_on
   ```

##### Option 2: REST Command (Manual)

Alternatively, add this to your Home Assistant configuration:

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

The workflow and local script share `coffee-dates.js`. Every calculation uses
`America/Los_Angeles`, regardless of the machine's timezone:
- Monday–Saturday: the upcoming Sunday, including late Saturday night.
- Sunday before 9:30 AM Pacific: that same Sunday.
- Sunday at or after 9:30 AM Pacific: the following Sunday.

Daylight saving time is handled by the timezone name, not a fixed UTC offset.
The displayed date, branch date, and last-updated date come from one clock sample.
Last updated is also displayed in Pacific time.

### Regression Tests

Run `node --test tests/*.test.js` (Node.js 18 or newer). No dependencies are needed.
Tests execute the workflow's HTML-update step on temporary files with a frozen
clock for both status values and different runner timezones. Coverage includes
Saturday evening, the Sunday cutoff, DST transitions, and year/leap-day boundaries.
No GitHub requests, pushes, or merges are performed by the tests. The standalone
script's date wiring is also checked, with its existing git commands stubbed.

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
