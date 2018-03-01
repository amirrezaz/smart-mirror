"""Configuration module"""
import ConfigParser
import os


class Config(object):
    """
    cfd-api configuration
    """
    _BOOT_ERROR_MESSAGE = """Please configure the profile by setting
    export PROFILE=/path/to/conf.ini"""

    """Service parameters"""
    def __init__(self):
        self._config = ConfigParser.ConfigParser()
        config_path = os.environ.get('PROFILE', None)

        if not config_path:
            print self._BOOT_ERROR_MESSAGE
            exit(1)
        self._config.read(config_path)

    @property
    def params(self):
        """Service parameters conf"""
        return self._config
