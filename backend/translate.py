"""Translation helpers.

This module is intentionally resilient to missing optional dependencies so the
backend can start even when translation extras aren't installed.
"""

from __future__ import annotations

from typing import Optional

try:
    from deep_translator import GoogleTranslator  # type: ignore
except ModuleNotFoundError:  # pragma: no cover
    GoogleTranslator = None  # type: ignore[assignment]

def translate_text(text, from_lang, to_lang):
    """Translate text between languages"""

    if text is None:
        return ""

    # If same language, return original
    if from_lang == to_lang:
        return text

    if GoogleTranslator is None:
        # Translation is optional; fall back to the original message so chat still works.
        print(
            "Translation disabled: missing optional dependency 'deep-translator'. "
            "Install it with: cd backend && .venv/bin/pip install -r requirements.txt"
        )
        return text

    try:
        source_lang = (from_lang or 'auto').strip() or 'auto'
        target_lang = (to_lang or 'en').strip() or 'en'
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        return translator.translate(text)
    except Exception as e:
        print(f"Error during translation: {e}")
        return text

def get_available_languages():
    """Get list of available languages"""
    return [
        {'code': 'en', 'name': 'English', 'flag': '🇺🇸'},
        {'code': 'sw', 'name': 'Swahili', 'flag': '🇹🇿'},
        {'code': 'am', 'name': 'Amharic', 'flag': '🇪🇹'},
        {'code': 'fr', 'name': 'French', 'flag': '🇫🇷'},
        {'code': 'ar', 'name': 'Arabic', 'flag': '🇸🇦'},
        {'code': 'es', 'name': 'Spanish', 'flag': '🇪🇸'},
        {'code': 'pt', 'name': 'Portuguese', 'flag': '🇵🇹'},
        {'code': 'yo', 'name': 'Yoruba', 'flag': '🇳🇬'},
        {'code': 'ha', 'name': 'Hausa', 'flag': '🇳🇬'},
        {'code': 'zu', 'name': 'Zulu', 'flag': '🇿🇦'}
    ]
