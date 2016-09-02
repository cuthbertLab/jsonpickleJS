/**
 * jsonpickleJS -- interpretation of python jsonpickle in Javascript
 * main.js -- main loader -- this should be the only file that most users care about.
 *
 * Copyright (c) 2014-16 Michael Scott Cuthbert and cuthbertLab
 */
import { unpickler } from './unpickler';
import { pickler } from './pickler';
import { util } from './util';
import { tags } from './tags';
import { handlers } from './handlers';

const jsonpickle = {};
jsonpickle.pickler = pickler;
jsonpickle.unpickler = unpickler;
jsonpickle.util = util;
jsonpickle.tags = tags;
jsonpickle.handlers = handlers;

jsonpickle.encode = function jsonpickle_encode(value, unpicklable, make_refs,
        keys, max_depth, backend) {
    if (unpicklable === undefined) {
        unpicklable = true;
    }
    if (make_refs === undefined) {
        make_refs = true;
    }
    if (keys === undefined) {
        keys = false;
    }
    const options = {
        unpicklable,
        make_refs,
        keys,
        max_depth,
        backend,
    };
    return pickler.encode(value, options);
};


jsonpickle.decode = function jsonpickle_decode(string, backend, keys) {
    if (keys === undefined) {
        keys = false;
    }
    return unpickler.decode(string, backend, keys);
};

window.jsonpickle = {}; // global for now.
export default jsonpickle;
