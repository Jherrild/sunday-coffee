# Sunday Coffee Status Integration for Home Assistant

This custom integration allows you to control the Sunday Coffee status page directly from Home Assistant using button entities.

## Features

- **Two Button Entities**: Simple button entities to turn coffee status ON or OFF
- **GitHub Actions Integration**: Automatically triggers the GitHub workflow to update the status page
- **Easy Configuration**: Simple setup via Home Assistant UI with config flow

## Installation

### Via HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Click on "Integrations"
3. Click the three dots menu in the top right corner
4. Select "Custom repositories"
5. Add this repository URL: `https://github.com/Jherrild/sunday-coffee`
6. Select category: "Integration"
7. Click "Add"
8. Search for "Sunday Coffee Status" in HACS
9. Click "Download"
10. Restart Home Assistant

### Manual Installation

1. Copy the `custom_components/sunday_coffee` directory to your Home Assistant's `custom_components` directory
2. Restart Home Assistant

## Configuration

1. Go to Settings → Devices & Services
2. Click "Add Integration"
3. Search for "Sunday Coffee Status"
4. Enter the following information:
   - **GitHub Personal Access Token**: A token with `repo` and `workflow` permissions
   - **Repository Owner**: Default is `Jherrild`
   - **Repository Name**: Default is `sunday-coffee`
   - **Workflow File**: Default is `update-coffee-status.yml`

### Creating a GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Home Assistant Sunday Coffee")
4. Select the following scopes:
   - `repo` (Full control of private repositories)
   - `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. Copy the token and save it securely (you won't be able to see it again!)

## Usage

After configuration, two button entities will be created:

- `button.sunday_coffee_on` - Triggers coffee status ON
- `button.sunday_coffee_off` - Triggers coffee status OFF

### Dashboard Card

Add the buttons to your dashboard:

```yaml
type: entities
title: Sunday Coffee
entities:
  - button.sunday_coffee_on
  - button.sunday_coffee_off
```

Or use individual button cards:

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

### Automation Example

Automatically turn coffee ON every Saturday morning:

```yaml
automation:
  - alias: "Saturday Coffee Reminder"
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

## How It Works

When you press a button:

1. The button entity triggers the `async_press` method
2. The integration makes an API call to GitHub to trigger the workflow
3. GitHub Actions runs the `update-coffee-status.yml` workflow
4. The workflow updates the `index.html` file with the new status
5. The changes are committed and pushed to the repository
6. GitHub Pages automatically deploys the updated page

## Troubleshooting

### Integration doesn't appear in the list

- Make sure you've restarted Home Assistant after installation
- Check the Home Assistant logs for any errors

### Button press doesn't work

- Verify your GitHub Personal Access Token has the correct permissions (`repo` and `workflow`)
- Check that the repository owner, name, and workflow file are correct
- Look in the Home Assistant logs for error messages

### Workflow doesn't trigger

- Ensure the GitHub Personal Access Token is valid and hasn't expired
- Verify the workflow file exists in the repository at `.github/workflows/update-coffee-status.yml`
- Check the GitHub Actions tab in your repository for workflow runs

## Support

For issues, questions, or feature requests, please open an issue on the [GitHub repository](https://github.com/Jherrild/sunday-coffee/issues).

## License

This integration is part of the Sunday Coffee repository and uses the same license.
