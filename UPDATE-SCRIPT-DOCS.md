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

# Example: publish a note with the status
./update-status.sh on 'Example note: we will be inside this week.'

# Example: multiple paragraphs (Bash quoting keeps newlines in one argument)
./update-status.sh on $'First paragraph.\n\nSecond paragraph.'
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

The local script requires a clean working tree. It creates its update branch from
`origin/main` without resetting local `main`, then writes the status/date/notes.
Notes use the same same-Sunday preservation and new-Sunday clearing rules as the
workflow. Omit the optional second argument to perform a status-only update.
Use the workflow's `clear_notes` input to explicitly clear same-week notes.

## GitHub Actions Workflow

The repository includes a GitHub Actions workflow that handles the complete automation including PR creation and merging.

### Triggering via GitHub UI

1. Go to the **Actions** tab in your GitHub repository
2. Select the **Update Coffee Status** workflow
3. Click **Run workflow**
4. Select the coffee status (true/false)
5. Optionally enter notes, select **Clear notes**, or choose a theme
6. Click **Run workflow**

The workflow will:
- Run the update script
- Create a pull request
- Automatically merge it to main
- Trigger the GitHub Pages deployment

### Notes and Themes

Optional inputs:

| Input | Default | Behavior |
| --- | --- | --- |
| `notes` | Empty | Nonblank text replaces the note. Blank preserves same-Sunday notes; notes clear when advancing to a different Sunday. |
| `clear_notes` | `false` | `true` removes notes even if replacement text was supplied. |
| `theme` | `keep` | `keep`, `default`, or `halloween`. Persists until explicitly changed, independently of ON/OFF status. |

Existing API callers and Home Assistant buttons that only supply `coffee_status`
continue to work. No Home Assistant integration upgrade is required for that
compatibility; entering notes currently uses GitHub Actions, its API, or the local
script, not a new Home Assistant dashboard field.

Example GitHub CLI commands (**these publish through the existing auto-merge
workflow when run against main**):

```bash
gh workflow run update-coffee-status.yml -R Jherrild/sunday-coffee \
  -f coffee_status=true -f notes='Example note: come by when you can.' -f theme=halloween

gh workflow run update-coffee-status.yml -R Jherrild/sunday-coffee \
  -f coffee_status=false -f clear_notes=true -f theme=default
```

For longer/multiline notes, the CLI can read a local plain-text file with
`-F notes=@notes.txt` instead of `-f notes='...'`, or send a JSON string through
the API. Notes are passed to the renderer as environment data, not interpolated
into shell source. HTML is escaped, single newlines become line breaks, and blank
lines separate paragraphs. Empty notes are not displayed. The checked-in page
starts with no note; documentation/preview examples are not real announcements.

The active theme is the `data-theme` variable on `index.html`'s `<html>` element.
You can change just that attribute in a normal PR for a theme-only edit, without
changing the date/status. The status workflow still targets the upcoming Sunday
as described below; selecting a theme there does not make it a theme-only run.
See [README](README.md#adding-another-holiday-later) for adding future themes.

All content is public. There is no Navigate button, address gate, CAPTCHA,
reminder signup, or automatic holiday schedule in this change.

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
