"""
Environment Loader
==================
Loads environment variables from .env file and provides
typed access to configuration values.

Usage:
    from env_loader import config
    api_key = config("GOOGLE_CLIENT_ID")
    port = config("SMTP_PORT", cast=int, default=587)
"""

import os
import sys
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    print("ERROR: python-dotenv not installed. Run: pip install python-dotenv")
    sys.exit(1)

# Load .env from project root
_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_ENV_PATH = _PROJECT_ROOT / ".env"

if _ENV_PATH.exists():
    load_dotenv(_ENV_PATH)
else:
    print(f"WARNING: .env file not found at {_ENV_PATH}")


def config(key: str, default: str = None, cast: type = str, required: bool = False):
    """
    Get a configuration value from environment variables.

    Args:
        key: Environment variable name
        default: Default value if not set
        cast: Type to cast the value to (str, int, bool, float)
        required: If True, raise error when missing

    Returns:
        The configuration value, cast to the specified type

    Raises:
        ValueError: If required key is missing
    """
    value = os.getenv(key, default)

    if value is None:
        if required:
            raise ValueError(f"Required environment variable '{key}' is not set.")
        return None

    if cast == bool:
        return value.lower() in ("true", "1", "yes")

    return cast(value)


# Pre-loaded common config
TMP_DIR = Path(config("TMP_DIR", default=".tmp"))
TMP_DIR.mkdir(exist_ok=True)
LOG_LEVEL = config("LOG_LEVEL", default="INFO")
