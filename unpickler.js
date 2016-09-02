/**
 * jsonPickle/javascript/unpickler -- Conversion from music21p jsonpickle streams
 *
 * Copyright (c) 2013-14, Michael Scott Cuthbert and cuthbertLab
 * Based on music21 (=music21p), Copyright (c) 2006–14, Michael Scott Cuthbert and cuthbertLab
 *
 * usage:
 *
 * js_obj = unpickler.decode(json_string);
 *
 */

import { util } from './util';
import { handlers } from './handlers';
import { tags } from './tags';

export const unpickler = {};

unpickler.decode = function decode(string, user_handlers, options) {
    const params = {
        keys: false,
        safe: false,
        reset: true,
        backend: JSON,
    };

    util.merge(params, options);

    const use_handlers = {};
    util.merge(use_handlers, handlers); // don't screw up default handlers...
    util.merge(use_handlers, user_handlers);

    let context;
    // backend does not do anything -- it is there for
    // compat with py-JSON-Pickle
    if (params.context === undefined) {
        const unpickler_options = {
            keys: params.keys,
            backend: params.backend,
            safe: params.safe,
        };
        context = new unpickler.Unpickler(unpickler_options, use_handlers);
    } else {
        context = params.context;
    }
    const jsonObj = params.backend.parse(string);
    return context.restore(jsonObj, params.reset);
};

export class Unpickler {
    constructor(options, handlers) {
        const params = {
            keys: false,
            safe: false,
        };
        util.merge(params, options);
        this.keys = params.keys;
        this.safe = params.safe;

        this.handlers = handlers;
        // obsolete...
        // this._namedict = {};

        // The namestack grows whenever we recurse into a child object
        this._namestack = [];

        // Maps objects to their index in the _objs list
        this._obj_to_idx = {};
        this._objs = [];
    }

    reset() {
        // this._namedict = {};
        this._namestack = [];
        this._obj_to_idx = {};
        this._objs = [];
    }

    /**
     * Restores a flattened object to a JavaScript representation
     * as close to the original python object as possible.
     *
     */
    restore(obj, reset) {
        if (reset) {
            this.reset();
        }
        return this._restore(obj);
    }

    _restore(obj) {
        const has_tag = unpickler.has_tag;
        let restoreMeth = (obj) => obj;

        if (has_tag(obj, tags.ID)) {
            restoreMeth = this._restore_id.bind(this);
        } else if (has_tag(obj, tags.REF)) {
            // backwards compat. not supported
        } else if (has_tag(obj, tags.TYPE)) {
            restoreMeth = this._restore_type.bind(this);
        } else if (has_tag(obj, tags.REPR)) {
            // backwards compat. not supported
        } else if (has_tag(obj, tags.OBJECT)) {
            restoreMeth = this._restore_object.bind(this);
        } else if (has_tag(obj, tags.TUPLE)) {
            restoreMeth = this._restore_tuple.bind(this);
        } else if (has_tag(obj, tags.SET)) {
            restoreMeth = this._restore_set.bind(this);
        } else if (util.is_list(obj)) {
            restoreMeth = this._restore_list.bind(this);
        } else if (util.is_dictionary(obj)) {
            restoreMeth = this._restore_dict.bind(this);
        } else {
            // map to self
        }
        return restoreMeth(obj);
    }

    _restore_id(obj) {
        return this._objs[obj[tags.ID]];
    }

    _restore_type(obj) {
        const typeref = unpickler.loadclass(obj[tags.TYPE]);
        if (typeref === undefined) {
            return obj;
        } else {
            return typeref;
        }
    }

    _restore_object(obj) {
        const class_name = obj[tags.OBJECT];
        const handler = this.handlers[class_name];
        if (handler !== undefined && handler.restore !== undefined) {
            const instance = handler.restore(obj);
            instance[tags.PY_CLASS] = class_name;
            return this._mkref(instance);
        } else {
            const cls = unpickler.loadclass(class_name);
            if (cls === undefined) {
                obj[tags.PY_CLASS] = class_name;
                return this._mkref(obj);
            }
            const instance = this._restore_object_instance(obj, cls);
            instance[tags.PY_CLASS] = class_name;
            if (handler !== undefined && handler.post_restore !== undefined) {
                return handler.post_restore(instance);
            } else {
                return instance;
            }
        }
    }
    _loadfactory(obj) {
        const default_factory = obj.default_factory;
        if (default_factory === undefined) {
            return undefined;
        } else {
            obj.default_factory = undefined;
            return this._restore(default_factory);
        }
    }


    _restore_object_instance(obj, cls) {
        // var factory = this._loadfactory(obj);
        let args = unpickler.getargs(obj);
        if (args.length > 0) {
            args = this._restore(args);
        }
        // not using factory... does not seem to apply to JS
        const instance = unpickler.construct(cls, args);
        this._mkref(instance);
        return this._restore_object_instance_variables(obj, instance);
    }

    _restore_object_instance_variables(obj, instance) {
        const has_tag = unpickler.has_tag;
        const restore_key = this._restore_key_fn();
        const keys = [];
        for (const k in obj) {
            if ({}.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        keys.sort();
        for (let i = 0; i < keys.length; i++) {
            let k = keys[i];
            if (tags.RESERVED.indexOf(k) !== -1) {
                continue;
            }
            const v = obj[k];
            this._namestack.push(k);
            k = restore_key(k);
            let value;
            if (v !== undefined && v !== null) {
                value = this._restore(v);
            }
            // no setattr checks...
            instance[k] = value;
            this._namestack.pop();
        }
        if (has_tag(obj, tags.SEQ)) {
            if (instance.push !== undefined) {
                for (const v in obj[tags.SEQ]) {
                    if (!({}.hasOwnProperty.call(obj[tags.SEQ], v))) {
                        continue;
                    }
                    instance.push(this._restore(v));
                }
            } // no .add ...
        }

        if (has_tag(obj, tags.STATE)) {
            instance = this._restore_state(obj, instance);
        }
        return instance;
    }


    _restore_state(obj, instance) {
        // only if the JS object implements __setstate__
        if (instance.__setstate__ !== undefined) {
            const state = this._restore(obj[tags.STATE]);
            instance.__setstate__(state);
        } else {
            instance = this._restore_object_instance_variables(obj[tags.STATE], instance);
        }
        return instance;
    }

    _restore_list(obj) {
        const parent = [];
        this._mkref(parent);
        const children = [];
        for (let i = 0; i < obj.length; i++) {
            const v = obj[i];
            const rest = this._restore(v);
            children.push(rest);
        }
        parent.push(...children);
        return parent;
    }
    _restore_tuple(obj) {
        // JS having no difference between list, tuple, set -- returns Array
        const children = [];
        const tupleContents = obj[tags.TUPLE];
        for (let i = 0; i < tupleContents.length; i++) {
            children.push(this._restore(tupleContents[i]));
        }
        return children;
    }

    _restore_set(obj) {
        // JS having no difference between list, tuple, set -- returns Array
        // TODO: ES5 Sets!
        const children = [];
        const setContents = obj[tags.SET];
        for (let i = 0; i < setContents.length; i++) {
            children.push(this._restore(setContents[i]));
        }
        return children;
    }

    _restore_dict(obj) {
        const data = {};
        // var restore_key = this._restore_key_fn();
        const keys = [];
        for (const k in obj) {
            if ({}.hasOwnProperty.call(obj, k)) {
                keys.push(k);
            }
        }
        keys.sort();
        for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const v = obj[k];

            this._namestack.push(k);
            data[k] = this._restore(v);
            // no setattr checks...
            this._namestack.pop();
        }
        return data;
    }

    _restore_key_fn() {
        if (this.keys) {
            return (key) => {
                if (key.indexOf(tags.JSON_KEY) === 0) {
                    key = unpickler.decode(key.slice(tags.JSON_KEY.length),
                            this.handlers,
                            { context: this,
                              keys: this.keys,
                              reset: false,
                            }
                    );
                    return key;
                } else {
                    return key;
                }
            };
        } else {
            return (key) => key;
        }
    }

//  _refname not needed...
    _mkref(obj) {
        // does not use id(obj) in javascript
        this._objs.push(obj);
        return obj;
    }
}
unpickler.Unpickler = Unpickler;


unpickler.getargs = function getargs(obj) {
    const seq_list = obj[tags.SEQ];
    const obj_dict = obj[tags.OBJECT];
    if (seq_list === undefined || obj_dict === undefined) {
        return [];
    }
    const typeref = unpickler.loadclass(obj_dict);
    if (typeref === undefined) {
        return [];
    }
    if (typeref._fields !== undefined) {
        if (typeref._fields.length === seq_list.length) {
            return seq_list;
        }
    }
    return [];
};

unpickler.loadclass = function loadclass(module_and_name) {
    const main_check = '__main__.';
    if (module_and_name.indexOf(main_check) === 0) {
        module_and_name = module_and_name.slice(main_check.length);
    }
    let parent = window;
    const module_class_split = module_and_name.split('.');
    for (let i = 0; i < module_class_split.length; i++) {
        const this_module_or_class = module_class_split[i];
        parent = parent[this_module_or_class];
        if (parent === undefined) {
            return parent;
        }
    }
    return parent;
};

unpickler.has_tag = function has_tag(obj, tag) {
    if ((typeof obj === 'object') && (obj !== null) &&
            (obj[tag] !== undefined)) {
        return true;
    } else {
        return false;
    }
};

// http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible
unpickler.construct = function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
};
