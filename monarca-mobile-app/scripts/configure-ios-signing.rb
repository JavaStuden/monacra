# Apply signing only to the application target; CocoaPods targets must not inherit its profile.
require 'json'
require 'xcodeproj'

config = JSON.parse(File.read(File.join(ENV.fetch('RUNNER_TEMP'), 'monarca-signing.json')))
project = Xcodeproj::Project.open('ios/App/App.xcodeproj')
target = project.targets.find { |item| item.name == 'App' }
abort 'The iOS App target was not found.' unless target
release = target.build_configurations.find { |item| item.name == 'Release' }
abort 'The iOS Release configuration was not found.' unless release

release.build_settings.merge!(
  'CODE_SIGN_STYLE' => 'Manual',
  'CODE_SIGN_IDENTITY' => config.fetch('identity'),
  'DEVELOPMENT_TEAM' => config.fetch('team_id'),
  'PROVISIONING_PROFILE_SPECIFIER' => config.fetch('profile_uuid'),
  'PRODUCT_BUNDLE_IDENTIFIER' => ENV.fetch('IOS_BUNDLE_ID'),
  'MARKETING_VERSION' => ENV.fetch('IOS_VERSION'),
  'CURRENT_PROJECT_VERSION' => ENV.fetch('IOS_BUILD_NUMBER')
)
project.save
puts 'Configured distribution signing for the App Release target.'
