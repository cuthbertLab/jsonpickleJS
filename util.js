import { tags } from './tags';

export const util = {};

util.merge = function merge(destination, source) {
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
};

util.PRIMITIVES = ['string', 'number', 'boolean'];

/* from jsonpickle.util */
// to_do...
util.is_type = (obj) => false;

// same as dictionary in JS...
util.is_object = (obj) => util.is_dictionary(obj);

util.is_primitive = (obj) => {
    if (obj === undefined || obj == null) {
        return true;
    }
    if (util.PRIMITIVES.indexOf(typeof obj) !== -1) {
        return true;
    }
    return false;
};


util.is_dictionary = (obj) => ((typeof obj === 'object') && (obj !== null));

util.is_sequence = (obj) => (util.is_list(obj) || util.is_set(obj) || util.is_tuple(obj));

util.is_list = (obj) => (obj instanceof Array);

// to_do...
util.is_set = (obj) => false;
util.is_tuple = (obj) => false;
util.is_dictionary_subclass = (obj) => false;
util.is_sequence_subclass = (obj) => false;
util.is_noncomplex = (obj) => false;

util.is_function = (obj) => (typeof obj === 'function');
util.is_module = (obj) => false;

util.is_picklable = (name, value) => {
    if (tags.RESERVED.indexOf(name) !== -1) {
        return false;
    }
    if (util.is_function(value)) {
        return false;
    } else {
        return true;
    }
};
util.is_installed = (module) => true; // ???

util.is_list_like = (obj) => util.is_list(obj);
