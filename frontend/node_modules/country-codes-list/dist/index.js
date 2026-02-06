"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customList = exports.customArray = exports.findOne = exports.filter = exports.all = exports.utils = void 0;
const groupBy_1 = __importDefault(require("./utils/groupBy"));
const supplant_1 = __importDefault(require("./utils/supplant"));
const countriesData_1 = __importDefault(require("./countriesData"));
exports.utils = {
    groupBy: groupBy_1.default,
};
function all() {
    return countriesData_1.default;
}
exports.all = all;
function filter(countryProperty, value) {
    return countriesData_1.default.filter((countryData) => countryData[countryProperty] === value);
}
exports.filter = filter;
function findOne(countryProperty, value) {
    return countriesData_1.default.find((countryData) => countryData[countryProperty] === value);
}
exports.findOne = findOne;
function customArray(fields = {
    name: "{countryNameEn} ({countryCode})",
    value: "{countryCode}",
}, { sortBy, sortDataBy, filter: filterFunc, } = {}) {
    const finalCollection = [];
    let data = countriesData_1.default;
    if (typeof filterFunc === "function") {
        data = data.filter(filterFunc);
    }
    if (sortDataBy) {
        const collator = new Intl.Collator([], { sensitivity: "accent" });
        data.sort((a, b) => collator.compare(a[sortDataBy], b[sortDataBy]));
    }
    data.forEach((countryData) => {
        const collectionObject = {};
        for (const field in fields) {
            collectionObject[field] = (0, supplant_1.default)(fields[field], countryData);
        }
        finalCollection.push(collectionObject);
    });
    if (sortBy && fields[sortBy]) {
        const collator = new Intl.Collator([], { sensitivity: "accent" });
        finalCollection.sort((a, b) => collator.compare(a[sortBy], b[sortBy]));
    }
    return finalCollection;
}
exports.customArray = customArray;
function customList(key = "countryCode", label = "{countryNameEn} ({countryCode})", { filter: filterFunc } = {}) {
    const finalObject = {};
    let data = countriesData_1.default;
    if (typeof filterFunc === "function") {
        data = data.filter(filterFunc);
    }
    data.forEach((countryData) => {
        const value = (0, supplant_1.default)(label, countryData);
        finalObject[String(countryData[key])] = value;
    });
    return finalObject;
}
exports.customList = customList;
