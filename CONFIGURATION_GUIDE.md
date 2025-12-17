# Configuration Guide for Sunday Coffee Home Assistant Integration

This guide walks you through the complete configuration process for the Sunday Coffee HACS integration.

## Prerequisites

Before you begin, make sure you have:
- Home Assistant installed and running
- HACS (Home Assistant Community Store) installed
- Access to your GitHub account

## Step 1: Create a GitHub Personal Access Token (PAT)

The integration needs a GitHub Personal Access Token to trigger the workflow that updates your coffee status page.

### Creating the Token:

1. **Go to GitHub Token Settings**
   - Navigate to: https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - You may need to confirm your password

3. **Configure the Token**
   - **Note/Name**: Enter a descriptive name like `Home Assistant Sunday Coffee`
   - **Expiration**: Choose an expiration period (recommended: 90 days or 1 year)
   - **Select scopes**: Check these two boxes:
     - ✅ **`repo`** (Full control of private repositories)
     - ✅ **`workflow`** (Update GitHub Action workflows)

4. **Generate and Save**
   - Click "Generate token" at the bottom
   - **IMPORTANT**: Copy the token immediately and save it somewhere secure (password manager recommended)
   - You won't be able to see it again!

## Step 2: Install the Integration via HACS

1. **Add Custom Repository**
   - Open Home Assistant
   - Go to HACS → Integrations
   - Click the three-dot menu (⋮) in the top right corner
   - Select "Custom repositories"
   - Add repository URL: `https://github.com/Jherrild/sunday-coffee`
   - Category: "Integration"
   - Click "Add"

2. **Install the Integration**
   - In HACS Integrations, search for "Sunday Coffee Status"
   - Click on it
   - Click "Download"
   - Confirm the download

3. **Restart Home Assistant**
   - Go to Settings → System → Restart
   - Wait for Home Assistant to come back online

## Step 3: Configure the Integration in Home Assistant

After restarting, you'll configure the integration:

1. **Add the Integration**
   - Go to Settings → Devices & Services
   - Click "+ ADD INTEGRATION" button (bottom right)
   - Search for "Sunday Coffee Status"
   - Click on it to start configuration

2. **Enter Configuration Details**

   You'll see a configuration form with these fields:

   | Field | Description | Example Value |
   |-------|-------------|---------------|
   | **GitHub Personal Access Token** | The PAT you created in Step 1 | `ghp_xxxxxxxxxxxxxxxxxxxx` |
   | **Repository Owner** | Your GitHub username | `Jherrild` (default) |
   | **Repository Name** | The name of your repository | `sunday-coffee` (default) |
   | **Workflow File Name** | The workflow file to trigger | `update-coffee-status.yml` (default) |

   **For most users:**
   - You only need to enter the **GitHub Personal Access Token**
   - The other fields have correct defaults pre-filled
   - Only change them if you forked the repository or changed the workflow file name

3. **Submit Configuration**
   - Click "Submit"
   - The integration will validate your token and repository access
   - If successful, you'll see a success message

## Step 4: Use the Button Entities

After configuration, two button entities are automatically created:

- `button.sunday_coffee_on` - Turn coffee status ON
- `button.sunday_coffee_off` - Turn coffee status OFF

### Adding to Your Dashboard:

**Option 1: Simple Entity Card**
```yaml
type: entities
title: Sunday Coffee
entities:
  - button.sunday_coffee_on
  - button.sunday_coffee_off
```

**Option 2: Button Cards**
```yaml
type: horizontal-stack
cards:
  - type: button
    entity: button.sunday_coffee_on
    name: Coffee ON
    icon: mdi:coffee
    tap_action:
      action: call-service
      service: button.press
      target:
        entity_id: button.sunday_coffee_on
  - type: button
    entity: button.sunday_coffee_off
    name: Coffee OFF
    icon: mdi:coffee-off
    tap_action:
      action: call-service
      service: button.press
      target:
        entity_id: button.sunday_coffee_off
```

### Using in Automations:

```yaml
automation:
  - alias: "Turn on coffee every Saturday morning"
    trigger:
      - platform: time
        at: "08:00:00"
    condition:
      - condition: time
        weekday:
          - sat
    action:
      - service: button.press
        target:
          entity_id: button.sunday_coffee_on
```

## Troubleshooting

### "Invalid GitHub token" Error

- **Cause**: The token is incorrect or doesn't have the required permissions
- **Solution**: 
  1. Double-check you copied the entire token
  2. Verify the token has both `repo` and `workflow` scopes
  3. Make sure the token hasn't expired
  4. Try generating a new token

### "Repository not found or not accessible" Error

- **Cause**: The repository owner/name is incorrect, or the token can't access it
- **Solution**:
  1. Verify the repository owner and name are correct
  2. If you forked the repo, use your GitHub username as the owner
  3. Make sure the token has `repo` scope

### "Cannot connect to GitHub API" Error

- **Cause**: Network connectivity issue
- **Solution**:
  1. Check your Home Assistant has internet access
  2. Try again in a few moments
  3. Check if GitHub is accessible from your network

### Button Press Does Nothing

- **Cause**: Workflow might be failing
- **Solution**:
  1. Check the GitHub Actions tab in your repository for workflow runs
  2. Look at Home Assistant logs for error messages
  3. Verify your GitHub token hasn't expired

## Summary

**What you need:**
- GitHub Personal Access Token with `repo` and `workflow` scopes

**Configuration fields:**
- **Required**: GitHub Personal Access Token
- **Optional** (defaults work for most users):
  - Repository Owner: `Jherrild`
  - Repository Name: `sunday-coffee`
  - Workflow File: `update-coffee-status.yml`

**Result:**
- Two button entities in Home Assistant
- Press buttons to update your Sunday Coffee status page
- Works in dashboards and automations
