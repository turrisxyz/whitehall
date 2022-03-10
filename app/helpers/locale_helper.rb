module LocaleHelper
  def select_locale(attribute, locales, options = {})
    select_tag attribute, options_for_select(options_for_locales(locales)), options
  end

  def options_for_locales(locales)
    locales.map do |locale|
      locale = Locale.coerce(locale)
      [locale.native_and_english_language_name, locale.code.to_s]
    end
  end

  def options_for_foreign_language_locale(edition)
    options = Locale.non_english.map do |locale|
      locale = Locale.coerce(locale)
      { text: locale.native_and_english_language_name, value: locale.code.to_s, checked: edition.primary_locale == locale.code.to_s }
    end
    [{ text: "Choose foreign language...", value: nil }] + options
  end
end
