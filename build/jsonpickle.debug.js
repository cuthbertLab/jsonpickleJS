/**
  * jsonpickle.js 1.0.0 built on   * 2016-09-02.
 * Copyright (c) 2013-2016 Michael Scott Cuthbert and cuthbertLab
 *
 * http://github.com/cuthbertLab/jsonpickleJS
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.jsonpickle = factory());
}(this, (function () { 'use strict';

  var tags = {
      ID: 'py/id',
      OBJECT: 'py/object',
      TYPE: 'py/type',
      REPR: 'py/repr',
      REF: 'py/ref',
      TUPLE: 'py/tuple',
      SET: 'py/set',
      SEQ: 'py/seq',
      STATE: 'py/state',
      JSON_KEY: 'json://'
  };
  tags.RESERVED = [tags.ID, tags.OBJECT, tags.TYPE, tags.REPR, tags.REF, tags.TUPLE, tags.SET, tags.SEQ, tags.STATE, tags.JSON_KEY];
  tags.PY_CLASS = '_py_class';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var util = {};

  util.merge = function merge(destination, source) {
      if (source === undefined) {
          return destination;
      }
      for (var prop in source) {
          if (!{}.hasOwnProperty.call(source, prop)) {
              continue;
          }
          destination[prop] = source[prop];
      }
      return destination;
  };

  util.PRIMITIVES = ['string', 'number', 'boolean'];

  /* from jsonpickle.util */
  // to_do...
  util.is_type = function (obj) {
      return false;
  };

  // same as dictionary in JS...
  util.is_object = function (obj) {
      return util.is_dictionary(obj);
  };

  util.is_primitive = function (obj) {
      if (obj === undefined || obj == null) {
          return true;
      }
      if (util.PRIMITIVES.indexOf(typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== -1) {
          return true;
      }
      return false;
  };

  util.is_dictionary = function (obj) {
      return (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null;
  };

  util.is_sequence = function (obj) {
      return util.is_list(obj) || util.is_set(obj) || util.is_tuple(obj);
  };

  util.is_list = function (obj) {
      return obj instanceof Array;
  };

  // to_do...
  util.is_set = function (obj) {
      return false;
  };
  util.is_tuple = function (obj) {
      return false;
  };
  util.is_dictionary_subclass = function (obj) {
      return false;
  };
  util.is_sequence_subclass = function (obj) {
      return false;
  };
  util.is_noncomplex = function (obj) {
      return false;
  };

  util.is_function = function (obj) {
      return typeof obj === 'function';
  };
  util.is_module = function (obj) {
      return false;
  };

  util.is_picklable = function (name, value) {
      if (tags.RESERVED.indexOf(name) !== -1) {
          return false;
      }
      if (util.is_function(value)) {
          return false;
      } else {
          return true;
      }
  };
  util.is_installed = function (module) {
      return true;
  }; // ???

  util.is_list_like = function (obj) {
      return util.is_list(obj);
  };

  var handlers = {
      'fractions.Fraction': {
          restore: function restore(obj) {
              return obj._numerator / obj._denominator;
          }
      }
  };

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

  var unpickler = {};

  unpickler.decode = function decode(string, user_handlers, options) {
      var params = {
          keys: false,
          safe: false,
          reset: true,
          backend: JSON
      };

      util.merge(params, options);

      var use_handlers = {};
      util.merge(use_handlers, handlers); // don't screw up default handlers...
      util.merge(use_handlers, user_handlers);

      var context = void 0;
      // backend does not do anything -- it is there for
      // compat with py-JSON-Pickle
      if (params.context === undefined) {
          var unpickler_options = {
              keys: params.keys,
              backend: params.backend,
              safe: params.safe
          };
          context = new unpickler.Unpickler(unpickler_options, use_handlers);
      } else {
          context = params.context;
      }
      var jsonObj = params.backend.parse(string);
      return context.restore(jsonObj, params.reset);
  };

  var Unpickler = function () {
      function Unpickler(options, handlers) {
          classCallCheck(this, Unpickler);

          var params = {
              keys: false,
              safe: false
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

      createClass(Unpickler, [{
          key: 'reset',
          value: function reset() {
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

      }, {
          key: 'restore',
          value: function restore(obj, reset) {
              if (reset) {
                  this.reset();
              }
              return this._restore(obj);
          }
      }, {
          key: '_restore',
          value: function _restore(obj) {
              var has_tag = unpickler.has_tag;
              var restoreMeth = function restoreMeth(obj) {
                  return obj;
              };

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
      }, {
          key: '_restore_id',
          value: function _restore_id(obj) {
              return this._objs[obj[tags.ID]];
          }
      }, {
          key: '_restore_type',
          value: function _restore_type(obj) {
              var typeref = unpickler.loadclass(obj[tags.TYPE]);
              if (typeref === undefined) {
                  return obj;
              } else {
                  return typeref;
              }
          }
      }, {
          key: '_restore_object',
          value: function _restore_object(obj) {
              var class_name = obj[tags.OBJECT];
              var handler = this.handlers[class_name];
              if (handler !== undefined && handler.restore !== undefined) {
                  var instance = handler.restore(obj);
                  instance[tags.PY_CLASS] = class_name;
                  return this._mkref(instance);
              } else {
                  var cls = unpickler.loadclass(class_name);
                  if (cls === undefined) {
                      obj[tags.PY_CLASS] = class_name;
                      return this._mkref(obj);
                  }
                  var _instance = this._restore_object_instance(obj, cls);
                  _instance[tags.PY_CLASS] = class_name;
                  if (handler !== undefined && handler.post_restore !== undefined) {
                      return handler.post_restore(_instance);
                  } else {
                      return _instance;
                  }
              }
          }
      }, {
          key: '_loadfactory',
          value: function _loadfactory(obj) {
              var default_factory = obj.default_factory;
              if (default_factory === undefined) {
                  return undefined;
              } else {
                  obj.default_factory = undefined;
                  return this._restore(default_factory);
              }
          }
      }, {
          key: '_restore_object_instance',
          value: function _restore_object_instance(obj, cls) {
              // var factory = this._loadfactory(obj);
              var args = unpickler.getargs(obj);
              if (args.length > 0) {
                  args = this._restore(args);
              }
              // not using factory... does not seem to apply to JS
              var instance = unpickler.construct(cls, args);
              this._mkref(instance);
              return this._restore_object_instance_variables(obj, instance);
          }
      }, {
          key: '_restore_object_instance_variables',
          value: function _restore_object_instance_variables(obj, instance) {
              var has_tag = unpickler.has_tag;
              var restore_key = this._restore_key_fn();
              var keys = [];
              for (var k in obj) {
                  if ({}.hasOwnProperty.call(obj, k)) {
                      keys.push(k);
                  }
              }
              keys.sort();
              for (var i = 0; i < keys.length; i++) {
                  var _k = keys[i];
                  if (tags.RESERVED.indexOf(_k) !== -1) {
                      continue;
                  }
                  var v = obj[_k];
                  this._namestack.push(_k);
                  _k = restore_key(_k);
                  var value = void 0;
                  if (v !== undefined && v !== null) {
                      value = this._restore(v);
                  }
                  // no setattr checks...
                  instance[_k] = value;
                  this._namestack.pop();
              }
              if (has_tag(obj, tags.SEQ)) {
                  if (instance.push !== undefined) {
                      for (var _v in obj[tags.SEQ]) {
                          if (!{}.hasOwnProperty.call(obj[tags.SEQ], _v)) {
                              continue;
                          }
                          instance.push(this._restore(_v));
                      }
                  } // no .add ...
              }

              if (has_tag(obj, tags.STATE)) {
                  instance = this._restore_state(obj, instance);
              }
              return instance;
          }
      }, {
          key: '_restore_state',
          value: function _restore_state(obj, instance) {
              // only if the JS object implements __setstate__
              if (instance.__setstate__ !== undefined) {
                  var state = this._restore(obj[tags.STATE]);
                  instance.__setstate__(state);
              } else {
                  instance = this._restore_object_instance_variables(obj[tags.STATE], instance);
              }
              return instance;
          }
      }, {
          key: '_restore_list',
          value: function _restore_list(obj) {
              var parent = [];
              this._mkref(parent);
              var children = [];
              for (var i = 0; i < obj.length; i++) {
                  var v = obj[i];
                  var rest = this._restore(v);
                  children.push(rest);
              }
              parent.push.apply(parent, children);
              return parent;
          }
      }, {
          key: '_restore_tuple',
          value: function _restore_tuple(obj) {
              // JS having no difference between list, tuple, set -- returns Array
              var children = [];
              var tupleContents = obj[tags.TUPLE];
              for (var i = 0; i < tupleContents.length; i++) {
                  children.push(this._restore(tupleContents[i]));
              }
              return children;
          }
      }, {
          key: '_restore_set',
          value: function _restore_set(obj) {
              // JS having no difference between list, tuple, set -- returns Array
              // TODO: ES5 Sets!
              var children = [];
              var setContents = obj[tags.SET];
              for (var i = 0; i < setContents.length; i++) {
                  children.push(this._restore(setContents[i]));
              }
              return children;
          }
      }, {
          key: '_restore_dict',
          value: function _restore_dict(obj) {
              var data = {};
              // var restore_key = this._restore_key_fn();
              var keys = [];
              for (var k in obj) {
                  if ({}.hasOwnProperty.call(obj, k)) {
                      keys.push(k);
                  }
              }
              keys.sort();
              for (var i = 0; i < keys.length; i++) {
                  var _k2 = keys[i];
                  var v = obj[_k2];

                  this._namestack.push(_k2);
                  data[_k2] = this._restore(v);
                  // no setattr checks...
                  this._namestack.pop();
              }
              return data;
          }
      }, {
          key: '_restore_key_fn',
          value: function _restore_key_fn() {
              var _this = this;

              if (this.keys) {
                  return function (key) {
                      if (key.indexOf(tags.JSON_KEY) === 0) {
                          key = unpickler.decode(key.slice(tags.JSON_KEY.length), _this.handlers, { context: _this,
                              keys: _this.keys,
                              reset: false
                          });
                          return key;
                      } else {
                          return key;
                      }
                  };
              } else {
                  return function (key) {
                      return key;
                  };
              }
          }

          //  _refname not needed...

      }, {
          key: '_mkref',
          value: function _mkref(obj) {
              // does not use id(obj) in javascript
              this._objs.push(obj);
              return obj;
          }
      }]);
      return Unpickler;
  }();
  unpickler.Unpickler = Unpickler;

  unpickler.getargs = function getargs(obj) {
      var seq_list = obj[tags.SEQ];
      var obj_dict = obj[tags.OBJECT];
      if (seq_list === undefined || obj_dict === undefined) {
          return [];
      }
      var typeref = unpickler.loadclass(obj_dict);
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
      var main_check = '__main__.';
      if (module_and_name.indexOf(main_check) === 0) {
          module_and_name = module_and_name.slice(main_check.length);
      }
      var parent = window;
      var module_class_split = module_and_name.split('.');
      for (var i = 0; i < module_class_split.length; i++) {
          var this_module_or_class = module_class_split[i];
          parent = parent[this_module_or_class];
          if (parent === undefined) {
              return parent;
          }
      }
      return parent;
  };

  unpickler.has_tag = function has_tag(obj, tag) {
      if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object' && obj !== null && obj[tag] !== undefined) {
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

  var pickler = {};

  pickler.encode = function encode(value, options) {
      var params = {
          unpicklable: false,
          make_refs: true,
          keys: false,
          max_depth: undefined,
          reset: true,
          backend: undefined, // does nothing; python compat
          context: undefined
      };

      util.merge(params, options);
      if (params.context === undefined) {
          var outparams = {
              unpicklable: params.unpicklable,
              make_refs: params.make_refs,
              keys: params.keys,
              backend: params.backend,
              max_depth: params.max_depth
          };
          params.context = new pickler.Pickler(outparams);
          var fixed_obj = params.context.flatten(value, params.reset);
          return JSON.stringify(fixed_obj);
      } else {
          return undefined;
      }
  };

  var Pickler = function () {
      function Pickler(options) {
          classCallCheck(this, Pickler);

          var params = {
              unpicklable: true,
              make_refs: true,
              max_depth: undefined,
              backend: undefined,
              keys: false
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

      createClass(Pickler, [{
          key: 'reset',
          value: function reset() {
              this._objs = [];
              this._depth = -1;
              this._seen = [];
          }
      }, {
          key: '_push',
          value: function _push() {
              this._depth += 1;
          }
      }, {
          key: '_pop',
          value: function _pop(value) {
              this._depth -= 1;
              if (this._depth === -1) {
                  this.reset();
              }
              return value;
          }
      }, {
          key: '_mkref',
          value: function _mkref(obj) {
              var found_id = this._get_id_in_objs(obj);
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
      }, {
          key: '_get_id_in_objs',
          value: function _get_id_in_objs(obj) {
              var objLength = this._objs.length;
              //      console.log('sought obj', obj);
              //      console.log('stored objs: ', this._objs);
              for (var i = 0; i < objLength; i++) {
                  if (obj === this._objs[i]) {
                      return i;
                  }
              }
              return -1;
          }
      }, {
          key: '_getref',
          value: function _getref(obj) {
              var wrap_obj = {};
              wrap_obj[tags.ID] = this._get_id_in_objs(obj);
              return wrap_obj;
          }
      }, {
          key: 'flatten',
          value: function flatten(obj, reset) {
              if (reset === undefined) {
                  reset = true;
              }
              if (reset) {
                  this.reset();
              }
              var flatOut = this._flatten(obj);
              console.log(this._objs);
              return flatOut;
          }
      }, {
          key: '_flatten',
          value: function _flatten(obj) {
              this._push();
              return this._pop(this._flatten_obj(obj));
          }
      }, {
          key: '_flatten_obj',
          value: function _flatten_obj(obj) {
              this._seen.push(obj);
              var max_reached = this._depth === this._max_depth;
              if (max_reached || this.make_refs === false && this._get_id_in_objs(obj) !== -1) {
                  // no repr equivalent, use str;
                  return toString(obj);
              } else {
                  var flattener = this._get_flattener(obj);
                  // console.log(flattener);
                  return flattener.call(this, obj);
              }
          }
      }, {
          key: '_list_recurse',
          value: function _list_recurse(obj) {
              var l = [];
              for (var i = 0; i < obj.length; i++) {
                  l.push(this._flatten(obj[i]));
              }
              return l;
          }
      }, {
          key: '_get_flattener',
          value: function _get_flattener(obj) {
              var _this = this;

              if (util.is_primitive(obj)) {
                  return function (obj) {
                      return obj;
                  };
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
                      return function (obj) {
                          var obj_wrap = {};
                          obj_wrap[tags.TUPLE] = _this._list_recurse(obj);
                      };
                  }
              }
              if (util.is_set(obj)) {
                  if (!this.unpicklable) {
                      return this._list_recurse;
                  } else {
                      return function (obj) {
                          var obj_wrap = {};
                          obj_wrap[tags.SET] = _this._list_recurse(obj);
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
              console.log('no flattener for ', obj, ' of type ', typeof obj === 'undefined' ? 'undefined' : _typeof(obj));
              return undefined;
          }
      }, {
          key: '_ref_obj_instance',
          value: function _ref_obj_instance(obj) {
              if (this._mkref(obj)) {
                  return this._flatten_obj_instance(obj);
              }
              return this._getref(obj);
          }
      }, {
          key: '_flatten_obj_instance',
          value: function _flatten_obj_instance(obj) {
              var data = {};
              var has_class = obj[tags.PY_CLASS] !== undefined; // ? or ...
              var has_dict = true;
              // const has_slots = false;
              var has_getstate = obj.__getstate__ !== undefined;

              if (has_class && util.is_module(obj) === false) {
                  var fullModuleName = pickler._getclassdetail(obj);
                  if (this.unpicklable) {
                      data[tags.OBJECT] = fullModuleName;
                      console.log(data);
                  }
                  var handler = handlers[fullModuleName];
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
      }, {
          key: '_flatten_dict_obj',
          value: function _flatten_dict_obj(obj, data) {
              if (data === undefined) {
                  data = new obj.prototype.constructor();
              }
              var key_index = [];
              for (var key in obj) {
                  if ({}.hasOwnProperty.call(obj, key)) {
                      key_index.push(key);
                  }
              }
              for (var i = 0; i < key_index.length; i++) {
                  var _key = key_index[i];
                  var value = obj[_key];
                  if (_key === tags.PY_CLASS) {
                      continue;
                  }
                  this._flatten_key_value_pair(_key, value, data);
              }
              // default_factory...
              return data;
          }

          //  _flatten_newstyle_with_slots

      }, {
          key: '_flatten_key_value_pair',
          value: function _flatten_key_value_pair(k, v, data) {
              if (util.is_picklable(k, v) === false) {
                  return data;
              }
              // assume all keys are strings -- Javascript;
              data[k] = this._flatten(v);
              return data;
          }

          //  pickler.Pickler.prototype._flatten_sequence_obj = function () {};

      }, {
          key: '_getstate',
          value: function _getstate(obj, data) {
              var state = this._flatten_obj(obj.__getstate__());
              if (this.unpicklable) {
                  data[tags.STATE] = state;
              } else {
                  data = state;
              }
              return data;
          }

          //  pickler._mktyperef = function (obj) {};

      }, {
          key: '_getclassdetail',
          value: function _getclassdetail(obj) {
              // just returns the Python class name
              return obj[tags.PY_CLASS];
          }
      }]);
      return Pickler;
  }();
  pickler.Pickler = Pickler;

  /**
   * jsonpickleJS -- interpretation of python jsonpickle in Javascript
   * main.js -- main loader -- this should be the only file that most users care about.
   *
   * Copyright (c) 2014-16 Michael Scott Cuthbert and cuthbertLab
   */
  var jsonpickle = {};
  jsonpickle.pickler = pickler;
  jsonpickle.unpickler = unpickler;
  jsonpickle.util = util;
  jsonpickle.tags = tags;
  jsonpickle.handlers = handlers;

  jsonpickle.encode = function jsonpickle_encode(value, unpicklable, make_refs, keys, max_depth, backend) {
      if (unpicklable === undefined) {
          unpicklable = true;
      }
      if (make_refs === undefined) {
          make_refs = true;
      }
      if (keys === undefined) {
          keys = false;
      }
      var options = {
          unpicklable: unpicklable,
          make_refs: make_refs,
          keys: keys,
          max_depth: max_depth,
          backend: backend
      };
      return pickler.encode(value, options);
  };

  jsonpickle.decode = function jsonpickle_decode(string, backend, keys) {
      if (keys === undefined) {
          keys = false;
      }
      return unpickler.decode(string, backend, keys);
  };

  window.jsonpickle = {};

  return jsonpickle;

})));
//# sourceMappingURL=jsonpickle.debug.js.map