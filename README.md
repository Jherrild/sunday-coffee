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

### Webhook Integration

The repository includes a GitHub Actions workflow that can be triggered via webhook, making it easy to integrate with Google Assistant or Home Assistant. See the documentation for setup instructions.
