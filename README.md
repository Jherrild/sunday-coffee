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

### Home Assistant Integration (HACS)

This repository can be added as a custom integration in Home Assistant via HACS, providing button entities to easily update the coffee status.

#### Installation

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
