"""
Google Auth
===========
Handles Google OAuth 2.0 authentication flow and credential management.
Supports Calendar, Drive, and Gmail scopes.

Usage:
    # First run — opens browser for OAuth consent
    python execution/google_auth.py

    # In other scripts
    from google_auth import get_credentials, build_service
    creds = get_credentials()
    calendar = build_service("calendar", "v3")
"""

import sys
from pathlib import Path

try:
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
except ImportError:
    print("ERROR: Google API libraries not installed.")
    print("Run: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

_PROJECT_ROOT = Path(__file__).resolve().parent.parent
_CREDENTIALS_FILE = _PROJECT_ROOT / "credentials.json"
_TOKEN_FILE = _PROJECT_ROOT / "token.json"

# Scopes required for the application
SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/gmail.send",
]


def get_credentials() -> Credentials:
    """
    Load or create OAuth 2.0 credentials.

    On first run, opens a browser window for user consent.
    Subsequent runs reuse the saved token.

    Returns:
        google.oauth2.credentials.Credentials

    Raises:
        FileNotFoundError: If credentials.json is missing
    """
    creds = None

    # Load existing token
    if _TOKEN_FILE.exists():
        creds = Credentials.from_authorized_user_file(str(_TOKEN_FILE), SCOPES)

    # Refresh or create new credentials
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            if not _CREDENTIALS_FILE.exists():
                raise FileNotFoundError(
                    f"credentials.json not found at {_CREDENTIALS_FILE}.\n"
                    "Download it from Google Cloud Console → APIs & Services → Credentials."
                )
            print("Starting OAuth flow — a browser window will open...")
            flow = InstalledAppFlow.from_client_secrets_file(str(_CREDENTIALS_FILE), SCOPES)
            creds = flow.run_local_server(port=0)

        # Save token for future runs
        with open(_TOKEN_FILE, "w") as token_file:
            token_file.write(creds.to_json())
        print(f"Token saved to {_TOKEN_FILE}")

    return creds


def build_service(service_name: str, version: str):
    """
    Build an authenticated Google API service client.

    Args:
        service_name: API name (e.g., 'calendar', 'drive', 'gmail')
        version: API version (e.g., 'v3', 'v1')

    Returns:
        googleapiclient.discovery.Resource
    """
    creds = get_credentials()
    return build(service_name, version, credentials=creds)


if __name__ == "__main__":
    print("=== Google Authentication Setup ===")
    print(f"Credentials file: {_CREDENTIALS_FILE}")
    print(f"Token file:       {_TOKEN_FILE}")
    print(f"Scopes:           {len(SCOPES)} scope(s)")
    print()

    try:
        creds = get_credentials()
        print("✓ Authentication successful!")
        print(f"  Token valid: {creds.valid}")
        print(f"  Scopes: {', '.join(creds.scopes or [])}")
    except FileNotFoundError as e:
        print(f"✗ {e}")
        sys.exit(1)
    except Exception as e:
        print(f"✗ Authentication failed: {e}")
        sys.exit(1)
