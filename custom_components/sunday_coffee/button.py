"""Button platform for Sunday Coffee integration."""
from __future__ import annotations

import logging
from typing import Any

import aiohttp

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    CONF_GITHUB_TOKEN,
    CONF_REPO_OWNER,
    CONF_REPO_NAME,
    CONF_WORKFLOW_FILE,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Sunday Coffee button entities."""
    config = hass.data[DOMAIN][config_entry.entry_id]
    
    async_add_entities([
        SundayCoffeeButton(config, "on"),
        SundayCoffeeButton(config, "off"),
    ])


class SundayCoffeeButton(ButtonEntity):
    """Representation of a Sunday Coffee button."""

    def __init__(self, config: dict[str, Any], status: str) -> None:
        """Initialize the button."""
        self._config = config
        self._status = status
        self._attr_name = f"Sunday Coffee {status.upper()}"
        self._attr_unique_id = f"{DOMAIN}_{status}"

    @property
    def icon(self) -> str:
        """Return the icon for the button."""
        return "mdi:coffee" if self._status == "on" else "mdi:coffee-off"

    async def async_press(self) -> None:
        """Handle the button press."""
        _LOGGER.info("Triggering Sunday Coffee status update: %s", self._status)
        
        # GitHub API endpoint for triggering workflow
        owner = self._config[CONF_REPO_OWNER]
        repo = self._config[CONF_REPO_NAME]
        workflow = self._config[CONF_WORKFLOW_FILE]
        token = self._config[CONF_GITHUB_TOKEN]
        
        url = f"https://api.github.com/repos/{owner}/{repo}/actions/workflows/{workflow}/dispatches"
        
        headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        payload = {
            "ref": "main",
            "inputs": {
                "coffee_status": str(self._status == "on").lower()
            }
        }
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(url, json=payload, headers=headers) as response:
                    if response.status == 204:
                        _LOGGER.info("Successfully triggered workflow for status: %s", self._status)
                    else:
                        error_text = await response.text()
                        _LOGGER.error(
                            "Failed to trigger workflow. Status: %s, Response: %s",
                            response.status,
                            error_text
                        )
        except Exception as err:
            _LOGGER.error("Error triggering workflow: %s", err)
