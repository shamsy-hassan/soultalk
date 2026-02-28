"""Shared language catalog and country-language mapping for the API."""

COUNTRY_LANGUAGES = {
    "+254": ["en", "sw"],  # Kenya
    "+255": ["en", "sw"],  # Tanzania
    "+256": ["en", "sw", "lg"],  # Uganda
    "+250": ["en", "fr", "rw"],  # Rwanda
    "+251": ["en", "am", "so", "ar"],  # Ethiopia
    "+257": ["fr", "rn", "sw"],  # Burundi
    "+211": ["en", "ar"],  # South Sudan
    "+252": ["so", "ar", "it"],  # Somalia
    "+253": ["ar", "fr", "so", "aa"],  # Djibouti
    "+291": ["ar", "ti", "en"],  # Eritrea
    "+249": ["ar", "en"],  # Sudan
    "+269": ["fr", "ar", "sw"],  # Comoros
    "+248": ["en", "fr"],  # Seychelles
    "+230": ["en", "fr"],  # Mauritius
    "+261": ["mg", "fr"],  # Madagascar
    "default": ["en"],
}

# ui_supported means we have a full i18n translation file in frontend for app chrome.
LANGUAGES = {
    "en": {"name": "English", "nativeName": "English", "flag": "🇬🇧", "ui_supported": True},
    "sw": {"name": "Swahili", "nativeName": "Kiswahili", "flag": "🇹🇿", "ui_supported": True},
    "am": {"name": "Amharic", "nativeName": "አማርኛ", "flag": "🇪🇹", "ui_supported": True},
    "fr": {"name": "French", "nativeName": "Français", "flag": "🇫🇷", "ui_supported": True},
    "de": {"name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "ui_supported": True},
    "rw": {"name": "Kinyarwanda", "nativeName": "Ikinyarwanda", "flag": "🇷🇼", "ui_supported": True},
    "rn": {"name": "Kirundi", "nativeName": "Ikirundi", "flag": "🇧🇮", "ui_supported": True},
    "so": {"name": "Somali", "nativeName": "Soomaali", "flag": "🇸🇴", "ui_supported": True},
    "ar": {"name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "ui_supported": True},
    "es": {"name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "ui_supported": True},
    "pt": {"name": "Portuguese", "nativeName": "Português", "flag": "🇵🇹", "ui_supported": True},
    "yo": {"name": "Yoruba", "nativeName": "Yorùbá", "flag": "🇳🇬", "ui_supported": True},
    "ha": {"name": "Hausa", "nativeName": "Hausa", "flag": "🇳🇬", "ui_supported": True},
    "zu": {"name": "Zulu", "nativeName": "isiZulu", "flag": "🇿🇦", "ui_supported": True},
    "lg": {"name": "Luganda", "nativeName": "Luganda", "flag": "🇺🇬", "ui_supported": True},
    "aa": {"name": "Afar", "nativeName": "Qafar af", "flag": "🇩🇯", "ui_supported": True},
    "ti": {"name": "Tigrinya", "nativeName": "ትግርኛ", "flag": "🇪🇷", "ui_supported": True},
    "mg": {"name": "Malagasy", "nativeName": "Malagasy", "flag": "🇲🇬", "ui_supported": True},
    "it": {"name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "ui_supported": True},
}


def list_languages(country_code=None, ui_only=False):
    """Return language records, optionally filtered by country and UI support."""
    if country_code:
        codes = COUNTRY_LANGUAGES.get(country_code, COUNTRY_LANGUAGES["default"])
    else:
        codes = sorted(LANGUAGES.keys())

    languages = []
    for code in codes:
        metadata = LANGUAGES.get(code, {"name": code, "nativeName": code, "flag": "🌐", "ui_supported": False})
        if ui_only and not metadata.get("ui_supported", False):
            continue
        languages.append(
            {
                "code": code,
                "name": metadata["name"],
                "nativeName": metadata["nativeName"],
                "flag": metadata["flag"],
                "ui_supported": metadata["ui_supported"],
            }
        )
    return languages
