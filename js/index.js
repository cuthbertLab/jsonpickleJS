/**
 * jsonpickleJS -- interpretation of python jsonpickle in Javascript
 * index.js -- main loader -- this should be the only file that most users care about.
 *
 * Copyright (c) 2014-19 Michael Scott Cuthbert and cuthbertLab
 */
import 'regenerator-runtime/runtime';

import * as unpickler from './unpickler.js';
import * as pickler from './pickler.js';
import * as util from './util.js';
import { tags } from './tags.js';
import { handlers } from './handlers.js';

// noinspection JSUnusedGlobalSymbols
export { pickler, unpickler, util, tags, handlers };

export function encode(
    value, unpicklable=true, make_refs=true,
    keys=false, max_depth, backend
) {
    const options = {
        unpicklable,
        make_refs,
        keys,
        max_depth,
        backend,
    };
    return pickler.encode(value, options);
}


export function decode(string, backend, keys=false) {
    return unpickler.decode(string, backend, keys);
}
