"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Replaces placeholders in a string with values from an object.
 * @param template - The string containing placeholders.
 * @param data - The object containing key-value pairs for replacement.
 * @returns The string with placeholders replaced by values.
 */
function supplant(template, data) {
    return template.replace(/{([^{}]*)}/g, (match, key) => {
        const value = data[key];
        return typeof value === "string" || typeof value === "number"
            ? value.toString()
            : match;
    });
}
exports.default = supplant;
