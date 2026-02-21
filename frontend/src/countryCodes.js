// frontend/src/countryCodes.js

export const countryCodes = [
    { code: "+254", name: "Kenya", flag: "🇰🇪" },
    { code: "+255", name: "Tanzania", flag: "🇹🇿" },
    { code: "+256", name: "Uganda", flag: "🇺🇬" },
    { code: "+250", name: "Rwanda", flag: "🇷🇼" },
    { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
    { code: "+257", name: "Burundi", flag: "🇧🇮" },
    { code: "+211", name: "South Sudan", flag: "🇸🇸" },
    { code: "+252", name: "Somalia", flag: "🇸🇴" },
    { code: "+253", name: "Djibouti", flag: "🇩🇯" },
    { code: "+291", name: "Eritrea", flag: "🇪🇷" },
    { code: "+249", name: "Sudan", flag: "🇸🇩" },
    { code: "+269", name: "Comoros", flag: "🇰🇲" },
    { code: "+248", name: "Seychelles", flag: "🇸🇨" },
    { code: "+230", name: "Mauritius", flag: "🇲🇺" },
    { code: "+261", name: "Madagascar", flag: "🇲🇬" },
];

export const countryLanguages = {
    "+254": ["en", "sw"], // Kenya: English, Swahili
    "+255": ["en", "sw"], // Tanzania: English, Swahili
    "+256": ["en", "sw", "lg"], // Uganda: English, Swahili, Luganda
    "+250": ["en", "fr", "rw"], // Rwanda: English, French, Kinyarwanda
    "+251": ["en", "am", "so", "ar"], // Ethiopia: English, Amharic, Somali, Arabic
    "+257": ["fr", "rn", "sw"], // Burundi: French, Kirundi, Swahili
    "+211": ["en", "ar"], // South Sudan: English, Arabic
    "+252": ["so", "ar", "it"], // Somalia: Somali, Arabic, Italian
    "+253": ["ar", "fr", "so", "aa"], // Djibouti: Arabic, French, Somali, Afar (aa for Afar)
    "+291": ["ar", "ti", "en"], // Eritrea: Arabic, Tigrinya (ti), English
    "+249": ["ar", "en"], // Sudan: Arabic, English
    "+269": ["fr", "ar", "sw"], // Comoros: French, Arabic, Swahili
    "+248": ["en", "fr"], // Seychelles: English, French
    "+230": ["en", "fr"], // Mauritius: English, French
    "+261": ["mg", "fr"], // Madagascar: Malagasy (mg), French
    "default": ["en"] // Default to English if not specified
};