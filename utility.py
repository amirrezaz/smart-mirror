from subprocess import call


class Screen:

    def __init__(self):
        self.monitor_on = True
        self.monitor_off_hard = False

    def turn_off(self):
        if self.monitor_on:
            call(['vcgencmd', 'display_power', '0'])
            # print '------------- TURN OFF ----------------'
            self.monitor_on = False

    def turn_on(self):
        if not self.monitor_on and not self.monitor_off_hard:
            # print '*********** TURN ON *********'
            call(['vcgencmd', 'display_power', '1'])
            self.monitor_on = True

    def turn_off_hard(self):
        self.monitor_off_hard = True
        self.turn_off()

    def turn_on_hard(self):
        self.monitor_off_hard = False
        self.turn_on()

    @property
    def is_on(self):
        return self.monitor_on


screen = Screen()
