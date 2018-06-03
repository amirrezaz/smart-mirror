from pyicloud import PyiCloudService
import click

def main():
    config = conf.Config()
    username = config.params.get('icloud', {}).get('username', None)
    password = config.params.get('icloud', {}).get('password', None)

    api = PyiCloudService(username, password)

    if api.requires_2fa:

        print ("Two-step authentisation required. Your trusted devices are:")

        devices = api.trusted_devices
        for i, device in enumerate(devices):
            print ("  %s: %s" % (i, device.get('deviceName',
                                               "SMS to %s" % device.get('phoneNumber'))))

        device = click.prompt('Which device would you like to use?', default=0)
        device = devices[device]
        if not api.send_verification_code(device):
            print ("Failed to send verification code")
            sys.exit(1)

        code = click.prompt('Please enter validation code')
        if not api.validate_verification_code(device, code):
            print ("Failed to verify verification code")
            sys.exit(1)

if __name__ == "main":
    main()
