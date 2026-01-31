# This file will contain code for translation services.
from googletrans import Translator

def translate_text(text, from_lang, to_lang):
    """Translate text between languages"""
    
    # If same language, return original
    if from_lang == to_lang:
        return text
    
    try:
        translator = Translator()
        translated = translator.translate(text, src=from_lang, dest=to_lang)
        return translated.text
    except Exception as e:
        print(f"Error during translation: {e}")
        return f"[{text}] (translation not available)"

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
