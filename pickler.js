import { util } from './util';
import { handlers } from './handlers';
import { tags } from './tags';

export const pickler = {};

pickler.encode = function encode(value, options) {
    const params = {
        unpicklable: false,
        make_refs: true,
        keys: false,
        max_depth: undefined,
        reset: true,
        backend: undefined, // does nothing; python compat
        context: undefined,
    };

    util.merge(params, options);
    if (params.context === undefined) {
        const outparams = {
            unpicklable: params.unpicklable,
            make_refs: params.make_refs,
            keys: params.keys,
            backend: params.backend,
            max_depth: params.max_depth,
        };
        params.context = new pickler.Pickler(outparams);
        const fixed_obj = params.context.flatten(value, params.reset);
        return JSON.stringify(fixed_obj);
    } else {
        return undefined;
    }
};

export class Pickler {
    constructor(options) {
        const params = {
            unpicklable: true,
            make_refs: true,
            max_depth: undefined,
            backend: undefined,
            keys: false,
        };
        util.merge(params, options);
        this.unpicklable = params.unpicklable;
        this.make_refs = params.make_refs;
        this.backend = params.backend;
        this.keys = params.keys;
        this._depth = -1;
        this._max_depth = params.max_depth;
        this._objs = [];
        this._seen = [];
    }
    reset() {
        this._objs = [];
        this._depth = -1;
        this._seen = [];
    }

    _push() {
        this._depth += 1;
    }
    _pop(value) {
        this._depth -= 1;
        if (this._depth === -1) {
            this.reset();
        }
        return value;
    }
    _mkref(obj) {
        const found_id = this._get_id_in_objs(obj);
        // console.log(found_id);
        if (found_id !== -1) {
            return false;
//          if (this.unpicklable == false || this.make_refs == false) {
//          return true;
//          } else {
//          return false;
//          }
        }
        this._objs.push(obj);
        return true;
    }
    _get_id_in_objs(obj) {
        const objLength = this._objs.length;
//      console.log('sought obj', obj);
//      console.log('stored objs: ', this._objs);
        for (let i = 0; i < objLength; i++) {
            if (obj === this._objs[i]) {
                return i;
            }
        }
        return -1;
    }
    _getref(obj) {
        const wrap_obj =  {};
        wrap_obj[tags.ID] = this._get_id_in_objs(obj);
        return wrap_obj;
    }
    flatten(obj, reset) {
        if (reset === undefined) {
            reset = true;
        }
        if (reset) {
            this.reset();
        }
        const flatOut = this._flatten(obj);
        console.log(this._objs);
        return flatOut;
    }
    _flatten(obj) {
        this._push();
        return this._pop(this._flatten_obj(obj));
    }
    _flatten_obj(obj) {
        this._seen.push(obj);
        const max_reached = (this._depth === this._max_depth);
        if (max_reached || (this.make_refs === false && this._get_id_in_objs(obj) !== -1)) {
            // no repr equivalent, use str;
            return toString(obj);
        } else {
            const flattener = this._get_flattener(obj);
            // console.log(flattener);
            return flattener.call(this, obj);
        }
    }
    _list_recurse(obj) {
        const l = [];
        for (let i = 0; i < obj.length; i++) {
            l.push(this._flatten(obj[i]));
        }
        return l;
    }
    _get_flattener(obj) {
        if (util.is_primitive(obj)) {
            return obj => obj;
        }
        if (util.is_list(obj)) {
            if (this._mkref(obj)) {
                return this._list_recurse;
            } else {
                this._push();
                return this._getref;
            }
        }
        if (util.is_tuple(obj)) {
            if (!this.unpicklable) {
                return this._list_recurse;
            } else {
                return (obj) => {
                    const obj_wrap = {};
                    obj_wrap[tags.TUPLE] = this._list_recurse(obj);
                };
            }
        }
        if (util.is_set(obj)) {
            if (!this.unpicklable) {
                return this._list_recurse;
            } else {
                return (obj) => {
                    const obj_wrap = {};
                    obj_wrap[tags.SET] = this._list_recurse(obj);
                };
            }
        }
        // better -- translate as object...
        // if (util.is_dictionary(obj)) {
        //    return this._flatten_dict_obj;
        // }
        // if (util.is_type(obj)) {
        //    return _mktyperef;
        // }
        if (util.is_object(obj)) {
            return this._ref_obj_instance;
        }
        console.log('no flattener for ', obj, ' of type ', typeof obj);
        return undefined;
    }
    _ref_obj_instance(obj) {
        if (this._mkref(obj)) {
            return this._flatten_obj_instance(obj);
        }
        return this._getref(obj);
    }
    _flatten_obj_instance(obj) {
        const data = {};
        const has_class = (obj[tags.PY_CLASS] !== undefined); // ? or ...
        const has_dict = true;
        // const has_slots = false;
        const has_getstate = (obj.__getstate__ !== undefined);

        if (has_class && util.is_module(obj) === false) {
            const fullModuleName = pickler._getclassdetail(obj);
            if (this.unpicklable) {
                data[tags.OBJECT] = fullModuleName;
                console.log(data);
            }
            const handler = handlers[fullModuleName];
            if (handler !== undefined) {
                handler.flatten(obj, data);
            }
        }

        if (util.is_module(obj)) {
            // todo if possible to have this happen...
        }

        if (util.is_dictionary_subclass(obj)) {
            // todo if possible to have this happen...
        }
        if (has_dict) {
            // where every object currently ends up
            if (util.is_sequence_subclass(obj)) {
                // todo if possible to be...
            }
            if (has_getstate) {
                return this._getstate(obj, data);
            }
            return this._flatten_dict_obj(obj, data);
        }
        return undefined;

        // todo: is_sequence_subclass
        // todo: is_noncomplex
        // todo: has_slots...
    }
    _flatten_dict_obj(obj, data) {
        if (data === undefined) {
            data = new obj.prototype.constructor();
        }
        const key_index = [];
        for (const key in obj) {
            if ({}.hasOwnProperty.call(obj, key)) {
                key_index.push(key);
            }
        }
        for (let i = 0; i < key_index.length; i++) {
            const key = key_index[i];
            const value = obj[key];
            if (key === tags.PY_CLASS) {
                continue;
            }
            this._flatten_key_value_pair(key, value, data);
        }
        // default_factory...
        return data;
    }


//  _flatten_newstyle_with_slots
    _flatten_key_value_pair(k, v, data) {
        if (util.is_picklable(k, v) === false) {
            return data;
        }
        // assume all keys are strings -- Javascript;
        data[k] = this._flatten(v);
        return data;
    }

//  pickler.Pickler.prototype._flatten_sequence_obj = function () {};
    _getstate(obj, data) {
        const state = this._flatten_obj(obj.__getstate__());
        if (this.unpicklable) {
            data[tags.STATE] = state;
        } else {
            data = state;
        }
        return data;
    }

//  pickler._mktyperef = function (obj) {};
    _getclassdetail(obj) {
        // just returns the Python class name
        return obj[tags.PY_CLASS];
    }
}
pickler.Pickler = Pickler;

