import groupBy from "./utils/groupBy";
import { CountryData, CountryProperty } from "./countriesData";
export type { CountryData, CountryProperty };
export declare const utils: {
    groupBy: typeof groupBy;
};
export declare function all(): CountryData[];
export declare function filter(countryProperty: CountryProperty, value: string): CountryData[];
export declare function findOne(countryProperty: CountryProperty, value: string): CountryData | undefined;
export declare function customArray(fields?: Record<string, string>, { sortBy, sortDataBy, filter: filterFunc, }?: {
    sortBy?: CountryProperty;
    sortDataBy?: CountryProperty;
    filter?: (cd: CountryData) => boolean;
}): Record<string, string>[];
export declare function customList(key?: keyof CountryData, label?: string, { filter: filterFunc }?: {
    filter?: (cd: CountryData) => boolean;
}): Record<string, string>;
