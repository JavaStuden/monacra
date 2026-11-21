"""Validate App Store provisioning before using it to sign the Capacitor app."""

import datetime
import hashlib
import json
import os
from pathlib import Path
import plistlib
import re
import subprocess
import uuid


def validate_profile(profile, bundle_id, identities, now=None):
    now = now or datetime.datetime.now(datetime.timezone.utc)
    expiry = profile.get('ExpirationDate')
    if not isinstance(expiry, datetime.datetime):
        raise ValueError('Provisioning profile has no expiration date.')
    if expiry.tzinfo is None:
        expiry = expiry.replace(tzinfo=datetime.timezone.utc)
    if expiry <= now:
        raise ValueError('Provisioning profile has expired.')
    entitlements = profile.get('Entitlements', {})
    if (entitlements.get('get-task-allow') is not False or 'ProvisionedDevices' in profile
            or profile.get('ProvisionsAllDevices')):
        raise ValueError('Use an App Store Connect distribution profile, not development, Ad Hoc or enterprise.')
    if 'iOS' not in profile.get('Platform', []):
        raise ValueError('Provisioning profile is not for iOS.')
    application_id = entitlements.get('application-identifier', '')
    if '.' not in application_id or application_id.split('.', 1)[1] != bundle_id:
        raise ValueError('Provisioning profile does not match the app bundle identifier.')
    teams = profile.get('TeamIdentifier', [])
    if len(teams) != 1 or not re.fullmatch(r'[A-Z0-9]{10}', teams[0]):
        raise ValueError('Provisioning profile has no valid Apple team identifier.')
    if entitlements.get('com.apple.developer.team-identifier') != teams[0]:
        raise ValueError('Provisioning profile team entitlement does not match its team.')
    profile_uuid = str(uuid.UUID(profile.get('UUID', ''))).upper()
    allowed = {
        hashlib.sha1(certificate).hexdigest().upper()
        for certificate in profile.get('DeveloperCertificates', [])
    }
    matching = sorted(allowed.intersection(identity.upper() for identity in identities))
    if not matching:
        raise ValueError('The profile has no matching signing certificate/private key in the temporary keychain.')
    return {'team_id': teams[0], 'profile_uuid': profile_uuid, 'identity': matching[0]}


def main():
    temp = Path(os.environ['RUNNER_TEMP'])
    with (temp / 'monarca-profile.plist').open('rb') as stream:
        profile = plistlib.load(stream)
    result = subprocess.run(
        ['security', 'find-identity', '-v', '-p', 'codesigning',
         str(temp / 'monarca-signing.keychain-db')],
        capture_output=True, text=True, check=True,
    )
    identities = re.findall(r'\b[0-9A-Fa-f]{40}\b', result.stdout)
    config = validate_profile(profile, os.environ['IOS_BUNDLE_ID'], identities)
    (temp / 'monarca-signing.json').write_text(json.dumps(config), encoding='utf-8')
    options = {
        'method': 'app-store-connect',
        'destination': 'export',
        'teamID': config['team_id'],
        'signingStyle': 'manual',
        'signingCertificate': config['identity'],
        'provisioningProfiles': {os.environ['IOS_BUNDLE_ID']: config['profile_uuid']},
        'manageAppVersionAndBuildNumber': False,
        'uploadSymbols': True,
    }
    with (temp / 'monarca-export-options.plist').open('wb') as stream:
        plistlib.dump(options, stream)
    with open(os.environ['GITHUB_ENV'], 'a', encoding='utf-8') as stream:
        stream.write('IOS_PROFILE_UUID=' + config['profile_uuid'] + '\n')
    print('App Store provisioning profile and signing identity validated.')


if __name__ == '__main__':
    main()
