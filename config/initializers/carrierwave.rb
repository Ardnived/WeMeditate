CarrierWave.configure do |config|
  config.asset_host = ActionController::Base.asset_host

  if ENV['GCLOUD_BUCKET'].present?
    config.storage = :fog

    config.fog_provider = 'fog/google'
    config.fog_directory = ENV['GCLOUD_BUCKET']
    config.fog_attributes = { expires: 600 }
    config.fog_credentials = {
      provider:               'Google',
      google_project:         'we-meditate',
      google_json_key_string: ENV['GOOGLE_CLOUD_KEYFILE'].present? ? ENV['GOOGLE_CLOUD_KEYFILE'] : nil,
    }
=begin
    config.storage = :gcloud
    config.gcloud_bucket = ENV['GCLOUD_BUCKET']

    # If the bucket name looks like a host name use it as asset_host.
    # For example "wemeditate" is treated as bucket only with URL's like:
    # https://storage.googleapis.com/wemeditate/uploads/<carrier-wave-path>
    # while "assets.wemeditate.co" is treated as a host with URL's like:
    # https://assets.wemeditate.co/uploads/<carrier-wave-path>
    config.asset_host = "https://#{ENV['GCLOUD_BUCKET']}" if ENV['GCLOUD_BUCKET'].include?('.')

    config.gcloud_bucket_is_public = true
    config.gcloud_authenticated_url_expiration = 600

    config.gcloud_attributes = { expires: 600 }
    config.gcloud_credentials = {
      gcloud_project: 'we-meditate',
      gcloud_keyfile: ENV['GOOGLE_CLOUD_KEYFILE'].present? ? JSON.parse(ENV['GOOGLE_CLOUD_KEYFILE']) : nil,
    }
=end
  else
    config.storage = :file
  end
end
