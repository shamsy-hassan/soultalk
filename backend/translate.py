"""Translation helpers.

This module is intentionally resilient to missing optional dependencies so the
backend can start even when translation extras aren't installed.
"""

from __future__ import annotations

import requests

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
        response = requests.get(
            'https://translate.googleapis.com/translate_a/single',
            params={
                'client': 'gtx',
                'sl': source_lang,
                'tl': target_lang,
                'dt': 't',
                'q': text.strip(),
            },
            timeout=10,
        )
        response.raise_for_status()
        payload = response.json()
        translated = ''.join(
            segment[0]
            for segment in (payload[0] or [])
            if isinstance(segment, list) and segment and segment[0]
        ).strip()
        if translated:
            return translated
        raise ValueError('Google returned an empty translation')
    except (requests.RequestException, ValueError, TypeError, IndexError) as direct_error:
        if GoogleTranslator is not None:
            try:
                return GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            except Exception as fallback_error:
                print(
                    f"Translation unavailable ({source_lang} -> {target_lang}): "
                    f"{fallback_error}; direct endpoint: {direct_error}"
                )
                return text
        print(f"Translation unavailable ({source_lang} -> {target_lang}): {direct_error}")
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
