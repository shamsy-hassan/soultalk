# This file will contain code for translation services.
# Mock translation for MVP - Replace with real API (Google Translate, DeepL, OpenAI, etc.)
# Language codes: en=English, sw=Swahili, am=Amharic, fr=French, ar=Arabic

translation_map = {
    # English to Swahili
    ('en', 'sw'): {
        'Hello': 'Hujambo',
        'How are you?': 'Habari yako?',
        'I am good': 'Niko sawa',
        'Thank you': 'Asante',
        'Goodbye': 'Kwaheri',
        'What is your name?': 'Jina lako nani?',
        'My name is': 'Jina langu ni',
        'Nice to meet you': 'Nafurahi kukutana nawe',
        'How is the weather?': 'Hali ya hewa ikoje?',
        'I love this': 'Nampenda hii'
    },
    # Swahili to English
    ('sw', 'en'): {
        'Hujambo': 'Hello',
        'Habari yako?': 'How are you?',
        'Niko sawa': 'I am good',
        'Asante': 'Thank you',
        'Kwaheri': 'Goodbye',
        'Jina lako nani?': 'What is your name?',
        'Jina langu ni': 'My name is',
        'Nafurahi kukutana nawe': 'Nice to meet you',
        'Hali ya hewa ikoje?': 'How is the weather?',
        'Nampenda hii': 'I love this'
    },
    # English to Amharic (simplified)
    ('en', 'am'): {
        'Hello': 'ሰላም',
        'How are you?': 'እንዴት ነህ?',
        'I am good': 'ደህና ነኝ',
        'Thank you': 'አመሰግናለሁ',
        'Goodbye': 'ደህና ሁን',
        'What is your name?': 'ስምህ ማን ነው?',
        'My name is': 'ስሜ',
        'Nice to meet you': 'ስለተገናኝክ ደስተኛ ነኝ',
        'How is the weather?': 'አየር እንዴት ነው?',
        'I love this': 'ይህን እወዳለሁ'
    },
    # Amharic to English (simplified)
    ('am', 'en'): {
        'ሰላም': 'Hello',
        'እንዴት ነህ?': 'How are you?',
        'ደህና ነኝ': 'I am good',
        'አመሰግናለሁ': 'Thank you',
        'ደህና ሁን': 'Goodbye',
        'ስምህ ማን ነው?': 'What is your name?',
        'ስሜ': 'My name is',
        'ስለተገናኝክ ደስተኛ ነኝ': 'Nice to meet you',
        'አየር እንዴት ነው?': 'How is the weather?',
        'ይህን እወዳለሁ': 'I love this'
    },
    # Swahili to Amharic
    ('sw', 'am'): {
        'Hujambo': 'ሰላም',
        'Habari yako?': 'እንዴት ነህ?',
        'Niko sawa': 'ደህና ነኝ',
        'Asante': 'አመሰግናለሁ',
        'Kwaheri': 'ደህና ሁን'
    },
    # Amharic to Swahili
    ('am', 'sw'): {
        'ሰላም': 'Hujambo',
        'እንዴት ነህ?': 'Habari yako?',
        'ደህና ነኝ': 'Niko sawa',
        'አመሰግናለሁ': 'Asante',
        'ደህና ሁን': 'Kwaheri'
    }
}

def translate_text(text, from_lang, to_lang):
    """Translate text between languages"""
    
    # If same language, return original
    if from_lang == to_lang:
        return text
    
    # Check if we have a direct translation
    key = (from_lang, to_lang)
    if key in translation_map:
        # Return translated phrase if found, otherwise return original
        return translation_map[key].get(text, f"[{text}] (translation not available)")
    
    # For MVP, if no direct translation, try through English
    if from_lang != 'en' and to_lang != 'en':
        # First translate to English
        english_key = (from_lang, 'en')
        if english_key in translation_map:
            english_text = translation_map[english_key].get(text, text)
            # Then translate to target
            target_key = ('en', to_lang)
            if target_key in translation_map:
                return translation_map[target_key].get(english_text, f"[{text}]")
    
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