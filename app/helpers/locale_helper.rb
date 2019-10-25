## LOCALE HELPER
# Helps with locale-related methods

module LocaleHelper

  # Get the web domain for the current locale
  def locale_host
    Rails.configuration.locale_hosts[I18n.locale]
  end

  # Get the translated name for a given country_code
  def country_name country_code
    countries[country_code.to_s.upcase].titleize
  end

  # Get the translated names for each country for a given language
  def countries language = I18n.locale
    # Get the localized country names for the given locale, or default to english if there is an error
    I18nData.countries(language) rescue I18nData.countries
  end

  # Get the translated name for a given language
  # If no language code is given it will default to the current locale 
  # If `native: true` is passed, then it will return the language name in it's native tongue, instead of the current locale
  def language_name language = I18n.locale, native: false
    languages(native ? language : I18n.locale)[language.to_s.upcase].titleize
  end

  # Get the translated names for each language for a given language
  def languages language = I18n.locale
    # Get the localized langugae names for the given locale, or default to english if there is an error
    I18nData.languages(language) rescue I18nData.languages
  end
  
end