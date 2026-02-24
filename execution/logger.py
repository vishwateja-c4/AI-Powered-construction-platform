"""
Logger
======
Centralized logging utility with colored console output
and optional file logging.

Usage:
    from logger import get_logger
    log = get_logger("my_script")
    log.info("Task started")
    log.error("Something failed", exc_info=True)
"""

import logging
import sys
from pathlib import Path

try:
    import colorlog
    _HAS_COLOR = True
except ImportError:
    _HAS_COLOR = False

# Import config safely
try:
    from env_loader import LOG_LEVEL, TMP_DIR
except ImportError:
    LOG_LEVEL = "INFO"
    TMP_DIR = Path(".tmp")
    TMP_DIR.mkdir(exist_ok=True)

_LOG_DIR = TMP_DIR / "logs"
_LOG_DIR.mkdir(exist_ok=True)


def get_logger(name: str, log_to_file: bool = True) -> logging.Logger:
    """
    Create a logger with colored console output and optional file output.

    Args:
        name: Logger name (usually the script/module name)
        log_to_file: Whether to also log to a file in .tmp/logs/

    Returns:
        Configured logging.Logger instance
    """
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # already configured

    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    # Console handler
    if _HAS_COLOR:
        console_fmt = colorlog.ColoredFormatter(
            "%(log_color)s%(asctime)s [%(levelname)-8s]%(reset)s %(name)s — %(message)s",
            datefmt="%H:%M:%S",
            log_colors={
                "DEBUG": "cyan",
                "INFO": "green",
                "WARNING": "yellow",
                "ERROR": "red",
                "CRITICAL": "bold_red",
            },
        )
        console_handler = colorlog.StreamHandler(sys.stdout)
        console_handler.setFormatter(console_fmt)
    else:
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)-8s] %(name)s — %(message)s", datefmt="%H:%M:%S")
        )
    logger.addHandler(console_handler)

    # File handler
    if log_to_file:
        log_file = _LOG_DIR / f"{name}.log"
        file_handler = logging.FileHandler(log_file, encoding="utf-8")
        file_handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)-8s] %(name)s — %(message)s")
        )
        logger.addHandler(file_handler)

    return logger
