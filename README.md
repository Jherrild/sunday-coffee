# sunday-coffee
A static web page with the status of Sunday coffee

## Updating the Status

This repository includes an automated update script that can be run locally or triggered via webhook. See [UPDATE-SCRIPT-DOCS.md](UPDATE-SCRIPT-DOCS.md) for detailed usage instructions.

### Quick Start

```bash
# Update coffee status to ON
./update-status.sh on

# Update coffee status to OFF
./update-status.sh off
```

### Notes and Themes

The **Update Coffee Status** workflow accepts optional `notes`, `clear_notes`, and `theme` inputs in addition to the existing status. See [the usage guide](UPDATE-SCRIPT-DOCS.md#notes-and-themes) for UI/API examples.

- Notes appear in a left-aligned **This week** block below the time/location chips. Plain text supports line breaks and paragraphs; HTML is escaped. An empty note is hidden.
- Leaving `notes` blank preserves notes for the **same Sunday**. Moving to a different Sunday clears them unless new text is supplied. `clear_notes: true` explicitly removes them and overrides the notes input.
- The existing Home Assistant ON/OFF buttons remain compatible; they preserve same-week notes and the selected theme. This change does not add a Home Assistant text input or install/update that integration.
- Themes are selected independently of ON/OFF status. `default` restores the green/white everyday look; `halloween` preserves the Midnight ember palette and spiderweb. The workflow's `keep` option leaves the selection unchanged.
- **Halloween remains selected initially.** No automatic calendar switching is enabled.

The theme variable lives directly on the root element in `index.html`:

```html
<html lang="en" data-theme="halloween">
```

Change it to `data-theme="default"` to turn Halloween off without changing that weekend's status or date. Rendering is CSS-only: there is no browser-side config fetch, JavaScript requirement, or backend.

#### Adding another holiday later

Add a `:root[data-theme="holiday-name"]` CSS block overriding the shared palette/appearance variables. Keep layout and status rules theme-neutral. Scope any decoration to that theme and hide it otherwise. Add the new name to the workflow's `theme` options **and** its supported-theme validation list, then extend the theme tests. Unknown or missing theme attributes fall back to the everyday CSS, while the workflow rejects unsupported selections.

**All notes and theme settings are public website content.** Do not put addresses, passwords, or other secrets in them. Navigation and reminder signup are not included.

### Home Assistant Integration (HACS)

This repository can be added as a custom integration in Home Assistant via HACS, providing button entities to easily update the coffee status.

📖 **[See the Complete Configuration Guide](CONFIGURATION_GUIDE.md)** for detailed step-by-step instructions including PAT creation and troubleshooting.

#### Quick Installation

1. **Add to HACS:**
   - Open HACS in your Home Assistant instance
   - Click on "Integrations"
   - Click the three dots in the top right corner
   - Select "Custom repositories"
   - Add this repository URL: `https://github.com/Jherrild/sunday-coffee`
   - Select category: "Integration"
   - Click "Add"

2. **Install the Integration:**
   - Search for "Sunday Coffee Status" in HACS
   - Click "Download"
   - Restart Home Assistant

3. **Configure the Integration:**
   - Go to Settings → Devices & Services
   - Click "Add Integration"
   - Search for "Sunday Coffee Status"
   - Enter your GitHub Personal Access Token with `repo` and `workflow` permissions
   - Configure repository details (defaults are provided)

4. **Use the Button Entities:**
   - Two button entities will be created:
     - `button.sunday_coffee_on` - Triggers coffee status ON
     - `button.sunday_coffee_off` - Triggers coffee status OFF
   - Add these buttons to your dashboard or use in automations

#### Creating a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Home Assistant Sunday Coffee")
4. Select scopes: `repo` and `workflow`
5. Click "Generate token"
6. Copy the token and save it securely

### Webhook Integration

The repository includes a GitHub Actions workflow that can be triggered via webhook, making it easy to integrate with Google Assistant or other services. See the documentation for setup instructions.
