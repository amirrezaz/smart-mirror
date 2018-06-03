"""Configuration module"""
import os
import yaml

class Config(object):
    """
    smart mirror configuration
    """

    """Service parameters"""
    def __init__(self):

        config_path = "{}/conf/global.yaml".format(
            os.path.dirname(os.path.abspath(__file__))
        )

        with open(config_path) as conf:
            self._params = yaml.load(conf.read())


    @property
    def params(self):
        """Service parameters conf"""
        return self._params
