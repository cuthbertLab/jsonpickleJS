import { tags } from './tags';

export function merge(destination, source) {
    if (source === undefined) {
        return destination;
    }
    for (const prop in source) {
        if (!({}.hasOwnProperty.call(source, prop))) {
            continue;
        }
        destination[prop] = source[prop];
    }
    return destination;
}

export const PRIMITIVES = ['string', 'number', 'boolean'];

/* from jsonpickle.util */
// to_do...
// noinspection JSUnusedGlobalSymbols, JSUnusedLocalSymbols
export const is_type = obj => false;

// same as dictionary in JS...
export const is_object = obj => is_dictionary(obj);

export const is_primitive = obj => {
    if (obj === undefined || obj == null) {
        return true;
    }
    return PRIMITIVES.indexOf(typeof obj) !== -1;
};


export const is_dictionary = obj => ((typeof obj === 'object') && (obj !== null));

// noinspection JSUnusedGlobalSymbols
export const is_sequence = obj => (is_list(obj) || is_set(obj) || is_tuple(obj));

export const is_list = obj => (obj instanceof Array);

// to_do...
// noinspection JSUnusedLocalSymbols
export const is_set = obj => false;

// noinspection JSUnusedLocalSymbols
export const is_tuple = obj => false;

// noinspection JSUnusedLocalSymbols
export const is_dictionary_subclass = obj => false;

// noinspection JSUnusedLocalSymbols
export const is_sequence_subclass = obj => false;

// noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
export const is_noncomplex = obj => false;

export const is_function = obj => (typeof obj === 'function');

// noinspection JSUnusedLocalSymbols
export const is_module = obj => false;

// noinspection JSUnusedGlobalSymbols
export const is_picklable = (name, value) => {
    if (tags.RESERVED.indexOf(name) !== -1) {
        return false;
    }
    return !is_function(value);
};

// noinspection JSUnusedLocalSymbols, JSUnusedGlobalSymbols
export const is_installed = module => true; // ???

// noinspection JSUnusedGlobalSymbols
export const is_list_like = obj => is_list(obj);
