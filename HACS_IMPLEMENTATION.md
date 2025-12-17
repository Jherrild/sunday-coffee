# HACS Integration Implementation

## Overview

This implementation adds a Home Assistant Community Store (HACS) compatible custom integration that allows users to control the Sunday Coffee status page directly from Home Assistant.

## What Was Added

### Integration Files

- **`custom_components/sunday_coffee/`** - Main integration directory
  - `__init__.py` - Integration entry point with setup and unload functions
  - `button.py` - Button platform with two entities (ON/OFF)
  - `config_flow.py` - Configuration UI flow with GitHub API validation
  - `const.py` - Constants and default values
  - `manifest.json` - Integration metadata for Home Assistant
  - `strings.json` - UI strings for the integration
  - `translations/en.json` - English translation strings
  - `README.md` - Comprehensive integration documentation

### HACS Support

- **`hacs.json`** - HACS repository configuration

### Additional Files

- **`.gitignore`** - Ignores Python cache files

## Features

1. **Button Entities**: Two button entities that trigger the GitHub Actions workflow
   - `button.sunday_coffee_on` - Triggers coffee status ON
   - `button.sunday_coffee_off` - Triggers coffee status OFF

2. **Config Flow**: User-friendly configuration via Home Assistant UI
   - GitHub Personal Access Token input
   - Repository details (with defaults)
   - API connectivity validation

3. **Security**: 
   - Token stored securely in Home Assistant config
   - GitHub API validation during setup
   - Proper error handling with specific exceptions

4. **HACS Compliance**:
   - Proper directory structure
   - All required manifest fields
   - Translation support
   - Documentation

## Installation Methods

### Via HACS (Recommended)
1. Add custom repository: `https://github.com/Jherrild/sunday-coffee`
2. Search for "Sunday Coffee Status"
3. Install and restart Home Assistant
4. Configure via UI with GitHub token

### Manual Installation
1. Copy `custom_components/sunday_coffee/` to Home Assistant config
2. Restart Home Assistant
3. Configure via UI with GitHub token

## How It Works

```
User presses button in Home Assistant
         ↓
Button entity calls async_press()
         ↓
Makes GitHub API request to trigger workflow
         ↓
GitHub Actions runs update-coffee-status.yml
         ↓
Workflow updates index.html and deploys
         ↓
Sunday Coffee status page is updated
```

## Configuration

Users need to provide:
- **GitHub Personal Access Token** (with `repo` and `workflow` permissions)
- Repository Owner (default: Jherrild)
- Repository Name (default: sunday-coffee)
- Workflow File (default: update-coffee-status.yml)

## Testing Notes

- All Python files compile successfully
- All JSON files are valid
- CodeQL security scan: 0 vulnerabilities
- Integration follows Home Assistant best practices
- HACS-compliant structure

## Future Enhancements (Optional)

- Add sensor entity to show current coffee status
- Add service for custom date selection
- Add notification on workflow success/failure
- Add support for multiple repositories
