#!/bin/bash

# Shell wrapper for the update-status.js script
# Usage: ./update-status.sh on|off

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <on|off>"
    echo ""
    echo "Examples:"
    echo "  $0 on   # Turn coffee status ON"
    echo "  $0 off  # Turn coffee status OFF"
    exit 1
fi

# Convert on/off to true/false
STATUS="$1"
case "${STATUS,,}" in
    on|true|yes|1)
        BOOL_STATUS="true"
        ;;
    off|false|no|0)
        BOOL_STATUS="false"
        ;;
    *)
        echo "Error: Invalid status '$STATUS'. Use 'on' or 'off'."
        exit 1
        ;;
esac

# Run the Node.js script
node "$(dirname "$0")/update-status.js" "$BOOL_STATUS"
