class ImageUploader < ApplicationUploader

  include CarrierWave::MiniMagick

  VERSIONS = {
    huge: 2880,
    large: 1440,
    medium: 720,
    small: 360,
    tiny: 180,
  }.freeze

  VERSIONS.each do |name, version_width|
    version name, &create_version(version_width)
  end

  # Add a white list of extensions which are allowed to be uploaded.
  def extension_whitelist
    %w[png jpg jpeg]
  end

end
