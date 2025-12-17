"""Config flow for Sunday Coffee integration."""
from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult

from .const import (
    DOMAIN,
    CONF_GITHUB_TOKEN,
    CONF_REPO_OWNER,
    CONF_REPO_NAME,
    CONF_WORKFLOW_FILE,
    DEFAULT_REPO_OWNER,
    DEFAULT_REPO_NAME,
    DEFAULT_WORKFLOW_FILE,
)

_LOGGER = logging.getLogger(__name__)

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_GITHUB_TOKEN): str,
        vol.Optional(CONF_REPO_OWNER, default=DEFAULT_REPO_OWNER): str,
        vol.Optional(CONF_REPO_NAME, default=DEFAULT_REPO_NAME): str,
        vol.Optional(CONF_WORKFLOW_FILE, default=DEFAULT_WORKFLOW_FILE): str,
    }
)


async def validate_input(hass: HomeAssistant, data: dict[str, Any]) -> dict[str, Any]:
    """Validate the user input allows us to connect."""
    # Basic validation - just check token is not empty
    if not data[CONF_GITHUB_TOKEN]:
        raise ValueError("GitHub token cannot be empty")
    
    return {"title": f"Sunday Coffee - {data[CONF_REPO_OWNER]}/{data[CONF_REPO_NAME]}"}


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for Sunday Coffee."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            try:
                info = await validate_input(self.hass, user_input)
            except ValueError:
                errors["base"] = "invalid_auth"
            except Exception:  # pylint: disable=broad-except
                _LOGGER.exception("Unexpected exception")
                errors["base"] = "unknown"
            else:
                return self.async_create_entry(title=info["title"], data=user_input)

        return self.async_show_form(
            step_id="user", data_schema=STEP_USER_DATA_SCHEMA, errors=errors
        )
