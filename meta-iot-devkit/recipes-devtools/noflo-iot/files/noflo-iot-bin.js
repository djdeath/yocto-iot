#!/usr/bin/env node
// vim: set filetype=javascript:
// Generated using https://github.com/djdeath/noflo-iot

var node_require = require;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

var require = function(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    return node_require(path);
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0, len = paths.length; i < len; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0, len = path.length; i < len; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = require.resolve(localRequire.resolve(path));
    if (resolved && require.modules.hasOwnProperty(resolved)) {
      return require(resolved, parent, path);
    }
    return require(path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};

require.register("jashkenas-underscore/underscore.js", function(exports, require, module){
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    _.each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    _.each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    _.each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    _.some(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    _.each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(predicate), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    _.each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    _.each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    return _.some(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (!iterator && _.isArray(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      _.each(obj, function(value, index, list) {
        computed = iterator ? iterator.call(context, value, index, list) : value;
        if (computed > lastComputed) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (!iterator && _.isArray(obj)) {
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      _.each(obj, function(value, index, list) {
        computed = iterator ? iterator.call(context, value, index, list) : value;
        if (computed < lastComputed) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    _.each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      _.each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    for (var i = 0, length = input.length; i < length; i++) {
      var value = input[i];
      if (!_.isArray(value) && !_.isArguments(value)) {
        if (!strict) output.push(value);
      } else if (shallow) {
        push.apply(output, value);
      } else {
        flatten(value, shallow, strict, output);
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = lookupIterator(predicate);
    var pass = [], fail = [];
    _.each(obj, function(elem) {
      (predicate.call(context, elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (array == null) return [];
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var result = [];
    var seen = [];
    for (var i = 0, length = array.length; i < length; i++) {
      var value = array[i];
      if (iterator) value = iterator.call(context, value, i, array);
      if (isSorted ? (!i || seen !== value) : !_.contains(seen, value)) {
        if (isSorted) seen = value;
        else seen.push(value);
        result.push(array[i]);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    if (array == null) return [];
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = array.length; i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, true, []);
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var i = from == null ? array.length : from;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    _.each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last > 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    _.each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj, iterator, context) {
    var result = {};
    if (_.isFunction(iterator)) {
      for (var key in obj) {
        var value = obj[key];
        if (iterator.call(context, value, key, obj)) result[key] = value;
      }
    } else {
      var keys = concat.apply([], slice.call(arguments, 1));
      for (var i = 0, length = keys.length; i < length; i++) {
        var key = keys[i];
        if (key in obj) result[key] = obj[key];
      }
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iterator, context) {
    var keys;
    if (_.isFunction(iterator)) {
      iterator = _.negate(iterator);
    } else {
      keys = _.map(concat.apply([], slice.call(arguments, 1)), String);
      iterator = function(value, key) { return !_.contains(keys, key); };
    }
    return _.pick(obj, iterator, context);
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    _.each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true;
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-underscore/index.js", function(exports, require, module){
//     Underscore.js 1.3.3
//     (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var push             = ArrayProto.push,
      slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root['_'] = _;
  }

  // Current version.
  _.VERSION = '1.3.3';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (_.has(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError('Reduce of empty array with no initial value');
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = _.toArray(obj).reverse();
    if (context && !initial) iterator = _.bind(iterator, context);
    return initial ? _.reduce(reversed, iterator, memo, context) : _.reduce(reversed, iterator);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result || (result = iterator.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    found = any(obj, function(value) {
      return value === target;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (_.isFunction(method) ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See: https://bugs.webkit.org/show_bug.cgi?id=80797
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return -Infinity;
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    if (!iterator && _.isEmpty(obj)) return Infinity;
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Shuffle an array.
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = Math.floor(Math.random() * ++index);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, val, context) {
    var iterator = lookupIterator(obj, val);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      if (a === void 0) return 1;
      if (b === void 0) return -1;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(obj, val) {
    return _.isFunction(val) ? val : function(obj) { return obj[val]; };
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(obj, val, behavior) {
    var result = {};
    var iterator = lookupIterator(obj, val);
    each(obj, function(value, index) {
      var key = iterator(value, index);
      behavior(result, key, value);
    });
    return result;
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      (result[key] || (result[key] = [])).push(value);
    });
  };

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = function(obj, val) {
    return group(obj, val, function(result, key, value) {
      result[key] || (result[key] = 0);
      result[key]++;
    });
  };

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var value = iterator(obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(obj) {
    if (!obj)                                     return [];
    if (_.isArray(obj))                           return slice.call(obj);
    if (_.isArguments(obj))                       return slice.call(obj);
    if (obj.toArray && _.isFunction(obj.toArray)) return obj.toArray();
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.isArray(obj) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if ((n != null) && !guard) {
      return slice.call(array, Math.max(array.length - n, 0));
    } else {
      return array[array.length - 1];
    }
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    each(input, function(value) {
      if (_.isArray(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator) {
    var initial = iterator ? _.map(array, iterator) : array;
    var results = [];
    _.reduce(initial, function(memo, value, index) {
      if (isSorted ? (_.last(memo) !== value || !memo.length) : !_.include(memo, value)) {
        memo.push(value);
        results.push(array[index]);
      }
      return memo;
    }, []);
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, []));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(slice.call(arguments, 1), true, []);
    return _.filter(array, function(value){ return !_.include(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(args, "" + i);
    }
    return results;
  };

  // Zip together two arrays -- an array of keys and an array of values -- into
  // a single object.
  _.zipObject = function(keys, values) {
    var result = {};
    for (var i = 0, l = keys.length; i < l; i++) {
      result[keys[i]] = values[i];
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function bind(func, context) {
    var bound, args;
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    var context, args, timeout, throttling, more, result;
    var whenDone = _.debounce(function(){ more = throttling = false; }, wait);
    return function() {
      context = this; args = arguments;
      var later = function() {
        timeout = null;
        if (more) func.apply(context, args);
        whenDone();
      };
      if (!timeout) timeout = setTimeout(later, wait);
      if (throttling) {
        more = true;
      } else {
        throttling = true;
        result = func.apply(context, args);
      }
      whenDone();
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments, 0));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    if (times <= 0) return func();
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var result = {};
    each(flatten(slice.call(arguments, 1), true, []), function(key) {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, stack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the Harmony `egal` proposal: http://wiki.ecmascript.org/doku.php?id=harmony:egal.
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // Invoke a custom `isEqual` method if one is provided.
    if (a.isEqual && _.isFunction(a.isEqual)) return a.isEqual(b);
    if (b.isEqual && _.isFunction(b.isEqual)) return b.isEqual(a);
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = stack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (stack[length] == a) return true;
    }
    // Add the first object to the stack of traversed objects.
    stack.push(a);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          // Ensure commutative equality for sparse arrays.
          if (!(result = size in a == size in b && eq(a[size], b[size], stack))) break;
        }
      }
    } else {
      // Objects with different constructors are not equivalent.
      if ('constructor' in a != 'constructor' in b || a.constructor != b.constructor) return false;
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], stack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    stack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return _.isNumber(obj) && isFinite(obj);
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    // `NaN` is the only value for which `===` is not reflexive.
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // List of HTML entities for escaping.
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  // Regex containing the keys listed immediately above.
  var htmlEscaper = /[&<>"'\/]/g;

  // Escape a string for HTML interpolation.
  _.escape = function(string) {
    return ('' + string).replace(htmlEscaper, function(match) {
      return htmlEscapes[match];
    });
  };

  // If the value of the named property is a function then invoke it;
  // otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return null;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /.^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    '\\':   '\\',
    "'":    "'",
    r:      '\r',
    n:      '\n',
    t:      '\t',
    u2028:  '\u2028',
    u2029:  '\u2029'
  };

  for (var key in escapes) escapes[escapes[key]] = key;
  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
  var unescaper = /\\(\\|'|r|n|t|u2028|u2029)/g;

  // Within an interpolation, evaluation, or escaping, remove HTML escaping
  // that had been previously added.
  var unescape = function(code) {
    return code.replace(unescaper, function(match, escape) {
      return escapes[escape];
    });
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    settings = _.defaults(settings || {}, _.templateSettings);

    // Compile the template source, taking care to escape characters that
    // cannot be included in a string literal and then unescape them in code
    // blocks.
    var source = "__p+='" + text
      .replace(escaper, function(match) {
        return '\\' + escapes[match];
      })
      .replace(settings.escape || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':_.escape(__t))+\n'";
      })
      .replace(settings.interpolate || noMatch, function(match, code) {
        return "'+\n((__t=(" + unescape(code) + "))==null?'':__t)+\n'";
      })
      .replace(settings.evaluate || noMatch, function(match, code) {
        return "';\n" + unescape(code) + "\n__p+='";
      }) + "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'')};\n" +
      source + "return __p;\n";

    var render = new Function(settings.variable || 'obj', '_', source);
    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result(obj, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

}).call(this);

});
require.register("noflo-noflo/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo","description":"Flow-Based Programming environment for JavaScript","keywords":["fbp","workflow","flow"],"repo":"noflo/noflo","version":"0.5.0","dependencies":{"component/emitter":"*","component/underscore":"*","noflo/fbp":"*"},"development":{},"license":"MIT","main":"src/lib/NoFlo.js","scripts":["src/lib/Graph.js","src/lib/InternalSocket.js","src/lib/BasePort.js","src/lib/InPort.js","src/lib/OutPort.js","src/lib/Ports.js","src/lib/Port.js","src/lib/ArrayPort.js","src/lib/Component.js","src/lib/AsyncComponent.js","src/lib/LoggingComponent.js","src/lib/ComponentLoader.js","src/lib/NoFlo.js","src/lib/Network.js","src/lib/Platform.js","src/lib/Journal.js","src/lib/Utils.js","src/components/Graph.js"],"json":["component.json"],"noflo":{"components":{"Graph":"src/components/Graph.js"}}}');
});
require.register("noflo-noflo/src/lib/Graph.js", function(exports, require, module){
var EventEmitter, Graph, clone,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

clone = require('./Utils').clone;

Graph = (function(_super) {
  __extends(Graph, _super);

  Graph.prototype.name = '';

  Graph.prototype.properties = {};

  Graph.prototype.nodes = [];

  Graph.prototype.edges = [];

  Graph.prototype.initializers = [];

  Graph.prototype.exports = [];

  Graph.prototype.inports = {};

  Graph.prototype.outports = {};

  Graph.prototype.groups = [];

  function Graph(name) {
    this.name = name != null ? name : '';
    this.properties = {};
    this.nodes = [];
    this.edges = [];
    this.initializers = [];
    this.exports = [];
    this.inports = {};
    this.outports = {};
    this.groups = [];
    this.transaction = {
      id: null,
      depth: 0
    };
  }

  Graph.prototype.startTransaction = function(id, metadata) {
    if (this.transaction.id) {
      throw Error("Nested transactions not supported");
    }
    this.transaction.id = id;
    this.transaction.depth = 1;
    return this.emit('startTransaction', id, metadata);
  };

  Graph.prototype.endTransaction = function(id, metadata) {
    if (!this.transaction.id) {
      throw Error("Attempted to end non-existing transaction");
    }
    this.transaction.id = null;
    this.transaction.depth = 0;
    return this.emit('endTransaction', id, metadata);
  };

  Graph.prototype.checkTransactionStart = function() {
    if (!this.transaction.id) {
      return this.startTransaction('implicit');
    } else if (this.transaction.id === 'implicit') {
      return this.transaction.depth += 1;
    }
  };

  Graph.prototype.checkTransactionEnd = function() {
    if (this.transaction.id === 'implicit') {
      this.transaction.depth -= 1;
    }
    if (this.transaction.depth === 0) {
      return this.endTransaction('implicit');
    }
  };

  Graph.prototype.setProperties = function(properties) {
    var before, item, val;
    this.checkTransactionStart();
    before = clone(this.properties);
    for (item in properties) {
      val = properties[item];
      this.properties[item] = val;
    }
    this.emit('changeProperties', this.properties, before);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addExport = function(publicPort, nodeKey, portKey, metadata) {
    var exported;
    if (metadata == null) {
      metadata = {
        x: 0,
        y: 0
      };
    }
    if (!this.getNode(nodeKey)) {
      return;
    }
    this.checkTransactionStart();
    exported = {
      "public": publicPort,
      process: nodeKey,
      port: portKey,
      metadata: metadata
    };
    this.exports.push(exported);
    this.emit('addExport', exported);
    return this.checkTransactionEnd();
  };

  Graph.prototype.removeExport = function(publicPort) {
    var exported, found, idx, _i, _len, _ref;
    publicPort = publicPort.toLowerCase();
    found = null;
    _ref = this.exports;
    for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
      exported = _ref[idx];
      if (exported["public"] === publicPort) {
        found = exported;
      }
    }
    if (!found) {
      return;
    }
    this.checkTransactionStart();
    this.exports.splice(this.exports.indexOf(found), 1);
    this.emit('removeExport', found);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addInport = function(publicPort, nodeKey, portKey, metadata) {
    if (!this.getNode(nodeKey)) {
      return;
    }
    this.checkTransactionStart();
    this.inports[publicPort] = {
      process: nodeKey,
      port: portKey,
      metadata: metadata
    };
    this.emit('addInport', publicPort, this.inports[publicPort]);
    return this.checkTransactionEnd();
  };

  Graph.prototype.removeInport = function(publicPort) {
    var port;
    publicPort = publicPort.toLowerCase();
    if (!this.inports[publicPort]) {
      return;
    }
    this.checkTransactionStart();
    port = this.inports[publicPort];
    this.setInportMetadata(publicPort, {});
    delete this.inports[publicPort];
    this.emit('removeInport', publicPort, port);
    return this.checkTransactionEnd();
  };

  Graph.prototype.renameInport = function(oldPort, newPort) {
    if (!this.inports[oldPort]) {
      return;
    }
    this.checkTransactionStart();
    this.inports[newPort] = this.inports[oldPort];
    delete this.inports[oldPort];
    this.emit('renameInport', oldPort, newPort);
    return this.checkTransactionEnd();
  };

  Graph.prototype.setInportMetadata = function(publicPort, metadata) {
    var before, item, val;
    if (!this.inports[publicPort]) {
      return;
    }
    this.checkTransactionStart();
    before = clone(this.inports[publicPort].metadata);
    if (!this.inports[publicPort].metadata) {
      this.inports[publicPort].metadata = {};
    }
    for (item in metadata) {
      val = metadata[item];
      if (val != null) {
        this.inports[publicPort].metadata[item] = val;
      } else {
        delete this.inports[publicPort].metadata[item];
      }
    }
    this.emit('changeInport', publicPort, this.inports[publicPort], before);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addOutport = function(publicPort, nodeKey, portKey, metadata) {
    if (!this.getNode(nodeKey)) {
      return;
    }
    this.checkTransactionStart();
    this.outports[publicPort] = {
      process: nodeKey,
      port: portKey,
      metadata: metadata
    };
    this.emit('addOutport', publicPort, this.outports[publicPort]);
    return this.checkTransactionEnd();
  };

  Graph.prototype.removeOutport = function(publicPort) {
    var port;
    publicPort = publicPort.toLowerCase();
    if (!this.outports[publicPort]) {
      return;
    }
    this.checkTransactionStart();
    port = this.outports[publicPort];
    this.setOutportMetadata(publicPort, {});
    delete this.outports[publicPort];
    this.emit('removeOutport', publicPort, port);
    return this.checkTransactionEnd();
  };

  Graph.prototype.renameOutport = function(oldPort, newPort) {
    if (!this.outports[oldPort]) {
      return;
    }
    this.checkTransactionStart();
    this.outports[newPort] = this.outports[oldPort];
    delete this.outports[oldPort];
    this.emit('renameOutport', oldPort, newPort);
    return this.checkTransactionEnd();
  };

  Graph.prototype.setOutportMetadata = function(publicPort, metadata) {
    var before, item, val;
    if (!this.outports[publicPort]) {
      return;
    }
    this.checkTransactionStart();
    before = clone(this.outports[publicPort].metadata);
    if (!this.outports[publicPort].metadata) {
      this.outports[publicPort].metadata = {};
    }
    for (item in metadata) {
      val = metadata[item];
      if (val != null) {
        this.outports[publicPort].metadata[item] = val;
      } else {
        delete this.outports[publicPort].metadata[item];
      }
    }
    this.emit('changeOutport', publicPort, this.outports[publicPort], before);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addGroup = function(group, nodes, metadata) {
    var g;
    this.checkTransactionStart();
    g = {
      name: group,
      nodes: nodes,
      metadata: metadata
    };
    this.groups.push(g);
    this.emit('addGroup', g);
    return this.checkTransactionEnd();
  };

  Graph.prototype.renameGroup = function(oldName, newName) {
    var group, _i, _len, _ref;
    this.checkTransactionStart();
    _ref = this.groups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      if (!group) {
        continue;
      }
      if (group.name !== oldName) {
        continue;
      }
      group.name = newName;
      this.emit('renameGroup', oldName, newName);
    }
    return this.checkTransactionEnd();
  };

  Graph.prototype.removeGroup = function(groupName) {
    var group, _i, _len, _ref;
    this.checkTransactionStart();
    _ref = this.groups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      if (!group) {
        continue;
      }
      if (group.name !== groupName) {
        continue;
      }
      this.setGroupMetadata(group.name, {});
      this.groups.splice(this.groups.indexOf(group), 1);
      this.emit('removeGroup', group);
    }
    return this.checkTransactionEnd();
  };

  Graph.prototype.setGroupMetadata = function(groupName, metadata) {
    var before, group, item, val, _i, _len, _ref;
    this.checkTransactionStart();
    _ref = this.groups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      if (!group) {
        continue;
      }
      if (group.name !== groupName) {
        continue;
      }
      before = clone(group.metadata);
      for (item in metadata) {
        val = metadata[item];
        if (val != null) {
          group.metadata[item] = val;
        } else {
          delete group.metadata[item];
        }
      }
      this.emit('changeGroup', group, before);
    }
    return this.checkTransactionEnd();
  };

  Graph.prototype.addNode = function(id, component, metadata) {
    var node;
    this.checkTransactionStart();
    if (!metadata) {
      metadata = {};
    }
    node = {
      id: id,
      component: component,
      metadata: metadata
    };
    this.nodes.push(node);
    this.emit('addNode', node);
    this.checkTransactionEnd();
    return node;
  };

  Graph.prototype.removeNode = function(id) {
    var edge, exported, group, index, initializer, node, priv, pub, toRemove, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _len6, _len7, _len8, _m, _n, _o, _p, _q, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    node = this.getNode(id);
    if (!node) {
      return;
    }
    this.checkTransactionStart();
    toRemove = [];
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if ((edge.from.node === node.id) || (edge.to.node === node.id)) {
        toRemove.push(edge);
      }
    }
    for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
      edge = toRemove[_j];
      this.removeEdge(edge.from.node, edge.from.port, edge.to.node, edge.to.port);
    }
    toRemove = [];
    _ref1 = this.initializers;
    for (_k = 0, _len2 = _ref1.length; _k < _len2; _k++) {
      initializer = _ref1[_k];
      if (initializer.to.node === node.id) {
        toRemove.push(initializer);
      }
    }
    for (_l = 0, _len3 = toRemove.length; _l < _len3; _l++) {
      initializer = toRemove[_l];
      this.removeInitial(initializer.to.node, initializer.to.port);
    }
    toRemove = [];
    _ref2 = this.exports;
    for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
      exported = _ref2[_m];
      if (id.toLowerCase() === exported.process) {
        toRemove.push(exported);
      }
    }
    for (_n = 0, _len5 = toRemove.length; _n < _len5; _n++) {
      exported = toRemove[_n];
      this.removeExports(exported["public"]);
    }
    toRemove = [];
    _ref3 = this.inports;
    for (pub in _ref3) {
      priv = _ref3[pub];
      if (priv.process === id) {
        toRemove.push(pub);
      }
    }
    for (_o = 0, _len6 = toRemove.length; _o < _len6; _o++) {
      pub = toRemove[_o];
      this.removeInport(pub);
    }
    toRemove = [];
    _ref4 = this.outports;
    for (pub in _ref4) {
      priv = _ref4[pub];
      if (priv.process === id) {
        toRemove.push(pub);
      }
    }
    for (_p = 0, _len7 = toRemove.length; _p < _len7; _p++) {
      pub = toRemove[_p];
      this.removeOutport(pub);
    }
    _ref5 = this.groups;
    for (_q = 0, _len8 = _ref5.length; _q < _len8; _q++) {
      group = _ref5[_q];
      if (!group) {
        continue;
      }
      index = group.nodes.indexOf(id);
      if (index === -1) {
        continue;
      }
      group.nodes.splice(index, 1);
    }
    this.setNodeMetadata(id, {});
    if (-1 !== this.nodes.indexOf(node)) {
      this.nodes.splice(this.nodes.indexOf(node), 1);
    }
    this.emit('removeNode', node);
    return this.checkTransactionEnd();
  };

  Graph.prototype.getNode = function(id) {
    var node, _i, _len, _ref;
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (!node) {
        continue;
      }
      if (node.id === id) {
        return node;
      }
    }
    return null;
  };

  Graph.prototype.renameNode = function(oldId, newId) {
    var edge, exported, group, iip, index, node, priv, pub, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    this.checkTransactionStart();
    node = this.getNode(oldId);
    if (!node) {
      return;
    }
    node.id = newId;
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (!edge) {
        continue;
      }
      if (edge.from.node === oldId) {
        edge.from.node = newId;
      }
      if (edge.to.node === oldId) {
        edge.to.node = newId;
      }
    }
    _ref1 = this.initializers;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      iip = _ref1[_j];
      if (!iip) {
        continue;
      }
      if (iip.to.node === oldId) {
        iip.to.node = newId;
      }
    }
    _ref2 = this.inports;
    for (pub in _ref2) {
      priv = _ref2[pub];
      if (priv.process === oldId) {
        priv.process = newId;
      }
    }
    _ref3 = this.outports;
    for (pub in _ref3) {
      priv = _ref3[pub];
      if (priv.process === oldId) {
        priv.process = newId;
      }
    }
    _ref4 = this.exports;
    for (_k = 0, _len2 = _ref4.length; _k < _len2; _k++) {
      exported = _ref4[_k];
      if (exported.process === oldId) {
        exported.process = newId;
      }
    }
    _ref5 = this.groups;
    for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
      group = _ref5[_l];
      if (!group) {
        continue;
      }
      index = group.nodes.indexOf(oldId);
      if (index === -1) {
        continue;
      }
      group.nodes[index] = newId;
    }
    this.emit('renameNode', oldId, newId);
    return this.checkTransactionEnd();
  };

  Graph.prototype.setNodeMetadata = function(id, metadata) {
    var before, item, node, val;
    node = this.getNode(id);
    if (!node) {
      return;
    }
    this.checkTransactionStart();
    before = clone(node.metadata);
    if (!node.metadata) {
      node.metadata = {};
    }
    for (item in metadata) {
      val = metadata[item];
      if (val != null) {
        node.metadata[item] = val;
      } else {
        delete node.metadata[item];
      }
    }
    this.emit('changeNode', node, before);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addEdge = function(outNode, outPort, inNode, inPort, metadata) {
    var edge, _i, _len, _ref;
    _ref = this.edges;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      edge = _ref[_i];
      if (edge.from.node === outNode && edge.from.port === outPort && edge.to.node === inNode && edge.to.port === inPort) {
        return;
      }
    }
    if (!this.getNode(outNode)) {
      return;
    }
    if (!this.getNode(inNode)) {
      return;
    }
    if (!metadata) {
      metadata = {};
    }
    this.checkTransactionStart();
    edge = {
      from: {
        node: outNode,
        port: outPort
      },
      to: {
        node: inNode,
        port: inPort
      },
      metadata: metadata
    };
    this.edges.push(edge);
    this.emit('addEdge', edge);
    this.checkTransactionEnd();
    return edge;
  };

  Graph.prototype.removeEdge = function(node, port, node2, port2) {
    var edge, index, toKeep, toRemove, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
    this.checkTransactionStart();
    toRemove = [];
    toKeep = [];
    if (node2 && port2) {
      _ref = this.edges;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        edge = _ref[index];
        if (edge.from.node === node && edge.from.port === port && edge.to.node === node2 && edge.to.port === port2) {
          this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
          toRemove.push(edge);
        } else {
          toKeep.push(edge);
        }
      }
    } else {
      _ref1 = this.edges;
      for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
        edge = _ref1[index];
        if ((edge.from.node === node && edge.from.port === port) || (edge.to.node === node && edge.to.port === port)) {
          this.setEdgeMetadata(edge.from.node, edge.from.port, edge.to.node, edge.to.port, {});
          toRemove.push(edge);
        } else {
          toKeep.push(edge);
        }
      }
    }
    this.edges = toKeep;
    for (_k = 0, _len2 = toRemove.length; _k < _len2; _k++) {
      edge = toRemove[_k];
      this.emit('removeEdge', edge);
    }
    return this.checkTransactionEnd();
  };

  Graph.prototype.getEdge = function(node, port, node2, port2) {
    var edge, index, _i, _len, _ref;
    _ref = this.edges;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (!edge) {
        continue;
      }
      if (edge.from.node === node && edge.from.port === port) {
        if (edge.to.node === node2 && edge.to.port === port2) {
          return edge;
        }
      }
    }
    return null;
  };

  Graph.prototype.setEdgeMetadata = function(node, port, node2, port2, metadata) {
    var before, edge, item, val;
    edge = this.getEdge(node, port, node2, port2);
    if (!edge) {
      return;
    }
    this.checkTransactionStart();
    before = clone(edge.metadata);
    if (!edge.metadata) {
      edge.metadata = {};
    }
    for (item in metadata) {
      val = metadata[item];
      if (val != null) {
        edge.metadata[item] = val;
      } else {
        delete edge.metadata[item];
      }
    }
    this.emit('changeEdge', edge, before);
    return this.checkTransactionEnd();
  };

  Graph.prototype.addInitial = function(data, node, port, metadata) {
    var initializer;
    if (!this.getNode(node)) {
      return;
    }
    this.checkTransactionStart();
    initializer = {
      from: {
        data: data
      },
      to: {
        node: node,
        port: port
      },
      metadata: metadata
    };
    this.initializers.push(initializer);
    this.emit('addInitial', initializer);
    this.checkTransactionEnd();
    return initializer;
  };

  Graph.prototype.removeInitial = function(node, port) {
    var edge, index, toKeep, toRemove, _i, _j, _len, _len1, _ref;
    this.checkTransactionStart();
    toRemove = [];
    toKeep = [];
    _ref = this.initializers;
    for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
      edge = _ref[index];
      if (edge.to.node === node && edge.to.port === port) {
        toRemove.push(edge);
      } else {
        toKeep.push(edge);
      }
    }
    this.initializers = toKeep;
    for (_j = 0, _len1 = toRemove.length; _j < _len1; _j++) {
      edge = toRemove[_j];
      this.emit('removeInitial', edge);
    }
    return this.checkTransactionEnd();
  };

  Graph.prototype.toDOT = function() {
    var cleanID, cleanPort, data, dot, edge, id, initializer, node, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    cleanID = function(id) {
      return id.replace(/\s*/g, "");
    };
    cleanPort = function(port) {
      return port.replace(/\./g, "");
    };
    dot = "digraph {\n";
    _ref = this.nodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      dot += "    " + (cleanID(node.id)) + " [label=" + node.id + " shape=box]\n";
    }
    _ref1 = this.initializers;
    for (id = _j = 0, _len1 = _ref1.length; _j < _len1; id = ++_j) {
      initializer = _ref1[id];
      if (typeof initializer.from.data === 'function') {
        data = 'Function';
      } else {
        data = initializer.from.data;
      }
      dot += "    data" + id + " [label=\"'" + data + "'\" shape=plaintext]\n";
      dot += "    data" + id + " -> " + (cleanID(initializer.to.node)) + "[headlabel=" + (cleanPort(initializer.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
    }
    _ref2 = this.edges;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      edge = _ref2[_k];
      dot += "    " + (cleanID(edge.from.node)) + " -> " + (cleanID(edge.to.node)) + "[taillabel=" + (cleanPort(edge.from.port)) + " headlabel=" + (cleanPort(edge.to.port)) + " labelfontcolor=blue labelfontsize=8.0]\n";
    }
    dot += "}";
    return dot;
  };

  Graph.prototype.toYUML = function() {
    var edge, initializer, yuml, _i, _j, _len, _len1, _ref, _ref1;
    yuml = [];
    _ref = this.initializers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      initializer = _ref[_i];
      yuml.push("(start)[" + initializer.to.port + "]->(" + initializer.to.node + ")");
    }
    _ref1 = this.edges;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      edge = _ref1[_j];
      yuml.push("(" + edge.from.node + ")[" + edge.from.port + "]->(" + edge.to.node + ")");
    }
    return yuml.join(",");
  };

  Graph.prototype.toJSON = function() {
    var connection, edge, exported, group, groupData, initializer, json, node, priv, property, pub, value, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
    json = {
      properties: {},
      inports: {},
      outports: {},
      groups: [],
      processes: {},
      connections: []
    };
    if (this.name) {
      json.properties.name = this.name;
    }
    _ref = this.properties;
    for (property in _ref) {
      value = _ref[property];
      json.properties[property] = value;
    }
    _ref1 = this.inports;
    for (pub in _ref1) {
      priv = _ref1[pub];
      json.inports[pub] = priv;
    }
    _ref2 = this.outports;
    for (pub in _ref2) {
      priv = _ref2[pub];
      json.outports[pub] = priv;
    }
    _ref3 = this.exports;
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      exported = _ref3[_i];
      if (!json.exports) {
        json.exports = [];
      }
      json.exports.push(exported);
    }
    _ref4 = this.groups;
    for (_j = 0, _len1 = _ref4.length; _j < _len1; _j++) {
      group = _ref4[_j];
      groupData = {
        name: group.name,
        nodes: group.nodes
      };
      if (Object.keys(group.metadata).length) {
        groupData.metadata = group.metadata;
      }
      json.groups.push(groupData);
    }
    _ref5 = this.nodes;
    for (_k = 0, _len2 = _ref5.length; _k < _len2; _k++) {
      node = _ref5[_k];
      json.processes[node.id] = {
        component: node.component
      };
      if (node.metadata) {
        json.processes[node.id].metadata = node.metadata;
      }
    }
    _ref6 = this.edges;
    for (_l = 0, _len3 = _ref6.length; _l < _len3; _l++) {
      edge = _ref6[_l];
      connection = {
        src: {
          process: edge.from.node,
          port: edge.from.port
        },
        tgt: {
          process: edge.to.node,
          port: edge.to.port
        }
      };
      if (Object.keys(edge.metadata).length) {
        connection.metadata = edge.metadata;
      }
      json.connections.push(connection);
    }
    _ref7 = this.initializers;
    for (_m = 0, _len4 = _ref7.length; _m < _len4; _m++) {
      initializer = _ref7[_m];
      json.connections.push({
        data: initializer.from.data,
        tgt: {
          process: initializer.to.node,
          port: initializer.to.port
        }
      });
    }
    return json;
  };

  Graph.prototype.save = function(file, success) {
    var json;
    json = JSON.stringify(this.toJSON(), null, 4);
    return require('fs').writeFile("" + file + ".json", json, "utf-8", function(err, data) {
      if (err) {
        throw err;
      }
      return success(file);
    });
  };

  return Graph;

})(EventEmitter);

exports.Graph = Graph;

exports.createGraph = function(name) {
  return new Graph(name);
};

exports.loadJSON = function(definition, success, metadata) {
  var conn, def, exported, graph, group, id, portId, priv, processId, properties, property, pub, split, value, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6;
  if (metadata == null) {
    metadata = {};
  }
  if (!definition.properties) {
    definition.properties = {};
  }
  if (!definition.processes) {
    definition.processes = {};
  }
  if (!definition.connections) {
    definition.connections = [];
  }
  graph = new Graph(definition.properties.name);
  graph.startTransaction('loadJSON', metadata);
  properties = {};
  _ref = definition.properties;
  for (property in _ref) {
    value = _ref[property];
    if (property === 'name') {
      continue;
    }
    properties[property] = value;
  }
  graph.setProperties(properties);
  _ref1 = definition.processes;
  for (id in _ref1) {
    def = _ref1[id];
    if (!def.metadata) {
      def.metadata = {};
    }
    graph.addNode(id, def.component, def.metadata);
  }
  _ref2 = definition.connections;
  for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
    conn = _ref2[_i];
    if (conn.data !== void 0) {
      graph.addInitial(conn.data, conn.tgt.process, conn.tgt.port.toLowerCase());
      continue;
    }
    metadata = conn.metadata ? conn.metadata : {};
    graph.addEdge(conn.src.process, conn.src.port.toLowerCase(), conn.tgt.process, conn.tgt.port.toLowerCase(), metadata);
  }
  if (definition.exports && definition.exports.length) {
    _ref3 = definition.exports;
    for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
      exported = _ref3[_j];
      if (exported["private"]) {
        split = exported["private"].split('.');
        if (split.length !== 2) {
          continue;
        }
        processId = split[0];
        portId = split[1];
        for (id in definition.processes) {
          if (id.toLowerCase() === processId.toLowerCase()) {
            processId = id;
          }
        }
      } else {
        processId = exported.process;
        portId = exported.port;
      }
      graph.addExport(exported["public"], processId, portId, exported.metadata);
    }
  }
  if (definition.inports) {
    _ref4 = definition.inports;
    for (pub in _ref4) {
      priv = _ref4[pub];
      graph.addInport(pub, priv.process, priv.port, priv.metadata);
    }
  }
  if (definition.outports) {
    _ref5 = definition.outports;
    for (pub in _ref5) {
      priv = _ref5[pub];
      graph.addOutport(pub, priv.process, priv.port, priv.metadata);
    }
  }
  if (definition.groups) {
    _ref6 = definition.groups;
    for (_k = 0, _len2 = _ref6.length; _k < _len2; _k++) {
      group = _ref6[_k];
      graph.addGroup(group.name, group.nodes, group.metadata || {});
    }
  }
  graph.endTransaction('loadJSON');
  return success(graph);
};

exports.loadFBP = function(fbpData, success) {
  var definition;
  definition = require('fbp').parse(fbpData);
  return exports.loadJSON(definition, success);
};

exports.loadHTTP = function(url, success) {
  var req;
  req = new XMLHttpRequest;
  req.onreadystatechange = function() {
    if (req.readyState !== 4) {
      return;
    }
    if (req.status !== 200) {
      return success();
    }
    return success(req.responseText);
  };
  req.open('GET', url, true);
  return req.send();
};

exports.loadFile = function(file, success, metadata) {
  var definition, e;
  if (metadata == null) {
    metadata = {};
  }
  if (!(typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1)) {
    try {
      definition = require(file);
      exports.loadJSON(definition, success, metadata);
      return;
    } catch (_error) {
      e = _error;
      exports.loadHTTP(file, function(data) {
        if (!data) {
          throw new Error("Failed to load graph " + file);
          return;
        }
        if (file.split('.').pop() === 'fbp') {
          return exports.loadFBP(data, success);
        }
        definition = JSON.parse(data);
        return exports.loadJSON(definition, success);
      });
    }
    return;
  }
  return require('fs').readFile(file, "utf-8", function(err, data) {
    if (err) {
      throw err;
    }
    if (file.split('.').pop() === 'fbp') {
      return exports.loadFBP(data, success);
    }
    definition = JSON.parse(data);
    return exports.loadJSON(definition, success);
  });
};

});
require.register("noflo-noflo/src/lib/InternalSocket.js", function(exports, require, module){
var EventEmitter, InternalSocket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

InternalSocket = (function(_super) {
  __extends(InternalSocket, _super);

  function InternalSocket() {
    this.connected = false;
    this.groups = [];
  }

  InternalSocket.prototype.connect = function() {
    if (this.connected) {
      return;
    }
    this.connected = true;
    return this.emit('connect', this);
  };

  InternalSocket.prototype.disconnect = function() {
    if (!this.connected) {
      return;
    }
    this.connected = false;
    return this.emit('disconnect', this);
  };

  InternalSocket.prototype.isConnected = function() {
    return this.connected;
  };

  InternalSocket.prototype.send = function(data) {
    if (!this.connected) {
      this.connect();
    }
    return this.emit('data', data);
  };

  InternalSocket.prototype.beginGroup = function(group) {
    this.groups.push(group);
    return this.emit('begingroup', group);
  };

  InternalSocket.prototype.endGroup = function() {
    if (!this.groups.length) {
      return;
    }
    return this.emit('endgroup', this.groups.pop());
  };

  InternalSocket.prototype.getId = function() {
    var fromStr, toStr;
    fromStr = function(from) {
      return "" + from.process.id + "() " + (from.port.toUpperCase());
    };
    toStr = function(to) {
      return "" + (to.port.toUpperCase()) + " " + to.process.id + "()";
    };
    if (!(this.from || this.to)) {
      return "UNDEFINED";
    }
    if (this.from && !this.to) {
      return "" + (fromStr(this.from)) + " -> ANON";
    }
    if (!this.from) {
      return "DATA -> " + (toStr(this.to));
    }
    return "" + (fromStr(this.from)) + " -> " + (toStr(this.to));
  };

  return InternalSocket;

})(EventEmitter);

exports.InternalSocket = InternalSocket;

exports.createSocket = function() {
  return new InternalSocket;
};

});
require.register("noflo-noflo/src/lib/BasePort.js", function(exports, require, module){
var BasePort, EventEmitter, validTypes,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

validTypes = ['all', 'string', 'number', 'int', 'object', 'array', 'boolean', 'color', 'date', 'bang'];

BasePort = (function(_super) {
  __extends(BasePort, _super);

  function BasePort(options) {
    this.handleOptions(options);
    this.sockets = [];
    this.node = null;
    this.name = null;
  }

  BasePort.prototype.handleOptions = function(options) {
    if (!options) {
      options = {};
    }
    if (!options.datatype) {
      options.datatype = 'all';
    }
    if (options.required === void 0) {
      options.required = true;
    }
    if (validTypes.indexOf(options.datatype) === -1) {
      throw new Error("Invalid port datatype '" + options.datatype + "' specified, valid are " + (validTypes.join(' ,')));
    }
    if (options.type && options.type.indexOf('/') === -1) {
      throw new Error("Invalid port type '" + options.type + "' specified. Should be URL or MIME type");
    }
    return this.options = options;
  };

  BasePort.prototype.getId = function() {
    if (!(this.node && this.name)) {
      return 'Port';
    }
    return "" + this.node + " " + (this.name.toUpperCase());
  };

  BasePort.prototype.getDataType = function() {
    return this.options.datatype;
  };

  BasePort.prototype.getDescription = function() {
    return this.options.description;
  };

  BasePort.prototype.attach = function(socket, index) {
    if (index == null) {
      index = null;
    }
    if (!this.isAddressable() || index === null) {
      index = this.sockets.length;
    }
    this.sockets[index] = socket;
    this.attachSocket(socket, index);
    if (this.isAddressable()) {
      this.emit('attach', socket, index);
      return;
    }
    return this.emit('attach', socket);
  };

  BasePort.prototype.attachSocket = function() {};

  BasePort.prototype.detach = function(socket) {
    var index;
    index = this.sockets.indexOf(socket);
    if (index === -1) {
      return;
    }
    this.sockets.splice(index, 1);
    if (this.isAddressable()) {
      this.emit('detach', socket, index);
      return;
    }
    return this.emit('detach', socket);
  };

  BasePort.prototype.isAddressable = function() {
    if (this.options.addressable) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isBuffered = function() {
    if (this.options.buffered) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isRequired = function() {
    if (this.options.required) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isAttached = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (this.isAddressable() && socketId !== null) {
      if (this.sockets[socketId]) {
        return true;
      }
      return false;
    }
    if (this.sockets.length) {
      return true;
    }
    return false;
  };

  BasePort.prototype.isConnected = function(socketId) {
    var connected;
    if (socketId == null) {
      socketId = null;
    }
    if (this.isAddressable()) {
      if (socketId === null) {
        throw new Error("" + (this.getId()) + ": Socket ID required");
      }
      if (!this.sockets[socketId]) {
        throw new Error("" + (this.getId()) + ": Socket " + socketId + " not available");
      }
      return this.sockets[socketId].isConnected();
    }
    connected = false;
    this.sockets.forEach((function(_this) {
      return function(socket) {
        if (socket.isConnected()) {
          return connected = true;
        }
      };
    })(this));
    return connected;
  };

  BasePort.prototype.canAttach = function() {
    return true;
  };

  return BasePort;

})(EventEmitter);

module.exports = BasePort;

});
require.register("noflo-noflo/src/lib/InPort.js", function(exports, require, module){
var BasePort, InPort,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BasePort = require('./BasePort');

InPort = (function(_super) {
  __extends(InPort, _super);

  function InPort(options, process) {
    this.process = null;
    if (!process && typeof options === 'function') {
      process = options;
      options = {};
    }
    if (options && options.buffered === void 0) {
      options.buffered = false;
    }
    if (!process && options && options.process) {
      process = options.process;
      delete options.process;
    }
    if (process) {
      if (typeof process !== 'function') {
        throw new Error('process must be a function');
      }
      this.process = process;
    }
    InPort.__super__.constructor.call(this, options);
    this.sendDefault();
    this.prepareBuffer();
  }

  InPort.prototype.attachSocket = function(socket, localId) {
    if (localId == null) {
      localId = null;
    }
    socket.on('connect', (function(_this) {
      return function() {
        return _this.handleSocketEvent('connect', socket, localId);
      };
    })(this));
    socket.on('begingroup', (function(_this) {
      return function(group) {
        return _this.handleSocketEvent('begingroup', group, localId);
      };
    })(this));
    socket.on('data', (function(_this) {
      return function(data) {
        _this.validateData(data);
        return _this.handleSocketEvent('data', data, localId);
      };
    })(this));
    socket.on('endgroup', (function(_this) {
      return function(group) {
        return _this.handleSocketEvent('endgroup', group, localId);
      };
    })(this));
    return socket.on('disconnect', (function(_this) {
      return function() {
        return _this.handleSocketEvent('disconnect', socket, localId);
      };
    })(this));
  };

  InPort.prototype.handleSocketEvent = function(event, payload, id) {
    if (this.isBuffered()) {
      this.buffer.push({
        event: event,
        payload: payload,
        id: id
      });
      if (this.isAddressable()) {
        if (this.process) {
          this.process(event, id, this.nodeInstance);
        }
        this.emit(event, id);
      } else {
        if (this.process) {
          this.process(event, this.nodeInstance);
        }
        this.emit(event);
      }
      return;
    }
    if (this.process) {
      if (this.isAddressable()) {
        this.process(event, payload, id, this.nodeInstance);
      } else {
        this.process(event, payload, this.nodeInstance);
      }
    }
    if (this.isAddressable()) {
      return this.emit(event, payload, id);
    }
    return this.emit(event, payload);
  };

  InPort.prototype.sendDefault = function() {
    if (this.options["default"] === void 0) {
      return;
    }
    return setTimeout((function(_this) {
      return function() {
        var idx, socket, _i, _len, _ref, _results;
        _ref = _this.sockets;
        _results = [];
        for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
          socket = _ref[idx];
          _results.push(_this.handleSocketEvent('data', _this.options["default"], idx));
        }
        return _results;
      };
    })(this), 0);
  };

  InPort.prototype.prepareBuffer = function() {
    if (!this.isBuffered()) {
      return;
    }
    return this.buffer = [];
  };

  InPort.prototype.validateData = function(data) {
    if (!this.options.values) {
      return;
    }
    if (this.options.values.indexOf(data) === -1) {
      throw new Error('Invalid data received');
    }
  };

  InPort.prototype.receive = function() {
    if (!this.isBuffered()) {
      throw new Error('Receive is only possible on buffered ports');
    }
    return this.buffer.shift();
  };

  return InPort;

})(BasePort);

module.exports = InPort;

});
require.register("noflo-noflo/src/lib/OutPort.js", function(exports, require, module){
var BasePort, OutPort,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BasePort = require('./BasePort');

OutPort = (function(_super) {
  __extends(OutPort, _super);

  function OutPort() {
    return OutPort.__super__.constructor.apply(this, arguments);
  }

  OutPort.prototype.connect = function(socketId) {
    var socket, sockets, _i, _len, _results;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    _results = [];
    for (_i = 0, _len = sockets.length; _i < _len; _i++) {
      socket = sockets[_i];
      _results.push(socket.connect());
    }
    return _results;
  };

  OutPort.prototype.beginGroup = function(group, socketId) {
    var sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    return sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.beginGroup(group);
      }
      socket.once('connect', function() {
        return socket.beginGroup(group);
      });
      return socket.connect();
    });
  };

  OutPort.prototype.send = function(data, socketId) {
    var sockets;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    return sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.send(data);
      }
      socket.once('connect', function() {
        return socket.send(data);
      });
      return socket.connect();
    });
  };

  OutPort.prototype.endGroup = function(socketId) {
    var socket, sockets, _i, _len, _results;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    _results = [];
    for (_i = 0, _len = sockets.length; _i < _len; _i++) {
      socket = sockets[_i];
      _results.push(socket.endGroup());
    }
    return _results;
  };

  OutPort.prototype.disconnect = function(socketId) {
    var socket, sockets, _i, _len, _results;
    if (socketId == null) {
      socketId = null;
    }
    sockets = this.getSockets(socketId);
    this.checkRequired(sockets);
    _results = [];
    for (_i = 0, _len = sockets.length; _i < _len; _i++) {
      socket = sockets[_i];
      _results.push(socket.disconnect());
    }
    return _results;
  };

  OutPort.prototype.checkRequired = function(sockets) {
    if (sockets.length === 0 && this.isRequired()) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
  };

  OutPort.prototype.getSockets = function(socketId) {
    if (this.isAddressable()) {
      if (socketId === null) {
        throw new Error("" + (this.getId()) + " Socket ID required");
      }
      if (!this.sockets[socketId]) {
        return [];
      }
      return [this.sockets[socketId]];
    }
    return this.sockets;
  };

  return OutPort;

})(BasePort);

module.exports = OutPort;

});
require.register("noflo-noflo/src/lib/Ports.js", function(exports, require, module){
var EventEmitter, InPort, InPorts, OutPort, OutPorts, Ports,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

InPort = require('./InPort');

OutPort = require('./OutPort');

Ports = (function(_super) {
  __extends(Ports, _super);

  Ports.prototype.model = InPort;

  function Ports(ports) {
    var name, options;
    this.ports = {};
    if (!ports) {
      return;
    }
    for (name in ports) {
      options = ports[name];
      this.add(name, options);
    }
  }

  Ports.prototype.add = function(name, options, process) {
    if (name === 'add' || name === 'remove') {
      throw new Error('Add and remove are restricted port names');
    }
    if (this.ports[name]) {
      this.remove(name);
    }
    if (typeof options === 'object' && options.canAttach) {
      this.ports[name] = options;
    } else {
      this.ports[name] = new this.model(options, process);
    }
    this[name] = this.ports[name];
    return this.emit('add', name);
  };

  Ports.prototype.remove = function(name) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not defined");
    }
    delete this.ports[name];
    delete this[name];
    return this.emit('remove', name);
  };

  return Ports;

})(EventEmitter);

exports.InPorts = InPorts = (function(_super) {
  __extends(InPorts, _super);

  function InPorts() {
    return InPorts.__super__.constructor.apply(this, arguments);
  }

  InPorts.prototype.on = function(name, event, callback) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].on(event, callback);
  };

  InPorts.prototype.once = function(name, event, callback) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].once(event, callback);
  };

  return InPorts;

})(Ports);

exports.OutPorts = OutPorts = (function(_super) {
  __extends(OutPorts, _super);

  function OutPorts() {
    return OutPorts.__super__.constructor.apply(this, arguments);
  }

  OutPorts.prototype.model = OutPort;

  OutPorts.prototype.connect = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].connect(socketId);
  };

  OutPorts.prototype.beginGroup = function(name, group, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].beginGroup(group, socketId);
  };

  OutPorts.prototype.send = function(name, data, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].send(data, socketId);
  };

  OutPorts.prototype.endGroup = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].endGroup(socketId);
  };

  OutPorts.prototype.disconnect = function(name, socketId) {
    if (!this.ports[name]) {
      throw new Error("Port " + name + " not available");
    }
    return this.ports[name].disconnect(socketId);
  };

  return OutPorts;

})(Ports);

});
require.register("noflo-noflo/src/lib/Port.js", function(exports, require, module){
var EventEmitter, Port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

Port = (function(_super) {
  __extends(Port, _super);

  Port.prototype.description = '';

  Port.prototype.required = true;

  function Port(type) {
    this.type = type;
    if (!this.type) {
      this.type = 'all';
    }
    this.sockets = [];
    this.from = null;
    this.node = null;
    this.name = null;
  }

  Port.prototype.getId = function() {
    if (!(this.node && this.name)) {
      return 'Port';
    }
    return "" + this.node + " " + (this.name.toUpperCase());
  };

  Port.prototype.getDataType = function() {
    return this.type;
  };

  Port.prototype.getDescription = function() {
    return this.description;
  };

  Port.prototype.attach = function(socket) {
    this.sockets.push(socket);
    return this.attachSocket(socket);
  };

  Port.prototype.attachSocket = function(socket, localId) {
    if (localId == null) {
      localId = null;
    }
    this.emit("attach", socket);
    this.from = socket.from;
    if (socket.setMaxListeners) {
      socket.setMaxListeners(0);
    }
    socket.on("connect", (function(_this) {
      return function() {
        return _this.emit("connect", socket, localId);
      };
    })(this));
    socket.on("begingroup", (function(_this) {
      return function(group) {
        return _this.emit("begingroup", group, localId);
      };
    })(this));
    socket.on("data", (function(_this) {
      return function(data) {
        return _this.emit("data", data, localId);
      };
    })(this));
    socket.on("endgroup", (function(_this) {
      return function(group) {
        return _this.emit("endgroup", group, localId);
      };
    })(this));
    return socket.on("disconnect", (function(_this) {
      return function() {
        return _this.emit("disconnect", socket, localId);
      };
    })(this));
  };

  Port.prototype.connect = function() {
    var socket, _i, _len, _ref, _results;
    if (this.sockets.length === 0) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
    _ref = this.sockets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      socket = _ref[_i];
      _results.push(socket.connect());
    }
    return _results;
  };

  Port.prototype.beginGroup = function(group) {
    if (this.sockets.length === 0) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
    return this.sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.beginGroup(group);
      }
      socket.once('connect', function() {
        return socket.beginGroup(group);
      });
      return socket.connect();
    });
  };

  Port.prototype.send = function(data) {
    if (this.sockets.length === 0) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
    return this.sockets.forEach(function(socket) {
      if (socket.isConnected()) {
        return socket.send(data);
      }
      socket.once('connect', function() {
        return socket.send(data);
      });
      return socket.connect();
    });
  };

  Port.prototype.endGroup = function() {
    var socket, _i, _len, _ref, _results;
    if (this.sockets.length === 0) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
    _ref = this.sockets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      socket = _ref[_i];
      _results.push(socket.endGroup());
    }
    return _results;
  };

  Port.prototype.disconnect = function() {
    var socket, _i, _len, _ref, _results;
    if (this.sockets.length === 0) {
      throw new Error("" + (this.getId()) + ": No connections available");
    }
    _ref = this.sockets;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      socket = _ref[_i];
      _results.push(socket.disconnect());
    }
    return _results;
  };

  Port.prototype.detach = function(socket) {
    var index;
    if (this.sockets.length === 0) {
      return;
    }
    if (!socket) {
      socket = this.sockets[0];
    }
    index = this.sockets.indexOf(socket);
    if (index === -1) {
      return;
    }
    this.sockets.splice(index, 1);
    return this.emit("detach", socket);
  };

  Port.prototype.isConnected = function() {
    var connected;
    connected = false;
    this.sockets.forEach((function(_this) {
      return function(socket) {
        if (socket.isConnected()) {
          return connected = true;
        }
      };
    })(this));
    return connected;
  };

  Port.prototype.isAddressable = function() {
    return false;
  };

  Port.prototype.isRequired = function() {
    return this.required;
  };

  Port.prototype.isAttached = function() {
    if (this.sockets.length > 0) {
      return true;
    }
    return false;
  };

  Port.prototype.canAttach = function() {
    return true;
  };

  return Port;

})(EventEmitter);

exports.Port = Port;

});
require.register("noflo-noflo/src/lib/ArrayPort.js", function(exports, require, module){
var ArrayPort, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

ArrayPort = (function(_super) {
  __extends(ArrayPort, _super);

  function ArrayPort(type) {
    this.type = type;
    ArrayPort.__super__.constructor.call(this, this.type);
  }

  ArrayPort.prototype.attach = function(socket) {
    this.sockets.push(socket);
    return this.attachSocket(socket, this.sockets.length - 1);
  };

  ArrayPort.prototype.connect = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach(function(socket) {
        return socket.connect();
      });
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.beginGroup = function(group, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          return _this.beginGroup(group, index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].beginGroup(group);
    }
    this.sockets[socketId].once("connect", (function(_this) {
      return function() {
        return _this.sockets[socketId].beginGroup(group);
      };
    })(this));
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.send = function(data, socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          return _this.send(data, index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    if (this.isConnected(socketId)) {
      return this.sockets[socketId].send(data);
    }
    this.sockets[socketId].once("connect", (function(_this) {
      return function() {
        return _this.sockets[socketId].send(data);
      };
    })(this));
    return this.sockets[socketId].connect();
  };

  ArrayPort.prototype.endGroup = function(socketId) {
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      this.sockets.forEach((function(_this) {
        return function(socket, index) {
          return _this.endGroup(index);
        };
      })(this));
      return;
    }
    if (!this.sockets[socketId]) {
      throw new Error("" + (this.getId()) + ": No connection '" + socketId + "' available");
    }
    return this.sockets[socketId].endGroup();
  };

  ArrayPort.prototype.disconnect = function(socketId) {
    var socket, _i, _len, _ref;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      if (!this.sockets.length) {
        throw new Error("" + (this.getId()) + ": No connections available");
      }
      _ref = this.sockets;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        socket = _ref[_i];
        socket.disconnect();
      }
      return;
    }
    if (!this.sockets[socketId]) {
      return;
    }
    return this.sockets[socketId].disconnect();
  };

  ArrayPort.prototype.isConnected = function(socketId) {
    var connected;
    if (socketId == null) {
      socketId = null;
    }
    if (socketId === null) {
      connected = false;
      this.sockets.forEach((function(_this) {
        return function(socket) {
          if (socket.isConnected()) {
            return connected = true;
          }
        };
      })(this));
      return connected;
    }
    if (!this.sockets[socketId]) {
      return false;
    }
    return this.sockets[socketId].isConnected();
  };

  ArrayPort.prototype.isAddressable = function() {
    return true;
  };

  ArrayPort.prototype.isAttached = function(socketId) {
    if (socketId === void 0) {
      if (this.sockets.length > 0) {
        return true;
      }
      return false;
    }
    if (this.sockets[socketId]) {
      return true;
    }
    return false;
  };

  return ArrayPort;

})(port.Port);

exports.ArrayPort = ArrayPort;

});
require.register("noflo-noflo/src/lib/Component.js", function(exports, require, module){
var Component, EventEmitter, ports,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

ports = require('./Ports');

Component = (function(_super) {
  __extends(Component, _super);

  Component.prototype.description = '';

  Component.prototype.icon = null;

  function Component(options) {
    this.error = __bind(this.error, this);
    if (!options) {
      options = {};
    }
    if (!options.inPorts) {
      options.inPorts = {};
    }
    if (options.inPorts instanceof ports.InPorts) {
      this.inPorts = options.inPorts;
    } else {
      this.inPorts = new ports.InPorts(options.inPorts);
    }
    if (!options.outPorts) {
      options.outPorts = {};
    }
    if (options.outPorts instanceof ports.OutPorts) {
      this.outPorts = options.outPorts;
    } else {
      this.outPorts = new ports.OutPorts(options.outPorts);
    }
  }

  Component.prototype.getDescription = function() {
    return this.description;
  };

  Component.prototype.isReady = function() {
    return true;
  };

  Component.prototype.isSubgraph = function() {
    return false;
  };

  Component.prototype.setIcon = function(icon) {
    this.icon = icon;
    return this.emit('icon', this.icon);
  };

  Component.prototype.getIcon = function() {
    return this.icon;
  };

  Component.prototype.error = function(e) {
    if (this.outPorts.error && this.outPorts.error.isAttached()) {
      this.outPorts.error.send(e);
      this.outPorts.error.disconnect();
      return;
    }
    throw e;
  };

  Component.prototype.shutdown = function() {};

  return Component;

})(EventEmitter);

exports.Component = Component;

});
require.register("noflo-noflo/src/lib/AsyncComponent.js", function(exports, require, module){
var AsyncComponent, component, port,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

port = require("./Port");

component = require("./Component");

AsyncComponent = (function(_super) {
  __extends(AsyncComponent, _super);

  function AsyncComponent(inPortName, outPortName, errPortName) {
    this.inPortName = inPortName != null ? inPortName : "in";
    this.outPortName = outPortName != null ? outPortName : "out";
    this.errPortName = errPortName != null ? errPortName : "error";
    if (!this.inPorts[this.inPortName]) {
      throw new Error("no inPort named '" + this.inPortName + "'");
    }
    if (!this.outPorts[this.outPortName]) {
      throw new Error("no outPort named '" + this.outPortName + "'");
    }
    this.load = 0;
    this.q = [];
    this.outPorts.load = new port.Port();
    this.inPorts[this.inPortName].on("begingroup", (function(_this) {
      return function(group) {
        if (_this.load > 0) {
          return _this.q.push({
            name: "begingroup",
            data: group
          });
        }
        return _this.outPorts[_this.outPortName].beginGroup(group);
      };
    })(this));
    this.inPorts[this.inPortName].on("endgroup", (function(_this) {
      return function() {
        if (_this.load > 0) {
          return _this.q.push({
            name: "endgroup"
          });
        }
        return _this.outPorts[_this.outPortName].endGroup();
      };
    })(this));
    this.inPorts[this.inPortName].on("disconnect", (function(_this) {
      return function() {
        if (_this.load > 0) {
          return _this.q.push({
            name: "disconnect"
          });
        }
        _this.outPorts[_this.outPortName].disconnect();
        if (_this.outPorts.load.isAttached()) {
          return _this.outPorts.load.disconnect();
        }
      };
    })(this));
    this.inPorts[this.inPortName].on("data", (function(_this) {
      return function(data) {
        if (_this.q.length > 0) {
          return _this.q.push({
            name: "data",
            data: data
          });
        }
        return _this.processData(data);
      };
    })(this));
  }

  AsyncComponent.prototype.processData = function(data) {
    this.incrementLoad();
    return this.doAsync(data, (function(_this) {
      return function(err) {
        if (err) {
          if (_this.outPorts[_this.errPortName] && _this.outPorts[_this.errPortName].isAttached()) {
            _this.outPorts[_this.errPortName].send(err);
            _this.outPorts[_this.errPortName].disconnect();
          } else {
            throw err;
          }
        }
        return _this.decrementLoad();
      };
    })(this));
  };

  AsyncComponent.prototype.incrementLoad = function() {
    this.load++;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      return this.outPorts.load.disconnect();
    }
  };

  AsyncComponent.prototype.doAsync = function(data, callback) {
    return callback(new Error("AsyncComponents must implement doAsync"));
  };

  AsyncComponent.prototype.decrementLoad = function() {
    if (this.load === 0) {
      throw new Error("load cannot be negative");
    }
    this.load--;
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.send(this.load);
    }
    if (this.outPorts.load.isAttached()) {
      this.outPorts.load.disconnect();
    }
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick((function(_this) {
        return function() {
          return _this.processQueue();
        };
      })(this));
    } else {
      return setTimeout((function(_this) {
        return function() {
          return _this.processQueue();
        };
      })(this), 0);
    }
  };

  AsyncComponent.prototype.processQueue = function() {
    var event, processedData;
    if (this.load > 0) {
      return;
    }
    processedData = false;
    while (this.q.length > 0) {
      event = this.q[0];
      switch (event.name) {
        case "begingroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].beginGroup(event.data);
          this.q.shift();
          break;
        case "endgroup":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].endGroup();
          this.q.shift();
          break;
        case "disconnect":
          if (processedData) {
            return;
          }
          this.outPorts[this.outPortName].disconnect();
          if (this.outPorts.load.isAttached()) {
            this.outPorts.load.disconnect();
          }
          this.q.shift();
          break;
        case "data":
          this.processData(event.data);
          this.q.shift();
          processedData = true;
      }
    }
  };

  return AsyncComponent;

})(component.Component);

exports.AsyncComponent = AsyncComponent;

});
require.register("noflo-noflo/src/lib/LoggingComponent.js", function(exports, require, module){
var Component, Port, util,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Component = require("./Component").Component;

Port = require("./Port").Port;

if (!require('./Platform').isBrowser()) {
  util = require("util");
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

exports.LoggingComponent = (function(_super) {
  __extends(LoggingComponent, _super);

  function LoggingComponent() {
    this.sendLog = __bind(this.sendLog, this);
    this.outPorts = {
      log: new Port()
    };
  }

  LoggingComponent.prototype.sendLog = function(message) {
    if (typeof message === "object") {
      message.when = new Date;
      message.source = this.constructor.name;
      if (this.nodeId != null) {
        message.nodeID = this.nodeId;
      }
    }
    if ((this.outPorts.log != null) && this.outPorts.log.isAttached()) {
      return this.outPorts.log.send(message);
    } else {
      return console.log(util.inspect(message, 4, true, true));
    }
  };

  return LoggingComponent;

})(Component);

});
require.register("noflo-noflo/src/lib/ComponentLoader.js", function(exports, require, module){
var ComponentLoader, EventEmitter, internalSocket, nofloGraph,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

internalSocket = require('./InternalSocket');

nofloGraph = require('./Graph');

if (!require('./Platform').isBrowser()) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

ComponentLoader = (function(_super) {
  __extends(ComponentLoader, _super);

  function ComponentLoader(baseDir) {
    this.baseDir = baseDir;
    this.components = null;
    this.checked = [];
    this.revalidate = false;
    this.libraryIcons = {};
    this.processing = false;
    this.ready = false;
  }

  ComponentLoader.prototype.getModulePrefix = function(name) {
    if (!name) {
      return '';
    }
    if (name === 'noflo') {
      return '';
    }
    return name.replace('noflo-', '');
  };

  ComponentLoader.prototype.getModuleComponents = function(moduleName) {
    var cPath, definition, dependency, e, loader, name, prefix, _ref, _ref1, _results;
    if (this.checked.indexOf(moduleName) !== -1) {
      return;
    }
    this.checked.push(moduleName);
    try {
      definition = require("/" + moduleName + "/component.json");
    } catch (_error) {
      e = _error;
      if (moduleName.substr(0, 1) === '/') {
        return this.getModuleComponents("noflo-" + (moduleName.substr(1)));
      }
      return;
    }
    for (dependency in definition.dependencies) {
      this.getModuleComponents(dependency.replace('/', '-'));
    }
    if (!definition.noflo) {
      return;
    }
    prefix = this.getModulePrefix(definition.name);
    if (definition.noflo.icon) {
      this.libraryIcons[prefix] = definition.noflo.icon;
    }
    if (moduleName[0] === '/') {
      moduleName = moduleName.substr(1);
    }
    if (definition.noflo.loader) {
      loader = require("/" + moduleName + "/" + definition.noflo.loader);
      loader(this);
    }
    if (definition.noflo.components) {
      _ref = definition.noflo.components;
      for (name in _ref) {
        cPath = _ref[name];
        if (cPath.indexOf('.js') !== -1) {
          cPath = cPath.replace('.js', '.js');
        }
        if (cPath.substr(0, 2) === './') {
          cPath = cPath.substr(2);
        }
        this.registerComponent(prefix, name, "/" + moduleName + "/" + cPath);
      }
    }
    if (definition.noflo.graphs) {
      _ref1 = definition.noflo.graphs;
      _results = [];
      for (name in _ref1) {
        cPath = _ref1[name];
        _results.push(this.registerGraph(prefix, name, "/" + moduleName + "/" + cPath));
      }
      return _results;
    }
  };

  ComponentLoader.prototype.listComponents = function(callback) {
    if (this.processing) {
      this.once('ready', (function(_this) {
        return function() {
          return callback(_this.components);
        };
      })(this));
      return;
    }
    if (this.components) {
      return callback(this.components);
    }
    this.ready = false;
    this.processing = true;
    return setTimeout((function(_this) {
      return function() {
        _this.components = {};
        _this.getModuleComponents(_this.baseDir);
        _this.processing = false;
        _this.ready = true;
        _this.emit('ready', true);
        if (callback) {
          return callback(_this.components);
        }
      };
    })(this), 1);
  };

  ComponentLoader.prototype.load = function(name, callback, delayed, metadata) {
    var component, componentName, implementation, instance;
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function() {
          return _this.load(name, callback, delayed, metadata);
        };
      })(this));
      return;
    }
    component = this.components[name];
    if (!component) {
      for (componentName in this.components) {
        if (componentName.split('/')[1] === name) {
          component = this.components[componentName];
          break;
        }
      }
      if (!component) {
        throw new Error("Component " + name + " not available with base " + this.baseDir);
        return;
      }
    }
    if (this.isGraph(component)) {
      if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
        process.nextTick((function(_this) {
          return function() {
            return _this.loadGraph(name, component, callback, delayed, metadata);
          };
        })(this));
      } else {
        setTimeout((function(_this) {
          return function() {
            return _this.loadGraph(name, component, callback, delayed, metadata);
          };
        })(this), 0);
      }
      return;
    }
    if (typeof component === 'function') {
      implementation = component;
      if (component.getComponent && typeof component.getComponent === 'function') {
        instance = component.getComponent(metadata);
      } else {
        instance = component(metadata);
      }
    } else if (typeof component === 'object' && typeof component.getComponent === 'function') {
      instance = component.getComponent(metadata);
    } else {
      implementation = require(component);
      if (implementation.getComponent && typeof implementation.getComponent === 'function') {
        instance = implementation.getComponent(metadata);
      } else {
        instance = implementation(metadata);
      }
    }
    if (name === 'Graph') {
      instance.baseDir = this.baseDir;
    }
    this.setIcon(name, instance);
    return callback(instance);
  };

  ComponentLoader.prototype.isGraph = function(cPath) {
    if (typeof cPath === 'object' && cPath instanceof nofloGraph.Graph) {
      return true;
    }
    if (typeof cPath !== 'string') {
      return false;
    }
    return cPath.indexOf('.fbp') !== -1 || cPath.indexOf('.json') !== -1;
  };

  ComponentLoader.prototype.loadGraph = function(name, component, callback, delayed, metadata) {
    var delaySocket, graph, graphImplementation, graphSocket;
    graphImplementation = require(this.components['Graph']);
    graphSocket = internalSocket.createSocket();
    graph = graphImplementation.getComponent(metadata);
    graph.loader = this;
    graph.baseDir = this.baseDir;
    if (delayed) {
      delaySocket = internalSocket.createSocket();
      graph.inPorts.start.attach(delaySocket);
    }
    graph.inPorts.graph.attach(graphSocket);
    graphSocket.send(component);
    graphSocket.disconnect();
    graph.inPorts.remove('graph');
    graph.inPorts.remove('start');
    this.setIcon(name, graph);
    return callback(graph);
  };

  ComponentLoader.prototype.setIcon = function(name, instance) {
    var componentName, library, _ref;
    if (!instance.getIcon || instance.getIcon()) {
      return;
    }
    _ref = name.split('/'), library = _ref[0], componentName = _ref[1];
    if (componentName && this.getLibraryIcon(library)) {
      instance.setIcon(this.getLibraryIcon(library));
      return;
    }
    if (instance.isSubgraph()) {
      instance.setIcon('sitemap');
      return;
    }
    instance.setIcon('square');
  };

  ComponentLoader.prototype.getLibraryIcon = function(prefix) {
    if (this.libraryIcons[prefix]) {
      return this.libraryIcons[prefix];
    }
    return null;
  };

  ComponentLoader.prototype.normalizeName = function(packageId, name) {
    var fullName, prefix;
    prefix = this.getModulePrefix(packageId);
    fullName = "" + prefix + "/" + name;
    if (!packageId) {
      fullName = name;
    }
    return fullName;
  };

  ComponentLoader.prototype.registerComponent = function(packageId, name, cPath, callback) {
    var fullName;
    fullName = this.normalizeName(packageId, name);
    this.components[fullName] = cPath;
    if (callback) {
      return callback();
    }
  };

  ComponentLoader.prototype.registerGraph = function(packageId, name, gPath, callback) {
    return this.registerComponent(packageId, name, gPath, callback);
  };

  ComponentLoader.prototype.setSource = function(packageId, name, source, language, callback) {
    var e, implementation;
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function() {
          return _this.setSource(packageId, name, source, language, callback);
        };
      })(this));
      return;
    }
    if (language === 'coffeescript') {
      if (!window.CoffeeScript) {
        return callback(new Error('CoffeeScript compiler not available'));
      }
      try {
        source = CoffeeScript.compile(source, {
          bare: true
        });
      } catch (_error) {
        e = _error;
        return callback(e);
      }
    }
    try {
      source = source.replace("require('noflo')", "require('./NoFlo')");
      source = source.replace('require("noflo")', 'require("./NoFlo")');
      implementation = eval("(function () { var exports = {}; " + source + "; return exports; })()");
    } catch (_error) {
      e = _error;
      return callback(e);
    }
    if (!(implementation || implementation.getComponent)) {
      return callback(new Error('Provided source failed to create a runnable component'));
    }
    return this.registerComponent(packageId, name, implementation, function() {
      return callback(null);
    });
  };

  ComponentLoader.prototype.getSource = function(name, callback) {
    var component, componentName, nameParts, path;
    if (!this.ready) {
      this.listComponents((function(_this) {
        return function() {
          return _this.getSource(packageId, name, callback);
        };
      })(this));
      return;
    }
    component = this.components[name];
    if (!component) {
      for (componentName in this.components) {
        if (componentName.split('/')[1] === name) {
          component = this.components[componentName];
          name = componentName;
          break;
        }
      }
      if (!component) {
        return callback(new Error("Component " + name + " not installed"));
      }
    }
    if (typeof component !== 'string') {
      return callback(new Error("Can't provide source for " + name + ". Not a file"));
    }
    path = window.require.resolve(component);
    if (!path) {
      return callback(new Error("Component " + name + " is not resolvable to a path"));
    }
    nameParts = name.split('/');
    if (nameParts.length === 1) {
      nameParts[1] = nameParts[0];
      nameParts[0] = '';
    }
    return callback(null, {
      name: nameParts[1],
      library: nameParts[0],
      code: window.require.modules[path].toString()
    });
  };

  ComponentLoader.prototype.clear = function() {
    this.components = null;
    this.checked = [];
    this.revalidate = true;
    this.ready = false;
    return this.processing = false;
  };

  return ComponentLoader;

})(EventEmitter);

exports.ComponentLoader = ComponentLoader;

});
require.register("noflo-noflo/src/lib/NoFlo.js", function(exports, require, module){
var ports;

exports.graph = require('./Graph');

exports.Graph = exports.graph.Graph;

exports.journal = require('./Journal');

exports.Journal = exports.journal.Journal;

exports.Network = require('./Network').Network;

exports.isBrowser = require('./Platform').isBrowser;

if (!exports.isBrowser()) {
  exports.ComponentLoader = require('./nodejs/ComponentLoader').ComponentLoader;
} else {
  exports.ComponentLoader = require('./ComponentLoader').ComponentLoader;
}

exports.Component = require('./Component').Component;

exports.AsyncComponent = require('./AsyncComponent').AsyncComponent;

exports.LoggingComponent = require('./LoggingComponent').LoggingComponent;

ports = require('./Ports');

exports.InPorts = ports.InPorts;

exports.OutPorts = ports.OutPorts;

exports.InPort = require('./InPort');

exports.OutPort = require('./OutPort');

exports.Port = require('./Port').Port;

exports.ArrayPort = require('./ArrayPort').ArrayPort;

exports.internalSocket = require('./InternalSocket');

exports.createNetwork = function(graph, callback, delay) {
  var network, networkReady;
  network = new exports.Network(graph);
  networkReady = function(network) {
    if (callback != null) {
      callback(network);
    }
    return network.start();
  };
  if (graph.nodes.length === 0) {
    setTimeout(function() {
      return networkReady(network);
    }, 0);
    return network;
  }
  network.loader.listComponents(function() {
    if (delay) {
      if (callback != null) {
        callback(network);
      }
      return;
    }
    return network.connect(function() {
      return networkReady(network);
    });
  });
  return network;
};

exports.loadFile = function(file, baseDir, callback) {
  if (!callback) {
    callback = baseDir;
    baseDir = null;
  }
  return exports.graph.loadFile(file, function(net) {
    if (baseDir) {
      net.baseDir = baseDir;
    }
    return exports.createNetwork(net, callback);
  });
};

exports.saveFile = function(graph, file, callback) {
  return exports.graph.save(file, function() {
    return callback(file);
  });
};

});
require.register("noflo-noflo/src/lib/Network.js", function(exports, require, module){
var EventEmitter, Network, componentLoader, graph, internalSocket, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

internalSocket = require("./InternalSocket");

graph = require("./Graph");

if (!require('./Platform').isBrowser()) {
  componentLoader = require("./nodejs/ComponentLoader");
  EventEmitter = require('events').EventEmitter;
} else {
  componentLoader = require('./ComponentLoader');
  EventEmitter = require('emitter');
}

Network = (function(_super) {
  __extends(Network, _super);

  Network.prototype.processes = {};

  Network.prototype.connections = [];

  Network.prototype.initials = [];

  Network.prototype.graph = null;

  Network.prototype.startupDate = null;

  Network.prototype.portBuffer = {};

  function Network(graph) {
    this.processes = {};
    this.connections = [];
    this.initials = [];
    this.graph = graph;
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      this.baseDir = graph.baseDir || process.cwd();
    } else {
      this.baseDir = graph.baseDir || '/';
    }
    this.startupDate = new Date();
    if (graph.componentLoader) {
      this.loader = graph.componentLoader;
    } else {
      this.loader = new componentLoader.ComponentLoader(this.baseDir);
    }
  }

  Network.prototype.uptime = function() {
    return new Date() - this.startupDate;
  };

  Network.prototype.connectionCount = 0;

  Network.prototype.increaseConnections = function() {
    if (this.connectionCount === 0) {
      this.emit('start', {
        start: this.startupDate
      });
    }
    return this.connectionCount++;
  };

  Network.prototype.decreaseConnections = function() {
    var ender;
    this.connectionCount--;
    if (this.connectionCount === 0) {
      ender = _.debounce((function(_this) {
        return function() {
          if (_this.connectionCount) {
            return;
          }
          return _this.emit('end', {
            start: _this.startupDate,
            end: new Date,
            uptime: _this.uptime()
          });
        };
      })(this), 10);
      return ender();
    }
  };

  Network.prototype.load = function(component, metadata, callback) {
    return this.loader.load(component, callback, false, metadata);
  };

  Network.prototype.addNode = function(node, callback) {
    var process;
    if (this.processes[node.id]) {
      if (callback) {
        callback(this.processes[node.id]);
      }
      return;
    }
    process = {
      id: node.id
    };
    if (!node.component) {
      this.processes[process.id] = process;
      if (callback) {
        callback(process);
      }
      return;
    }
    return this.load(node.component, node.metadata, (function(_this) {
      return function(instance) {
        var name, port, _ref, _ref1;
        instance.nodeId = node.id;
        process.component = instance;
        _ref = process.component.inPorts;
        for (name in _ref) {
          port = _ref[name];
          if (!port || typeof port === 'function' || !port.canAttach) {
            continue;
          }
          port.node = node.id;
          port.nodeInstance = instance;
          port.name = name;
        }
        _ref1 = process.component.outPorts;
        for (name in _ref1) {
          port = _ref1[name];
          if (!port || typeof port === 'function' || !port.canAttach) {
            continue;
          }
          port.node = node.id;
          port.nodeInstance = instance;
          port.name = name;
        }
        if (instance.isSubgraph()) {
          _this.subscribeSubgraph(process);
        }
        _this.subscribeNode(process);
        _this.processes[process.id] = process;
        if (callback) {
          return callback(process);
        }
      };
    })(this));
  };

  Network.prototype.removeNode = function(node, callback) {
    if (!this.processes[node.id]) {
      return;
    }
    this.processes[node.id].component.shutdown();
    delete this.processes[node.id];
    if (callback) {
      return callback();
    }
  };

  Network.prototype.renameNode = function(oldId, newId, callback) {
    var name, port, process, _ref, _ref1;
    process = this.getNode(oldId);
    if (!process) {
      return;
    }
    process.id = newId;
    _ref = process.component.inPorts;
    for (name in _ref) {
      port = _ref[name];
      port.node = newId;
    }
    _ref1 = process.component.outPorts;
    for (name in _ref1) {
      port = _ref1[name];
      port.node = newId;
    }
    this.processes[newId] = process;
    delete this.processes[oldId];
    if (callback) {
      return callback();
    }
  };

  Network.prototype.getNode = function(id) {
    return this.processes[id];
  };

  Network.prototype.connect = function(done) {
    var edges, initializers, nodes, serialize, subscribeGraph;
    if (done == null) {
      done = function() {};
    }
    serialize = (function(_this) {
      return function(next, add) {
        return function(type) {
          return _this["add" + type](add, function() {
            return next(type);
          });
        };
      };
    })(this);
    subscribeGraph = (function(_this) {
      return function() {
        _this.subscribeGraph();
        return done();
      };
    })(this);
    initializers = _.reduceRight(this.graph.initializers, serialize, subscribeGraph);
    edges = _.reduceRight(this.graph.edges, serialize, function() {
      return initializers("Initial");
    });
    nodes = _.reduceRight(this.graph.nodes, serialize, function() {
      return edges("Edge");
    });
    return nodes("Node");
  };

  Network.prototype.connectPort = function(socket, process, port, inbound) {
    if (inbound) {
      socket.to = {
        process: process,
        port: port
      };
      if (!(process.component.inPorts && process.component.inPorts[port])) {
        throw new Error("No inport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
        return;
      }
      return process.component.inPorts[port].attach(socket);
    }
    socket.from = {
      process: process,
      port: port
    };
    if (!(process.component.outPorts && process.component.outPorts[port])) {
      throw new Error("No outport '" + port + "' defined in process " + process.id + " (" + (socket.getId()) + ")");
      return;
    }
    return process.component.outPorts[port].attach(socket);
  };

  Network.prototype.subscribeGraph = function() {
    var graphOps, processOps, processing, registerOp;
    graphOps = [];
    processing = false;
    registerOp = function(op, details) {
      return graphOps.push({
        op: op,
        details: details
      });
    };
    processOps = (function(_this) {
      return function() {
        var cb, op;
        if (!graphOps.length) {
          processing = false;
          return;
        }
        processing = true;
        op = graphOps.shift();
        cb = processOps;
        switch (op.op) {
          case 'renameNode':
            return _this.renameNode(op.details.from, op.details.to, cb);
          default:
            return _this[op.op](op.details, cb);
        }
      };
    })(this);
    this.graph.on('addNode', (function(_this) {
      return function(node) {
        registerOp('addNode', node);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    this.graph.on('removeNode', (function(_this) {
      return function(node) {
        registerOp('removeNode', node);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    this.graph.on('renameNode', (function(_this) {
      return function(oldId, newId) {
        registerOp('renameNode', {
          from: oldId,
          to: newId
        });
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    this.graph.on('addEdge', (function(_this) {
      return function(edge) {
        registerOp('addEdge', edge);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    this.graph.on('removeEdge', (function(_this) {
      return function(edge) {
        registerOp('removeEdge', edge);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    this.graph.on('addInitial', (function(_this) {
      return function(iip) {
        registerOp('addInitial', iip);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
    return this.graph.on('removeInitial', (function(_this) {
      return function(iip) {
        registerOp('removeInitial', iip);
        if (!processing) {
          return processOps();
        }
      };
    })(this));
  };

  Network.prototype.subscribeSubgraph = function(node) {
    var emitSub;
    if (!node.component.isReady()) {
      node.component.once('ready', (function(_this) {
        return function() {
          return _this.subscribeSubgraph(node);
        };
      })(this));
      return;
    }
    if (!node.component.network) {
      return;
    }
    emitSub = (function(_this) {
      return function(type, data) {
        if (type === 'connect') {
          _this.increaseConnections();
        }
        if (type === 'disconnect') {
          _this.decreaseConnections();
        }
        if (!data) {
          data = {};
        }
        if (data.subgraph) {
          if (!data.subgraph.unshift) {
            data.subgraph = [data.subgraph];
          }
          data.subgraph = data.subgraph.unshift(node.id);
        } else {
          data.subgraph = [node.id];
        }
        return _this.emit(type, data);
      };
    })(this);
    node.component.network.on('connect', function(data) {
      return emitSub('connect', data);
    });
    node.component.network.on('begingroup', function(data) {
      return emitSub('begingroup', data);
    });
    node.component.network.on('data', function(data) {
      return emitSub('data', data);
    });
    node.component.network.on('endgroup', function(data) {
      return emitSub('endgroup', data);
    });
    return node.component.network.on('disconnect', function(data) {
      return emitSub('disconnect', data);
    });
  };

  Network.prototype.subscribeSocket = function(socket) {
    socket.on('connect', (function(_this) {
      return function() {
        _this.increaseConnections();
        return _this.emit('connect', {
          id: socket.getId(),
          socket: socket
        });
      };
    })(this));
    socket.on('begingroup', (function(_this) {
      return function(group) {
        return _this.emit('begingroup', {
          id: socket.getId(),
          socket: socket,
          group: group
        });
      };
    })(this));
    socket.on('data', (function(_this) {
      return function(data) {
        return _this.emit('data', {
          id: socket.getId(),
          socket: socket,
          data: data
        });
      };
    })(this));
    socket.on('endgroup', (function(_this) {
      return function(group) {
        return _this.emit('endgroup', {
          id: socket.getId(),
          socket: socket,
          group: group
        });
      };
    })(this));
    return socket.on('disconnect', (function(_this) {
      return function() {
        _this.decreaseConnections();
        return _this.emit('disconnect', {
          id: socket.getId(),
          socket: socket
        });
      };
    })(this));
  };

  Network.prototype.subscribeNode = function(node) {
    if (!node.component.getIcon) {
      return;
    }
    return node.component.on('icon', (function(_this) {
      return function() {
        return _this.emit('icon', {
          id: node.id,
          icon: node.component.getIcon()
        });
      };
    })(this));
  };

  Network.prototype.addEdge = function(edge, callback) {
    var from, socket, to;
    socket = internalSocket.createSocket();
    from = this.getNode(edge.from.node);
    if (!from) {
      throw new Error("No process defined for outbound node " + edge.from.node);
    }
    if (!from.component) {
      throw new Error("No component defined for outbound node " + edge.from.node);
    }
    if (!from.component.isReady()) {
      from.component.once("ready", (function(_this) {
        return function() {
          return _this.addEdge(edge, callback);
        };
      })(this));
      return;
    }
    to = this.getNode(edge.to.node);
    if (!to) {
      throw new Error("No process defined for inbound node " + edge.to.node);
    }
    if (!to.component) {
      throw new Error("No component defined for inbound node " + edge.to.node);
    }
    if (!to.component.isReady()) {
      to.component.once("ready", (function(_this) {
        return function() {
          return _this.addEdge(edge, callback);
        };
      })(this));
      return;
    }
    this.connectPort(socket, to, edge.to.port, true);
    this.connectPort(socket, from, edge.from.port, false);
    this.subscribeSocket(socket);
    this.connections.push(socket);
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeEdge = function(edge, callback) {
    var connection, _i, _len, _ref, _results;
    _ref = this.connections;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection) {
        continue;
      }
      if (!(edge.to.node === connection.to.process.id && edge.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      if (edge.from.node) {
        if (connection.from && edge.from.node === connection.from.process.id && edge.from.port === connection.from.port) {
          connection.from.process.component.outPorts[connection.from.port].detach(connection);
        }
      }
      this.connections.splice(this.connections.indexOf(connection), 1);
      if (callback) {
        _results.push(callback());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Network.prototype.addInitial = function(initializer, callback) {
    var socket, to;
    socket = internalSocket.createSocket();
    this.subscribeSocket(socket);
    to = this.getNode(initializer.to.node);
    if (!to) {
      throw new Error("No process defined for inbound node " + initializer.to.node);
    }
    if (!(to.component.isReady() || to.component.inPorts[initializer.to.port])) {
      to.component.setMaxListeners(0);
      to.component.once("ready", (function(_this) {
        return function() {
          return _this.addInitial(initializer, callback);
        };
      })(this));
      return;
    }
    this.connectPort(socket, to, initializer.to.port, true);
    this.connections.push(socket);
    this.initials.push({
      socket: socket,
      data: initializer.from.data
    });
    if (callback) {
      return callback();
    }
  };

  Network.prototype.removeInitial = function(initializer, callback) {
    var connection, _i, _len, _ref;
    _ref = this.connections;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection) {
        continue;
      }
      if (!(initializer.to.node === connection.to.process.id && initializer.to.port === connection.to.port)) {
        continue;
      }
      connection.to.process.component.inPorts[connection.to.port].detach(connection);
      this.connections.splice(this.connections.indexOf(connection), 1);
    }
    if (callback) {
      return callback();
    }
  };

  Network.prototype.sendInitial = function(initial) {
    initial.socket.connect();
    initial.socket.send(initial.data);
    return initial.socket.disconnect();
  };

  Network.prototype.sendInitials = function() {
    var send;
    send = (function(_this) {
      return function() {
        var initial, _i, _len, _ref;
        _ref = _this.initials;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          initial = _ref[_i];
          _this.sendInitial(initial);
        }
        return _this.initials = [];
      };
    })(this);
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick(send);
    } else {
      return setTimeout(send, 0);
    }
  };

  Network.prototype.start = function() {
    return this.sendInitials();
  };

  Network.prototype.stop = function() {
    var connection, id, process, _i, _len, _ref, _ref1, _results;
    _ref = this.connections;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      connection = _ref[_i];
      if (!connection.isConnected()) {
        continue;
      }
      connection.disconnect();
    }
    _ref1 = this.processes;
    _results = [];
    for (id in _ref1) {
      process = _ref1[id];
      _results.push(process.component.shutdown());
    }
    return _results;
  };

  return Network;

})(EventEmitter);

exports.Network = Network;

});
require.register("noflo-noflo/src/lib/Platform.js", function(exports, require, module){
exports.isBrowser = function() {
  if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
    return false;
  }
  return true;
};

});
require.register("noflo-noflo/src/lib/Journal.js", function(exports, require, module){
var EventEmitter, Journal, JournalStore, MemoryJournalStore, calculateMeta, clone, entryToPrettyString,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  EventEmitter = require('events').EventEmitter;
} else {
  EventEmitter = require('emitter');
}

clone = require('./Utils').clone;

entryToPrettyString = function(entry) {
  var a;
  a = entry.args;
  switch (entry.cmd) {
    case 'addNode':
      return "" + a.id + "(" + a.component + ")";
    case 'removeNode':
      return "DEL " + a.id + "(" + a.component + ")";
    case 'renameNode':
      return "RENAME " + a.oldId + " " + a.newId;
    case 'changeNode':
      return "META " + a.id;
    case 'addEdge':
      return "" + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
    case 'removeEdge':
      return "" + a.from.node + " " + a.from.port + " -X> " + a.to.port + " " + a.to.node;
    case 'changeEdge':
      return "META " + a.from.node + " " + a.from.port + " -> " + a.to.port + " " + a.to.node;
    case 'addInitial':
      return "'" + a.from.data + "' -> " + a.to.port + " " + a.to.node;
    case 'removeInitial':
      return "'" + a.from.data + "' -X> " + a.to.port + " " + a.to.node;
    case 'startTransaction':
      return ">>> " + entry.rev + ": " + a.id;
    case 'endTransaction':
      return "<<< " + entry.rev + ": " + a.id;
    case 'changeProperties':
      return "PROPERTIES";
    case 'addGroup':
      return "GROUP " + a.name;
    case 'renameGroup':
      return "RENAME GROUP " + a.oldName + " " + a.newName;
    case 'removeGroup':
      return "DEL GROUP " + a.name;
    case 'changeGroup':
      return "META GROUP " + a.name;
    case 'addInport':
      return "INPORT " + a.name;
    case 'removeInport':
      return "DEL INPORT " + a.name;
    case 'renameInport':
      return "RENAME INPORT " + a.oldId + " " + a.newId;
    case 'changeInport':
      return "META INPORT " + a.name;
    case 'addOutport':
      return "OUTPORT " + a.name;
    case 'removeOutport':
      return "DEL OUTPORT " + a.name;
    case 'renameOutport':
      return "RENAME OUTPORT " + a.oldId + " " + a.newId;
    case 'changeOutport':
      return "META OUTPORT " + a.name;
    default:
      throw new Error("Unknown journal entry: " + entry.cmd);
  }
};

calculateMeta = function(oldMeta, newMeta) {
  var k, setMeta, v;
  setMeta = {};
  for (k in oldMeta) {
    v = oldMeta[k];
    setMeta[k] = null;
  }
  for (k in newMeta) {
    v = newMeta[k];
    setMeta[k] = v;
  }
  return setMeta;
};

JournalStore = (function(_super) {
  __extends(JournalStore, _super);

  JournalStore.prototype.lastRevision = 0;

  function JournalStore(graph) {
    this.graph = graph;
    this.lastRevision = 0;
  }

  JournalStore.prototype.putTransaction = function(revId, entries) {
    if (revId > this.lastRevision) {
      this.lastRevision = revId;
    }
    return this.emit('transaction', revId);
  };

  JournalStore.prototype.fetchTransaction = function(revId, entries) {};

  return JournalStore;

})(EventEmitter);

MemoryJournalStore = (function(_super) {
  __extends(MemoryJournalStore, _super);

  function MemoryJournalStore(graph) {
    MemoryJournalStore.__super__.constructor.call(this, graph);
    this.transactions = [];
  }

  MemoryJournalStore.prototype.putTransaction = function(revId, entries) {
    MemoryJournalStore.__super__.putTransaction.call(this, revId, entries);
    return this.transactions[revId] = entries;
  };

  MemoryJournalStore.prototype.fetchTransaction = function(revId) {
    return this.transactions[revId];
  };

  return MemoryJournalStore;

})(JournalStore);

Journal = (function(_super) {
  __extends(Journal, _super);

  Journal.prototype.graph = null;

  Journal.prototype.entries = [];

  Journal.prototype.subscribed = true;

  function Journal(graph, metadata, store) {
    this.endTransaction = __bind(this.endTransaction, this);
    this.startTransaction = __bind(this.startTransaction, this);
    var edge, group, iip, k, node, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
    this.graph = graph;
    this.entries = [];
    this.subscribed = true;
    this.store = store || new MemoryJournalStore(this.graph);
    if (this.store.transactions.length === 0) {
      this.currentRevision = -1;
      this.startTransaction('initial', metadata);
      _ref = this.graph.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        this.appendCommand('addNode', node);
      }
      _ref1 = this.graph.edges;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        edge = _ref1[_j];
        this.appendCommand('addEdge', edge);
      }
      _ref2 = this.graph.initializers;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        iip = _ref2[_k];
        this.appendCommand('addInitial', iip);
      }
      if (Object.keys(this.graph.properties).length > 0) {
        this.appendCommand('changeProperties', this.graph.properties, {});
      }
      _ref3 = this.graph.inports;
      for (k in _ref3) {
        v = _ref3[k];
        this.appendCommand('addInport', {
          name: k,
          port: v
        });
      }
      _ref4 = this.graph.outports;
      for (k in _ref4) {
        v = _ref4[k];
        this.appendCommand('addOutport', {
          name: k,
          port: v
        });
      }
      _ref5 = this.graph.groups;
      for (_l = 0, _len3 = _ref5.length; _l < _len3; _l++) {
        group = _ref5[_l];
        this.appendCommand('addGroup', group);
      }
      this.endTransaction('initial', metadata);
    } else {
      this.currentRevision = this.store.lastRevision;
    }
    this.graph.on('addNode', (function(_this) {
      return function(node) {
        return _this.appendCommand('addNode', node);
      };
    })(this));
    this.graph.on('removeNode', (function(_this) {
      return function(node) {
        return _this.appendCommand('removeNode', node);
      };
    })(this));
    this.graph.on('renameNode', (function(_this) {
      return function(oldId, newId) {
        var args;
        args = {
          oldId: oldId,
          newId: newId
        };
        return _this.appendCommand('renameNode', args);
      };
    })(this));
    this.graph.on('changeNode', (function(_this) {
      return function(node, oldMeta) {
        return _this.appendCommand('changeNode', {
          id: node.id,
          "new": node.metadata,
          old: oldMeta
        });
      };
    })(this));
    this.graph.on('addEdge', (function(_this) {
      return function(edge) {
        return _this.appendCommand('addEdge', edge);
      };
    })(this));
    this.graph.on('removeEdge', (function(_this) {
      return function(edge) {
        return _this.appendCommand('removeEdge', edge);
      };
    })(this));
    this.graph.on('changeEdge', (function(_this) {
      return function(edge, oldMeta) {
        return _this.appendCommand('changeEdge', {
          from: edge.from,
          to: edge.to,
          "new": edge.metadata,
          old: oldMeta
        });
      };
    })(this));
    this.graph.on('addInitial', (function(_this) {
      return function(iip) {
        return _this.appendCommand('addInitial', iip);
      };
    })(this));
    this.graph.on('removeInitial', (function(_this) {
      return function(iip) {
        return _this.appendCommand('removeInitial', iip);
      };
    })(this));
    this.graph.on('changeProperties', (function(_this) {
      return function(newProps, oldProps) {
        return _this.appendCommand('changeProperties', {
          "new": newProps,
          old: oldProps
        });
      };
    })(this));
    this.graph.on('addGroup', (function(_this) {
      return function(group) {
        return _this.appendCommand('addGroup', group);
      };
    })(this));
    this.graph.on('renameGroup', (function(_this) {
      return function(oldName, newName) {
        return _this.appendCommand('renameGroup', {
          oldName: oldName,
          newName: newName
        });
      };
    })(this));
    this.graph.on('removeGroup', (function(_this) {
      return function(group) {
        return _this.appendCommand('removeGroup', group);
      };
    })(this));
    this.graph.on('changeGroup', (function(_this) {
      return function(group, oldMeta) {
        return _this.appendCommand('changeGroup', {
          name: group.name,
          "new": group.metadata,
          old: oldMeta
        });
      };
    })(this));
    this.graph.on('addExport', (function(_this) {
      return function(exported) {
        return _this.appendCommand('addExport', exported);
      };
    })(this));
    this.graph.on('removeExport', (function(_this) {
      return function(exported) {
        return _this.appendCommand('removeExport', exported);
      };
    })(this));
    this.graph.on('addInport', (function(_this) {
      return function(name, port) {
        return _this.appendCommand('addInport', {
          name: name,
          port: port
        });
      };
    })(this));
    this.graph.on('removeInport', (function(_this) {
      return function(name, port) {
        return _this.appendCommand('removeInport', {
          name: name,
          port: port
        });
      };
    })(this));
    this.graph.on('renameInport', (function(_this) {
      return function(oldId, newId) {
        return _this.appendCommand('renameInport', {
          oldId: oldId,
          newId: newId
        });
      };
    })(this));
    this.graph.on('changeInport', (function(_this) {
      return function(name, port, oldMeta) {
        return _this.appendCommand('changeInport', {
          name: name,
          "new": port.metadata,
          old: oldMeta
        });
      };
    })(this));
    this.graph.on('addOutport', (function(_this) {
      return function(name, port) {
        return _this.appendCommand('addOutport', {
          name: name,
          port: port
        });
      };
    })(this));
    this.graph.on('removeOutport', (function(_this) {
      return function(name, port) {
        return _this.appendCommand('removeOutport', {
          name: name,
          port: port
        });
      };
    })(this));
    this.graph.on('renameOutport', (function(_this) {
      return function(oldId, newId) {
        return _this.appendCommand('renameOutport', {
          oldId: oldId,
          newId: newId
        });
      };
    })(this));
    this.graph.on('changeOutport', (function(_this) {
      return function(name, port, oldMeta) {
        return _this.appendCommand('changeOutport', {
          name: name,
          "new": port.metadata,
          old: oldMeta
        });
      };
    })(this));
    this.graph.on('startTransaction', (function(_this) {
      return function(id, meta) {
        return _this.startTransaction(id, meta);
      };
    })(this));
    this.graph.on('endTransaction', (function(_this) {
      return function(id, meta) {
        return _this.endTransaction(id, meta);
      };
    })(this));
  }

  Journal.prototype.startTransaction = function(id, meta) {
    if (!this.subscribed) {
      return;
    }
    if (this.entries.length > 0) {
      throw Error("Inconsistent @entries");
    }
    this.currentRevision++;
    return this.appendCommand('startTransaction', {
      id: id,
      metadata: meta
    }, this.currentRevision);
  };

  Journal.prototype.endTransaction = function(id, meta) {
    if (!this.subscribed) {
      return;
    }
    this.appendCommand('endTransaction', {
      id: id,
      metadata: meta
    }, this.currentRevision);
    this.store.putTransaction(this.currentRevision, this.entries);
    return this.entries = [];
  };

  Journal.prototype.appendCommand = function(cmd, args, rev) {
    var entry;
    if (!this.subscribed) {
      return;
    }
    entry = {
      cmd: cmd,
      args: clone(args)
    };
    if (rev != null) {
      entry.rev = rev;
    }
    return this.entries.push(entry);
  };

  Journal.prototype.executeEntry = function(entry) {
    var a;
    a = entry.args;
    switch (entry.cmd) {
      case 'addNode':
        return this.graph.addNode(a.id, a.component);
      case 'removeNode':
        return this.graph.removeNode(a.id);
      case 'renameNode':
        return this.graph.renameNode(a.oldId, a.newId);
      case 'changeNode':
        return this.graph.setNodeMetadata(a.id, calculateMeta(a.old, a["new"]));
      case 'addEdge':
        return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
      case 'removeEdge':
        return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
      case 'changeEdge':
        return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a.old, a["new"]));
      case 'addInitial':
        return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
      case 'removeInitial':
        return this.graph.removeInitial(a.to.node, a.to.port);
      case 'startTransaction':
        return null;
      case 'endTransaction':
        return null;
      case 'changeProperties':
        return this.graph.setProperties(a["new"]);
      case 'addGroup':
        return this.graph.addGroup(a.name, a.nodes, a.metadata);
      case 'renameGroup':
        return this.graph.renameGroup(a.oldName, a.newName);
      case 'removeGroup':
        return this.graph.removeGroup(a.name);
      case 'changeGroup':
        return this.graph.setGroupMetadata(a.name, calculateMeta(a.old, a["new"]));
      case 'addInport':
        return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
      case 'removeInport':
        return this.graph.removeInport(a.name);
      case 'renameInport':
        return this.graph.renameInport(a.oldId, a.newId);
      case 'changeInport':
        return this.graph.setInportMetadata(a.port, calculateMeta(a.old, a["new"]));
      case 'addOutport':
        return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata(a.name));
      case 'removeOutport':
        return this.graph.removeOutport;
      case 'renameOutport':
        return this.graph.renameOutport(a.oldId, a.newId);
      case 'changeOutport':
        return this.graph.setOutportMetadata(a.port, calculateMeta(a.old, a["new"]));
      default:
        throw new Error("Unknown journal entry: " + entry.cmd);
    }
  };

  Journal.prototype.executeEntryInversed = function(entry) {
    var a;
    a = entry.args;
    switch (entry.cmd) {
      case 'addNode':
        return this.graph.removeNode(a.id);
      case 'removeNode':
        return this.graph.addNode(a.id, a.component);
      case 'renameNode':
        return this.graph.renameNode(a.newId, a.oldId);
      case 'changeNode':
        return this.graph.setNodeMetadata(a.id, calculateMeta(a["new"], a.old));
      case 'addEdge':
        return this.graph.removeEdge(a.from.node, a.from.port, a.to.node, a.to.port);
      case 'removeEdge':
        return this.graph.addEdge(a.from.node, a.from.port, a.to.node, a.to.port);
      case 'changeEdge':
        return this.graph.setEdgeMetadata(a.from.node, a.from.port, a.to.node, a.to.port, calculateMeta(a["new"], a.old));
      case 'addInitial':
        return this.graph.removeInitial(a.to.node, a.to.port);
      case 'removeInitial':
        return this.graph.addInitial(a.from.data, a.to.node, a.to.port);
      case 'startTransaction':
        return null;
      case 'endTransaction':
        return null;
      case 'changeProperties':
        return this.graph.setProperties(a.old);
      case 'addGroup':
        return this.graph.removeGroup(a.name);
      case 'renameGroup':
        return this.graph.renameGroup(a.newName, a.oldName);
      case 'removeGroup':
        return this.graph.addGroup(a.name, a.nodes, a.metadata);
      case 'changeGroup':
        return this.graph.setGroupMetadata(a.name, calculateMeta(a["new"], a.old));
      case 'addInport':
        return this.graph.removeInport(a.name);
      case 'removeInport':
        return this.graph.addInport(a.name, a.port.process, a.port.port, a.port.metadata);
      case 'renameInport':
        return this.graph.renameInport(a.newId, a.oldId);
      case 'changeInport':
        return this.graph.setInportMetadata(a.port, calculateMeta(a["new"], a.old));
      case 'addOutport':
        return this.graph.removeOutport(a.name);
      case 'removeOutport':
        return this.graph.addOutport(a.name, a.port.process, a.port.port, a.port.metadata);
      case 'renameOutport':
        return this.graph.renameOutport(a.newId, a.oldId);
      case 'changeOutport':
        return this.graph.setOutportMetadata(a.port, calculateMeta(a["new"], a.old));
      default:
        throw new Error("Unknown journal entry: " + entry.cmd);
    }
  };

  Journal.prototype.moveToRevision = function(revId) {
    var entries, entry, i, r, _i, _j, _k, _l, _len, _ref, _ref1, _ref2, _ref3, _ref4;
    if (revId === this.currentRevision) {
      return;
    }
    this.subscribed = false;
    if (revId > this.currentRevision) {
      for (r = _i = _ref = this.currentRevision + 1; _ref <= revId ? _i <= revId : _i >= revId; r = _ref <= revId ? ++_i : --_i) {
        _ref1 = this.store.fetchTransaction(r);
        for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
          entry = _ref1[_j];
          this.executeEntry(entry);
        }
      }
    } else {
      for (r = _k = _ref2 = this.currentRevision, _ref3 = revId + 1; _k >= _ref3; r = _k += -1) {
        entries = this.store.fetchTransaction(r);
        for (i = _l = _ref4 = entries.length - 1; _l >= 0; i = _l += -1) {
          this.executeEntryInversed(entries[i]);
        }
      }
    }
    this.currentRevision = revId;
    return this.subscribed = true;
  };

  Journal.prototype.undo = function() {
    if (!this.canUndo()) {
      return;
    }
    return this.moveToRevision(this.currentRevision - 1);
  };

  Journal.prototype.canUndo = function() {
    return this.currentRevision > 0;
  };

  Journal.prototype.redo = function() {
    if (!this.canRedo()) {
      return;
    }
    return this.moveToRevision(this.currentRevision + 1);
  };

  Journal.prototype.canRedo = function() {
    return this.currentRevision < this.store.lastRevision;
  };

  Journal.prototype.toPrettyString = function(startRev, endRev) {
    var e, entry, lines, r, _i, _j, _len;
    startRev |= 0;
    endRev |= this.store.lastRevision;
    lines = [];
    for (r = _i = startRev; startRev <= endRev ? _i < endRev : _i > endRev; r = startRev <= endRev ? ++_i : --_i) {
      e = this.store.fetchTransaction(r);
      for (_j = 0, _len = e.length; _j < _len; _j++) {
        entry = e[_j];
        lines.push(entryToPrettyString(entry));
      }
    }
    return lines.join('\n');
  };

  Journal.prototype.toJSON = function(startRev, endRev) {
    var entries, entry, r, _i, _j, _len, _ref;
    startRev |= 0;
    endRev |= this.store.lastRevision;
    entries = [];
    for (r = _i = startRev; _i < endRev; r = _i += 1) {
      _ref = this.store.fetchTransaction(r);
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        entry = _ref[_j];
        entries.push(entryToPrettyString(entry));
      }
    }
    return entries;
  };

  Journal.prototype.save = function(file, success) {
    var json;
    json = JSON.stringify(this.toJSON(), null, 4);
    return require('fs').writeFile("" + file + ".json", json, "utf-8", function(err, data) {
      if (err) {
        throw err;
      }
      return success(file);
    });
  };

  return Journal;

})(EventEmitter);

exports.Journal = Journal;

exports.JournalStore = JournalStore;

exports.MemoryJournalStore = MemoryJournalStore;

});
require.register("noflo-noflo/src/lib/Utils.js", function(exports, require, module){
var clone;

clone = function(obj) {
  var flags, key, newInstance;
  if ((obj == null) || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }
  if (obj instanceof RegExp) {
    flags = '';
    if (obj.global != null) {
      flags += 'g';
    }
    if (obj.ignoreCase != null) {
      flags += 'i';
    }
    if (obj.multiline != null) {
      flags += 'm';
    }
    if (obj.sticky != null) {
      flags += 'y';
    }
    return new RegExp(obj.source, flags);
  }
  newInstance = new obj.constructor();
  for (key in obj) {
    newInstance[key] = clone(obj[key]);
  }
  return newInstance;
};

exports.clone = clone;

});
require.register("noflo-noflo/src/components/Graph.js", function(exports, require, module){
var Graph, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
  noflo = require("../../lib/NoFlo");
} else {
  noflo = require('../lib/NoFlo');
}

Graph = (function(_super) {
  __extends(Graph, _super);

  function Graph(metadata) {
    this.metadata = metadata;
    this.network = null;
    this.ready = true;
    this.started = false;
    this.baseDir = null;
    this.loader = null;
    this.inPorts = new noflo.InPorts({
      graph: {
        datatype: 'all',
        description: 'NoFlo graph definition to be used with the subgraph component',
        required: true,
        immediate: true
      },
      start: {
        datatype: 'bang',
        description: 'if attached, the network will only be started when receiving a start message',
        required: false
      }
    });
    this.outPorts = new noflo.OutPorts;
    this.inPorts.on('graph', 'data', (function(_this) {
      return function(data) {
        return _this.setGraph(data);
      };
    })(this));
    this.inPorts.on('start', 'data', (function(_this) {
      return function() {
        return _this.start();
      };
    })(this));
  }

  Graph.prototype.setGraph = function(graph) {
    this.ready = false;
    if (typeof graph === 'object') {
      if (typeof graph.addNode === 'function') {
        return this.createNetwork(graph);
      }
      noflo.graph.loadJSON(graph, (function(_this) {
        return function(instance) {
          instance.baseDir = _this.baseDir;
          return _this.createNetwork(instance);
        };
      })(this));
      return;
    }
    if (graph.substr(0, 1) !== "/" && graph.substr(1, 1) !== ":" && process && process.cwd) {
      graph = "" + (process.cwd()) + "/" + graph;
    }
    return graph = noflo.graph.loadFile(graph, (function(_this) {
      return function(instance) {
        instance.baseDir = _this.baseDir;
        return _this.createNetwork(instance);
      };
    })(this));
  };

  Graph.prototype.createNetwork = function(graph) {
    this.description = graph.properties.description || '';
    graph.componentLoader = this.loader;
    return noflo.createNetwork(graph, (function(_this) {
      return function(network) {
        _this.network = network;
        _this.emit('network', _this.network);
        return _this.network.connect(function() {
          var name, notReady, process, _ref, _ref1;
          notReady = false;
          _ref = _this.network.processes;
          for (name in _ref) {
            process = _ref[name];
            if (!_this.checkComponent(name, process)) {
              notReady = true;
            }
          }
          if (!notReady) {
            _this.setToReady();
          }
          if (((_ref1 = _this.inPorts.start) != null ? _ref1.isAttached() : void 0) && !_this.started) {
            return;
          }
          return _this.start(graph);
        });
      };
    })(this), true);
  };

  Graph.prototype.start = function(graph) {
    this.started = true;
    if (!this.network) {
      return;
    }
    this.network.sendInitials();
    if (!graph) {
      return;
    }
    return graph.on('addInitial', (function(_this) {
      return function() {
        return _this.network.sendInitials();
      };
    })(this));
  };

  Graph.prototype.checkComponent = function(name, process) {
    if (!process.component.isReady()) {
      process.component.once("ready", (function(_this) {
        return function() {
          _this.checkComponent(name, process);
          return _this.setToReady();
        };
      })(this));
      return false;
    }
    this.findEdgePorts(name, process);
    return true;
  };

  Graph.prototype.isExportedInport = function(port, nodeName, portName) {
    var exported, priv, pub, _i, _len, _ref, _ref1;
    _ref = this.network.graph.inports;
    for (pub in _ref) {
      priv = _ref[pub];
      if (!(priv.process === nodeName && priv.port === portName)) {
        continue;
      }
      return pub;
    }
    _ref1 = this.network.graph.exports;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      exported = _ref1[_i];
      if (!(exported.process === nodeName && exported.port === portName)) {
        continue;
      }
      this.network.graph.checkTransactionStart();
      this.network.graph.removeExport(exported["public"]);
      this.network.graph.addInport(exported["public"], exported.process, exported.port, exported.metadata);
      this.network.graph.checkTransactionEnd();
      return exported["public"];
    }
    if (Object.keys(this.network.graph.inports).length > 0) {
      return false;
    }
    if (port.isAttached()) {
      return false;
    }
    return (nodeName + '.' + portName).toLowerCase();
  };

  Graph.prototype.isExportedOutport = function(port, nodeName, portName) {
    var exported, priv, pub, _i, _len, _ref, _ref1;
    _ref = this.network.graph.outports;
    for (pub in _ref) {
      priv = _ref[pub];
      if (!(priv.process === nodeName && priv.port === portName)) {
        continue;
      }
      return pub;
    }
    _ref1 = this.network.graph.exports;
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      exported = _ref1[_i];
      if (!(exported.process === nodeName && exported.port === portName)) {
        continue;
      }
      this.network.graph.checkTransactionStart();
      this.network.graph.removeExport(exported["public"]);
      this.network.graph.addOutport(exported["public"], exported.process, exported.port, exported.metadata);
      this.network.graph.checkTransactionEnd();
      return exported["public"];
    }
    if (Object.keys(this.network.graph.outports).length > 0) {
      return false;
    }
    if (port.isAttached()) {
      return false;
    }
    return (nodeName + '.' + portName).toLowerCase();
  };

  Graph.prototype.setToReady = function() {
    if (typeof process !== 'undefined' && process.execPath && process.execPath.indexOf('node') !== -1) {
      return process.nextTick((function(_this) {
        return function() {
          _this.ready = true;
          return _this.emit('ready');
        };
      })(this));
    } else {
      return setTimeout((function(_this) {
        return function() {
          _this.ready = true;
          return _this.emit('ready');
        };
      })(this), 0);
    }
  };

  Graph.prototype.findEdgePorts = function(name, process) {
    var port, portName, targetPortName, _ref, _ref1;
    _ref = process.component.inPorts;
    for (portName in _ref) {
      port = _ref[portName];
      if (!port || typeof port === 'function' || !port.canAttach) {
        continue;
      }
      targetPortName = this.isExportedInport(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.inPorts.add(targetPortName, port);
    }
    _ref1 = process.component.outPorts;
    for (portName in _ref1) {
      port = _ref1[portName];
      if (!port || typeof port === 'function' || !port.canAttach) {
        continue;
      }
      targetPortName = this.isExportedOutport(port, name, portName);
      if (targetPortName === false) {
        continue;
      }
      this.outPorts.add(targetPortName, port);
    }
    return true;
  };

  Graph.prototype.isReady = function() {
    return this.ready;
  };

  Graph.prototype.isSubgraph = function() {
    return true;
  };

  Graph.prototype.shutdown = function() {
    if (!this.network) {
      return;
    }
    return this.network.stop();
  };

  return Graph;

})(noflo.Component);

exports.getComponent = function(metadata) {
  return new Graph(metadata);
};

});
require.register("noflo-noflo-core/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of core.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-core/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-core","description":"NoFlo Essentials","repo":"noflo/noflo-core","version":"0.1.0","author":{"name":"Henri Bergius","email":"henri.bergius@iki.fi"},"contributors":[{"name":"Kenneth Kan","email":"kenhkan@gmail.com"},{"name":"Ryan Shaw","email":"ryanshaw@unc.edu"}],"keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Callback.js","components/DisconnectAfterPacket.js","components/Drop.js","components/Group.js","components/Kick.js","components/Merge.js","components/Output.js","components/Repeat.js","components/RepeatAsync.js","components/Split.js","components/RunInterval.js","components/RunTimeout.js","components/MakeFunction.js","index.js"],"json":["component.json"],"noflo":{"components":{"Callback":"components/Callback.js","DisconnectAfterPacket":"components/DisconnectAfterPacket.js","Drop":"components/Drop.js","Group":"components/Group.js","Kick":"components/Kick.js","Merge":"components/Merge.js","Output":"components/Output.js","Repeat":"components/Repeat.js","RepeatAsync":"components/RepeatAsync.js","Split":"components/Split.js","RunInterval":"components/RunInterval.js","RunTimeout":"components/RunTimeout.js","MakeFunction":"components/MakeFunction.js"}}}');
});
require.register("noflo-noflo-core/components/Callback.js", function(exports, require, module){
var Callback, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

Callback = (function(_super) {
  __extends(Callback, _super);

  Callback.prototype.description = 'This component calls a given callback function for each IP it receives.  The Callback component is typically used to connect NoFlo with external Node.js code.';

  Callback.prototype.icon = 'sign-out';

  function Callback() {
    this.callback = null;
    this.inPorts = {
      "in": new noflo.Port('all'),
      callback: new noflo.Port('function')
    };
    this.outPorts = {
      error: new noflo.Port('object')
    };
    this.inPorts.callback.on('data', (function(_this) {
      return function(data) {
        if (!_.isFunction(data)) {
          _this.error('The provided callback must be a function');
          return;
        }
        return _this.callback = data;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (!_this.callback) {
          _this.error('No callback provided');
          return;
        }
        return _this.callback(data);
      };
    })(this));
  }

  Callback.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return Callback;

})(noflo.Component);

exports.getComponent = function() {
  return new Callback;
};

});
require.register("noflo-noflo-core/components/DisconnectAfterPacket.js", function(exports, require, module){
var DisconnectAfterPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DisconnectAfterPacket = (function(_super) {
  __extends(DisconnectAfterPacket, _super);

  DisconnectAfterPacket.prototype.description = 'Forwards any packets, but also sends a disconnect after each of them';

  DisconnectAfterPacket.prototype.icon = 'pause';

  function DisconnectAfterPacket() {
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        _this.outPorts.out.send(data);
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
  }

  return DisconnectAfterPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new DisconnectAfterPacket;
};

});
require.register("noflo-noflo-core/components/Drop.js", function(exports, require, module){
var Drop, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Drop = (function(_super) {
  __extends(Drop, _super);

  Drop.prototype.description = 'This component drops every packet it receives with no action';

  Drop.prototype.icon = 'trash-o';

  function Drop() {
    this.inPorts = {
      "in": new noflo.ArrayPort('all')
    };
    this.outPorts = {};
  }

  return Drop;

})(noflo.Component);

exports.getComponent = function() {
  return new Drop;
};

});
require.register("noflo-noflo-core/components/Group.js", function(exports, require, module){
var Group, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Group = (function(_super) {
  __extends(Group, _super);

  Group.prototype.description = 'Adds a set of groups around the packets received at each connection';

  Group.prototype.icon = 'tags';

  function Group() {
    this.groups = [];
    this.newGroups = [];
    this.threshold = null;
    this.inPorts = {
      "in": new noflo.ArrayPort('all'),
      group: new noflo.ArrayPort('string'),
      threshold: new noflo.Port('integer')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        var group, _i, _len, _ref, _results;
        _ref = _this.newGroups;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _results.push(_this.outPorts.out.beginGroup(group));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var group, _i, _len, _ref;
        _ref = _this.newGroups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.endGroup();
        }
        _this.outPorts.out.disconnect();
        return _this.groups = [];
      };
    })(this));
    this.inPorts.group.on('data', (function(_this) {
      return function(data) {
        var diff;
        if (_this.threshold) {
          diff = _this.newGroups.length - _this.threshold + 1;
          if (diff > 0) {
            _this.newGroups = _this.newGroups.slice(diff);
          }
        }
        return _this.newGroups.push(data);
      };
    })(this));
    this.inPorts.threshold.on('data', (function(_this) {
      return function(threshold) {
        _this.threshold = threshold;
      };
    })(this));
  }

  return Group;

})(noflo.Component);

exports.getComponent = function() {
  return new Group;
};

});
require.register("noflo-noflo-core/components/Kick.js", function(exports, require, module){
var Kick, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Kick = (function(_super) {
  __extends(Kick, _super);

  Kick.prototype.description = 'This component generates a single packet and sends it to the output port. Mostly usable for debugging, but can also be useful for starting up networks.';

  Kick.prototype.icon = 'share';

  function Kick() {
    this.data = {
      packet: null,
      group: []
    };
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('bang'),
      data: new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function() {
        return _this.data.group = _this.groups.slice(0);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.sendKick(_this.data);
        return _this.groups = [];
      };
    })(this));
    this.inPorts.data.on('data', (function(_this) {
      return function(data) {
        return _this.data.packet = data;
      };
    })(this));
  }

  Kick.prototype.sendKick = function(kick) {
    var group, _i, _j, _len, _len1, _ref, _ref1;
    _ref = kick.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(kick.packet);
    _ref1 = kick.group;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      this.outPorts.out.endGroup();
    }
    return this.outPorts.out.disconnect();
  };

  return Kick;

})(noflo.Component);

exports.getComponent = function() {
  return new Kick;
};

});
require.register("noflo-noflo-core/components/Merge.js", function(exports, require, module){
var Merge, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Merge = (function(_super) {
  __extends(Merge, _super);

  Merge.prototype.description = 'This component receives data on multiple input ports and sends the same data out to the connected output port';

  Merge.prototype.icon = 'compress';

  function Merge() {
    this.inPorts = {
      "in": new noflo.ArrayPort('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.outPorts.out.connect();
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var socket, _i, _len, _ref;
        _ref = _this.inPorts["in"].sockets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          socket = _ref[_i];
          if (socket.connected) {
            return;
          }
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Merge;

})(noflo.Component);

exports.getComponent = function() {
  return new Merge;
};

});
require.register("noflo-noflo-core/components/Output.js", function(exports, require, module){
var Output, noflo, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

if (!noflo.isBrowser()) {
  util = require('util');
} else {
  util = {
    inspect: function(data) {
      return data;
    }
  };
}

Output = (function(_super) {
  __extends(Output, _super);

  Output.prototype.description = 'This component receives input on a single inport, and sends the data items directly to console.log';

  Output.prototype.icon = 'bug';

  function Output() {
    this.options = null;
    this.inPorts = {
      "in": new noflo.ArrayPort('all'),
      options: new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        _this.log(data);
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
    this.inPorts.options.on('data', (function(_this) {
      return function(data) {
        return _this.setOptions(data);
      };
    })(this));
  }

  Output.prototype.setOptions = function(options) {
    var key, value, _results;
    if (typeof options !== 'object') {
      throw new Error('Options is not an object');
    }
    if (this.options == null) {
      this.options = {};
    }
    _results = [];
    for (key in options) {
      if (!__hasProp.call(options, key)) continue;
      value = options[key];
      _results.push(this.options[key] = value);
    }
    return _results;
  };

  Output.prototype.log = function(data) {
    if (this.options != null) {
      return console.log(util.inspect(data, this.options.showHidden, this.options.depth, this.options.colors));
    } else {
      return console.log(data);
    }
  };

  return Output;

})(noflo.Component);

exports.getComponent = function() {
  return new Output();
};

});
require.register("noflo-noflo-core/components/Repeat.js", function(exports, require, module){
var Repeat, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Repeat = (function(_super) {
  __extends(Repeat, _super);

  Repeat.prototype.description = 'Forwards packets and metadata in the same way it receives them';

  Repeat.prototype.icon = 'forward';

  function Repeat() {
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.outPorts.out.connect();
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Repeat;

})(noflo.Component);

exports.getComponent = function() {
  return new Repeat();
};

});
require.register("noflo-noflo-core/components/RepeatAsync.js", function(exports, require, module){
var RepeatAsync, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RepeatAsync = (function(_super) {
  __extends(RepeatAsync, _super);

  RepeatAsync.prototype.description = "Like 'Repeat', except repeat on next tick";

  RepeatAsync.prototype.icon = 'step-forward';

  function RepeatAsync() {
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var groups, later;
        groups = _this.groups;
        later = function() {
          var group, _i, _j, _len, _len1;
          for (_i = 0, _len = groups.length; _i < _len; _i++) {
            group = groups[_i];
            _this.outPorts.out.beginGroup(group);
          }
          _this.outPorts.out.send(data);
          for (_j = 0, _len1 = groups.length; _j < _len1; _j++) {
            group = groups[_j];
            _this.outPorts.out.endGroup();
          }
          return _this.outPorts.out.disconnect();
        };
        return setTimeout(later, 0);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.groups = [];
      };
    })(this));
  }

  return RepeatAsync;

})(noflo.Component);

exports.getComponent = function() {
  return new RepeatAsync;
};

});
require.register("noflo-noflo-core/components/Split.js", function(exports, require, module){
var Split, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Split = (function(_super) {
  __extends(Split, _super);

  Split.prototype.description = 'This component receives data on a single input port and sends the same data out to all connected output ports';

  Split.prototype.icon = 'expand';

  function Split() {
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.outPorts.out.connect();
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Split;

})(noflo.Component);

exports.getComponent = function() {
  return new Split;
};

});
require.register("noflo-noflo-core/components/RunInterval.js", function(exports, require, module){
var RunInterval, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RunInterval = (function(_super) {
  __extends(RunInterval, _super);

  RunInterval.prototype.description = 'Send a packet at the given interval';

  RunInterval.prototype.icon = 'clock-o';

  function RunInterval() {
    this.timer = null;
    this.interval = null;
    this.inPorts = {
      interval: new noflo.Port('number'),
      start: new noflo.Port('bang'),
      stop: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('bang')
    };
    this.inPorts.interval.on('data', (function(_this) {
      return function(interval) {
        _this.interval = interval;
        if (_this.timer != null) {
          clearInterval(_this.timer);
          return _this.start();
        }
      };
    })(this));
    this.inPorts.start.on('data', (function(_this) {
      return function() {
        if (_this.timer != null) {
          clearInterval(_this.timer);
        }
        _this.outPorts.out.connect();
        return _this.start();
      };
    })(this));
    this.inPorts.stop.on('data', (function(_this) {
      return function() {
        if (!_this.timer) {
          return;
        }
        clearInterval(_this.timer);
        _this.timer = null;
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  RunInterval.prototype.start = function() {
    var out;
    out = this.outPorts.out;
    return this.timer = setInterval(function() {
      return out.send(true);
    }, this.interval);
  };

  RunInterval.prototype.shutdown = function() {
    if (this.timer != null) {
      return clearInterval(this.timer);
    }
  };

  return RunInterval;

})(noflo.Component);

exports.getComponent = function() {
  return new RunInterval;
};

});
require.register("noflo-noflo-core/components/RunTimeout.js", function(exports, require, module){
var RunTimeout, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

RunTimeout = (function(_super) {
  __extends(RunTimeout, _super);

  RunTimeout.prototype.description = 'Send a packet after the given time in ms';

  RunTimeout.prototype.icon = 'clock-o';

  function RunTimeout() {
    this.timer = null;
    this.time = null;
    this.inPorts = {
      time: new noflo.Port('number'),
      start: new noflo.Port('bang'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('bang')
    };
    this.inPorts.time.on('data', (function(_this) {
      return function(time) {
        _this.time = time;
        if (_this.timer != null) {
          clearTimeout(_this.timer);
          return _this.timer = setTimeout(function() {
            return _this.outPorts.out.send(true);
          }, _this.time);
        }
      };
    })(this));
    this.inPorts.start.on('data', (function(_this) {
      return function() {
        if (_this.timer != null) {
          clearTimeout(_this.timer);
        }
        _this.outPorts.out.connect();
        return _this.timer = setTimeout(function() {
          _this.outPorts.out.send(true);
          return _this.outPorts.out.disconnect();
        }, _this.time);
      };
    })(this));
    this.inPorts.clear.on('data', (function(_this) {
      return function() {
        if (!_this.timer) {
          return;
        }
        clearTimeout(_this.timer);
        _this.timer = null;
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  RunTimeout.prototype.shutdown = function() {
    if (this.timer != null) {
      return clearTimeout(this.timer);
    }
  };

  return RunTimeout;

})(noflo.Component);

exports.getComponent = function() {
  return new RunTimeout;
};

});
require.register("noflo-noflo-core/components/MakeFunction.js", function(exports, require, module){
var MakeFunction, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MakeFunction = (function(_super) {
  __extends(MakeFunction, _super);

  MakeFunction.prototype.description = 'Evaluates a function each time data hits the "in" port and sends the return value to "out". Within the function "x" will be the variable from the in port. For example, to make a ^2 function input "return x*x;" to the function port.';

  MakeFunction.prototype.icon = 'code';

  function MakeFunction() {
    this.f = null;
    this.inPorts = {
      "in": new noflo.Port('all'),
      "function": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      "function": new noflo.Port('function'),
      error: new noflo.Port('object')
    };
    this.inPorts["function"].on('data', (function(_this) {
      return function(data) {
        var error;
        if (typeof data === "function") {
          _this.f = data;
        } else {
          try {
            _this.f = Function("x", data);
          } catch (_error) {
            error = _error;
            _this.error('Error creating function: ' + data);
          }
        }
        if (_this.f && _this.outPorts["function"].isAttached()) {
          return _this.outPorts["function"].send(_this.f);
        }
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var error;
        if (!_this.f) {
          _this.error('No function defined');
          return;
        }
        try {
          return _this.outPorts.out.send(_this.f(data));
        } catch (_error) {
          error = _error;
          return _this.error('Error evaluating function.');
        }
      };
    })(this));
  }

  MakeFunction.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return MakeFunction;

})(noflo.Component);

exports.getComponent = function() {
  return new MakeFunction;
};

});
require.register("noflo-noflo-strings/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("noflo-noflo-strings/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-strings","description":"String Utilities for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-strings","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/CompileString.js","components/Filter.js","components/SendString.js","components/SplitStr.js","components/StringTemplate.js","components/Replace.js","components/Jsonify.js","components/ParseJson.js","index.js"],"json":["component.json"],"noflo":{"icon":"font","components":{"CompileString":"components/CompileString.js","Filter":"components/Filter.js","SendString":"components/SendString.js","SplitStr":"components/SplitStr.js","StringTemplate":"components/StringTemplate.js","Replace":"components/Replace.js","Jsonify":"components/Jsonify.js","ParseJson":"components/ParseJson.js"}}}');
});
require.register("noflo-noflo-strings/components/CompileString.js", function(exports, require, module){
var CompileString, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CompileString = (function(_super) {
  __extends(CompileString, _super);

  function CompileString() {
    this.delimiter = "\n";
    this.data = [];
    this.onGroupEnd = true;
    this.inPorts = {
      delimiter: new noflo.Port,
      "in": new noflo.ArrayPort,
      ongroup: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.delimiter.on('data', (function(_this) {
      return function(data) {
        return _this.delimiter = data;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.data.push(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        if (_this.data.length && _this.onGroupEnd) {
          _this.outPorts.out.send(_this.data.join(_this.delimiter));
        }
        _this.outPorts.out.endGroup();
        return _this.data = [];
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.data.length) {
          _this.outPorts.out.send(_this.data.join(_this.delimiter));
        }
        _this.data = [];
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.ongroup.on("data", (function(_this) {
      return function(data) {
        if (typeof data === 'string') {
          if (data.toLowerCase() === 'false') {
            _this.onGroupEnd = false;
            return;
          }
          _this.onGroupEnd = true;
          return;
        }
        return _this.onGroupEnd = data;
      };
    })(this));
  }

  return CompileString;

})(noflo.Component);

exports.getComponent = function() {
  return new CompileString;
};

});
require.register("noflo-noflo-strings/components/Filter.js", function(exports, require, module){
var Filter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Filter = (function(_super) {
  __extends(Filter, _super);

  Filter.prototype.description = "filters an IP which is a string using a regex";

  function Filter() {
    this.regex = null;
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string'),
      missed: new noflo.Port('string')
    };
    this.inPorts.pattern.on("data", (function(_this) {
      return function(data) {
        return _this.regex = new RegExp(data);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (typeof data !== 'string') {
          data = data.toString();
        }
        if ((_this.regex != null) && ((data != null ? typeof data.match === "function" ? data.match(_this.regex) : void 0 : void 0) != null)) {
          _this.outPorts.out.send(data);
          return;
        }
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.disconnect();
        }
      };
    })(this));
  }

  return Filter;

})(noflo.Component);

exports.getComponent = function() {
  return new Filter;
};

});
require.register("noflo-noflo-strings/components/SendString.js", function(exports, require, module){
var SendString, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SendString = (function(_super) {
  __extends(SendString, _super);

  function SendString() {
    this.data = {
      string: null,
      group: []
    };
    this.groups = [];
    this.inPorts = {
      string: new noflo.Port('string'),
      "in": new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.string.on('data', (function(_this) {
      return function(data) {
        return _this.data.string = data;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        _this.data.group = _this.groups.slice(0);
        return _this.sendString(_this.data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SendString.prototype.sendString = function(data) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = data.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(data.string);
    _ref1 = data.group;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return SendString;

})(noflo.Component);

exports.getComponent = function() {
  return new SendString;
};

});
require.register("noflo-noflo-strings/components/SplitStr.js", function(exports, require, module){
var SplitStr, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitStr = (function(_super) {
  __extends(SplitStr, _super);

  SplitStr.prototype.description = ' The SplitStr component receives a string in the in port, splits it by string specified in the delimiter port, and send each part as a separate packet to the out port';

  function SplitStr() {
    this.delimiterString = "\n";
    this.strings = [];
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port(),
      delimiter: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.delimiter.on('data', (function(_this) {
      return function(data) {
        var first, last;
        first = data.substr(0, 1);
        last = data.substr(data.length - 1, 1);
        if (first === '/' && last === '/' && data.length > 1) {
          data = new RegExp(data.substr(1, data.length - 2));
        }
        return _this.delimiterString = data;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.strings.push(data);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function(data) {
        var group, _i, _j, _len, _len1, _ref, _ref1;
        if (_this.strings.length === 0) {
          return _this.outPorts.out.disconnect();
        }
        _ref = _this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.beginGroup(group);
        }
        _this.strings.join(_this.delimiterString).split(_this.delimiterString).forEach(function(line) {
          return _this.outPorts.out.send(line);
        });
        _ref1 = _this.groups;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          group = _ref1[_j];
          _this.outPorts.out.endGroup();
        }
        _this.outPorts.out.disconnect();
        _this.strings = [];
        return _this.groups = [];
      };
    })(this));
  }

  return SplitStr;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitStr();
};

});
require.register("noflo-noflo-strings/components/StringTemplate.js", function(exports, require, module){
var StringTemplate, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

StringTemplate = (function(_super) {
  __extends(StringTemplate, _super);

  function StringTemplate() {
    this.template = null;
    this.inPorts = {
      template: new noflo.Port('string'),
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.template.on('data', (function(_this) {
      return function(data) {
        return _this.template = _.template(data);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(_this.template(data));
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return StringTemplate;

})(noflo.Component);

exports.getComponent = function() {
  return new StringTemplate;
};

});
require.register("noflo-noflo-strings/components/Replace.js", function(exports, require, module){
var Replace, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Replace = (function(_super) {
  __extends(Replace, _super);

  Replace.prototype.description = 'Given a fixed pattern and its replacement, replace all occurrences in the incoming template.';

  function Replace() {
    this.pattern = null;
    this.replacement = '';
    this.inPorts = {
      "in": new noflo.Port('string'),
      pattern: new noflo.Port('string'),
      replacement: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.pattern.on('data', (function(_this) {
      return function(data) {
        return _this.pattern = new RegExp(data, 'g');
      };
    })(this));
    this.inPorts.replacement.on('data', (function(_this) {
      return function(data) {
        return _this.replacement = data.replace('\\\\n', "\n");
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var string;
        string = data;
        if (_this.pattern != null) {
          string = ("" + data).replace(_this.pattern, _this.replacement);
        }
        return _this.outPorts.out.send(string);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Replace;

})(noflo.Component);

exports.getComponent = function() {
  return new Replace;
};

});
require.register("noflo-noflo-strings/components/Jsonify.js", function(exports, require, module){
var Jsonify, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

Jsonify = (function(_super) {
  __extends(Jsonify, _super);

  Jsonify.prototype.description = "JSONify all incoming, unless a raw flag is set to exclude data packets that are pure strings";

  function Jsonify() {
    this.raw = false;
    this.inPorts = {
      "in": new noflo.Port('object'),
      raw: new noflo.Port('boolean')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts.raw.on('data', (function(_this) {
      return function(raw) {
        return _this.raw = String(raw) === 'true';
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.raw && _.isString(data)) {
          _this.outPorts.out.send(data);
          return;
        }
        return _this.outPorts.out.send(JSON.stringify(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Jsonify;

})(noflo.Component);

exports.getComponent = function() {
  return new Jsonify;
};

});
require.register("noflo-noflo-strings/components/ParseJson.js", function(exports, require, module){
var ParseJson, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

ParseJson = (function(_super) {
  __extends(ParseJson, _super);

  function ParseJson() {
    this["try"] = false;
    this.inPorts = {
      "in": new noflo.Port(),
      "try": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["try"].on("data", (function(_this) {
      return function(data) {
        if (data === "true") {
          return _this["try"] = true;
        }
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var e;
        try {
          data = JSON.parse(data);
        } catch (_error) {
          e = _error;
          if (!_this["try"]) {
            data = JSON.parse(data);
          }
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return ParseJson;

})(noflo.Component);

exports.getComponent = function() {
  return new ParseJson;
};

});
require.register("noflo-noflo-packets/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of packets.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-packets/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-packets","description":"Packet Utilities for NoFlo","version":"0.1.4","author":"Kenneth Kan <kenhkan@gmail.com>","repo":"kenhkan/packets","keywords":[],"dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/CountPackets.js","components/Unzip.js","components/Defaults.js","components/DoNotDisconnect.js","components/DisconnectAfter.js","components/OnlyDisconnect.js","components/SplitPacket.js","components/Range.js","components/Flatten.js","components/Compact.js","components/Zip.js","components/SendWith.js","components/FilterPackets.js","components/FilterByValue.js","components/FilterByPosition.js","components/FilterPacket.js","components/UniquePacket.js","components/GroupByPacket.js","components/LastPacket.js","components/Counter.js","index.js"],"json":["component.json"],"noflo":{"icon":"dropbox","components":{"CountPackets":"components/CountPackets.js","Unzip":"components/Unzip.js","Defaults":"components/Defaults.js","DoNotDisconnect":"components/DoNotDisconnect.js","DisconnectAfter":"components/DisconnectAfter.js","OnlyDisconnect":"components/OnlyDisconnect.js","SplitPacket":"components/SplitPacket.js","Range":"components/Range.js","Flatten":"components/Flatten.js","Compact":"components/Compact.js","Zip":"components/Zip.js","SendWith":"components/SendWith.js","FilterPackets":"components/FilterPackets.js","FilterByValue":"components/FilterByValue.js","FilterByPosition":"components/FilterByPosition.js","FilterPacket":"components/FilterPacket.js","UniquePacket":"components/UniquePacket.js","GroupByPacket":"components/GroupByPacket.js","LastPacket":"components/LastPacket.js","Counter":"components/Counter.js"}}}');
});
require.register("noflo-noflo-packets/components/CountPackets.js", function(exports, require, module){
var CountPackets, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

CountPackets = (function(_super) {
  __extends(CountPackets, _super);

  CountPackets.prototype.description = "count number of data IPs";

  CountPackets.prototype.icon = 'sort-numeric-asc';

  function CountPackets() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      count: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        var count;
        _this.counts = [0];
        return count = _.last(_this.counts);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        _this.counts.push(0);
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var count;
        _this.counts[_this.counts.length - 1]++;
        count = _.last(_this.counts);
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        var count;
        count = _.last(_this.counts);
        _this.outPorts.count.send(count);
        _this.counts.pop();
        return _this.outPorts.out.endGroup(group);
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var count;
        count = _.last(_this.counts);
        _this.outPorts.count.send(count);
        _this.outPorts.count.disconnect();
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return CountPackets;

})(noflo.Component);

exports.getComponent = function() {
  return new CountPackets;
};

});
require.register("noflo-noflo-packets/components/Unzip.js", function(exports, require, module){
var Unzip, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Unzip = (function(_super) {
  __extends(Unzip, _super);

  Unzip.prototype.description = "Send packets whose position upon receipt is even to the EVEN port, otherwise the ODD port.";

  function Unzip() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      odd: new noflo.Port,
      even: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function(group) {
        return _this.count = 0;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var port;
        _this.count++;
        port = _this.count % 2 === 0 ? "even" : "odd";
        return _this.outPorts[port].send(data);
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.odd.disconnect();
        return _this.outPorts.even.disconnect();
      };
    })(this));
  }

  return Unzip;

})(noflo.Component);

exports.getComponent = function() {
  return new Unzip;
};

});
require.register("noflo-noflo-packets/components/Defaults.js", function(exports, require, module){
var Defaults, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Defaults = (function(_super) {
  __extends(Defaults, _super);

  Defaults.prototype.description = "if incoming is short of the length of the default packets, send the default packets.";

  function Defaults() {
    this.defaults = [];
    this.inPorts = {
      "in": new noflo.Port,
      "default": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["default"].on("connect", (function(_this) {
      return function() {
        return _this.defaults = [];
      };
    })(this));
    this.inPorts["default"].on("data", (function(_this) {
      return function(data) {
        return _this.defaults.push(data);
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        return _this.counts = [0];
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        _this.counts.push(0);
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var count;
        count = _.last(_this.counts);
        if (data == null) {
          data = _this.defaults[count];
        }
        _this.outPorts.out.send(data);
        return _this.counts[_this.counts.length - 1]++;
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        _this.padPackets(_.last(_this.counts));
        _this.counts.pop();
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.padPackets(_this.counts[0]);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  Defaults.prototype.padPackets = function(count) {
    var _results;
    _results = [];
    while (count < this.defaults.length) {
      this.outPorts.out.send(this.defaults[count]);
      _results.push(count++);
    }
    return _results;
  };

  return Defaults;

})(noflo.Component);

exports.getComponent = function() {
  return new Defaults;
};

});
require.register("noflo-noflo-packets/components/DoNotDisconnect.js", function(exports, require, module){
var DoNotDisconnect, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

DoNotDisconnect = (function(_super) {
  __extends(DoNotDisconnect, _super);

  DoNotDisconnect.prototype.description = "forwards everything but never disconnect";

  function DoNotDisconnect() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
  }

  return DoNotDisconnect;

})(noflo.Component);

exports.getComponent = function() {
  return new DoNotDisconnect;
};

});
require.register("noflo-noflo-packets/components/DisconnectAfter.js", function(exports, require, module){
var DisconnectAfter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DisconnectAfter = (function(_super) {
  __extends(DisconnectAfter, _super);

  DisconnectAfter.prototype.description = 'Pass a disconnect through after a certain number of packets has been passed';

  function DisconnectAfter() {
    this.count = 0;
    this.number = 1;
    this.allowDisconnect = false;
    this.inPorts = {
      "in": new noflo.Port('all'),
      packets: new noflo.Port('int')
    };
    this.outPorts = {
      out: new noflo.Port('out'),
      count: new noflo.Port('int')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        _this.outPorts.out.send(data);
        _this.count++;
        if (_this.count >= _this.number) {
          _this.allowDisconnect = true;
        }
        if (!_this.outPorts.count.isAttached()) {
          return;
        }
        _this.outPorts.count.beginGroup(_this.number);
        _this.outPorts.count.send(_this.count);
        return _this.outPorts.count.endGroup();
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.allowDisconnect) {
          return;
        }
        _this.outPorts.out.disconnect();
        if (_this.outPorts.count.isAttached()) {
          _this.outPorts.count.disconnect();
        }
        _this.count = 0;
        return _this.allowDisconnect = false;
      };
    })(this));
    this.inPorts.packets.on('data', (function(_this) {
      return function(number) {
        _this.number = number;
        return _this.count = 0;
      };
    })(this));
  }

  return DisconnectAfter;

})(noflo.Component);

exports.getComponent = function() {
  return new DisconnectAfter;
};

});
require.register("noflo-noflo-packets/components/OnlyDisconnect.js", function(exports, require, module){
var OnlyDisconnect, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

OnlyDisconnect = (function(_super) {
  __extends(OnlyDisconnect, _super);

  OnlyDisconnect.prototype.description = "the inverse of DoNotDisconnect";

  function OnlyDisconnect() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.out.connect();
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return OnlyDisconnect;

})(noflo.Component);

exports.getComponent = function() {
  return new OnlyDisconnect;
};

});
require.register("noflo-noflo-packets/components/SplitPacket.js", function(exports, require, module){
var SplitPacket, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

SplitPacket = (function(_super) {
  __extends(SplitPacket, _super);

  SplitPacket.prototype.description = "splits each incoming packet into its own connection";

  function SplitPacket() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        return _this.groups = [];
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var group, _i, _j, _len, _len1, _ref, _ref1;
        _this.outPorts.out.connect();
        _ref = _this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.beginGroup(group);
        }
        _this.outPorts.out.send(data);
        _ref1 = _this.groups;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          group = _ref1[_j];
          _this.outPorts.out.endGroup();
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.groups.pop();
      };
    })(this));
  }

  return SplitPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitPacket;
};

});
require.register("noflo-noflo-packets/components/Range.js", function(exports, require, module){
var Range, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Range = (function(_super) {
  __extends(Range, _super);

  Range.prototype.description = "only forward a specified number of packets in a connection";

  function Range() {
    this.start = -Infinity;
    this.end = +Infinity;
    this.length = +Infinity;
    this.inPorts = {
      "in": new noflo.Port,
      start: new noflo.Port,
      end: new noflo.Port,
      length: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.start.on("data", (function(_this) {
      return function(start) {
        return _this.start = parseInt(start);
      };
    })(this));
    this.inPorts.end.on("data", (function(_this) {
      return function(end) {
        return _this.end = parseInt(end);
      };
    })(this));
    this.inPorts.length.on("data", (function(_this) {
      return function(length) {
        return _this.length = parseInt(length);
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.totalCount = 0;
        return _this.sentCount = 0;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        _this.totalCount++;
        if (_this.totalCount > _this.start && _this.totalCount < _this.end && _this.sentCount < _this.length) {
          _this.sentCount++;
          return _this.outPorts.out.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Range;

})(noflo.Component);

exports.getComponent = function() {
  return new Range;
};

});
require.register("noflo-noflo-packets/components/Flatten.js", function(exports, require, module){
var Flatten, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Flatten = (function(_super) {
  __extends(Flatten, _super);

  Flatten.prototype.description = "Flatten the IP structure but preserve all groups (i.e. all groups are at the top level)";

  function Flatten() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.groups = [];
        return _this.cache = [];
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        var loc;
        loc = _this.locate();
        loc[group] = [];
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var loc;
        loc = _this.locate();
        return loc.push(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var nodes, packets, _ref;
        _ref = _this.flatten(_this.cache), packets = _ref.packets, nodes = _ref.nodes;
        _this.flush(_.extend(packets, nodes));
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  Flatten.prototype.locate = function() {
    return _.reduce(this.groups, (function(loc, group) {
      return loc[group];
    }), this.cache);
  };

  Flatten.prototype.flatten = function(node) {
    var group, groups, nodes, packets, subnodes, _i, _len, _ref;
    groups = this.getNonArrayKeys(node);
    if (groups.length === 0) {
      return {
        packets: node,
        nodes: {}
      };
    } else {
      subnodes = {};
      for (_i = 0, _len = groups.length; _i < _len; _i++) {
        group = groups[_i];
        _ref = this.flatten(node[group]), packets = _ref.packets, nodes = _ref.nodes;
        delete node[group];
        subnodes[group] = packets;
        _.extend(subnodes, nodes);
      }
      return {
        packets: node,
        nodes: subnodes
      };
    }
  };

  Flatten.prototype.getNonArrayKeys = function(node) {
    return _.compact(_.filter(_.keys(node), function(key) {
      return isNaN(parseInt(key));
    }));
  };

  Flatten.prototype.flush = function(node) {
    var group, packet, _i, _j, _len, _len1, _ref, _results;
    for (_i = 0, _len = node.length; _i < _len; _i++) {
      packet = node[_i];
      this.outPorts.out.send(packet);
    }
    _ref = this.getNonArrayKeys(node);
    _results = [];
    for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
      group = _ref[_j];
      this.outPorts.out.beginGroup(group);
      this.flush(node[group]);
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return Flatten;

})(noflo.Component);

exports.getComponent = function() {
  return new Flatten;
};

});
require.register("noflo-noflo-packets/components/Compact.js", function(exports, require, module){
var Compact, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Compact = (function(_super) {
  __extends(Compact, _super);

  Compact.prototype.description = "Remove null";

  function Compact() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (data == null) {
          return;
        }
        if (data.length === 0) {
          return;
        }
        if (_.isObject(data) && _.isEmpty(data)) {
          return;
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Compact;

})(noflo.Component);

exports.getComponent = function() {
  return new Compact;
};

});
require.register("noflo-noflo-packets/components/Zip.js", function(exports, require, module){
var Zip, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Zip = (function(_super) {
  __extends(Zip, _super);

  Zip.prototype.description = "zip through multiple IPs and output a series of zipped IPs just like how _.zip() works in Underscore.js";

  function Zip() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function(group) {
        return _this.packets = [];
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (_.isArray(data)) {
          return _this.packets.push(data);
        }
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        if (_.isEmpty(_this.packets)) {
          _this.outPorts.out.send([]);
        } else {
          _this.outPorts.out.send(_.zip.apply(_, _this.packets));
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Zip;

})(noflo.Component);

exports.getComponent = function() {
  return new Zip;
};

});
require.register("noflo-noflo-packets/components/SendWith.js", function(exports, require, module){
var SendWith, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

SendWith = (function(_super) {
  __extends(SendWith, _super);

  SendWith.prototype.description = "Always send the specified packets with incoming packets.";

  function SendWith() {
    this["with"] = [];
    this.inPorts = {
      "in": new noflo.Port,
      "with": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["with"].on("connect", (function(_this) {
      return function() {
        return _this["with"] = [];
      };
    })(this));
    this.inPorts["with"].on("data", (function(_this) {
      return function(data) {
        return _this["with"].push(data);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var packet, _i, _len, _ref;
        _ref = _this["with"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          packet = _ref[_i];
          _this.outPorts.out.send(packet);
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return SendWith;

})(noflo.Component);

exports.getComponent = function() {
  return new SendWith;
};

});
require.register("noflo-noflo-packets/components/FilterPackets.js", function(exports, require, module){
var FilterPackets, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

FilterPackets = (function(_super) {
  __extends(FilterPackets, _super);

  FilterPackets.prototype.description = "Filter packets matching some RegExp strings";

  function FilterPackets() {
    this.regexps = [];
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      missed: new noflo.Port,
      passthru: new noflo.Port
    };
    this.inPorts.regexp.on("connect", (function(_this) {
      return function() {
        return _this.regexps = [];
      };
    })(this));
    this.inPorts.regexp.on("data", (function(_this) {
      return function(regexp) {
        return _this.regexps.push(new RegExp(regexp));
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (_.any(_this.regexps, (function(regexp) {
          return data.match(regexp);
        }))) {
          _this.outPorts.out.send(data);
        } else {
          _this.outPorts.missed.send(data);
        }
        if (_this.outPorts.passthru.isAttached()) {
          return _this.outPorts.passthru.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        _this.outPorts.missed.disconnect();
        if (_this.outPorts.passthru.isAttached()) {
          return _this.outPorts.passthru.disconnect();
        }
      };
    })(this));
  }

  return FilterPackets;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPackets;
};

});
require.register("noflo-noflo-packets/components/FilterByValue.js", function(exports, require, module){
var FilterByValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

FilterByValue = (function(_super) {
  __extends(FilterByValue, _super);

  FilterByValue.prototype.description = "Filter packets based on their value";

  function FilterByValue() {
    this.filterValue = null;
    this.inPorts = {
      "in": new noflo.Port,
      filtervalue: new noflo.Port
    };
    this.outPorts = {
      lower: new noflo.Port,
      higher: new noflo.Port,
      equal: new noflo.Port
    };
    this.inPorts.filtervalue.on('data', (function(_this) {
      return function(data) {
        return _this.filterValue = data;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (data < _this.filterValue) {
          return _this.outPorts.lower.send(data);
        } else if (data > _this.filterValue) {
          return _this.outPorts.higher.send(data);
        } else if (data === _this.filterValue) {
          return _this.outPorts.equal.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.outPorts.lower.isConnected()) {
          _this.outPorts.lower.disconnect();
        }
        if (_this.outPorts.higher.isConnected()) {
          _this.outPorts.higher.disconnect();
        }
        if (_this.outPorts.equal.isConnected()) {
          return _this.outPorts.equal.disconnect();
        }
      };
    })(this));
  }

  return FilterByValue;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByValue;
};

});
require.register("noflo-noflo-packets/components/FilterByPosition.js", function(exports, require, module){
var FilterByPosition, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

FilterByPosition = (function(_super) {
  __extends(FilterByPosition, _super);

  FilterByPosition.prototype.description = "Filter packets based on their positions";

  function FilterByPosition() {
    this.filters = [];
    this.inPorts = {
      "in": new noflo.Port,
      filter: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.filter.on("connect", (function(_this) {
      return function() {
        return _this.filters = [];
      };
    })(this));
    this.inPorts.filter.on("data", (function(_this) {
      return function(filter) {
        return _this.filters.push(filter);
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        return _this.count = 0;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (_this.filters[_this.count]) {
          _this.outPorts.out.send(data);
        }
        return _this.count++;
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return FilterByPosition;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByPosition;
};

});
require.register("noflo-noflo-packets/components/FilterPacket.js", function(exports, require, module){
var FilterPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FilterPacket = (function(_super) {
  __extends(FilterPacket, _super);

  function FilterPacket() {
    this.regexps = [];
    this.inPorts = {
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      missed: new noflo.Port()
    };
    this.inPorts.regexp.on('data', (function(_this) {
      return function(data) {
        return _this.regexps.push(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.regexps.length) {
          return _this.filterData(data);
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        return _this.outPorts.missed.disconnect();
      };
    })(this));
  }

  FilterPacket.prototype.filterData = function(data) {
    var expression, match, regexp, _i, _len, _ref;
    match = false;
    _ref = this.regexps;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      expression = _ref[_i];
      regexp = new RegExp(expression);
      if (!regexp.exec(data)) {
        continue;
      }
      match = true;
    }
    if (!match) {
      if (this.outPorts.missed.isAttached()) {
        this.outPorts.missed.send(data);
      }
      return;
    }
    return this.outPorts.out.send(data);
  };

  return FilterPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPacket;
};

});
require.register("noflo-noflo-packets/components/UniquePacket.js", function(exports, require, module){
var UniquePacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

UniquePacket = (function(_super) {
  __extends(UniquePacket, _super);

  function UniquePacket() {
    this.seen = [];
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('all'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      duplicate: new noflo.Port('all')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var group, _i, _j, _len, _len1, _ref, _ref1, _results;
        if (!_this.unique(data)) {
          if (!_this.outPorts.duplicate.isAttached()) {
            return;
          }
          _this.outPorts.duplicate.send(data);
          return;
        }
        _ref = _this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.beginGroup(group);
        }
        _this.outPorts.out.send(data);
        _ref1 = _this.groups;
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          group = _ref1[_j];
          _results.push(_this.outPorts.out.endGroup());
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        if (!_this.outPorts.duplicate.isAttached()) {
          return;
        }
        return _this.outPorts.duplicate.disconnect();
      };
    })(this));
    this.inPorts.clear.on('data', (function(_this) {
      return function() {
        _this.seen = [];
        return _this.groups = [];
      };
    })(this));
  }

  UniquePacket.prototype.unique = function(packet) {
    if (this.seen.indexOf(packet) !== -1) {
      return false;
    }
    this.seen.push(packet);
    return true;
  };

  return UniquePacket;

})(noflo.Component);

exports.getComponent = function() {
  return new UniquePacket;
};

});
require.register("noflo-noflo-packets/components/GroupByPacket.js", function(exports, require, module){
var GroupByPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GroupByPacket = (function(_super) {
  __extends(GroupByPacket, _super);

  function GroupByPacket() {
    this.packets = 0;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        _this.outPorts.out.beginGroup(group);
        return _this.packets = 0;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        _this.outPorts.out.beginGroup(_this.packets);
        _this.outPorts.out.send(data);
        _this.outPorts.out.endGroup();
        return _this.packets++;
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.packets = 0;
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return GroupByPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupByPacket;
};

});
require.register("noflo-noflo-packets/components/LastPacket.js", function(exports, require, module){
var LastPacket, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

LastPacket = (function(_super) {
  __extends(LastPacket, _super);

  function LastPacket() {
    this.packets = null;
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.packets = [];
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.packets.push(data);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.packets.length === 0) {
          return;
        }
        _this.outPorts.out.send(_this.packets.pop());
        _this.outPorts.out.disconnect();
        return _this.packets = null;
      };
    })(this));
  }

  return LastPacket;

})(noflo.Component);

exports.getComponent = function() {
  return new LastPacket;
};

});
require.register("noflo-noflo-packets/components/Counter.js", function(exports, require, module){
var Counter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Counter = (function(_super) {
  __extends(Counter, _super);

  Counter.prototype.description = 'The count component receives input on a single input port, and sends the number of data packets received to the output port when the input disconnects';

  Counter.prototype.icon = 'sort-numeric-asc';

  function Counter() {
    this.count = null;
    this.inPorts = {
      "in": new noflo.Port,
      immediate: new noflo.Port('boolean')
    };
    this.outPorts = {
      count: new noflo.Port('number'),
      out: new noflo.Port
    };
    this.immediate = false;
    this.inPorts.immediate.on('data', (function(_this) {
      return function(value) {
        return _this.immediate = value;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.count === null) {
          _this.count = 0;
        }
        _this.count++;
        if (_this.outPorts.out.isAttached()) {
          _this.outPorts.out.send(data);
        }
        if (_this.immediate) {
          return _this.sendCount();
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.immediate) {
          _this.sendCount();
        }
        if (_this.outPorts.out.isAttached()) {
          _this.outPorts.out.disconnect();
        }
        return _this.count = null;
      };
    })(this));
  }

  Counter.prototype.sendCount = function() {
    if (!this.outPorts.count.isAttached()) {
      return;
    }
    this.outPorts.count.send(this.count);
    return this.outPorts.count.disconnect();
  };

  return Counter;

})(noflo.Component);

exports.getComponent = function() {
  return new Counter;
};

});
require.register("noflo-noflo-objects/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of objects.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-objects/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-objects","description":"Object Utilities for NoFlo","version":"0.1.0","keywords":["noflo","objects","utilities"],"author":"Kenneth Kan <kenhkan@gmail.com>","repo":"noflo/objects","dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/Extend.js","components/MergeObjects.js","components/SplitObject.js","components/ReplaceKey.js","components/Keys.js","components/Size.js","components/Values.js","components/Join.js","components/ExtractProperty.js","components/InsertProperty.js","components/SliceArray.js","components/SplitArray.js","components/FilterPropertyValue.js","components/FlattenObject.js","components/MapProperty.js","components/RemoveProperty.js","components/MapPropertyValue.js","components/GetObjectKey.js","components/UniqueArray.js","components/SetProperty.js","components/SimplifyObject.js","components/DuplicateProperty.js","components/CreateObject.js","components/CreateDate.js","components/SetPropertyValue.js","components/CallMethod.js","index.js"],"json":["component.json"],"noflo":{"icon":"list","components":{"Extend":"components/Extend.js","MergeObjects":"components/MergeObjects.js","SplitObject":"components/SplitObject.js","ReplaceKey":"components/ReplaceKey.js","Keys":"components/Keys.js","Size":"components/Size.js","Values":"components/Values.js","Join":"components/Join.js","ExtractProperty":"components/ExtractProperty.js","InsertProperty":"components/InsertProperty.js","SliceArray":"components/SliceArray.js","SplitArray":"components/SplitArray.js","FilterPropertyValue":"components/FilterPropertyValue.js","FlattenObject":"components/FlattenObject.js","MapProperty":"components/MapProperty.js","RemoveProperty":"components/RemoveProperty.js","MapPropertyValue":"components/MapPropertyValue.js","GetObjectKey":"components/GetObjectKey.js","UniqueArray":"components/UniqueArray.js","SetProperty":"components/SetProperty.js","SimplifyObject":"components/SimplifyObject.js","DuplicateProperty":"components/DuplicateProperty.js","CreateObject":"components/CreateObject.js","CreateDate":"components/CreateDate.js","SetPropertyValue":"components/SetPropertyValue.js","CallMethod":"components/CallMethod.js"}}}');
});
require.register("noflo-noflo-objects/components/Extend.js", function(exports, require, module){
var Extend, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Extend = (function(_super) {
  __extends(Extend, _super);

  Extend.prototype.description = "Extend an incoming object to some predefined objects, optionally by a certain property";

  function Extend() {
    this.bases = [];
    this.mergedBase = {};
    this.key = null;
    this.reverse = false;
    this.inPorts = {
      "in": new noflo.Port,
      base: new noflo.Port,
      key: new noflo.Port,
      reverse: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.base.on("connect", (function(_this) {
      return function() {
        return _this.bases = [];
      };
    })(this));
    this.inPorts.base.on("data", (function(_this) {
      return function(base) {
        if (base != null) {
          return _this.bases.push(base);
        }
      };
    })(this));
    this.inPorts.key.on("data", (function(_this) {
      return function(key) {
        _this.key = key;
      };
    })(this));
    this.inPorts.reverse.on("data", (function(_this) {
      return function(reverse) {
        return _this.reverse = reverse === 'true';
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function(group) {};
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(incoming) {
        var base, out, _i, _len, _ref;
        out = {};
        _ref = _this.bases;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          base = _ref[_i];
          if ((_this.key == null) || (incoming[_this.key] != null) && incoming[_this.key] === base[_this.key]) {
            _.extend(out, base);
          }
        }
        if (_this.reverse) {
          return _this.outPorts.out.send(_.extend({}, incoming, out));
        } else {
          return _this.outPorts.out.send(_.extend(out, incoming));
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Extend;

})(noflo.Component);

exports.getComponent = function() {
  return new Extend;
};

});
require.register("noflo-noflo-objects/components/MergeObjects.js", function(exports, require, module){
var MergeObjects, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

MergeObjects = (function(_super) {
  __extends(MergeObjects, _super);

  MergeObjects.prototype.description = "merges all incoming objects into one";

  function MergeObjects() {
    this.merge = _.bind(this.merge, this);
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.groups = [];
        return _this.objects = [];
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(object) {
        return _this.objects.push(object);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.out.send(_.reduce(_this.objects, _this.merge, {}));
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  MergeObjects.prototype.merge = function(origin, object) {
    var key, oValue, value;
    for (key in object) {
      value = object[key];
      oValue = origin[key];
      if (oValue != null) {
        switch (toString.call(oValue)) {
          case "[object Array]":
            origin[key].push.apply(origin[key], value);
            break;
          case "[object Object]":
            origin[key] = this.merge(oValue, value);
            break;
          default:
            origin[key] = value;
        }
      } else {
        origin[key] = value;
      }
    }
    return origin;
  };

  return MergeObjects;

})(noflo.Component);

exports.getComponent = function() {
  return new MergeObjects;
};

});
require.register("noflo-noflo-objects/components/SplitObject.js", function(exports, require, module){
var SplitObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

SplitObject = (function(_super) {
  __extends(SplitObject, _super);

  SplitObject.prototype.description = "splits a single object into multiple IPs, wrapped with the key as the group";

  function SplitObject() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var key, value, _results;
        _results = [];
        for (key in data) {
          value = data[key];
          _this.outPorts.out.beginGroup(key);
          _this.outPorts.out.send(value);
          _results.push(_this.outPorts.out.endGroup());
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return SplitObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitObject;
};

});
require.register("noflo-noflo-objects/components/ReplaceKey.js", function(exports, require, module){
var ReplaceKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

ReplaceKey = (function(_super) {
  __extends(ReplaceKey, _super);

  ReplaceKey.prototype.description = "given a regexp matching any key of an incoming object as a data IP, replace the key with the provided string";

  function ReplaceKey() {
    this.patterns = {};
    this.inPorts = {
      "in": new noflo.Port,
      pattern: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.pattern.on("data", (function(_this) {
      return function(patterns) {
        _this.patterns = patterns;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var key, newKey, pattern, replace, value, _ref;
        newKey = null;
        for (key in data) {
          value = data[key];
          _ref = _this.patterns;
          for (pattern in _ref) {
            replace = _ref[pattern];
            pattern = new RegExp(pattern);
            if (key.match(pattern) != null) {
              newKey = key.replace(pattern, replace);
              data[newKey] = value;
              delete data[key];
            }
          }
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.pattern = null;
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return ReplaceKey;

})(noflo.Component);

exports.getComponent = function() {
  return new ReplaceKey;
};

});
require.register("noflo-noflo-objects/components/Keys.js", function(exports, require, module){
var Keys, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Keys = (function(_super) {
  __extends(Keys, _super);

  Keys.prototype.description = "gets only the keys of an object and forward them as an array";

  function Keys() {
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var key, _i, _len, _ref, _results;
        _ref = _.keys(data);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          key = _ref[_i];
          _results.push(_this.outPorts.out.send(key));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Keys;

})(noflo.Component);

exports.getComponent = function() {
  return new Keys;
};

});
require.register("noflo-noflo-objects/components/Size.js", function(exports, require, module){
var Size, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Size = (function(_super) {
  __extends(Size, _super);

  Size.prototype.description = "gets the size of an object and sends that out as a number";

  function Size() {
    this.inPorts = {
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('integer')
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(_.size(data));
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Size;

})(noflo.Component);

exports.getComponent = function() {
  return new Size;
};

});
require.register("noflo-noflo-objects/components/Values.js", function(exports, require, module){
var Values, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Values = (function(_super) {
  __extends(Values, _super);

  Values.prototype.description = "gets only the values of an object and forward them as an array";

  function Values() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var value, _i, _len, _ref, _results;
        _ref = _.values(data);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          value = _ref[_i];
          _results.push(_this.outPorts.out.send(value));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Values;

})(noflo.Component);

exports.getComponent = function() {
  return new Values;
};

});
require.register("noflo-noflo-objects/components/Join.js", function(exports, require, module){
var Join, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

_ = require("underscore");

noflo = require("noflo");

Join = (function(_super) {
  __extends(Join, _super);

  Join.prototype.description = "Join all values of a passed packet together as a string with a predefined delimiter";

  function Join() {
    this.delimiter = ",";
    this.inPorts = {
      "in": new noflo.Port,
      delimiter: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.delimiter.on("data", (function(_this) {
      return function(delimiter) {
        _this.delimiter = delimiter;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(object) {
        if (_.isObject(object)) {
          return _this.outPorts.out.send(_.values(object).join(_this.delimiter));
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Join;

})(noflo.Component);

exports.getComponent = function() {
  return new Join;
};

});
require.register("noflo-noflo-objects/components/ExtractProperty.js", function(exports, require, module){
var ExtractProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

ExtractProperty = (function(_super) {
  __extends(ExtractProperty, _super);

  ExtractProperty.prototype.description = "Given a key, return only the value matching that key in the incoming object";

  function ExtractProperty() {
    this.inPorts = {
      "in": new noflo.Port,
      key: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.key.on("connect", (function(_this) {
      return function() {
        return _this.keys = [];
      };
    })(this));
    this.inPorts.key.on("data", (function(_this) {
      return function(key) {
        return _this.keys.push(key);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var key, value, _i, _len, _ref;
        if ((_this.keys != null) && _.isObject(data)) {
          value = data;
          _ref = _this.keys;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            key = _ref[_i];
            value = value[key];
          }
          return _this.outPorts.out.send(value);
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return ExtractProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new ExtractProperty;
};

});
require.register("noflo-noflo-objects/components/InsertProperty.js", function(exports, require, module){
var InsertProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

InsertProperty = (function(_super) {
  __extends(InsertProperty, _super);

  InsertProperty.prototype.description = "Insert a property into incoming objects.";

  function InsertProperty() {
    this.properties = {};
    this.inPorts = {
      "in": new noflo.Port,
      property: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.property.on("connect", (function(_this) {
      return function() {
        return _this.properties = {};
      };
    })(this));
    this.inPorts.property.on("begingroup", (function(_this) {
      return function(key) {
        _this.key = key;
      };
    })(this));
    this.inPorts.property.on("data", (function(_this) {
      return function(value) {
        if (_this.key != null) {
          return _this.properties[_this.key] = value;
        }
      };
    })(this));
    this.inPorts.property.on("endgroup", (function(_this) {
      return function() {
        return _this.key = null;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var key, value, _ref;
        if (!_.isObject(data)) {
          data = {};
        }
        _ref = _this.properties;
        for (key in _ref) {
          value = _ref[key];
          data[key] = value;
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return InsertProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new InsertProperty;
};

});
require.register("noflo-noflo-objects/components/SliceArray.js", function(exports, require, module){
var SliceArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SliceArray = (function(_super) {
  __extends(SliceArray, _super);

  function SliceArray() {
    this.begin = 0;
    this.end = null;
    this.inPorts = {
      "in": new noflo.Port(),
      begin: new noflo.Port(),
      end: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    this.inPorts.begin.on('data', (function(_this) {
      return function(data) {
        return _this.begin = data;
      };
    })(this));
    this.inPorts.end.on('data', (function(_this) {
      return function(data) {
        return _this.end = data;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.sliceData(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SliceArray.prototype.sliceData = function(data) {
    var sliced;
    if (!data.slice) {
      return this.outPorts.error.send("Data " + (typeof data) + " cannot be sliced");
    }
    if (this.end !== null) {
      sliced = data.slice(this.begin, this.end);
    }
    if (this.end === null) {
      sliced = data.slice(this.begin);
    }
    return this.outPorts.out.send(sliced);
  };

  return SliceArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SliceArray;
};

});
require.register("noflo-noflo-objects/components/SplitArray.js", function(exports, require, module){
var SplitArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitArray = (function(_super) {
  __extends(SplitArray, _super);

  function SplitArray() {
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.ArrayPort()
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var item, key, _i, _len, _results;
        if (toString.call(data) !== '[object Array]') {
          for (key in data) {
            item = data[key];
            _this.outPorts.out.beginGroup(key);
            _this.outPorts.out.send(item);
            _this.outPorts.out.endGroup();
          }
          return;
        }
        _results = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          item = data[_i];
          _results.push(_this.outPorts.out.send(item));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function(data) {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return SplitArray;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitArray;
};

});
require.register("noflo-noflo-objects/components/FilterPropertyValue.js", function(exports, require, module){
var FilterPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FilterPropertyValue = (function(_super) {
  __extends(FilterPropertyValue, _super);

  FilterPropertyValue.prototype.icon = 'filter';

  function FilterPropertyValue() {
    this.accepts = {};
    this.regexps = {};
    this.inPorts = {
      accept: new noflo.ArrayPort('all'),
      regexp: new noflo.ArrayPort('string'),
      "in": new noflo.Port('object')
    };
    this.outPorts = {
      out: new noflo.Port('object'),
      missed: new noflo.Port('object')
    };
    this.inPorts.accept.on('data', (function(_this) {
      return function(data) {
        return _this.prepareAccept(data);
      };
    })(this));
    this.inPorts.regexp.on('data', (function(_this) {
      return function(data) {
        return _this.prepareRegExp(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.filtering()) {
          return _this.filterData(data);
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  FilterPropertyValue.prototype.filtering = function() {
    return (Object.keys(this.accepts)).length > 0 || (Object.keys(this.regexps)).length > 0;
  };

  FilterPropertyValue.prototype.prepareAccept = function(map) {
    var e, mapParts;
    if (typeof map === 'object') {
      this.accepts = map;
      return;
    }
    mapParts = map.split('=');
    try {
      return this.accepts[mapParts[0]] = eval(mapParts[1]);
    } catch (_error) {
      e = _error;
      if (e instanceof ReferenceError) {
        return this.accepts[mapParts[0]] = mapParts[1];
      } else {
        throw e;
      }
    }
  };

  FilterPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  FilterPropertyValue.prototype.filterData = function(object) {
    var match, newData, property, regexp, value;
    newData = {};
    match = false;
    for (property in object) {
      value = object[property];
      if (this.accepts[property]) {
        if (this.accepts[property] !== value) {
          continue;
        }
        match = true;
      }
      if (this.regexps[property]) {
        regexp = new RegExp(this.regexps[property]);
        if (!regexp.exec(value)) {
          continue;
        }
        match = true;
      }
      newData[property] = value;
      continue;
    }
    if (!match) {
      if (!this.outPorts.missed.isAttached()) {
        return;
      }
      this.outPorts.missed.send(object);
      this.outPorts.missed.disconnect();
      return;
    }
    return this.outPorts.out.send(newData);
  };

  return FilterPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterPropertyValue;
};

});
require.register("noflo-noflo-objects/components/FlattenObject.js", function(exports, require, module){
var FlattenObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FlattenObject = (function(_super) {
  __extends(FlattenObject, _super);

  function FlattenObject() {
    this.map = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', (function(_this) {
      return function(data) {
        return _this.prepareMap(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var object, _i, _len, _ref, _results;
        _ref = _this.flattenObject(data);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          object = _ref[_i];
          _results.push(_this.outPorts.out.send(_this.mapKeys(object)));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  FlattenObject.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  FlattenObject.prototype.mapKeys = function(object) {
    var key, map, _ref;
    _ref = this.map;
    for (key in _ref) {
      map = _ref[key];
      object[map] = object.flattenedKeys[key];
    }
    delete object.flattenedKeys;
    return object;
  };

  FlattenObject.prototype.flattenObject = function(object) {
    var flattened, flattenedValue, key, val, value, _i, _len;
    flattened = [];
    for (key in object) {
      value = object[key];
      if (typeof value === 'object') {
        flattenedValue = this.flattenObject(value);
        for (_i = 0, _len = flattenedValue.length; _i < _len; _i++) {
          val = flattenedValue[_i];
          val.flattenedKeys.push(key);
          flattened.push(val);
        }
        continue;
      }
      flattened.push({
        flattenedKeys: [key],
        value: value
      });
    }
    return flattened;
  };

  return FlattenObject;

})(noflo.Component);

exports.getComponent = function() {
  return new FlattenObject;
};

});
require.register("noflo-noflo-objects/components/MapProperty.js", function(exports, require, module){
var MapProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapProperty = (function(_super) {
  __extends(MapProperty, _super);

  function MapProperty() {
    this.map = {};
    this.regexps = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', (function(_this) {
      return function(data) {
        return _this.prepareMap(data);
      };
    })(this));
    this.inPorts.regexp.on('data', (function(_this) {
      return function(data) {
        return _this.prepareRegExp(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.mapData(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  MapProperty.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  MapProperty.prototype.mapData = function(data) {
    var expression, matched, newData, property, regexp, replacement, value, _ref;
    newData = {};
    for (property in data) {
      value = data[property];
      if (property in this.map) {
        property = this.map[property];
      }
      _ref = this.regexps;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(property);
        if (!matched) {
          continue;
        }
        property = property.replace(regexp, replacement);
      }
      if (property in newData) {
        if (Array.isArray(newData[property])) {
          newData[property].push(value);
        } else {
          newData[property] = [newData[property], value];
        }
      } else {
        newData[property] = value;
      }
    }
    return this.outPorts.out.send(newData);
  };

  return MapProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new MapProperty;
};

});
require.register("noflo-noflo-objects/components/RemoveProperty.js", function(exports, require, module){
var RemoveProperty, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

RemoveProperty = (function(_super) {
  __extends(RemoveProperty, _super);

  RemoveProperty.prototype.icon = 'ban';

  function RemoveProperty() {
    this.properties = [];
    this.inPorts = {
      "in": new noflo.Port(),
      property: new noflo.ArrayPort()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', (function(_this) {
      return function(data) {
        return _this.properties.push(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(_this.removeProperties(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  RemoveProperty.prototype.removeProperties = function(object) {
    var property, _i, _len, _ref;
    object = _.clone(object);
    _ref = this.properties;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      property = _ref[_i];
      delete object[property];
    }
    return object;
  };

  return RemoveProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveProperty;
};

});
require.register("noflo-noflo-objects/components/MapPropertyValue.js", function(exports, require, module){
var MapPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapPropertyValue = (function(_super) {
  __extends(MapPropertyValue, _super);

  function MapPropertyValue() {
    this.mapAny = {};
    this.map = {};
    this.regexpAny = {};
    this.regexp = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', (function(_this) {
      return function(data) {
        return _this.prepareMap(data);
      };
    })(this));
    this.inPorts.regexp.on('data', (function(_this) {
      return function(data) {
        return _this.prepareRegExp(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.mapData(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  MapPropertyValue.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.mapAny = map;
      return;
    }
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.map[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.mapAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    if (mapParts.length === 3) {
      this.regexp[mapParts[0]] = {
        from: mapParts[1],
        to: mapParts[2]
      };
      return;
    }
    return this.regexpAny[mapParts[0]] = mapParts[1];
  };

  MapPropertyValue.prototype.mapData = function(data) {
    var expression, matched, property, regexp, replacement, value, _ref;
    for (property in data) {
      value = data[property];
      if (this.map[property] && this.map[property].from === value) {
        data[property] = this.map[property].to;
      }
      if (this.mapAny[value]) {
        data[property] = this.mapAny[value];
      }
      if (this.regexp[property]) {
        regexp = new RegExp(this.regexp[property].from);
        matched = regexp.exec(value);
        if (matched) {
          data[property] = value.replace(regexp, this.regexp[property].to);
        }
      }
      _ref = this.regexpAny;
      for (expression in _ref) {
        replacement = _ref[expression];
        regexp = new RegExp(expression);
        matched = regexp.exec(value);
        if (!matched) {
          continue;
        }
        data[property] = value.replace(regexp, replacement);
      }
    }
    return this.outPorts.out.send(data);
  };

  return MapPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new MapPropertyValue;
};

});
require.register("noflo-noflo-objects/components/GetObjectKey.js", function(exports, require, module){
var GetObjectKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GetObjectKey = (function(_super) {
  __extends(GetObjectKey, _super);

  GetObjectKey.prototype.icon = 'indent';

  function GetObjectKey() {
    this.sendGroup = true;
    this.data = [];
    this.key = [];
    this.inPorts = {
      "in": new noflo.Port('object'),
      key: new noflo.ArrayPort('string'),
      sendgroup: new noflo.Port('boolean')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      object: new noflo.Port('object'),
      missed: new noflo.Port('object')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.data = [];
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.key.length) {
          return _this.getKey(data);
        }
        return _this.data.push(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var data, _i, _len, _ref;
        if (!_this.data.length) {
          _this.outPorts.out.disconnect();
          return;
        }
        if (!_this.key.length) {
          return;
        }
        _ref = _this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          _this.getKey(data);
        }
        _this.outPorts.out.disconnect();
        if (_this.outPorts.object.isAttached()) {
          return _this.outPorts.object.disconnect();
        }
      };
    })(this));
    this.inPorts.key.on('data', (function(_this) {
      return function(data) {
        return _this.key.push(data);
      };
    })(this));
    this.inPorts.key.on('disconnect', (function(_this) {
      return function() {
        var data, _i, _len, _ref;
        if (!_this.data.length) {
          return;
        }
        _ref = _this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          _this.getKey(data);
        }
        _this.data = [];
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.sendgroup.on('data', (function(_this) {
      return function(data) {
        return _this.sendGroup = String(data) === 'true';
      };
    })(this));
  }

  GetObjectKey.prototype.error = function(data, error) {
    if (this.outPorts.missed.isAttached()) {
      this.outPorts.missed.send(data);
      this.outPorts.missed.disconnect();
      return;
    }
    throw error;
  };

  GetObjectKey.prototype.getKey = function(data) {
    var key, _i, _len, _ref;
    if (!this.key.length) {
      this.error(data, new Error('Key not defined'));
      return;
    }
    if (typeof data !== 'object') {
      this.error(data, new Error('Data is not an object'));
      return;
    }
    if (data === null) {
      this.error(data, new Error('Data is NULL'));
      return;
    }
    _ref = this.key;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      if (data[key] === void 0) {
        this.error(data, new Error("Object has no key " + key));
        continue;
      }
      if (this.sendGroup) {
        this.outPorts.out.beginGroup(key);
      }
      this.outPorts.out.send(data[key]);
      if (this.sendGroup) {
        this.outPorts.out.endGroup();
      }
    }
    if (!this.outPorts.object.isAttached()) {
      return;
    }
    return this.outPorts.object.send(data);
  };

  return GetObjectKey;

})(noflo.Component);

exports.getComponent = function() {
  return new GetObjectKey;
};

});
require.register("noflo-noflo-objects/components/UniqueArray.js", function(exports, require, module){
var UniqueArray, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

UniqueArray = (function(_super) {
  __extends(UniqueArray, _super);

  function UniqueArray() {
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(_this.unique(data));
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  UniqueArray.prototype.unique = function(array) {
    var member, newArray, seen, _i, _len;
    seen = {};
    newArray = [];
    for (_i = 0, _len = array.length; _i < _len; _i++) {
      member = array[_i];
      seen[member] = member;
    }
    for (member in seen) {
      newArray.push(member);
    }
    return newArray;
  };

  return UniqueArray;

})(noflo.Component);

exports.getComponent = function() {
  return new UniqueArray;
};

});
require.register("noflo-noflo-objects/components/SetProperty.js", function(exports, require, module){
var SetProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetProperty = (function(_super) {
  __extends(SetProperty, _super);

  function SetProperty() {
    this.properties = {};
    this.inPorts = {
      property: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', (function(_this) {
      return function(data) {
        return _this.setProperty(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.addProperties(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SetProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    return this.properties[propParts[0]] = propParts[1];
  };

  SetProperty.prototype.addProperties = function(object) {
    var property, value, _ref;
    _ref = this.properties;
    for (property in _ref) {
      value = _ref[property];
      object[property] = value;
    }
    return this.outPorts.out.send(object);
  };

  return SetProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new SetProperty;
};

});
require.register("noflo-noflo-objects/components/SimplifyObject.js", function(exports, require, module){
var SimplifyObject, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

SimplifyObject = (function(_super) {
  __extends(SimplifyObject, _super);

  function SimplifyObject() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('beginGroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(_this.simplify(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SimplifyObject.prototype.simplify = function(data) {
    if (_.isArray(data)) {
      if (data.length === 1) {
        return data[0];
      }
      return data;
    }
    if (!_.isObject(data)) {
      return data;
    }
    return this.simplifyObject(data);
  };

  SimplifyObject.prototype.simplifyObject = function(data) {
    var keys, simplified;
    keys = _.keys(data);
    if (keys.length === 1 && keys[0] === '$data') {
      return this.simplify(data['$data']);
    }
    simplified = {};
    _.each(data, (function(_this) {
      return function(value, key) {
        return simplified[key] = _this.simplify(value);
      };
    })(this));
    return simplified;
  };

  return SimplifyObject;

})(noflo.Component);

exports.getComponent = function() {
  return new SimplifyObject;
};

});
require.register("noflo-noflo-objects/components/DuplicateProperty.js", function(exports, require, module){
var DuplicateProperty, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

DuplicateProperty = (function(_super) {
  __extends(DuplicateProperty, _super);

  function DuplicateProperty() {
    this.properties = {};
    this.separator = '/';
    this.inPorts = {
      property: new noflo.ArrayPort(),
      separator: new noflo.Port(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.property.on('data', (function(_this) {
      return function(data) {
        return _this.setProperty(data);
      };
    })(this));
    this.inPorts.separator.on('data', (function(_this) {
      return function(data) {
        return _this.separator = data;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.addProperties(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  DuplicateProperty.prototype.setProperty = function(prop) {
    var propParts;
    if (typeof prop === 'object') {
      this.prop = prop;
      return;
    }
    propParts = prop.split('=');
    if (propParts.length > 2) {
      this.properties[propParts.pop()] = propParts;
      return;
    }
    return this.properties[propParts[1]] = propParts[0];
  };

  DuplicateProperty.prototype.addProperties = function(object) {
    var newValues, newprop, original, originalProp, _i, _len, _ref;
    _ref = this.properties;
    for (newprop in _ref) {
      original = _ref[newprop];
      if (typeof original === 'string') {
        object[newprop] = object[original];
        continue;
      }
      newValues = [];
      for (_i = 0, _len = original.length; _i < _len; _i++) {
        originalProp = original[_i];
        newValues.push(object[originalProp]);
      }
      object[newprop] = newValues.join(this.separator);
    }
    return this.outPorts.out.send(object);
  };

  return DuplicateProperty;

})(noflo.Component);

exports.getComponent = function() {
  return new DuplicateProperty;
};

});
require.register("noflo-noflo-objects/components/CreateObject.js", function(exports, require, module){
var CreateObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CreateObject = (function(_super) {
  __extends(CreateObject, _super);

  function CreateObject() {
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.start.on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts.start.on("data", (function(_this) {
      return function() {
        return _this.outPorts.out.send({});
      };
    })(this));
    this.inPorts.start.on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts.start.on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return CreateObject;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateObject;
};

});
require.register("noflo-noflo-objects/components/CreateDate.js", function(exports, require, module){
var CreateDate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CreateDate = (function(_super) {
  __extends(CreateDate, _super);

  CreateDate.prototype.description = 'Create a new Date object from string';

  CreateDate.prototype.icon = 'clock-o';

  function CreateDate() {
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var date;
        if (data === "now" || data === null || data === true) {
          date = new Date;
        } else {
          date = new Date(data);
        }
        return _this.outPorts.out.send(date);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return CreateDate;

})(noflo.Component);

exports.getComponent = function() {
  return new CreateDate;
};

});
require.register("noflo-noflo-objects/components/SetPropertyValue.js", function(exports, require, module){
var SetPropertyValue, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SetPropertyValue = (function(_super) {
  __extends(SetPropertyValue, _super);

  function SetPropertyValue() {
    this.property = null;
    this.value = null;
    this.data = [];
    this.groups = [];
    this.keep = false;
    this.inPorts = {
      property: new noflo.Port('string'),
      value: new noflo.Port('all'),
      "in": new noflo.Port('object'),
      keep: new noflo.Port('boolean')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.keep.on('data', (function(_this) {
      return function(keep) {
        return _this.keep = String(keep) === 'true';
      };
    })(this));
    this.inPorts.property.on('data', (function(_this) {
      return function(data) {
        _this.property = data;
        if (_this.value && _this.data.length) {
          return _this.addProperties();
        }
      };
    })(this));
    this.inPorts.value.on('data', (function(_this) {
      return function(data) {
        _this.value = data;
        if (_this.property && _this.data.length) {
          return _this.addProperties();
        }
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.property && _this.value) {
          _this.addProperty({
            data: data,
            group: _this.groups.slice(0)
          });
          return;
        }
        return _this.data.push({
          data: data,
          group: _this.groups.slice(0)
        });
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.property && _this.value) {
          _this.outPorts.out.disconnect();
        }
        if (!_this.keep) {
          return _this.value = null;
        }
      };
    })(this));
  }

  SetPropertyValue.prototype.addProperty = function(object) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    object.data[this.property] = this.value;
    _ref = object.group;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(object.data);
    _ref1 = object.group;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  SetPropertyValue.prototype.addProperties = function() {
    var object, _i, _len, _ref;
    _ref = this.data;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      object = _ref[_i];
      this.addProperty(object);
    }
    this.data = [];
    return this.outPorts.out.disconnect();
  };

  return SetPropertyValue;

})(noflo.Component);

exports.getComponent = function() {
  return new SetPropertyValue;
};

});
require.register("noflo-noflo-objects/components/CallMethod.js", function(exports, require, module){
var CallMethod, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

CallMethod = (function(_super) {
  __extends(CallMethod, _super);

  CallMethod.prototype.description = "call a method on an object";

  CallMethod.prototype.icon = 'gear';

  function CallMethod() {
    this.method = null;
    this.args = [];
    this.inPorts = {
      "in": new noflo.Port('object'),
      method: new noflo.Port('string'),
      "arguments": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      error: new noflo.Port('string')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var msg;
        if (!_this.method) {
          return;
        }
        if (!data[_this.method]) {
          msg = "Method '" + _this.method + "' not available";
          if (_this.outPorts.error.isAttached()) {
            _this.outPorts.error.send(msg);
            _this.outPorts.error.disconnect();
            return;
          }
          throw new Error(msg);
        }
        _this.outPorts.out.send(data[_this.method].apply(data, _this.args));
        return _this.args = [];
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.method.on("data", (function(_this) {
      return function(data) {
        return _this.method = data;
      };
    })(this));
    this.inPorts["arguments"].on('connect', (function(_this) {
      return function() {
        return _this.args = [];
      };
    })(this));
    this.inPorts["arguments"].on('data', (function(_this) {
      return function(data) {
        return _this.args.push(data);
      };
    })(this));
  }

  return CallMethod;

})(noflo.Component);

exports.getComponent = function() {
  return new CallMethod;
};

});
require.register("noflo-noflo-routers/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of routers.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-routers/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-routers","description":"Routing Packets in NoFlo","keywords":["noflo","routing"],"author":"Kenneth Kan <kenhkan@gmail.com>","version":"0.1.0","dependencies":{"noflo/noflo":"*","component/underscore":"*"},"scripts":["components/ControlledSequence.js","components/KickRouter.js","components/PacketRouter.js","components/RegexpRouter.js","components/SplitInSequence.js","index.js"],"json":["component.json"],"noflo":{"icon":"code-fork","components":{"ControlledSequence":"components/ControlledSequence.js","KickRouter":"components/KickRouter.js","PacketRouter":"components/PacketRouter.js","RegexpRouter":"components/RegexpRouter.js","SplitInSequence":"components/SplitInSequence.js"}},"repo":"https://raw.github.com/noflo/noflo-routers"}');
});
require.register("noflo-noflo-routers/components/ControlledSequence.js", function(exports, require, module){
var ControlledSequence, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ControlledSequence = (function(_super) {
  __extends(ControlledSequence, _super);

  function ControlledSequence() {
    this.current = 0;
    this.inPorts = {
      "in": new noflo.Port('all'),
      next: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group, _this.current);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data, _this.current);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup(_this.current);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect(_this.current);
      };
    })(this));
    this.inPorts.next.on('data', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect(_this.current);
        if (_this.current < _this.outPorts.out.sockets.length - 1) {
          _this.current++;
          return;
        }
        return _this.current = 0;
      };
    })(this));
  }

  return ControlledSequence;

})(noflo.Component);

exports.getComponent = function() {
  return new ControlledSequence;
};

});
require.register("noflo-noflo-routers/components/KickRouter.js", function(exports, require, module){
var KickRouter, noflo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

KickRouter = (function(_super) {
  __extends(KickRouter, _super);

  KickRouter.prototype.description = "Holds an IP and send it to a specified port or previous/next";

  function KickRouter() {
    this.sendToIndex = __bind(this.sendToIndex, this);
    this.data = null;
    this.current = 0;
    this.inPorts = {
      "in": new noflo.Port('all'),
      index: new noflo.Port('int'),
      prev: new noflo.Port('bang'),
      next: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.data = data;
      };
    })(this));
    this.inPorts.index.on('data', (function(_this) {
      return function(index) {
        return _this.sendToIndex(_this.data, index);
      };
    })(this));
    this.inPorts.prev.on('data', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect(_this.current);
        if (_this.current > 0) {
          _this.current--;
        } else {
          _this.current = _this.outPorts.out.sockets.length - 1;
        }
        return _this.sendToIndex(_this.data, _this.current);
      };
    })(this));
    this.inPorts.next.on('data', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect(_this.current);
        if (_this.current < _this.outPorts.out.sockets.length - 1) {
          _this.current++;
        } else {
          _this.current = 0;
        }
        return _this.sendToIndex(_this.data, _this.current);
      };
    })(this));
  }

  KickRouter.prototype.sendToIndex = function(data, index) {
    if (this.outPorts.out.isAttached(index)) {
      this.current = index;
      return this.outPorts.out.send(data, index);
    }
  };

  return KickRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new KickRouter;
};

});
require.register("noflo-noflo-routers/components/PacketRouter.js", function(exports, require, module){
var PacketRouter, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

PacketRouter = (function(_super) {
  __extends(PacketRouter, _super);

  PacketRouter.prototype.description = "Routes IPs based on position in an incoming IP stream";

  function PacketRouter() {
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.ArrayPort,
      missed: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.count = 0;
        return _this.outPortCount = _this.outPorts.out.sockets.length;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (_this.count < _this.outPortCount) {
          _this.outPorts.out.send(data, _this.count++);
          return _this.outPorts.out.disconnect();
        } else if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var i, _i, _ref, _ref1;
        if (_this.count < _this.outPortCount) {
          for (i = _i = _ref = _this.count, _ref1 = _this.outPortCount; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
            _this.outPorts.out.send(null, i);
            _this.outPorts.out.disconnect();
          }
        }
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.disconnect();
        }
      };
    })(this));
  }

  return PacketRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new PacketRouter;
};

});
require.register("noflo-noflo-routers/components/RegexpRouter.js", function(exports, require, module){
var RegexpRouter, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

RegexpRouter = (function(_super) {
  __extends(RegexpRouter, _super);

  RegexpRouter.prototype.description = "Route IPs based on RegExp (top-level only). The position of the RegExp determines which port to forward to.";

  function RegexpRouter() {
    this.routes = [];
    this.sendToplevel = false;
    this.inPorts = {
      "in": new noflo.Port('all'),
      route: new noflo.ArrayPort('string'),
      reset: new noflo.Port('bang'),
      sendtoplevel: new noflo.Port('boolean')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all'),
      missed: new noflo.Port('all'),
      route: new noflo.Port('string')
    };
    this.inPorts.reset.on("disconnect", (function(_this) {
      return function() {
        return _this.routes = [];
      };
    })(this));
    this.inPorts.sendtoplevel.on('data', (function(_this) {
      return function(data) {
        return _this.sendTopLevel = String(data) === 'true';
      };
    })(this));
    this.inPorts.route.on("data", (function(_this) {
      return function(regexp) {
        if (_.isString(regexp)) {
          return _this.routes.push(new RegExp(regexp));
        } else {
          throw new Error({
            message: "Route must be a string",
            source: regexp
          });
        }
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.matchedRouteIndex = null;
        return _this.level = 0;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        var i, index, route, _i, _len, _ref;
        index = _this.matchedRouteIndex;
        if (_this.level === 0) {
          _ref = _this.routes;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            route = _ref[i];
            if (group.match(route) != null) {
              _this.matchedRouteIndex = i;
              if (_this.outPorts.route.isAttached()) {
                _this.outPorts.route.send(group);
                _this.outPorts.route.disconnect();
              }
              break;
            }
          }
        } else if ((index != null) && _this.outPorts.out.isAttached(index)) {
          _this.outPorts.out.beginGroup(group, index);
        } else if (_this.outPorts.missed.isAttached()) {
          _this.outPorts.missed.beginGroup(group);
        }
        if (_this.sendTopLevel && _this.level === 0) {
          if ((_this.matchedRouteIndex != null) && _this.outPorts.out.isAttached(_this.matchedRouteIndex)) {
            _this.outPorts.out.beginGroup(group, _this.matchedRouteIndex);
          } else {
            _this.outPorts.missed.beginGroup(group);
          }
        }
        return _this.level++;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if ((_this.matchedRouteIndex != null) && _this.outPorts.out.isAttached(_this.matchedRouteIndex)) {
          return _this.outPorts.out.send(data, _this.matchedRouteIndex);
        } else if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        _this.level--;
        if (_this.level === 0 && (_this.matchedRouteIndex != null)) {
          if (_this.sendTopLevel) {
            if ((_this.matchedRouteIndex != null) && _this.outPorts.out.isAttached(_this.matchedRouteIndex)) {
              _this.outPorts.out.endGroup(_this.matchedRouteIndex);
            } else if (_this.outPorts.missed.isAttached()) {
              _this.outPorts.missed.endGroup();
            }
          }
          _this.matchedRouteIndex = null;
          return;
        }
        if ((_this.matchedRouteIndex != null) && _this.outPorts.out.isAttached(_this.matchedRouteIndex)) {
          return _this.outPorts.out.endGroup(_this.matchedRouteIndex);
        } else if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.endGroup();
        }
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.disconnect();
        }
      };
    })(this));
  }

  return RegexpRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new RegexpRouter;
};

});
require.register("noflo-noflo-routers/components/SplitInSequence.js", function(exports, require, module){
var SplitInSequence, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SplitInSequence = (function(_super) {
  __extends(SplitInSequence, _super);

  function SplitInSequence() {
    this.lastSent = null;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.ArrayPort
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.sendToPort(_this.portId(), data);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SplitInSequence.prototype.portId = function() {
    var next;
    if (this.lastSent === null) {
      return 0;
    }
    next = this.lastSent + 1;
    if (next > this.outPorts.out.sockets.length - 1) {
      return 0;
    }
    return next;
  };

  SplitInSequence.prototype.sendToPort = function(portId, data) {
    this.outPorts.out.send(data, portId);
    return this.lastSent = portId;
  };

  return SplitInSequence;

})(noflo.Component);

exports.getComponent = function() {
  return new SplitInSequence;
};

});
require.register("noflo-noflo-groups/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of groups.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-groups/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-groups","description":"Group Utilities for NoFlo","keywords":["noflo","groups","utilities"],"author":"Kenneth Kan <kenhkan@gmail.com>","version":"0.1.0","repo":"kenhkan/groups","dependencies":{"component/underscore":"*","noflo/noflo":"*"},"scripts":["components/ReadGroups.js","components/RemoveGroups.js","components/Regroup.js","components/Group.js","components/GroupZip.js","components/FilterByGroup.js","components/Objectify.js","components/ReadGroup.js","components/SendByGroup.js","components/CollectGroups.js","components/CollectObject.js","components/CollectTree.js","components/FirstGroup.js","components/MapGroup.js","components/MergeGroups.js","components/GroupByObjectKey.js","index.js"],"json":["component.json"],"noflo":{"icon":"tags","components":{"ReadGroups":"components/ReadGroups.js","RemoveGroups":"components/RemoveGroups.js","Regroup":"components/Regroup.js","Group":"components/Group.js","GroupZip":"components/GroupZip.js","FilterByGroup":"components/FilterByGroup.js","Objectify":"components/Objectify.js","ReadGroup":"components/ReadGroup.js","SendByGroup":"components/SendByGroup.js","CollectGroups":"components/CollectGroups.js","CollectObject":"components/CollectObject.js","CollectTree":"components/CollectTree.js","FirstGroup":"components/FirstGroup.js","MapGroup":"components/MapGroup.js","MergeGroups":"components/MergeGroups.js","GroupByObjectKey":"components/GroupByObjectKey.js"}}}');
});
require.register("noflo-noflo-groups/components/ReadGroups.js", function(exports, require, module){
var ReadGroups, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore');

ReadGroups = (function(_super) {
  __extends(ReadGroups, _super);

  function ReadGroups() {
    this.strip = false;
    this.threshold = Infinity;
    this.inPorts = {
      "in": new noflo.ArrayPort,
      strip: new noflo.Port,
      threshold: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port
    };
    this.inPorts.threshold.on('data', (function(_this) {
      return function(threshold) {
        return _this.threshold = parseInt(threshold);
      };
    })(this));
    this.inPorts.strip.on('data', (function(_this) {
      return function(strip) {
        return _this.strip = strip === 'true';
      };
    })(this));
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        _this.count = 0;
        return _this.groups = [];
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        var beginGroup;
        beginGroup = function() {
          _this.groups.push(group);
          if (_this.outPorts.out.isAttached()) {
            return _this.outPorts.out.beginGroup(group);
          }
        };
        if (_this.count >= _this.threshold) {
          return beginGroup(group);
        } else {
          _this.outPorts.group.send(group);
          if (!_this.strip) {
            beginGroup(group);
          }
          return _this.count++;
        }
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        if (group === _.last(_this.groups)) {
          _this.groups.pop();
          if (_this.outPorts.out.isAttached()) {
            return _this.outPorts.out.endGroup();
          }
        }
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (_this.outPorts.out.isAttached()) {
          _this.outPorts.out.disconnect();
        }
        return _this.outPorts.group.disconnect();
      };
    })(this));
  }

  return ReadGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadGroups;
};

});
require.register("noflo-noflo-groups/components/RemoveGroups.js", function(exports, require, module){
var RemoveGroups, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

RemoveGroups = (function(_super) {
  __extends(RemoveGroups, _super);

  RemoveGroups.prototype.description = "Remove a group given a string or a regex string";

  function RemoveGroups() {
    this.regexp = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.regexp.on("data", (function(_this) {
      return function(regexp) {
        return _this.regexp = new RegExp(regexp);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        if ((_this.regexp != null) && (group.match(_this.regexp) == null)) {
          return _this.outPorts.out.beginGroup(group);
        }
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        if ((_this.regexp != null) && (group.match(_this.regexp) == null)) {
          return _this.outPorts.out.endGroup();
        }
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return RemoveGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new RemoveGroups;
};

});
require.register("noflo-noflo-groups/components/Regroup.js", function(exports, require, module){
var Regroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Regroup = (function(_super) {
  __extends(Regroup, _super);

  Regroup.prototype.description = "Forward all the data IPs, strip all groups, and replace them with groups from another connection";

  function Regroup() {
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port,
      group: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.group.on("connect", (function(_this) {
      return function() {
        return _this.groups = [];
      };
    })(this));
    this.inPorts.group.on("data", (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        var group, _i, _len, _ref, _results;
        _ref = _this.groups;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _results.push(_this.outPorts.out.beginGroup(group));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var group, _i, _len, _ref;
        _ref = _this.groups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.endGroup();
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Regroup;

})(noflo.Component);

exports.getComponent = function() {
  return new Regroup;
};

});
require.register("noflo-noflo-groups/components/Group.js", function(exports, require, module){
var Group, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

Group = (function(_super) {
  __extends(Group, _super);

  Group.prototype.description = 'Add groups to a packet';

  function Group() {
    this.newGroups = [];
    this.inPorts = {
      "in": new noflo.Port('all'),
      group: new noflo.Port('string'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        var group, _i, _len, _ref, _results;
        _ref = _this.newGroups;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _results.push(_this.outPorts.out.beginGroup(group));
        }
        return _results;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        var group, _i, _len, _ref;
        _ref = _this.newGroups;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts.out.endGroup();
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.group.on("connect", (function(_this) {
      return function() {
        return _this.newGroups = [];
      };
    })(this));
    this.inPorts.group.on("data", (function(_this) {
      return function(group) {
        return _this.newGroups.push(group);
      };
    })(this));
  }

  return Group;

})(noflo.Component);

exports.getComponent = function() {
  return new Group;
};

});
require.register("noflo-noflo-groups/components/GroupZip.js", function(exports, require, module){
var GroupZip, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

GroupZip = (function(_super) {
  __extends(GroupZip, _super);

  function GroupZip() {
    this.newGroups = [];
    this.inPorts = {
      "in": new noflo.Port,
      group: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        return _this.count = 0;
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        _this.outPorts.out.beginGroup(_this.newGroups[_this.count++]);
        _this.outPorts.out.send(data);
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.group.on("connect", (function(_this) {
      return function() {
        return _this.newGroups = [];
      };
    })(this));
    this.inPorts.group.on("data", (function(_this) {
      return function(group) {
        return _this.newGroups.push(group);
      };
    })(this));
  }

  return GroupZip;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupZip;
};

});
require.register("noflo-noflo-groups/components/FilterByGroup.js", function(exports, require, module){
var FilterByGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

FilterByGroup = (function(_super) {
  __extends(FilterByGroup, _super);

  FilterByGroup.prototype.description = "Given a RegExp string, filter out groups that do not match and their children data packets/groups. Forward only the content of the matching group.";

  function FilterByGroup() {
    this.regexp = null;
    this.matchedLevel = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port,
      empty: new noflo.Port
    };
    this.inPorts.regexp.on("data", (function(_this) {
      return function(regexp) {
        return _this.regexp = new RegExp(regexp);
      };
    })(this));
    this.inPorts["in"].on("connect", (function(_this) {
      return function() {
        _this.level = 0;
        return _this.hasContent = false;
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        if (_this.matchedLevel != null) {
          _this.outPorts.out.beginGroup(group);
        }
        _this.level++;
        if ((_this.matchedLevel == null) && (_this.regexp != null) && (group.match(_this.regexp) != null)) {
          _this.matchedLevel = _this.level;
          if (_this.outPorts.group.isAttached()) {
            return _this.outPorts.group.send(group);
          }
        }
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        if (_this.matchedLevel != null) {
          _this.hasContent = true;
          return _this.outPorts.out.send(data);
        }
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        if (_this.matchedLevel === _this.level) {
          _this.matchedLevel = null;
        }
        if (_this.matchedLevel != null) {
          _this.outPorts.out.endGroup();
        }
        return _this.level--;
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        if (!_this.hasContent && _this.outPorts.empty.isAttached()) {
          _this.outPorts.empty.send(null);
          _this.outPorts.empty.disconnect();
        }
        if (_this.outPorts.group.isAttached()) {
          _this.outPorts.group.disconnect();
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return FilterByGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new FilterByGroup;
};

});
require.register("noflo-noflo-groups/components/Objectify.js", function(exports, require, module){
var Objectify, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

_ = require("underscore");

Objectify = (function(_super) {
  __extends(Objectify, _super);

  Objectify.prototype.description = "specify a regexp string, use the first match as the key of an object containing the data";

  function Objectify() {
    this.regexp = null;
    this.match = null;
    this.inPorts = {
      "in": new noflo.Port,
      regexp: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts.regexp.on("data", (function(_this) {
      return function(regexp) {
        return _this.regexp = new RegExp(regexp);
      };
    })(this));
    this.inPorts["in"].on("begingroup", (function(_this) {
      return function(group) {
        if ((_this.regexp != null) && (group.match(_this.regexp) != null)) {
          _this.match = _.first(group.match(_this.regexp));
        }
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        var d;
        if (_this.match != null) {
          d = data;
          data = {};
          data[_this.match] = d;
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on("endgroup", (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on("disconnect", (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Objectify;

})(noflo.Component);

exports.getComponent = function() {
  return new Objectify;
};

});
require.register("noflo-noflo-groups/components/ReadGroup.js", function(exports, require, module){
var ReadGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

ReadGroup = (function(_super) {
  __extends(ReadGroup, _super);

  function ReadGroup() {
    this.groups = [];
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.Port,
      group: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        _this.groups.push(group);
        _this.outPorts.group.beginGroup(group);
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.beginGroup(group);
        }
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.outPorts.out.isAttached()) {
          _this.outPorts.out.send(data);
        }
        if (!_this.groups.length) {
          return;
        }
        return _this.outPorts.group.send(_this.groups.join(':'));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        _this.groups.pop();
        _this.outPorts.group.endGroup();
        if (_this.outPorts.out.isAttached()) {
          return _this.outPorts.out.endGroup();
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        return _this.outPorts.group.disconnect();
      };
    })(this));
  }

  return ReadGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadGroup;
};

});
require.register("noflo-noflo-groups/components/SendByGroup.js", function(exports, require, module){
var SendByGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

SendByGroup = (function(_super) {
  __extends(SendByGroup, _super);

  SendByGroup.prototype.description = 'Send packet held in "data" when receiving matching set of groups in "in"';

  SendByGroup.prototype.icon = 'share-square';

  function SendByGroup() {
    this.data = {};
    this.ungrouped = null;
    this.dataGroups = [];
    this.inGroups = [];
    this.inPorts = {
      "in": new noflo.Port('bang'),
      data: new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('all')
    };
    this.inPorts.data.on('begingroup', (function(_this) {
      return function(group) {
        return _this.dataGroups.push(group);
      };
    })(this));
    this.inPorts.data.on('data', (function(_this) {
      return function(data) {
        if (!_this.dataGroups.length) {
          _this.ungrouped = data;
          return;
        }
        return _this.data[_this.groupId(_this.dataGroups)] = data;
      };
    })(this));
    this.inPorts.data.on('endgroup', (function(_this) {
      return function() {
        return _this.dataGroups.pop();
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.inGroups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var id;
        if (!_this.inGroups.length) {
          if (_this.ungrouped !== null) {
            _this.send(_this.ungrouped);
          }
          return;
        }
        id = _this.groupId(_this.inGroups);
        if (!_this.data[id]) {
          return;
        }
        return _this.send(_this.data[id]);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.inGroups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  SendByGroup.prototype.groupId = function(groups) {
    return groups.join(':');
  };

  SendByGroup.prototype.send = function(data) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = this.inGroups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(data);
    _ref1 = this.inGroups;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return SendByGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new SendByGroup;
};

});
require.register("noflo-noflo-groups/components/CollectGroups.js", function(exports, require, module){
var CollectGroups, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CollectGroups = (function(_super) {
  __extends(CollectGroups, _super);

  CollectGroups.prototype.description = 'Collect packets into object keyed by its groups';

  function CollectGroups() {
    this.data = {};
    this.groups = [];
    this.parents = [];
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('object'),
      error: new noflo.Port('object')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.data = {};
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (group === '$data') {
          _this.error('groups cannot be named \'$data\'');
          return;
        }
        _this.parents.push(_this.data);
        _this.groups.push(group);
        return _this.data = {};
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.setData(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        var data;
        data = _this.data;
        _this.data = _this.parents.pop();
        return _this.addChild(_this.data, _this.groups.pop(), data);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.send(_this.data);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  CollectGroups.prototype.addChild = function(parent, child, data) {
    if (!(child in parent)) {
      return parent[child] = data;
    }
    if (Array.isArray(parent[child])) {
      return parent[child].push(data);
    }
    return parent[child] = [parent[child], data];
  };

  CollectGroups.prototype.setData = function(data) {
    var _base;
    if ((_base = this.data).$data == null) {
      _base.$data = [];
    }
    return this.data.$data.push(data);
  };

  CollectGroups.prototype.error = function(msg) {
    if (this.outPorts.error.isAttached()) {
      this.outPorts.error.send(new Error(msg));
      this.outPorts.error.disconnect();
      return;
    }
    throw new Error(msg);
  };

  return CollectGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new CollectGroups;
};

});
require.register("noflo-noflo-groups/components/CollectObject.js", function(exports, require, module){
var CollectObject, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CollectObject = (function(_super) {
  __extends(CollectObject, _super);

  CollectObject.prototype.description = 'Collect packets to an object identified by keys organized by connection';

  function CollectObject() {
    this.keys = [];
    this.allpackets = [];
    this.data = {};
    this.groups = {};
    this.inPorts = {
      keys: new noflo.ArrayPort('string'),
      allpackets: new noflo.ArrayPort('string'),
      collect: new noflo.ArrayPort('all'),
      release: new noflo.Port('bang'),
      clear: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('object')
    };
    this.inPorts.keys.on('data', (function(_this) {
      return function(key) {
        var keys, _i, _len, _results;
        keys = key.split(',');
        if (keys.length > 1) {
          _this.keys = [];
        }
        _results = [];
        for (_i = 0, _len = keys.length; _i < _len; _i++) {
          key = keys[_i];
          _results.push(_this.keys.push(key));
        }
        return _results;
      };
    })(this));
    this.inPorts.allpackets.on('data', (function(_this) {
      return function(key) {
        var allpackets, _i, _len, _results;
        allpackets = key.split(',');
        if (allpackets.length > 1) {
          _this.keys = [];
        }
        _results = [];
        for (_i = 0, _len = allpackets.length; _i < _len; _i++) {
          key = allpackets[_i];
          _results.push(_this.allpackets.push(key));
        }
        return _results;
      };
    })(this));
    this.inPorts.collect.once('connect', (function(_this) {
      return function() {
        return _this.subscribeSockets();
      };
    })(this));
    this.inPorts.release.on('data', (function(_this) {
      return function() {
        return _this.release();
      };
    })(this));
    this.inPorts.release.on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.clear.on('data', (function(_this) {
      return function() {
        return _this.clear();
      };
    })(this));
  }

  CollectObject.prototype.release = function() {
    this.outPorts.out.send(this.data);
    return this.data = this.clone(this.data);
  };

  CollectObject.prototype.subscribeSockets = function() {
    return this.inPorts.collect.sockets.forEach((function(_this) {
      return function(socket, idx) {
        return _this.subscribeSocket(socket, idx);
      };
    })(this));
  };

  CollectObject.prototype.subscribeSocket = function(socket, id) {
    socket.on('begingroup', (function(_this) {
      return function(group) {
        if (!_this.groups[id]) {
          _this.groups[id] = [];
        }
        return _this.groups[id].push(group);
      };
    })(this));
    socket.on('data', (function(_this) {
      return function(data) {
        var groupId;
        if (!_this.keys[id]) {
          return;
        }
        groupId = _this.groupId(_this.groups[id]);
        if (!_this.data[groupId]) {
          _this.data[groupId] = {};
        }
        if (_this.allpackets.indexOf(_this.keys[id]) !== -1) {
          if (!_this.data[groupId][_this.keys[id]]) {
            _this.data[groupId][_this.keys[id]] = [];
          }
          _this.data[groupId][_this.keys[id]].push(data);
          return;
        }
        return _this.data[groupId][_this.keys[id]] = data;
      };
    })(this));
    return socket.on('endgroup', (function(_this) {
      return function() {
        if (!_this.groups[id]) {
          return;
        }
        return _this.groups[id].pop();
      };
    })(this));
  };

  CollectObject.prototype.groupId = function(groups) {
    if (!groups.length) {
      return 'ungrouped';
    }
    return groups[0];
  };

  CollectObject.prototype.clone = function(data) {
    var groupName, groupedData, name, newData, value;
    newData = {};
    for (groupName in data) {
      groupedData = data[groupName];
      newData[groupName] = {};
      for (name in groupedData) {
        value = groupedData[name];
        if (!groupedData.hasOwnProperty(name)) {
          continue;
        }
        newData[groupName][name] = value;
      }
    }
    return newData;
  };

  CollectObject.prototype.clear = function() {
    this.data = {};
    return this.groups = {};
  };

  return CollectObject;

})(noflo.Component);

exports.getComponent = function() {
  return new CollectObject;
};

});
require.register("noflo-noflo-groups/components/CollectTree.js", function(exports, require, module){
var CollectTree, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CollectTree = (function(_super) {
  __extends(CollectTree, _super);

  CollectTree.prototype.description = 'Collect grouped packets into a simple tree structure and send on disconnect';

  function CollectTree() {
    this.data = null;
    this.groups = [];
    this.inPorts = {
      "in": new noflo.Port('all')
    };
    this.outPorts = {
      out: new noflo.Port('all'),
      error: new noflo.Port('object')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.data = {};
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var d, g, idx, _i, _len, _ref;
        if (!_this.groups.length) {
          return;
        }
        d = _this.data;
        _ref = _this.groups;
        for (idx = _i = 0, _len = _ref.length; _i < _len; idx = ++_i) {
          g = _ref[idx];
          if (idx < _this.groups.length - 1) {
            if (!d[g]) {
              d[g] = {};
            }
            d = d[g];
            continue;
          }
        }
        if (!d[g]) {
          d[g] = data;
          return;
        }
        if (!Array.isArray(d[g])) {
          d[g] = [d[g]];
        }
        return d[g].push(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var err;
        _this.groups = [];
        if (Object.keys(_this.data).length) {
          _this.outPorts.out.send(_this.data);
          _this.outPorts.out.disconnect();
          _this.data = null;
          return;
        }
        _this.data = null;
        err = new Error('No tree information was collected');
        if (_this.outPorts.error.isAttached()) {
          _this.outPorts.error.send(err);
          _this.outPorts.error.disconnect();
          return;
        }
        throw err;
      };
    })(this));
  }

  return CollectTree;

})(noflo.Component);

exports.getComponent = function() {
  return new CollectTree;
};

});
require.register("noflo-noflo-groups/components/FirstGroup.js", function(exports, require, module){
var FirstGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

FirstGroup = (function(_super) {
  __extends(FirstGroup, _super);

  function FirstGroup() {
    this.depth = 0;
    this.inPorts = {
      "in": new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (_this.depth === 0) {
          _this.outPorts.out.beginGroup(group);
        }
        return _this.depth++;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        _this.depth--;
        if (_this.depth === 0) {
          return _this.outPorts.out.endGroup();
        }
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.depth = 0;
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return FirstGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new FirstGroup;
};

});
require.register("noflo-noflo-groups/components/MapGroup.js", function(exports, require, module){
var MapGroup, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MapGroup = (function(_super) {
  __extends(MapGroup, _super);

  function MapGroup() {
    this.map = {};
    this.regexps = {};
    this.inPorts = {
      map: new noflo.ArrayPort(),
      regexp: new noflo.ArrayPort(),
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts.map.on('data', (function(_this) {
      return function(data) {
        return _this.prepareMap(data);
      };
    })(this));
    this.inPorts.regexp.on('data', (function(_this) {
      return function(data) {
        return _this.prepareRegExp(data);
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.mapGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  MapGroup.prototype.prepareMap = function(map) {
    var mapParts;
    if (typeof map === 'object') {
      this.map = map;
      return;
    }
    mapParts = map.split('=');
    return this.map[mapParts[0]] = mapParts[1];
  };

  MapGroup.prototype.prepareRegExp = function(map) {
    var mapParts;
    mapParts = map.split('=');
    return this.regexps[mapParts[0]] = mapParts[1];
  };

  MapGroup.prototype.mapGroup = function(group) {
    var expression, matched, regexp, replacement, _ref;
    if (this.map[group]) {
      this.outPorts.out.beginGroup(this.map[group]);
      return;
    }
    _ref = this.regexps;
    for (expression in _ref) {
      replacement = _ref[expression];
      regexp = new RegExp(expression);
      matched = regexp.exec(group);
      if (!matched) {
        continue;
      }
      group = group.replace(regexp, replacement);
    }
    return this.outPorts.out.beginGroup(group);
  };

  return MapGroup;

})(noflo.Component);

exports.getComponent = function() {
  return new MapGroup;
};

});
require.register("noflo-noflo-groups/components/MergeGroups.js", function(exports, require, module){
var MergeGroups, noflo, _,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

_ = require('underscore')._;

MergeGroups = (function(_super) {
  __extends(MergeGroups, _super);

  function MergeGroups() {
    this.groups = {};
    this.data = {};
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.ArrayPort
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group, socket) {
        return _this.addGroup(socket, group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data, socket) {
        _this.registerData(socket, data);
        return _this.checkBuffer(socket);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group, socket) {
        _this.checkBuffer(socket);
        return _this.removeGroup(socket);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function(socket, socketId) {
        return _this.checkBuffer(socketId);
      };
    })(this));
  }

  MergeGroups.prototype.addGroup = function(socket, group) {
    if (!this.groups[socket]) {
      this.groups[socket] = [];
    }
    return this.groups[socket].push(group);
  };

  MergeGroups.prototype.removeGroup = function(socket) {
    return this.groups[socket].pop();
  };

  MergeGroups.prototype.groupId = function(socket) {
    if (!this.groups[socket]) {
      return null;
    }
    return this.groups[socket].join(':');
  };

  MergeGroups.prototype.registerData = function(socket, data) {
    var id;
    id = this.groupId(socket);
    if (!id) {
      return;
    }
    if (!this.data[id]) {
      this.data[id] = {};
    }
    return this.data[id][socket] = data;
  };

  MergeGroups.prototype.checkBuffer = function(socket) {
    var id, socketId, _i, _len, _ref;
    id = this.groupId(socket);
    if (!id) {
      return;
    }
    if (!this.data[id]) {
      return;
    }
    _ref = this.inPorts["in"].sockets;
    for (socketId = _i = 0, _len = _ref.length; _i < _len; socketId = ++_i) {
      socket = _ref[socketId];
      if (!this.data[id][socketId]) {
        return;
      }
    }
    this.outPorts.out.beginGroup(id);
    this.outPorts.out.send(this.data[id]);
    this.outPorts.out.endGroup();
    this.outPorts.out.disconnect();
    return delete this.data[id];
  };

  return MergeGroups;

})(noflo.Component);

exports.getComponent = function() {
  return new MergeGroups;
};

});
require.register("noflo-noflo-groups/components/GroupByObjectKey.js", function(exports, require, module){
var GroupByObjectKey, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

GroupByObjectKey = (function(_super) {
  __extends(GroupByObjectKey, _super);

  function GroupByObjectKey() {
    this.data = [];
    this.key = null;
    this.inPorts = {
      "in": new noflo.Port(),
      key: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port()
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        return _this.data = [];
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.key) {
          return _this.getKey(data);
        }
        return _this.data.push(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var data, _i, _len, _ref;
        if (!_this.data.length) {
          _this.outPorts.out.disconnect();
          return;
        }
        if (!_this.key) {
          return;
        }
        _ref = _this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          _this.getKey(data);
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.key.on('data', (function(_this) {
      return function(data) {
        return _this.key = data;
      };
    })(this));
    this.inPorts.key.on('disconnect', (function(_this) {
      return function() {
        var data, _i, _len, _ref;
        if (!_this.data.length) {
          return;
        }
        _ref = _this.data;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          data = _ref[_i];
          _this.getKey(data);
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  GroupByObjectKey.prototype.getKey = function(data) {
    var group;
    if (!this.key) {
      throw new Error('Key not defined');
    }
    if (typeof data !== 'object') {
      throw new Error('Data is not an object');
    }
    group = data[this.key];
    if (typeof data[this.key] !== 'string') {
      group = 'undefined';
    }
    if (typeof data[this.key] === 'boolean') {
      if (data[this.key]) {
        group = this.key;
      }
    }
    this.outPorts.out.beginGroup(group);
    this.outPorts.out.send(data);
    return this.outPorts.out.endGroup();
  };

  return GroupByObjectKey;

})(noflo.Component);

exports.getComponent = function() {
  return new GroupByObjectKey;
};

});
require.register("noflo-noflo-flow/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of flow.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("noflo-noflo-flow/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-flow","description":"Flow Control for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-dom","version":"0.2.0","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Concat.js","components/Gate.js","index.js"],"json":["component.json"],"noflo":{"icon":"random","components":{"Concat":"components/Concat.js","Gate":"components/Gate.js"}}}');
});
require.register("noflo-noflo-flow/components/Concat.js", function(exports, require, module){
var Concat, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Concat = (function(_super) {
  __extends(Concat, _super);

  Concat.prototype.description = 'Gathers data from all incoming connections and sends them together in order of connection';

  function Concat() {
    var subscribed;
    this.buffers = {};
    this.hasConnected = {};
    this.inPorts = {
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.Port
    };
    subscribed = false;
    this.inPorts["in"].on('connect', (function(_this) {
      return function(socket) {
        var id, _i, _len, _ref;
        _this.hasConnected[_this.inPorts["in"].sockets.indexOf(socket)] = true;
        if (!subscribed) {
          _ref = _this.inPorts["in"].sockets;
          for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
            socket = _ref[id];
            _this.subscribeSocket(id);
          }
          return subscribed = true;
        }
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        var socket, _i, _len, _ref;
        _ref = _this.inPorts["in"].sockets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          socket = _ref[_i];
          if (socket.isConnected()) {
            return;
          }
        }
        _this.clearBuffers();
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  Concat.prototype.clearBuffers = function() {
    var data, id, _ref;
    _ref = this.buffers;
    for (id in _ref) {
      data = _ref[id];
      if (!this.hasConnected[id]) {
        return;
      }
    }
    this.buffers = {};
    return this.hasConnected = {};
  };

  Concat.prototype.subscribeSocket = function(id) {
    this.buffers[id] = [];
    return this.inPorts["in"].sockets[id].on('data', (function(_this) {
      return function(data) {
        if (typeof _this.buffers[id] !== 'object') {
          _this.buffers[id] = [];
        }
        _this.buffers[id].push(data);
        return _this.checkSend();
      };
    })(this));
  };

  Concat.prototype.checkSend = function() {
    var buffer, id, socket, _i, _len, _ref, _ref1, _results;
    _ref = this.inPorts["in"].sockets;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      socket = _ref[id];
      if (!this.buffers[id]) {
        return;
      }
      if (!this.buffers[id].length) {
        return;
      }
    }
    _ref1 = this.buffers;
    _results = [];
    for (id in _ref1) {
      buffer = _ref1[id];
      _results.push(this.outPorts.out.send(buffer.shift()));
    }
    return _results;
  };

  return Concat;

})(noflo.Component);

exports.getComponent = function() {
  return new Concat;
};

});
require.register("noflo-noflo-flow/components/Gate.js", function(exports, require, module){
var Gate, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Gate = (function(_super) {
  __extends(Gate, _super);

  Gate.prototype.description = 'This component forwards received packets when the gate is open';

  Gate.prototype.icon = 'pause';

  function Gate() {
    this.open = false;
    this.inPorts = {
      "in": new noflo.Port('all'),
      open: new noflo.Port('bang'),
      close: new noflo.Port('bang')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.inPorts["in"].on('connect', (function(_this) {
      return function() {
        if (!_this.open) {
          return;
        }
        return _this.outPorts.out.connect();
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (!_this.open) {
          return;
        }
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (!_this.open) {
          return;
        }
        return _this.outPorts.out.send(data);
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        if (!_this.open) {
          return;
        }
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.open) {
          return;
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.open.on('data', (function(_this) {
      return function() {
        _this.open = true;
        return _this.setIcon('play');
      };
    })(this));
    this.inPorts.close.on('data', (function(_this) {
      return function() {
        _this.open = false;
        _this.outPorts.out.disconnect();
        return _this.setIcon('pause');
      };
    })(this));
  }

  return Gate;

})(noflo.Component);

exports.getComponent = function() {
  return new Gate;
};

});
require.register("noflo-fbp/lib/fbp.js", function(exports, require, module){
module.exports = (function(){
  /*
   * Generated by PEG.js 0.7.0.
   *
   * http://pegjs.majda.cz/
   */
  
  function quote(s) {
    /*
     * ECMA-262, 5th ed., 7.8.4: All characters may appear literally in a
     * string literal except for the closing quote character, backslash,
     * carriage return, line separator, paragraph separator, and line feed.
     * Any character may appear in the form of an escape sequence.
     *
     * For portability, we also escape escape all control and non-ASCII
     * characters. Note that "\0" and "\v" escape sequences are not used
     * because JSHint does not like the first and IE the second.
     */
     return '"' + s
      .replace(/\\/g, '\\\\')  // backslash
      .replace(/"/g, '\\"')    // closing quote character
      .replace(/\x08/g, '\\b') // backspace
      .replace(/\t/g, '\\t')   // horizontal tab
      .replace(/\n/g, '\\n')   // line feed
      .replace(/\f/g, '\\f')   // form feed
      .replace(/\r/g, '\\r')   // carriage return
      .replace(/[\x00-\x07\x0B\x0E-\x1F\x80-\uFFFF]/g, escape)
      + '"';
  }
  
  var result = {
    /*
     * Parses the input with a generated parser. If the parsing is successfull,
     * returns a value explicitly or implicitly specified by the grammar from
     * which the parser was generated (see |PEG.buildParser|). If the parsing is
     * unsuccessful, throws |PEG.parser.SyntaxError| describing the error.
     */
    parse: function(input, startRule) {
      var parseFunctions = {
        "start": parse_start,
        "line": parse_line,
        "LineTerminator": parse_LineTerminator,
        "comment": parse_comment,
        "connection": parse_connection,
        "bridge": parse_bridge,
        "leftlet": parse_leftlet,
        "iip": parse_iip,
        "rightlet": parse_rightlet,
        "node": parse_node,
        "component": parse_component,
        "compMeta": parse_compMeta,
        "port": parse_port,
        "anychar": parse_anychar,
        "iipchar": parse_iipchar,
        "_": parse__,
        "__": parse___
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "start";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_start() {
        var result0, result1;
        var pos0;
        
        pos0 = pos;
        result0 = [];
        result1 = parse_line();
        while (result1 !== null) {
          result0.push(result1);
          result1 = parse_line();
        }
        if (result0 !== null) {
          result0 = (function(offset) { return parser.getResult();  })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_line() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.substr(pos, 7) === "EXPORT=") {
            result1 = "EXPORT=";
            pos += 7;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"EXPORT=\"");
            }
          }
          if (result1 !== null) {
            if (/^[A-Za-z.0-9_]/.test(input.charAt(pos))) {
              result3 = input.charAt(pos);
              pos++;
            } else {
              result3 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Za-z.0-9_]");
              }
            }
            if (result3 !== null) {
              result2 = [];
              while (result3 !== null) {
                result2.push(result3);
                if (/^[A-Za-z.0-9_]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Za-z.0-9_]");
                  }
                }
              }
            } else {
              result2 = null;
            }
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 58) {
                result3 = ":";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\":\"");
                }
              }
              if (result3 !== null) {
                if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                  result5 = input.charAt(pos);
                  pos++;
                } else {
                  result5 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Z0-9_]");
                  }
                }
                if (result5 !== null) {
                  result4 = [];
                  while (result5 !== null) {
                    result4.push(result5);
                    if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                      result5 = input.charAt(pos);
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Z0-9_]");
                      }
                    }
                  }
                } else {
                  result4 = null;
                }
                if (result4 !== null) {
                  result5 = parse__();
                  if (result5 !== null) {
                    result6 = parse_LineTerminator();
                    result6 = result6 !== null ? result6 : "";
                    if (result6 !== null) {
                      result0 = [result0, result1, result2, result3, result4, result5, result6];
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, priv, pub) {return parser.registerExports(priv.join(""),pub.join(""))})(pos0, result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse__();
          if (result0 !== null) {
            if (input.substr(pos, 7) === "INPORT=") {
              result1 = "INPORT=";
              pos += 7;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"INPORT=\"");
              }
            }
            if (result1 !== null) {
              if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[A-Za-z0-9_]");
                }
              }
              if (result3 !== null) {
                result2 = [];
                while (result3 !== null) {
                  result2.push(result3);
                  if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                    result3 = input.charAt(pos);
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("[A-Za-z0-9_]");
                    }
                  }
                }
              } else {
                result2 = null;
              }
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 46) {
                  result3 = ".";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\".\"");
                  }
                }
                if (result3 !== null) {
                  if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                    result5 = input.charAt(pos);
                    pos++;
                  } else {
                    result5 = null;
                    if (reportFailures === 0) {
                      matchFailed("[A-Z0-9_]");
                    }
                  }
                  if (result5 !== null) {
                    result4 = [];
                    while (result5 !== null) {
                      result4.push(result5);
                      if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                        result5 = input.charAt(pos);
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("[A-Z0-9_]");
                        }
                      }
                    }
                  } else {
                    result4 = null;
                  }
                  if (result4 !== null) {
                    if (input.charCodeAt(pos) === 58) {
                      result5 = ":";
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("\":\"");
                      }
                    }
                    if (result5 !== null) {
                      if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                        result7 = input.charAt(pos);
                        pos++;
                      } else {
                        result7 = null;
                        if (reportFailures === 0) {
                          matchFailed("[A-Z0-9_]");
                        }
                      }
                      if (result7 !== null) {
                        result6 = [];
                        while (result7 !== null) {
                          result6.push(result7);
                          if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                            result7 = input.charAt(pos);
                            pos++;
                          } else {
                            result7 = null;
                            if (reportFailures === 0) {
                              matchFailed("[A-Z0-9_]");
                            }
                          }
                        }
                      } else {
                        result6 = null;
                      }
                      if (result6 !== null) {
                        result7 = parse__();
                        if (result7 !== null) {
                          result8 = parse_LineTerminator();
                          result8 = result8 !== null ? result8 : "";
                          if (result8 !== null) {
                            result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8];
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, node, port, pub) {return parser.registerInports(node.join(""),port.join(""),pub.join(""))})(pos0, result0[2], result0[4], result0[6]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse__();
            if (result0 !== null) {
              if (input.substr(pos, 8) === "OUTPORT=") {
                result1 = "OUTPORT=";
                pos += 8;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"OUTPORT=\"");
                }
              }
              if (result1 !== null) {
                if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                  result3 = input.charAt(pos);
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("[A-Za-z0-9_]");
                  }
                }
                if (result3 !== null) {
                  result2 = [];
                  while (result3 !== null) {
                    result2.push(result3);
                    if (/^[A-Za-z0-9_]/.test(input.charAt(pos))) {
                      result3 = input.charAt(pos);
                      pos++;
                    } else {
                      result3 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Za-z0-9_]");
                      }
                    }
                  }
                } else {
                  result2 = null;
                }
                if (result2 !== null) {
                  if (input.charCodeAt(pos) === 46) {
                    result3 = ".";
                    pos++;
                  } else {
                    result3 = null;
                    if (reportFailures === 0) {
                      matchFailed("\".\"");
                    }
                  }
                  if (result3 !== null) {
                    if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                      result5 = input.charAt(pos);
                      pos++;
                    } else {
                      result5 = null;
                      if (reportFailures === 0) {
                        matchFailed("[A-Z0-9_]");
                      }
                    }
                    if (result5 !== null) {
                      result4 = [];
                      while (result5 !== null) {
                        result4.push(result5);
                        if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                          result5 = input.charAt(pos);
                          pos++;
                        } else {
                          result5 = null;
                          if (reportFailures === 0) {
                            matchFailed("[A-Z0-9_]");
                          }
                        }
                      }
                    } else {
                      result4 = null;
                    }
                    if (result4 !== null) {
                      if (input.charCodeAt(pos) === 58) {
                        result5 = ":";
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("\":\"");
                        }
                      }
                      if (result5 !== null) {
                        if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                          result7 = input.charAt(pos);
                          pos++;
                        } else {
                          result7 = null;
                          if (reportFailures === 0) {
                            matchFailed("[A-Z0-9_]");
                          }
                        }
                        if (result7 !== null) {
                          result6 = [];
                          while (result7 !== null) {
                            result6.push(result7);
                            if (/^[A-Z0-9_]/.test(input.charAt(pos))) {
                              result7 = input.charAt(pos);
                              pos++;
                            } else {
                              result7 = null;
                              if (reportFailures === 0) {
                                matchFailed("[A-Z0-9_]");
                              }
                            }
                          }
                        } else {
                          result6 = null;
                        }
                        if (result6 !== null) {
                          result7 = parse__();
                          if (result7 !== null) {
                            result8 = parse_LineTerminator();
                            result8 = result8 !== null ? result8 : "";
                            if (result8 !== null) {
                              result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8];
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, node, port, pub) {return parser.registerOutports(node.join(""),port.join(""),pub.join(""))})(pos0, result0[2], result0[4], result0[6]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              result0 = parse_comment();
              if (result0 !== null) {
                if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                  result1 = input.charAt(pos);
                  pos++;
                } else {
                  result1 = null;
                  if (reportFailures === 0) {
                    matchFailed("[\\n\\r\\u2028\\u2029]");
                  }
                }
                result1 = result1 !== null ? result1 : "";
                if (result1 !== null) {
                  result0 = [result0, result1];
                } else {
                  result0 = null;
                  pos = pos0;
                }
              } else {
                result0 = null;
                pos = pos0;
              }
              if (result0 === null) {
                pos0 = pos;
                result0 = parse__();
                if (result0 !== null) {
                  if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                    result1 = input.charAt(pos);
                    pos++;
                  } else {
                    result1 = null;
                    if (reportFailures === 0) {
                      matchFailed("[\\n\\r\\u2028\\u2029]");
                    }
                  }
                  if (result1 !== null) {
                    result0 = [result0, result1];
                  } else {
                    result0 = null;
                    pos = pos0;
                  }
                } else {
                  result0 = null;
                  pos = pos0;
                }
                if (result0 === null) {
                  pos0 = pos;
                  pos1 = pos;
                  result0 = parse__();
                  if (result0 !== null) {
                    result1 = parse_connection();
                    if (result1 !== null) {
                      result2 = parse__();
                      if (result2 !== null) {
                        result3 = parse_LineTerminator();
                        result3 = result3 !== null ? result3 : "";
                        if (result3 !== null) {
                          result0 = [result0, result1, result2, result3];
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                  if (result0 !== null) {
                    result0 = (function(offset, edges) {return parser.registerEdges(edges);})(pos0, result0[1]);
                  }
                  if (result0 === null) {
                    pos = pos0;
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_LineTerminator() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 44) {
            result1 = ",";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\",\"");
            }
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_comment();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (/^[\n\r\u2028\u2029]/.test(input.charAt(pos))) {
                result3 = input.charAt(pos);
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("[\\n\\r\\u2028\\u2029]");
                }
              }
              result3 = result3 !== null ? result3 : "";
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos0;
              }
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comment() {
        var result0, result1, result2, result3;
        var pos0;
        
        pos0 = pos;
        result0 = parse__();
        if (result0 !== null) {
          if (input.charCodeAt(pos) === 35) {
            result1 = "#";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\"#\"");
            }
          }
          if (result1 !== null) {
            result2 = [];
            result3 = parse_anychar();
            while (result3 !== null) {
              result2.push(result3);
              result3 = parse_anychar();
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos0;
            }
          } else {
            result0 = null;
            pos = pos0;
          }
        } else {
          result0 = null;
          pos = pos0;
        }
        return result0;
      }
      
      function parse_connection() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_bridge();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            if (input.substr(pos, 2) === "->") {
              result2 = "->";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"->\"");
              }
            }
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_connection();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, y) { return [x,y]; })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_bridge();
        }
        return result0;
      }
      
      function parse_bridge() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result3 = parse__();
              if (result3 !== null) {
                result4 = parse_port();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, x, proc, y) { return [{"tgt":{process:proc, port:x}},{"src":{process:proc, port:y}}]; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_iip();
          if (result0 === null) {
            result0 = parse_rightlet();
            if (result0 === null) {
              result0 = parse_leftlet();
            }
          }
        }
        return result0;
      }
      
      function parse_leftlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_node();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_port();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, proc, port) { return {"src":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_iip() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 39) {
          result0 = "'";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"'\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          result2 = parse_iipchar();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_iipchar();
          }
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 39) {
              result2 = "'";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"'\"");
              }
            }
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, iip) { return {"data":iip.join("")} })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_rightlet() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_port();
        if (result0 !== null) {
          result1 = parse__();
          if (result1 !== null) {
            result2 = parse_node();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, port, proc) { return {"tgt":{process:proc, port:port}} })(pos0, result0[0], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_node() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z0-9_]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[a-zA-Z0-9_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[a-zA-Z0-9_]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse_component();
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, node, comp) { if(comp){parser.addNode(node.join(""),comp);}; return node.join("")})(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_component() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 40) {
          result0 = "(";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"(\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/\-0-9_]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/\\-0-9_]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/\-0-9_]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/\\-0-9_]");
                }
              }
            }
          } else {
            result1 = null;
          }
          result1 = result1 !== null ? result1 : "";
          if (result1 !== null) {
            result2 = parse_compMeta();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              if (input.charCodeAt(pos) === 41) {
                result3 = ")";
                pos++;
              } else {
                result3 = null;
                if (reportFailures === 0) {
                  matchFailed("\")\"");
                }
              }
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, comp, meta) { var o = {}; comp ? o.comp = comp.join("") : o.comp = ''; meta ? o.meta = meta.join("").split(',') : null; return o; })(pos0, result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_compMeta() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 58) {
          result0 = ":";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\":\"");
          }
        }
        if (result0 !== null) {
          if (/^[a-zA-Z\/=_,0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[a-zA-Z\\/=_,0-9]");
            }
          }
          if (result2 !== null) {
            result1 = [];
            while (result2 !== null) {
              result1.push(result2);
              if (/^[a-zA-Z\/=_,0-9]/.test(input.charAt(pos))) {
                result2 = input.charAt(pos);
                pos++;
              } else {
                result2 = null;
                if (reportFailures === 0) {
                  matchFailed("[a-zA-Z\\/=_,0-9]");
                }
              }
            }
          } else {
            result1 = null;
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, meta) {return meta})(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_port() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[A-Z.0-9_]");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (/^[A-Z.0-9_]/.test(input.charAt(pos))) {
              result1 = input.charAt(pos);
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("[A-Z.0-9_]");
              }
            }
          }
        } else {
          result0 = null;
        }
        if (result0 !== null) {
          result1 = parse___();
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, portname) {return portname.join("").toLowerCase()})(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_anychar() {
        var result0;
        
        if (/^[^\n\r\u2028\u2029]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[^\\n\\r\\u2028\\u2029]");
          }
        }
        return result0;
      }
      
      function parse_iipchar() {
        var result0, result1;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (/^[\\]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\\\]");
          }
        }
        if (result0 !== null) {
          if (/^[']/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[']");
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset) { return "'"; })(pos0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          if (/^[^']/.test(input.charAt(pos))) {
            result0 = input.charAt(pos);
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("[^']");
            }
          }
        }
        return result0;
      }
      
      function parse__() {
        var result0, result1;
        
        result0 = [];
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (input.charCodeAt(pos) === 32) {
            result1 = " ";
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("\" \"");
            }
          }
        }
        result0 = result0 !== null ? result0 : "";
        return result0;
      }
      
      function parse___() {
        var result0, result1;
        
        if (input.charCodeAt(pos) === 32) {
          result1 = " ";
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("\" \"");
          }
        }
        if (result1 !== null) {
          result0 = [];
          while (result1 !== null) {
            result0.push(result1);
            if (input.charCodeAt(pos) === 32) {
              result1 = " ";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\" \"");
              }
            }
          }
        } else {
          result0 = null;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
        var parser, edges, nodes; 
      
        parser = this;
        delete parser.exports;
        delete parser.inports;
        delete parser.outports;
      
        edges = parser.edges = [];
      
        nodes = {};
      
        parser.addNode = function (nodeName, comp) {
          if (!nodes[nodeName]) {
            nodes[nodeName] = {}
          }
          if (!!comp.comp) {
            nodes[nodeName].component = comp.comp;
          }
          if (!!comp.meta) {
            var metadata = {};
            for (var i = 0; i < comp.meta.length; i++) {
              var item = comp.meta[i].split('=');
              if (item.length === 1) {
                item = ['routes', item[0]];
              }
              metadata[item[0]] = item[1];
            }
            nodes[nodeName].metadata=metadata;
          }
         
        }
      
        parser.getResult = function () {
          return {processes:nodes, connections:parser.processEdges(), exports:parser.exports, inports: parser.inports, outports: parser.outports};
        }  
      
        var flatten = function (array, isShallow) {
          var index = -1,
            length = array ? array.length : 0,
            result = [];
      
          while (++index < length) {
            var value = array[index];
      
            if (value instanceof Array) {
              Array.prototype.push.apply(result, isShallow ? value : flatten(value));
            }
            else {
              result.push(value);
            }
          }
          return result;
        }
        
        parser.registerExports = function (priv, pub) {
          if (!parser.exports) {
            parser.exports = [];
          }
          parser.exports.push({private:priv.toLowerCase(), public:pub.toLowerCase()})
        }
        parser.registerInports = function (node, port, pub) {
          if (!parser.inports) {
            parser.inports = {};
          }
          parser.inports[pub.toLowerCase()] = {process:node, port:port.toLowerCase()}
        }
        parser.registerOutports = function (node, port, pub) {
          if (!parser.outports) {
            parser.outports = {};
          }
          parser.outports[pub.toLowerCase()] = {process:node, port:port.toLowerCase()}
        }
      
        parser.registerEdges = function (edges) {
      
          edges.forEach(function (o, i) {
            parser.edges.push(o);
          });
        }  
      
        parser.processEdges = function () {   
          var flats, grouped;
          flats = flatten(parser.edges);
          grouped = [];
          var current = {};
          flats.forEach(function (o, i) {
            if (i % 2 !== 0) { 
              var pair = grouped[grouped.length - 1];
              pair.tgt = o.tgt;
              return;
            }
            grouped.push(o);
          });
          return grouped;
        }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    },
    
    /* Returns the parser source code. */
    toSource: function() { return this._source; }
  };
  
  /* Thrown when a parser encounters a syntax error. */
  
  result.SyntaxError = function(expected, found, offset, line, column) {
    function buildMessage(expected, found) {
      var expectedHumanized, foundHumanized;
      
      switch (expected.length) {
        case 0:
          expectedHumanized = "end of input";
          break;
        case 1:
          expectedHumanized = expected[0];
          break;
        default:
          expectedHumanized = expected.slice(0, expected.length - 1).join(", ")
            + " or "
            + expected[expected.length - 1];
      }
      
      foundHumanized = found ? quote(found) : "end of input";
      
      return "Expected " + expectedHumanized + " but " + foundHumanized + " found.";
    }
    
    this.name = "SyntaxError";
    this.expected = expected;
    this.found = found;
    this.message = buildMessage(expected, found);
    this.offset = offset;
    this.line = line;
    this.column = column;
  };
  
  result.SyntaxError.prototype = Error.prototype;
  
  return result;
})();
});
require.register("djdeath-noflo-xml/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("djdeath-noflo-xml/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-xml","description":"XML components for the NoFlo flow-based programming environment","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-xml","version":"0.0.2","keywords":[],"scripts":["index.js"],"json":["component.json"]}');
});
require.register("djdeath-noflo-filesystem/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */

});
require.register("djdeath-noflo-filesystem/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-filesystem","description":"Filesystem components for the NoFlo flow-based programming environment","author":"Henri Bergius <henri.bergius@iki.fi>","version":"1.0.4","repo":"noflo/noflo-filesystem","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/BaseName.js","components/CopyFile.js","components/CopyTree.js","components/DirName.js","components/DirectoryBuffer.js","components/DirectoryGroupBuffer.js","components/ExtName.js","components/MakeDir.js","components/MimeRouter.js","components/MimeDocumentRouter.js","components/ReadDir.js","components/ReadFile.js","components/ReadFileSync.js","components/ReadFileRaw.js","components/Stat.js","components/WriteFile.js","components/WriteFileRaw.js","index.js"],"json":["component.json"],"noflo":{"components":{"BaseName":"components/BaseName.js","CopyFile":"components/CopyFile.js","CopyTree":"components/CopyTree.js","DirName":"components/DirName.js","DirectoryBuffer":"components/DirectoryBuffer.js","DirectoryGroupBuffer":"components/DirectoryGroupBuffer.js","ExtName":"components/ExtName.js","MakeDir":"components/MakeDir.js","MimeRouter":"components/MimeRouter.js","MimeDocumentRouter":"components/MimeDocumentRouter.js","ReadDir":"components/ReadDir.js","ReadFile":"components/ReadFile.js","ReadFileSync":"components/ReadFileSync.js","ReadFileRaw":"components/ReadFileRaw.js","Stat":"components/Stat.js","WriteFile":"components/WriteFile.js","WriteFileRaw":"components/WriteFileRaw.js"}}}');
});
require.register("djdeath-noflo-filesystem/components/BaseName.js", function(exports, require, module){
var BaseName, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

path = require('path');

noflo = require("noflo");

BaseName = (function(_super) {
  __extends(BaseName, _super);

  BaseName.prototype.icon = 'file';

  function BaseName() {
    this.ext = '';
    this.inPorts = {
      "in": new noflo.Port('string'),
      ext: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(path.basename(data, _this.ext));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.ext.on('data', (function(_this) {
      return function(ext) {
        _this.ext = ext;
      };
    })(this));
  }

  return BaseName;

})(noflo.Component);

exports.getComponent = function() {
  return new BaseName;
};

});
require.register("djdeath-noflo-filesystem/components/CopyFile.js", function(exports, require, module){
var CopyFile, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs');

noflo = require("noflo");

CopyFile = (function(_super) {
  __extends(CopyFile, _super);

  CopyFile.prototype.icon = 'copy';

  function CopyFile() {
    this.sourcePath = null;
    this.destPath = null;
    this.disconnected = false;
    this.q = [];
    this.inPorts = {
      source: new noflo.Port(),
      destination: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    this.inPorts.source.on('data', (function(_this) {
      return function(data) {
        if (_this.destPath) {
          _this.copy(data, _this.destPath);
          _this.destPath = null;
          return;
        }
        return _this.sourcePath = data;
      };
    })(this));
    this.inPorts.destination.on('data', (function(_this) {
      return function(data) {
        if (_this.sourcePath) {
          _this.copy(_this.sourcePath, data);
          _this.sourcePath = null;
          return;
        }
        return _this.destPath = data;
      };
    })(this));
    this.inPorts.source.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.destination.isConnected()) {
          return;
        }
        return _this.disconnected = true;
      };
    })(this));
    this.inPorts.destination.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.source.isConnected()) {
          return;
        }
        return _this.disconnected = true;
      };
    })(this));
  }

  CopyFile.prototype.processQueue = function() {
    var item, _results;
    _results = [];
    while (this.q.length) {
      item = this.q.shift();
      _results.push(this.copy(item.source, item.destination));
    }
    return _results;
  };

  CopyFile.prototype.copy = function(source, destination) {
    var handleError, rs, ws;
    handleError = (function(_this) {
      return function(err) {
        if (err.code === 'EMFILE') {
          _this.q.push({
            source: source,
            destination: destination
          });
          process.nextTick(function() {
            return _this.processQueue();
          });
          return;
        }
        if (!_this.outPorts.error.isAttached()) {
          return;
        }
        _this.outPorts.error.send(err);
        return _this.outPorts.error.disconnect();
      };
    })(this);
    rs = fs.createReadStream(source);
    ws = fs.createWriteStream(destination);
    rs.on('error', handleError);
    ws.on('error', handleError);
    rs.pipe(ws);
    return rs.on('end', (function(_this) {
      return function() {
        _this.outPorts.out.send(destination);
        if (_this.disconnected) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
  };

  return CopyFile;

})(noflo.Component);

exports.getComponent = function() {
  return new CopyFile;
};

});
require.register("djdeath-noflo-filesystem/components/CopyTree.js", function(exports, require, module){
var CopyTree, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs.extra');

noflo = require('noflo');

CopyTree = (function(_super) {
  __extends(CopyTree, _super);

  CopyTree.prototype.icon = 'copy';

  function CopyTree() {
    this.from = null;
    this.to = null;
    this.inPorts = {
      from: new noflo.Port,
      to: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      error: new noflo.Port
    };
    this.inPorts.from.on('data', (function(_this) {
      return function(data) {
        _this.from = data;
        if (_this.to) {
          return _this.copy();
        }
      };
    })(this));
    this.inPorts.to.on('data', (function(_this) {
      return function(data) {
        _this.to = data;
        if (_this.from) {
          return _this.copy();
        }
      };
    })(this));
  }

  CopyTree.prototype.copy = function() {
    return fs.copyRecursive(this.from, this.to, (function(_this) {
      return function(err) {
        if (err) {
          _this.outPorts.error.send(err);
          _this.outPorts.error.disconnect();
          return;
        }
        _this.outPorts.out.send(_this.to);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  };

  return CopyTree;

})(noflo.Component);

exports.getComponent = function() {
  return new CopyTree;
};

});
require.register("djdeath-noflo-filesystem/components/DirName.js", function(exports, require, module){
var DirName, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

path = require('path');

noflo = require("noflo");

DirName = (function(_super) {
  __extends(DirName, _super);

  DirName.prototype.icon = 'folder';

  function DirName() {
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(path.dirname(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return DirName;

})(noflo.Component);

exports.getComponent = function() {
  return new DirName;
};

});
require.register("djdeath-noflo-filesystem/components/DirectoryBuffer.js", function(exports, require, module){
var DirectoryBuffer, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

path = require('path');

DirectoryBuffer = (function(_super) {
  __extends(DirectoryBuffer, _super);

  DirectoryBuffer.prototype.icon = 'folder';

  function DirectoryBuffer() {
    this.buffers = {};
    this.released = [];
    this.inPorts = {
      collect: new noflo.Port('string'),
      release: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.groups = [];
    this.inPorts.collect.on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts.collect.on('data', (function(_this) {
      return function(data) {
        var bufName;
        bufName = path.dirname(data);
        if (_this.released.indexOf(bufName) !== -1) {
          _this.release({
            data: data,
            groups: _this.groups.slice(0)
          });
          return;
        }
        if (!_this.buffers[bufName]) {
          _this.buffers[bufName] = [];
        }
        return _this.buffers[bufName].push({
          data: data,
          groups: _this.groups.slice(0)
        });
      };
    })(this));
    this.inPorts.collect.on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts.release.on('data', (function(_this) {
      return function(data) {
        var _results;
        _this.released.push(data);
        if (!_this.buffers[data]) {
          return;
        }
        _results = [];
        while (_this.buffers[data].length > 0) {
          _results.push(_this.release(_this.buffers[data].pop()));
        }
        return _results;
      };
    })(this));
    this.inPorts.collect.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.release.isConnected()) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
    this.inPorts.release.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.collect.isConnected()) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
  }

  DirectoryBuffer.prototype.release = function(packet) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = packet.groups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(packet.data);
    _ref1 = packet.groups;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return DirectoryBuffer;

})(noflo.Component);

exports.getComponent = function() {
  return new DirectoryBuffer;
};

});
require.register("djdeath-noflo-filesystem/components/DirectoryGroupBuffer.js", function(exports, require, module){
var DirectoryGroupBuffer, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

path = require('path');

DirectoryGroupBuffer = (function(_super) {
  __extends(DirectoryGroupBuffer, _super);

  DirectoryGroupBuffer.prototype.icon = 'folder';

  function DirectoryGroupBuffer() {
    this.buffers = {};
    this.released = [];
    this.inPorts = {
      collect: new noflo.Port('all'),
      release: new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('all')
    };
    this.groups = [];
    this.inPorts.collect.on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts.collect.on('data', (function(_this) {
      return function(data) {
        var bufName;
        bufName = path.dirname(_this.groups.join('/'));
        if (_this.released.indexOf(bufName) !== -1) {
          _this.release({
            data: data,
            groups: _this.groups.slice(0)
          });
          return;
        }
        if (!_this.buffers[bufName]) {
          _this.buffers[bufName] = [];
        }
        return _this.buffers[bufName].push({
          data: data,
          groups: _this.groups.slice(0)
        });
      };
    })(this));
    this.inPorts.collect.on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts.release.on('data', (function(_this) {
      return function(data) {
        var _results;
        _this.released.push(data);
        if (!_this.buffers[data]) {
          return;
        }
        _results = [];
        while (_this.buffers[data].length > 0) {
          _results.push(_this.release(_this.buffers[data].pop()));
        }
        return _results;
      };
    })(this));
    this.inPorts.collect.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.release.isConnected()) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
    this.inPorts.release.on('disconnect', (function(_this) {
      return function() {
        if (!_this.inPorts.collect.isConnected()) {
          return _this.outPorts.out.disconnect();
        }
      };
    })(this));
  }

  DirectoryGroupBuffer.prototype.release = function(packet) {
    var group, _i, _j, _len, _len1, _ref, _ref1, _results;
    _ref = packet.groups;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      group = _ref[_i];
      this.outPorts.out.beginGroup(group);
    }
    this.outPorts.out.send(packet.data);
    _ref1 = packet.groups;
    _results = [];
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      group = _ref1[_j];
      _results.push(this.outPorts.out.endGroup());
    }
    return _results;
  };

  return DirectoryGroupBuffer;

})(noflo.Component);

exports.getComponent = function() {
  return new DirectoryGroupBuffer;
};

});
require.register("djdeath-noflo-filesystem/components/ExtName.js", function(exports, require, module){
var ExtName, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

path = require('path');

noflo = require("noflo");

ExtName = (function(_super) {
  __extends(ExtName, _super);

  ExtName.prototype.icon = 'file';

  function ExtName() {
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        return _this.outPorts.out.send(path.extname(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return ExtName;

})(noflo.Component);

exports.getComponent = function() {
  return new ExtName;
};

});
require.register("djdeath-noflo-filesystem/components/MakeDir.js", function(exports, require, module){
var MakeDir, fs, noflo, path,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs');

path = require('path');

noflo = require('noflo');

MakeDir = (function(_super) {
  __extends(MakeDir, _super);

  MakeDir.prototype.icon = 'folder';

  function MakeDir() {
    this.inPorts = {
      "in": new noflo.Port('string')
    };
    this.outPorts = {
      out: new noflo.Port('string'),
      error: new noflo.Port('object')
    };
    MakeDir.__super__.constructor.call(this);
  }

  MakeDir.prototype.sendPath = function(dirPath) {};

  MakeDir.prototype.doAsync = function(dirPath, callback) {
    return this.mkDir(dirPath, (function(_this) {
      return function(err) {
        if (err) {
          return callback(err);
        }
        _this.outPorts.out.send(dirPath);
        _this.outPorts.out.disconnect();
        return callback(null);
      };
    })(this));
  };

  MakeDir.prototype.mkDir = function(dirPath, callback) {
    var orig;
    orig = dirPath;
    dirPath = path.resolve(dirPath);
    return fs.mkdir(dirPath, (function(_this) {
      return function(err) {
        if (!err) {
          return callback(null);
        }
        switch (err.code) {
          case 'ENOENT':
            return _this.mkDir(path.dirname(dirPath), function(err) {
              if (err) {
                return callback(err);
              }
              return _this.mkDir(dirPath, callback);
            });
          default:
            return fs.stat(dirPath, function(statErr, stat) {
              if (statErr) {
                return callback(err);
              }
              if (!stat.isDirectory()) {
                return callback(err);
              }
              return callback(null);
            });
        }
      };
    })(this));
  };

  return MakeDir;

})(noflo.AsyncComponent);

exports.getComponent = function() {
  return new MakeDir;
};

});
require.register("djdeath-noflo-filesystem/components/MimeRouter.js", function(exports, require, module){
var MimeRouter, mimetype, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

mimetype = require('mimetype');

mimetype.set('.markdown', 'text/x-markdown');

mimetype.set('.md', 'text/x-markdown');

mimetype.set('.xml', 'text/xml');

MimeRouter = (function(_super) {
  __extends(MimeRouter, _super);

  MimeRouter.prototype.icon = 'code-fork';

  function MimeRouter() {
    this.routes = [];
    this.inPorts = {
      types: new noflo.Port('all'),
      routes: new noflo.Port('all'),
      "in": new noflo.ArrayPort('string')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('string'),
      missed: new noflo.Port('string')
    };
    this.inPorts.routes.on('data', (function(_this) {
      return function(data) {
        if (typeof data === 'string') {
          data = data.split(',');
        }
        return _this.routes = data;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var id, matcher, mime, selected, _i, _len, _ref;
        mime = mimetype.lookup(data);
        if (!mime) {
          return _this.missed(data);
        }
        selected = null;
        _ref = _this.routes;
        for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
          matcher = _ref[id];
          if (mime.indexOf(matcher) !== -1) {
            selected = id;
          }
        }
        if (selected === null) {
          return _this.missed(data);
        }
        return _this.outPorts.out.send(data, selected);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.disconnect();
        }
      };
    })(this));
  }

  MimeRouter.prototype.missed = function(data) {
    if (!this.outPorts.missed.isAttached()) {
      return;
    }
    return this.outPorts.missed.send(data);
  };

  return MimeRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new MimeRouter;
};

});
require.register("djdeath-noflo-filesystem/components/MimeDocumentRouter.js", function(exports, require, module){
var MimeDocumentRouter, mimetype, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

mimetype = require('mimetype');

mimetype.set('.markdown', 'text/x-markdown');

mimetype.set('.md', 'text/x-markdown');

mimetype.set('.xml', 'text/xml');

MimeDocumentRouter = (function(_super) {
  __extends(MimeDocumentRouter, _super);

  MimeDocumentRouter.prototype.icon = 'code-fork';

  function MimeDocumentRouter() {
    this.routes = [];
    this.inPorts = {
      routes: new noflo.Port,
      "in": new noflo.ArrayPort
    };
    this.outPorts = {
      out: new noflo.ArrayPort,
      missed: new noflo.Port
    };
    this.inPorts.routes.on('data', (function(_this) {
      return function(data) {
        if (typeof data === 'string') {
          data = data.split(',');
        }
        return _this.routes = data;
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        var id, matcher, mime, selected, _i, _len, _ref;
        if (!data.path) {
          return _this.missed(data);
        }
        mime = mimetype.lookup(data.path);
        if (!mime) {
          return _this.missed(data);
        }
        selected = null;
        _ref = _this.routes;
        for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
          matcher = _ref[id];
          if (mime.indexOf(matcher) !== -1) {
            selected = id;
          }
        }
        if (selected === null) {
          return _this.missed(data);
        }
        return _this.outPorts.out.send(data, selected);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        _this.outPorts.out.disconnect();
        if (_this.outPorts.missed.isAttached()) {
          return _this.outPorts.missed.disconnect();
        }
      };
    })(this));
  }

  MimeDocumentRouter.prototype.missed = function(data) {
    if (!this.outPorts.missed.isAttached()) {
      return;
    }
    return this.outPorts.missed.send(data);
  };

  return MimeDocumentRouter;

})(noflo.Component);

exports.getComponent = function() {
  return new MimeDocumentRouter;
};

});
require.register("djdeath-noflo-filesystem/components/ReadDir.js", function(exports, require, module){
var ReadDir, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require("fs");

noflo = require("noflo");

ReadDir = (function(_super) {
  __extends(ReadDir, _super);

  ReadDir.prototype.icon = 'folder-open';

  function ReadDir() {
    this.inPorts = {
      source: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    ReadDir.__super__.constructor.call(this, 'source');
  }

  ReadDir.prototype.doAsync = function(path, callback) {
    return fs.readdir(path, (function(_this) {
      return function(err, files) {
        var f, sortedFiles, _i, _len;
        if (err) {
          return callback(err);
        }
        if (path.slice(-1) === "/") {
          path = path.slice(0, -1);
        }
        sortedFiles = files.sort();
        for (_i = 0, _len = sortedFiles.length; _i < _len; _i++) {
          f = sortedFiles[_i];
          _this.outPorts.out.send("" + path + "/" + f);
        }
        _this.outPorts.out.disconnect();
        return callback(null);
      };
    })(this));
  };

  return ReadDir;

})(noflo.AsyncComponent);

exports.getComponent = function() {
  return new ReadDir();
};

});
require.register("djdeath-noflo-filesystem/components/ReadFile.js", function(exports, require, module){
var ReadFile, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require("fs");

noflo = require("noflo");

ReadFile = (function(_super) {
  __extends(ReadFile, _super);

  function ReadFile() {
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    ReadFile.__super__.constructor.call(this);
  }

  ReadFile.prototype.doAsync = function(fileName, callback) {
    return fs.readFile(fileName, "utf-8", (function(_this) {
      return function(err, data) {
        if (err != null) {
          return callback(err);
        }
        _this.outPorts.out.beginGroup(fileName);
        _this.outPorts.out.send(data);
        _this.outPorts.out.endGroup();
        _this.outPorts.out.disconnect();
        return callback(null);
      };
    })(this));
  };

  return ReadFile;

})(noflo.AsyncComponent);

exports.getComponent = function() {
  return new ReadFile;
};

});
require.register("djdeath-noflo-filesystem/components/ReadFileSync.js", function(exports, require, module){
var ReadFileSync, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require("fs");

noflo = require("noflo");

ReadFileSync = (function(_super) {
  __extends(ReadFileSync, _super);

  ReadFileSync.prototype.description = 'Just like ReadFile, but blocks until content is read';

  function ReadFileSync() {
    this.encoding = 'utf-8';
    this.inPorts = {
      "in": new noflo.Port,
      encoding: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      error: new noflo.Port
    };
    this.inPorts.encoding.on('data', (function(_this) {
      return function(encoding) {
        _this.encoding = encoding;
      };
    })(this));
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(filename) {
        var e;
        try {
          return _this.outPorts.out.send(fs.readFileSync(filename, _this.encoding));
        } catch (_error) {
          e = _error;
          if (_this.outPorts.error.isAttached()) {
            _this.outPorts.error.send(e);
            return _this.outPorts.error.disconnect();
          }
        }
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function(group) {
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return ReadFileSync;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadFileSync;
};

});
require.register("djdeath-noflo-filesystem/components/ReadFileRaw.js", function(exports, require, module){
var ReadFileRaw, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require("fs");

noflo = require("noflo");

ReadFileRaw = (function(_super) {
  __extends(ReadFileRaw, _super);

  function ReadFileRaw() {
    this.inPorts = {
      source: new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    this.inPorts.source.on("data", (function(_this) {
      return function(data) {
        return _this.readFile(data);
      };
    })(this));
  }

  ReadFileRaw.prototype.readBuffer = function(fd, position, size, buffer) {
    return fs.read(fd, buffer, 0, buffer.length, position, (function(_this) {
      return function(err, bytes, buffer) {
        _this.outPorts.out.send(buffer.slice(0, bytes));
        position += buffer.length;
        if (position >= size) {
          return _this.outPorts.out.disconnect();
        }
        return _this.readBuffer(fd, position, size, buffer);
      };
    })(this));
  };

  ReadFileRaw.prototype.readFile = function(filename) {
    return fs.open(filename, 'r', (function(_this) {
      return function(err, fd) {
        if (err) {
          return _this.outPorts.error.send(err);
        }
        return fs.fstat(fd, function(err, stats) {
          var buffer;
          if (err) {
            return _this.outPorts.error.send(err);
          }
          buffer = new Buffer(stats.size);
          return _this.readBuffer(fd, 0, stats.size, buffer);
        });
      };
    })(this));
  };

  return ReadFileRaw;

})(noflo.Component);

exports.getComponent = function() {
  return new ReadFileRaw;
};

});
require.register("djdeath-noflo-filesystem/components/Stat.js", function(exports, require, module){
var Stat, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require("fs");

noflo = require("noflo");

Stat = (function(_super) {
  __extends(Stat, _super);

  function Stat() {
    this.inPorts = {
      "in": new noflo.Port()
    };
    this.outPorts = {
      out: new noflo.Port(),
      error: new noflo.Port()
    };
    Stat.__super__.constructor.call(this);
  }

  Stat.prototype.doAsync = function(path, callback) {
    return fs.stat(path, (function(_this) {
      return function(err, stats) {
        var func, _i, _len, _ref;
        if (err) {
          return callback(err);
        }
        callback(null);
        stats.path = path;
        _ref = ["isFile", "isDirectory", "isBlockDevice", "isCharacterDevice", "isFIFO", "isSocket"];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          func = _ref[_i];
          stats[func] = stats[func]();
        }
        _this.outPorts.out.send(stats);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  };

  return Stat;

})(noflo.AsyncComponent);

exports.getComponent = function() {
  return new Stat();
};

});
require.register("djdeath-noflo-filesystem/components/WriteFile.js", function(exports, require, module){
var WriteFile, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

fs = require('fs');

noflo = require('noflo');

WriteFile = (function(_super) {
  __extends(WriteFile, _super);

  WriteFile.prototype.icon = 'save';

  function WriteFile() {
    this.data = null;
    this.filename = null;
    this.inPorts = {
      "in": new noflo.Port,
      filename: new noflo.Port
    };
    this.outPorts = {
      out: new noflo.Port,
      error: new noflo.Port
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (_this.filename) {
          _this.writeFile(_this.filename, data);
          _this.filename = null;
          return;
        }
        return _this.data = data;
      };
    })(this));
    this.inPorts.filename.on('data', (function(_this) {
      return function(data) {
        if (_this.data !== null) {
          _this.writeFile(data, _this.data);
          _this.data = null;
          return;
        }
        return _this.filename = data;
      };
    })(this));
  }

  WriteFile.prototype.writeFile = function(filename, data) {
    return fs.writeFile(filename, data, 'utf-8', (function(_this) {
      return function(err) {
        if (err) {
          return _this.outPorts.error.send(err);
        }
        _this.outPorts.out.send(filename);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  };

  return WriteFile;

})(noflo.Component);

exports.getComponent = function() {
  return new WriteFile;
};

});
require.register("djdeath-noflo-filesystem/components/WriteFileRaw.js", function(exports, require, module){
var WriteFileRaw, fs, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require("noflo");

fs = require("fs");

WriteFileRaw = (function(_super) {
  __extends(WriteFileRaw, _super);

  WriteFileRaw.prototype.icon = 'save';

  function WriteFileRaw() {
    this.filename = null;
    this.data = null;
    this.inPorts = {
      "in": new noflo.Port,
      filename: new noflo.Port
    };
    this.outPorts = {
      filename: new noflo.Port,
      error: new noflo.Port
    };
    this.inPorts["in"].on("data", (function(_this) {
      return function(data) {
        _this.data = data;
        if (_this.filename) {
          return _this.writeFile(_this.filename, data);
        }
      };
    })(this));
    this.inPorts.filename.on('endgroup', (function(_this) {
      return function() {
        return _this.filename = null;
      };
    })(this));
    this.inPorts.filename.on("data", (function(_this) {
      return function(data) {
        _this.filename = data;
        if (_this.data) {
          return _this.writeFile(data, _this.data);
        }
      };
    })(this));
  }

  WriteFileRaw.prototype.writeFile = function(filename, data) {
    return fs.open(filename, 'w', (function(_this) {
      return function(err, fd) {
        if (err) {
          return _this.outPorts.error.send(err);
        }
        return fs.write(fd, data, 0, data.length, 0, function(err, bytes, buffer) {
          if (err) {
            return _this.outPorts.error.send(err);
          }
          _this.outPorts.filename.send(filename);
          return _this.outPorts.filename.disconnect();
        });
      };
    })(this));
  };

  return WriteFileRaw;

})(noflo.Component);

exports.getComponent = function() {
  return new WriteFileRaw;
};

});
require.register("djdeath-noflo-math/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-math.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("djdeath-noflo-math/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-math","description":"Mathematical components for NoFlo","author":"Henri Bergius <henri.bergius@iki.fi>","repo":"noflo/noflo-math","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Add.js","components/Ceil.js","components/Subtract.js","components/Multiply.js","components/Divide.js","components/Floor.js","components/CalculateAngle.js","components/CalculateDistance.js","components/Compare.js","components/CountSum.js","components/Modulo.js","components/Round.js","lib/MathComponent.js","index.js"],"json":["component.json"],"noflo":{"icon":"plus-circle","components":{"Add":"components/Add.js","Ceil":"components/Ceil.js","Subtract":"components/Subtract.js","Multiply":"components/Multiply.js","Divide":"components/Divide.js","Floor":"components/Floor.js","CalculateAngle":"components/CalculateAngle.js","CalculateDistance":"components/CalculateDistance.js","Compare":"components/Compare.js","CountSum":"components/CountSum.js","Modulo":"components/Modulo.js","Round":"components/Round.js"}}}');
});
require.register("djdeath-noflo-math/components/Add.js", function(exports, require, module){
var Add, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Add = (function(_super) {
  __extends(Add, _super);

  Add.prototype.icon = 'plus';

  function Add() {
    Add.__super__.constructor.call(this, 'augend', 'addend', 'sum');
  }

  Add.prototype.calculate = function(augend, addend) {
    return Number(augend) + Number(addend);
  };

  return Add;

})(MathComponent);

exports.getComponent = function() {
  return new Add;
};

});
require.register("djdeath-noflo-math/components/Ceil.js", function(exports, require, module){
var Ceil, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Ceil = (function(_super) {
  __extends(Ceil, _super);

  function Ceil() {
    this.inPorts = {
      "in": new noflo.Port('number')
    };
    this.outPorts = {
      out: new noflo.Port('integer')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.send(Math.ceil(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Ceil;

})(noflo.Component);

exports.getComponent = function() {
  return new Ceil;
};

});
require.register("djdeath-noflo-math/components/Subtract.js", function(exports, require, module){
var MathComponent, Subtract,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Subtract = (function(_super) {
  __extends(Subtract, _super);

  Subtract.prototype.icon = 'minus';

  function Subtract() {
    Subtract.__super__.constructor.call(this, 'minuend', 'subtrahend', 'difference');
  }

  Subtract.prototype.calculate = function(minuend, subtrahend) {
    return minuend - subtrahend;
  };

  return Subtract;

})(MathComponent);

exports.getComponent = function() {
  return new Subtract;
};

});
require.register("djdeath-noflo-math/components/Multiply.js", function(exports, require, module){
var MathComponent, Multiply,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Multiply = (function(_super) {
  __extends(Multiply, _super);

  Multiply.prototype.icon = 'asterisk';

  function Multiply() {
    Multiply.__super__.constructor.call(this, 'multiplicand', 'multiplier', 'product');
  }

  Multiply.prototype.calculate = function(multiplicand, multiplier) {
    return multiplicand * multiplier;
  };

  return Multiply;

})(MathComponent);

exports.getComponent = function() {
  return new Multiply;
};

});
require.register("djdeath-noflo-math/components/Divide.js", function(exports, require, module){
var Divide, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Divide = (function(_super) {
  __extends(Divide, _super);

  function Divide() {
    Divide.__super__.constructor.call(this, 'dividend', 'divisor', 'quotient');
  }

  Divide.prototype.calculate = function(dividend, divisor) {
    return dividend / divisor;
  };

  return Divide;

})(MathComponent);

exports.getComponent = function() {
  return new Divide;
};

});
require.register("djdeath-noflo-math/components/Floor.js", function(exports, require, module){
var Floor, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Floor = (function(_super) {
  __extends(Floor, _super);

  function Floor() {
    this.inPorts = {
      "in": new noflo.Port('number')
    };
    this.outPorts = {
      out: new noflo.Port('integer')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.send(Math.floor(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Floor;

})(noflo.Component);

exports.getComponent = function() {
  return new Floor;
};

});
require.register("djdeath-noflo-math/components/CalculateAngle.js", function(exports, require, module){
var CalculateAngle, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

CalculateAngle = (function(_super) {
  __extends(CalculateAngle, _super);

  CalculateAngle.prototype.description = 'Calculate the angle between two points';

  CalculateAngle.prototype.icon = 'compass';

  function CalculateAngle() {
    CalculateAngle.__super__.constructor.call(this, 'origin', 'destination', 'angle', 'object');
  }

  CalculateAngle.prototype.calculate = function(origin, destination) {
    var angle, deltaX, deltaY;
    deltaX = destination.x - origin.x;
    deltaY = destination.y - origin.y;
    origin = null;
    destination = null;
    angle = (Math.atan2(deltaY, deltaX) * 180 / Math.PI) + 90;
    if (angle < 0) {
      angle = angle + 360;
    }
    return angle;
  };

  return CalculateAngle;

})(MathComponent);

exports.getComponent = function() {
  return new CalculateAngle;
};

});
require.register("djdeath-noflo-math/components/CalculateDistance.js", function(exports, require, module){
var CalculateDistance, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

CalculateDistance = (function(_super) {
  __extends(CalculateDistance, _super);

  CalculateDistance.prototype.icon = 'arrow-right';

  CalculateDistance.prototype.description = 'Calculate the distance between two points';

  function CalculateDistance() {
    CalculateDistance.__super__.constructor.call(this, 'origin', 'destination', 'distance', 'object');
  }

  CalculateDistance.prototype.calculate = function(origin, destination) {
    var deltaX, deltaY, distance;
    deltaX = destination.x - origin.x;
    deltaY = destination.y - origin.y;
    origin = null;
    destination = null;
    distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
    return distance;
  };

  return CalculateDistance;

})(MathComponent);

exports.getComponent = function() {
  return new CalculateDistance;
};

});
require.register("djdeath-noflo-math/components/Compare.js", function(exports, require, module){
var Compare, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Compare = (function(_super) {
  __extends(Compare, _super);

  Compare.prototype.description = 'Compare two numbers';

  Compare.prototype.icon = 'check';

  function Compare() {
    this.operator = '==';
    this.value = null;
    this.comparison = null;
    this.inPorts = {
      value: new noflo.Port('number'),
      comparison: new noflo.Port('number'),
      operator: new noflo.Port('string')
    };
    this.outPorts = {
      pass: new noflo.Port('number'),
      fail: new noflo.Port('number')
    };
    this.inPorts.operator.on('data', (function(_this) {
      return function(operator) {
        _this.operator = operator;
      };
    })(this));
    this.inPorts.value.on('data', (function(_this) {
      return function(value) {
        _this.value = value;
        if (_this.comparison) {
          return _this.compare();
        }
      };
    })(this));
    this.inPorts.value.on('disconnect', (function(_this) {
      return function() {
        return _this.outPorts.pass.disconnect();
      };
    })(this));
    this.inPorts.comparison.on('data', (function(_this) {
      return function(comparison) {
        _this.comparison = comparison;
        if (_this.value) {
          return _this.compare();
        }
      };
    })(this));
  }

  Compare.prototype.compare = function() {
    switch (this.operator) {
      case 'eq':
      case '==':
        if (this.value === this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'ne':
      case '!=':
        if (this.value !== this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'gt':
      case '>':
        if (this.value > this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'lt':
      case '<':
        if (this.value < this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'ge':
      case '>=':
        if (this.value >= this.comparison) {
          return this.send(this.value);
        }
        break;
      case 'le':
      case '<=':
        if (this.value <= this.comparison) {
          return this.send(this.value);
        }
    }
    if (!this.outPorts.fail.isAttached()) {
      return;
    }
    this.outPorts.fail.send(this.value);
    return this.outPorts.fail.disconnect();
  };

  Compare.prototype.send = function(val) {
    return this.outPorts.pass.send(this.value);
  };

  return Compare;

})(noflo.Component);

exports.getComponent = function() {
  return new Compare;
};

});
require.register("djdeath-noflo-math/components/CountSum.js", function(exports, require, module){
var CountSum, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

CountSum = (function(_super) {
  __extends(CountSum, _super);

  function CountSum() {
    this.portCounts = {};
    this.inPorts = {
      "in": new noflo.ArrayPort('number')
    };
    this.outPorts = {
      out: new noflo.ArrayPort('number')
    };
    this.inPorts["in"].on('data', (function(_this) {
      return function(data, portId) {
        return _this.count(portId, data);
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function(socket, portId) {
        var _i, _len, _ref;
        _ref = _this.inPorts["in"].sockets;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          socket = _ref[_i];
          if (socket.isConnected()) {
            return;
          }
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  CountSum.prototype.count = function(port, data) {
    var id, socket, sum, _i, _len, _ref;
    sum = 0;
    this.portCounts[port] = data;
    _ref = this.inPorts["in"].sockets;
    for (id = _i = 0, _len = _ref.length; _i < _len; id = ++_i) {
      socket = _ref[id];
      if (typeof this.portCounts[id] === 'undefined') {
        this.portCounts[id] = 0;
      }
      sum += this.portCounts[id];
    }
    return this.outPorts.out.send(sum);
  };

  return CountSum;

})(noflo.Component);

exports.getComponent = function() {
  return new CountSum;
};

});
require.register("djdeath-noflo-math/components/Modulo.js", function(exports, require, module){
var Divide, MathComponent,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MathComponent = require('../lib/MathComponent').MathComponent;

Divide = (function(_super) {
  __extends(Divide, _super);

  function Divide() {
    Divide.__super__.constructor.call(this, 'dividend', 'divisor', 'remainder');
  }

  Divide.prototype.calculate = function(dividend, divisor) {
    return dividend % divisor;
  };

  return Divide;

})(MathComponent);

exports.getComponent = function() {
  return new Divide;
};

});
require.register("djdeath-noflo-math/components/Round.js", function(exports, require, module){
var Round, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

Round = (function(_super) {
  __extends(Round, _super);

  Round.prototype.icon = 'circle-o';

  function Round() {
    this.inPorts = {
      "in": new noflo.Port('number')
    };
    this.outPorts = {
      out: new noflo.Port('number')
    };
    this.inPorts["in"].on('begingroup', (function(_this) {
      return function(group) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.beginGroup(group);
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(data) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.send(Math.round(data));
      };
    })(this));
    this.inPorts["in"].on('endgroup', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.endGroup();
      };
    })(this));
    this.inPorts["in"].on('disconnect', (function(_this) {
      return function() {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        return _this.outPorts.out.disconnect();
      };
    })(this));
  }

  return Round;

})(noflo.Component);

exports.getComponent = function() {
  return new Round;
};

});
require.register("djdeath-noflo-math/lib/MathComponent.js", function(exports, require, module){
var MathComponent, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

MathComponent = (function(_super) {
  __extends(MathComponent, _super);

  function MathComponent(primary, secondary, res, inputType) {
    var calculate;
    if (inputType == null) {
      inputType = 'number';
    }
    this.inPorts = {};
    this.outPorts = {};
    this.inPorts[primary] = new noflo.Port(inputType);
    this.inPorts[secondary] = new noflo.Port(inputType);
    this.inPorts.clear = new noflo.Port('bang');
    this.outPorts[res] = new noflo.Port('number');
    this.primary = {
      value: null,
      group: [],
      disconnect: false
    };
    this.secondary = null;
    this.groups = [];
    calculate = (function(_this) {
      return function() {
        var group, _i, _j, _len, _len1, _ref, _ref1;
        _ref = _this.primary.group;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          group = _ref[_i];
          _this.outPorts[res].beginGroup(group);
        }
        if (_this.outPorts[res].isAttached()) {
          _this.outPorts[res].send(_this.calculate(_this.primary.value, _this.secondary));
        }
        _ref1 = _this.primary.group;
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          group = _ref1[_j];
          _this.outPorts[res].endGroup();
        }
        if (_this.outPorts[res].isConnected() && _this.primary.disconnect) {
          return _this.outPorts[res].disconnect();
        }
      };
    })(this);
    this.inPorts[primary].on('begingroup', (function(_this) {
      return function(group) {
        return _this.groups.push(group);
      };
    })(this));
    this.inPorts[primary].on('data', (function(_this) {
      return function(data) {
        _this.primary = {
          value: data,
          group: _this.groups.slice(0),
          disconnect: false
        };
        if (_this.secondary !== null) {
          return calculate();
        }
      };
    })(this));
    this.inPorts[primary].on('endgroup', (function(_this) {
      return function() {
        return _this.groups.pop();
      };
    })(this));
    this.inPorts[primary].on('disconnect', (function(_this) {
      return function() {
        _this.primary.disconnect = true;
        return _this.outPorts[res].disconnect();
      };
    })(this));
    this.inPorts[secondary].on('data', (function(_this) {
      return function(data) {
        _this.secondary = data;
        if (_this.primary.value !== null) {
          return calculate();
        }
      };
    })(this));
    this.inPorts.clear.on('data', (function(_this) {
      return function(data) {
        var group, _i, _len, _ref;
        if (_this.outPorts[res].isConnected()) {
          _ref = _this.primary.group;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            group = _ref[_i];
            _this.outPorts[res].endGroup();
          }
          if (_this.primary.disconnect) {
            _this.outPorts[res].disconnect();
          }
        }
        _this.primary = {
          value: null,
          group: [],
          disconnect: false
        };
        _this.secondary = null;
        return _this.groups = [];
      };
    })(this));
  }

  return MathComponent;

})(noflo.Component);

exports.MathComponent = MathComponent;

});
require.register("djdeath-noflo-galileo/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-galileo.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("djdeath-noflo-galileo/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-galileo","description":"Intel Galileo Gpio/Pwm components for NoFlo.","author":{"name":"Lionel Landwerlin","email":"lionel.g.landwerlin@linux.intel.com"},"repo":"djdeath/noflo-galileo","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/Gpio.js","components/Pwm.js","components/PwmValues.js","index.js"],"json":["component.json"],"noflo":{"components":{"Gpio":"components/Gpio.js","Pwm":"components/Pwm.js","PwmValues":"components/PwmValues.js"}}}');
});
require.register("djdeath-noflo-galileo/components/Gpio.js", function(exports, require, module){
var Gpio, noflo, pins,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

pins = {
  io0: 50,
  io1: 51,
  io2: 32,
  io3: 18,
  io4: 28,
  io5: 17,
  io6: 24,
  io7: 27,
  io8: 26,
  io9: 19,
  a0: 44,
  a1: 45,
  a2: 46,
  a3: 47,
  a4: 48,
  a5: 49,
  led: 3
};

Gpio = (function(_super) {
  __extends(Gpio, _super);

  Gpio.prototype.description = 'Gpio pin definitions';

  Gpio.prototype.icon = 'book';

  function Gpio() {
    var k, v;
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {};
    this.onAttachReact = false;
    for (k in pins) {
      v = pins[k];
      this.outPorts[k] = new noflo.Port('number');
    }
    this.inPorts.start.on('data', (function(_this) {
      return function(value) {
        var port, _results;
        _this.enableReactOnAttach();
        _results = [];
        for (k in pins) {
          v = pins[k];
          port = _this.outPorts[k];
          if (!port.isAttached()) {
            continue;
          }
          port.send(v);
          _results.push(port.disconnect());
        }
        return _results;
      };
    })(this));
  }

  Gpio.prototype.enableReactOnAttach = function() {
    var k;
    if (this.onAttachReact) {
      return;
    }
    for (k in pins) {
      this.enablePortReactOnAttach(k);
    }
    return this.onAttachReact = true;
  };

  Gpio.prototype.enablePortReactOnAttach = function(portName) {
    var port;
    port = this.outPorts[portName];
    return port.on('attach', (function(_this) {
      return function(socket) {
        socket.send(pins[portName]);
        return socket.disconnect();
      };
    })(this));
  };

  return Gpio;

})(noflo.Component);

exports.getComponent = function() {
  return new Gpio;
};

});
require.register("djdeath-noflo-galileo/components/Pwm.js", function(exports, require, module){
var Pwm, noflo, pins,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

pins = {
  pwm1: 1,
  pwm3: 3,
  pwm4: 4,
  pwm5: 5,
  pwm6: 6,
  pwm7: 7
};

Pwm = (function(_super) {
  __extends(Pwm, _super);

  Pwm.prototype.description = 'Pwm pin definitions';

  Pwm.prototype.icon = 'book';

  function Pwm() {
    var k, v;
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {};
    this.onAttachReact = false;
    for (k in pins) {
      v = pins[k];
      this.outPorts[k] = new noflo.Port('number');
    }
    this.inPorts.start.on('data', (function(_this) {
      return function(value) {
        var port, _results;
        _this.enableReactOnAttach();
        _results = [];
        for (k in pins) {
          v = pins[k];
          port = _this.outPorts[k];
          if (!port.isAttached()) {
            continue;
          }
          port.send(v);
          _results.push(port.disconnect());
        }
        return _results;
      };
    })(this));
  }

  Pwm.prototype.enableReactOnAttach = function() {
    var k;
    if (this.onAttachReact) {
      return;
    }
    for (k in pins) {
      this.enablePortReactOnAttach(k);
    }
    return this.onAttachReact = true;
  };

  Pwm.prototype.enablePortReactOnAttach = function(portName) {
    var port;
    port = this.outPorts[portName];
    return port.on('attach', (function(_this) {
      return function(socket) {
        socket.send(pins[portName]);
        return socket.disconnect();
      };
    })(this));
  };

  return Pwm;

})(noflo.Component);

exports.getComponent = function() {
  return new Pwm;
};

});
require.register("djdeath-noflo-galileo/components/PwmValues.js", function(exports, require, module){
var PwmValues, noflo, pins,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

pins = {
  maxdutycycle: 500000,
  maxperiod: 500000
};

PwmValues = (function(_super) {
  __extends(PwmValues, _super);

  PwmValues.prototype.description = 'Pwm values definitions';

  PwmValues.prototype.icon = 'book';

  function PwmValues() {
    var k, v;
    this.inPorts = {
      start: new noflo.Port('bang')
    };
    this.outPorts = {};
    this.onAttachReact = false;
    for (k in pins) {
      v = pins[k];
      this.outPorts[k] = new noflo.Port('number');
    }
    this.inPorts.start.on('data', (function(_this) {
      return function(value) {
        var port, _results;
        _this.enableReactOnAttach();
        _results = [];
        for (k in pins) {
          v = pins[k];
          port = _this.outPorts[k];
          if (!port.isAttached()) {
            continue;
          }
          port.send(v);
          _results.push(port.disconnect());
        }
        return _results;
      };
    })(this));
  }

  PwmValues.prototype.enableReactOnAttach = function() {
    var k;
    if (this.onAttachReact) {
      return;
    }
    for (k in pins) {
      this.enablePortReactOnAttach(k);
    }
    return this.onAttachReact = true;
  };

  PwmValues.prototype.enablePortReactOnAttach = function(portName) {
    var port;
    port = this.outPorts[portName];
    return port.on('attach', (function(_this) {
      return function(socket) {
        socket.send(pins[portName]);
        return socket.disconnect();
      };
    })(this));
  };

  return PwmValues;

})(noflo.Component);

exports.getComponent = function() {
  return new PwmValues;
};

});
require.register("djdeath-noflo-micro/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-micro.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("djdeath-noflo-micro/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-micro","description":"Basic micro controller components for NoFlo.","author":{"name":"Lionel Landwerlin","email":"lionel.g.landwerlin@linux.intel.com"},"repo":"djdeath/noflo-micro","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*"},"scripts":["components/DigitalRead.js","components/DigitalWrite.js","components/MonitorPin.js","components/PwmWrite.js","index.js"],"json":["component.json"],"noflo":{"components":{"DigitalRead":"components/DigitalRead.js","DigitalWrite":"components/DigitalWrite.js","MonitorPin":"components/MonitorPin.js","PwmWrite":"components/PwmWrite.js"}}}');
});
require.register("djdeath-noflo-micro/components/DigitalRead.js", function(exports, require, module){
var DigitalRead, gpio, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

gpio = require('gpio');

DigitalRead = (function(_super) {
  __extends(DigitalRead, _super);

  DigitalRead.prototype.description = 'Read a boolean value from pin. Value is read on @trigger';

  DigitalRead.prototype.icon = 'sign-in';

  function DigitalRead() {
    this.inPorts = {
      trigger: new noflo.Port('bang'),
      pin: new noflo.Port('number')
    };
    this.outPorts = {
      out: new noflo.Port('boolean')
    };
    this.inPorts.trigger.on('data', (function(_this) {
      return function(value) {
        var val;
        if (!(_this.gpio && _this.outPorts.out.isAttached())) {
          return;
        }
        val = _this.gpio.value !== 0 ? true : false;
        _this.outPorts.out.send(val);
        return _this.outPorts.out.disconnect();
      };
    })(this));
    this.inPorts.pin.on('data', (function(_this) {
      return function(portNumber) {
        _this.stopGpio();
        _this.pinNumber = pinNumber;
        return _this.startGpio();
      };
    })(this));
  }

  DigitalRead.prototype.stopGpio = function() {
    if (!this.gpio) {
      return;
    }
    this.gpio.removeAllListeners('change');
    this.gpio.unexport();
    return delete this.gpio;
  };

  DigitalRead.prototype.startGpio = function() {
    if (!this.pinNumber) {
      return;
    }
    return this.gpio = gpio["export"](this.pinNumber, {
      direction: 'in',
      interval: this.sampling
    });
  };

  DigitalRead.prototype.shutdown = function() {
    return this.stopGpio();
  };

  return DigitalRead;

})(noflo.Component);

exports.getComponent = function() {
  return new DigitalRead;
};

});
require.register("djdeath-noflo-micro/components/DigitalWrite.js", function(exports, require, module){
var DigitalWrite, gpio, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

gpio = require('gpio');

DigitalWrite = (function(_super) {
  __extends(DigitalWrite, _super);

  DigitalWrite.prototype.description = 'Write a boolean value to pin';

  DigitalWrite.prototype.icon = 'sign-out';

  function DigitalWrite() {
    this.inPorts = {
      pin: new noflo.Port('number'),
      "in": new noflo.Port('boolean')
    };
    this.inPorts.pin.on('data', (function(_this) {
      return function(pinNumber) {
        _this.stopGpio();
        _this.pinNumber = pinNumber;
        return _this.startGpio();
      };
    })(this));
    this.inPorts["in"].on('data', (function(_this) {
      return function(value) {
        return _this.setValue(value);
      };
    })(this));
  }

  DigitalWrite.prototype.setValue = function(value) {
    this.value = value;
    if (!this.gpio) {
      return;
    }
    return this.gpio.set(this.value ? 1 : 0);
  };

  DigitalWrite.prototype.stopGpio = function() {
    if (!this.gpio) {
      return;
    }
    this.gpio.reset();
    this.gpio.unexport();
    return delete this.gpio;
  };

  DigitalWrite.prototype.startGpio = function() {
    if (!this.pinNumber) {
      return;
    }
    this.gpio = gpio["export"](this.pinNumber, {
      direction: 'out'
    });
    return this.gpio.on('directionChange', (function(_this) {
      return function() {
        return _this.gpio.set(_this.value ? 1 : 0);
      };
    })(this));
  };

  DigitalWrite.prototype.shutdown = function() {
    return this.stopGpio();
  };

  return DigitalWrite;

})(noflo.Component);

exports.getComponent = function() {
  return new DigitalWrite;
};

});
require.register("djdeath-noflo-micro/components/MonitorPin.js", function(exports, require, module){
var MonitorPin, gpio, noflo,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

gpio = require('gpio');

MonitorPin = (function(_super) {
  __extends(MonitorPin, _super);

  MonitorPin.prototype.description = 'Emit a boolean value each time a pin changes state.';

  MonitorPin.prototype.icon = 'sign-in';

  function MonitorPin() {
    this.inPorts = {
      pin: new noflo.Port('number'),
      sampling: new noflo.Port('number')
    };
    this.outPorts = {
      out: new noflo.Port('boolean')
    };
    this.sampling = 250;
    this.inPorts.sampling.on('data', (function(_this) {
      return function(value) {
        _this.stopGpio();
        _this.sampling = value;
        return _this.startGpio();
      };
    })(this));
    this.inPorts.pin.on('data', (function(_this) {
      return function(value) {
        _this.stopGpio();
        _this.pinNumber = value;
        return _this.startGpio();
      };
    })(this));
  }

  MonitorPin.prototype.stopGpio = function() {
    if (!this.gpio) {
      return;
    }
    this.gpio.removeAllListeners('change');
    this.gpio.reset();
    this.gpio.unexport();
    return delete this.gpio;
  };

  MonitorPin.prototype.startGpio = function() {
    if (!this.pinNumber) {
      return;
    }
    this.gpio = gpio["export"](this.pinNumber, {
      direction: 'in',
      interval: this.sampling
    });
    return this.gpio.on('change', (function(_this) {
      return function(val) {
        if (!_this.outPorts.out.isAttached()) {
          return;
        }
        _this.outPorts.out.send(val !== 0);
        return _this.outPorts.out.disconnect();
      };
    })(this));
  };

  MonitorPin.prototype.shutdown = function() {
    return this.stopGpio();
  };

  return MonitorPin;

})(noflo.Component);

exports.getComponent = function() {
  return new MonitorPin;
};

});
require.register("djdeath-noflo-micro/components/PwmWrite.js", function(exports, require, module){
var PwmWrite, noflo, pwm,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

pwm = require('pwm');

PwmWrite = (function(_super) {
  __extends(PwmWrite, _super);

  PwmWrite.prototype.description = 'Write a boolean value to pin';

  PwmWrite.prototype.icon = 'sign-out';

  function PwmWrite() {
    this.inPorts = {
      pin: new noflo.Port('number'),
      dutycycle: new noflo.Port('number'),
      period: new noflo.Port('number')
    };
    this.chipNumber = 0;
    this.dutyCycle = 0;
    this.period = 0;
    this.inPorts.pin.on('data', (function(_this) {
      return function(value) {
        _this.stopGpio();
        _this.pinNumber = value;
        return _this.startGpio();
      };
    })(this));
    this.inPorts.dutycycle.on('data', (function(_this) {
      return function(value) {
        _this.dutyCycle = value;
        if (_this.ready) {
          return _this.pwm.setDutyCycle(_this.dutyCycle);
        }
      };
    })(this));
    this.inPorts.period.on('data', (function(_this) {
      return function(value) {
        _this.period = value;
        if (_this.ready) {
          return _this.pwm.setPeriod(_this.period);
        }
      };
    })(this));
  }

  PwmWrite.prototype.stopGpio = function() {
    if (!this.pwm) {
      return;
    }
    this.pwm.reset();
    this.pwm.unexport();
    delete this.pwm;
    delete this.dutyCycle;
    return delete this.period;
  };

  PwmWrite.prototype.startGpio = function() {
    if (this.pinNumber === null) {
      return;
    }
    return this.pwm = pwm["export"](this.chipNumber, this.pinNumber, (function(_this) {
      return function() {
        _this.ready = true;
        console.log('pwm ready');
        return _this.pwm.setEnable(1, function() {
          return _this.applyParameters();
        });
      };
    })(this));
  };

  PwmWrite.prototype.applyParameters = function() {
    return this.pwm.setDutyCycle(0, (function(_this) {
      return function() {
        return _this.pwm.setPeriod(0, function() {
          return _this.pwm.setPeriod(_this.period, function() {
            return _this.pwm.setDutyCycle(_this.dutyCycle);
          });
        });
      };
    })(this));
  };

  PwmWrite.prototype.shutdown = function() {
    return this.stopGpio();
  };

  return PwmWrite;

})(noflo.Component);

exports.getComponent = function() {
  return new PwmWrite;
};

});
require.register("djdeath-trident-js/trident.js", function(exports, require, module){
/*
 * Copyright (c) 2005-2010 Trident Kirill Grouchnikov. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 *  o Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 *  o Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  o Neither the name of Trident Kirill Grouchnikov nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
 
/*
 * Spline ease and key frames are based on the BSD-licensed code from <a
 * href="https://timingframework.dev.java.net">TimingFramework</a> by Chet Haase
 * and Romain Guy.
 *
 * Some of the ease classes are based on the MIT-licensed code from
 * <a href="http://github.com/sole/tween.js">Tween.js</a> by Soledad Penadés.
 */
var lastTime = new Date().getTime();

var timelineId = 0;
var timelineScenarioId = 0;

var TimelineState = {"IDLE":"IDLE", "READY":"READY", 
  "PLAYING_FORWARD":"PLAYING_FORWARD", "PLAYING_REVERSE":"PLAYING_REVERSE", 
  "SUSPENDED":"SUSPENDED", "CANCELLED":"CANCELLED", "DONE":"DONE"};

var TimelineScenarioState = {"IDLE":"IDLE", "PLAYING":"PLAYING", 
  "SUSPENDED":"SUSPENDED", "DONE":"DONE"};

var RepeatBehavior = {"NORMAL":"NORMAL", "REVERSE":"REVERSE"};

/**
 * Interpolators
 */
function RGBPropertyInterpolator() {
  var interpolateSingle = function(from, to, at) {
    var intFrom = parseInt(from);
    var intTo = parseInt(to);
    return parseInt(parseFloat(intFrom + at * (intTo - intFrom)));
  }

  this.interpolate = function(from, to, timelinePosition) {
    var fromParts = from.substring(4,from.length-1).split(',');
    var toParts = to.substring(4,to.length-1).split(',');
    var red = interpolateSingle(fromParts[0], toParts[0], timelinePosition);
    var green = interpolateSingle(fromParts[1], toParts[1], timelinePosition);
    var blue = interpolateSingle(fromParts[2], toParts[2], timelinePosition);
    return "rgb(" + red + "," + green + "," + blue + ")";
  }
}

function IntPropertyInterpolator() {
  this.interpolate = function(from, to, timelinePosition) {
    return parseInt(parseFloat(from + (to - from) * timelinePosition));
  }
}

function FloatPropertyInterpolator() {
  this.interpolate = function(from, to, timelinePosition) {
    var fFrom = parseFloat(from);
    var fTo = parseFloat(to);
    return parseFloat(fFrom + (fTo - fFrom) * timelinePosition);
  }
}

/**
 * Ease
 */
function LinearEase() {
  this.map = function(durationFraction) {
    return durationFraction;
  }
}

function SineEase() {
  this.map = function(durationFraction) {
    return Math.sin(durationFraction * Math.PI / 2);
  }
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}

function LengthItem(len, t) {
  this.len = len;
  this.t = t;
  this.fraction = 0;

  this.setFraction = function(totalLength) {
    this.fraction = this.len / totalLength;
  }
}

function SplineEase(x1, y1, x2, y2) {
  if (x1 < 0 || x1 > 1.0 || y1 < 0 || y1 > 1.0 || x2 < 0 || x2 > 1.0
    || y2 < 0 || y2 > 1.0) {
      throw "Control points must be in the range [0, 1]";
  }

  // Note: (x0,y0) and (x1,y1) are implicitly (0, 0) and (1,1) respectively
  this.x1 = x1;
  this.x2 = x2;
  this.y1 = y1;
  this.y2 = y2;
  this.lengths = new Array();

  /**
  * Calculates the XY point for a given t value.
  * 
  * The general spline equation is: x = b0*x0 + b1*x1 + b2*x2 + b3*x3 y =
  * b0*y0 + b1*y1 + b2*y2 + b3*y3 where: b0 = (1-t)^3 b1 = 3 * t * (1-t)^2 b2
  * = 3 * t^2 * (1-t) b3 = t^3 We know that (x0,y0) == (0,0) and (x1,y1) ==
  * (1,1) for our splines, so this simplifies to: x = b1*x1 + b2*x2 + b3 y =
  * b1*x1 + b2*x2 + b3
  * 
  * @param t
  *            parametric value for spline calculation
  */
  this.__getXY = function(t) {
    var xy;
    var invT = (1 - t);
    var b1 = 3 * t * (invT * invT);
    var b2 = 3 * (t * t) * invT;
    var b3 = t * t * t;
    xy = new Point((b1 * x1) + (b2 * x2) + b3, (b1 * y1) + (b2 * y2) + b3);
    return xy;
  }

  /**
  * Utility function: When we are evaluating the spline, we only care about
  * the Y values. See {@link getXY getXY} for the details.
  */
  this.__getY = function(t) {
    var invT = (1 - t);
    var b1 = 3 * t * (invT * invT);
    var b2 = 3 * (t * t) * invT;
    var b3 = t * t * t;
    return (b1 * y1) + (b2 * y2) + b3;
  }

  /**
  * Given a fraction of time along the spline (which we can interpret as the
  * length along a spline), return the interpolated value of the spline. We
  * first calculate the t value for the length (by doing a lookup in our
  * array of previousloy calculated values and then linearly interpolating
  * between the nearest values) and then calculate the Y value for this t.
  * 
  * @param lengthFraction
  *            Fraction of time in a given time interval.
  * @return interpolated fraction between 0 and 1
  */
  this.map = function(lengthFraction) {
    var interpolatedT = 1.0;
    var prevT = 0.0;
    var prevLength = 0.0;
    for (var i = 0; i < this.lengths.length; ++i) {
      var lengthItem = this.lengths[i];
      var fraction = lengthItem.fraction;
      var t = lengthItem.t;
      if (lengthFraction <= fraction) {
        // answer lies between last item and this one
        var proportion = (lengthFraction - prevLength) / (fraction - prevLength);
        interpolatedT = prevT + proportion * (t - prevT);
        return this.__getY(interpolatedT);
      }
      prevLength = fraction;
      prevT = t;
    }
    return this.__getY(interpolatedT);
  }

  // Now contruct the array of all lengths to t in [0, 1.0]
  var prevX = 0.0;
  var prevY = 0.0;
  var prevLength = 0.0; // cumulative length
  for (var t = 0.01; t <= 1.0; t += .01) {
    var xy = this.__getXY(t);
    var length = prevLength
      + Math.sqrt((xy.x - prevX) * (xy.x - prevX)
      + (xy.y - prevY) * (xy.y - prevY));
    var lengthItem = new LengthItem(length, t);
    this.lengths[this.lengths.length] = lengthItem;
    prevLength = length;
    prevX = xy.x;
    prevY = xy.y;
  }
  // Now calculate the fractions so that we can access the lengths
  // array with values in [0,1]. prevLength now holds the total
  // length of the spline.
  for (var i = 0; i < this.lengths.length; ++i) {
    var lengthItem = this.lengths[i];
    lengthItem.setFraction(prevLength);
  }
}

function QuadraticEaseIn() {
  this.map = function(durationFraction) {
    return durationFraction * durationFraction;
  }
}

function QuadraticEaseOut() {
  this.map = function(durationFraction) {
    return -durationFraction * (durationFraction - 2);
  }
}

function QuadraticEaseInOut() {
  this.map = function(durationFraction) {
    if ((durationFraction *= 2) < 1) {
      return 0.5 * durationFraction *durationFraction;
    }
    return - 0.5 * (--durationFraction * (durationFraction - 2) - 1);
  }
}

function CubicEaseIn() {
  this.map = function(durationFraction) {
    return durationFraction * durationFraction * durationFraction;
  }
}

function CubicEaseOut() {
  this.map = function(durationFraction) {
    return --durationFraction * durationFraction * durationFraction + 1;
  }
}

function CubicEaseInOut() {
  this.map = function(durationFraction) {
    if ( (durationFraction *= 2) < 1 ) {
      return 0.5 * durationFraction * durationFraction * durationFraction;
    }
    return 0.5 * ((durationFraction -= 2) * durationFraction * durationFraction + 2 );
  }
}

function QuarticEaseIn() {
  this.map = function(durationFraction) {
    return durationFraction * durationFraction * durationFraction * durationFraction;
  }
}

function QuarticEaseOut() {
  this.map = function(durationFraction) {
    return -(--durationFraction * durationFraction * durationFraction * durationFraction - 1 );
  }
}

function QuarticEaseInOut() {
  this.map = function(durationFraction) {
    if ((durationFraction *= 2) < 1) {
      return 0.5 * durationFraction * durationFraction * durationFraction * durationFraction;
    }
    return -0.5 * ((durationFraction -= 2) * durationFraction * durationFraction * durationFraction - 2);
  }
}

function SinusoidalEaseIn() {
  this.map = function(durationFraction) {
    return - Math.cos(durationFraction * Math.PI / 2) + 1;
  }
}

function SinusoidalEaseOut() {
  this.map = function(durationFraction) {
    return Math.sin(durationFraction * Math.PI / 2);
  }
}

function SinusoidalEaseInOut() {
  this.map = function(durationFraction) {
    return -0.5 * (Math.cos(Math.PI * durationFraction) - 1);
  }
}

function ExponentialEaseIn() {
  this.map = function(durationFraction) {
    return durationFraction == 0 ? 0 : Math.pow(2, 10 * (durationFraction - 1));
  }
}

function ExponentialEaseOut() {
  this.map = function(durationFraction) {
    return durationFraction == 1 ? 1 : -Math.pow(2, - 10 * durationFraction) + 1;
  }
}

function ExponentialEaseInOut() {
  this.map = function(durationFraction) {
    if (durationFraction == 0) {
      return 0;
    }
    if (durationFraction == 1) {
      return 1;
    }
    if ((durationFraction *= 2) < 1) {
      return 0.5 * Math.pow(2, 10 * (durationFraction - 1));
    }
    return 0.5 * (-Math.pow(2, -10 * (durationFraction - 1)) + 2);
  }
}

function CircularEaseIn() {
  this.map = function(durationFraction) {
    return -(Math.sqrt(1 - durationFraction * durationFraction) - 1);
  }
}

function CircularEaseOut() {
  this.map = function(durationFraction) {
    return Math.sqrt(1 - --durationFraction * durationFraction);
  }
}

function CircularEaseInOut() {
  this.map = function(durationFraction) {
    if ((durationFraction /= 0.5) < 1) {
      return -0.5 * (Math.sqrt(1 - durationFraction * durationFraction) - 1);
    }
    return 0.5 * (Math.sqrt(1 - (durationFraction -= 2) * durationFraction) + 1);
  }
}

function ElasticEaseIn() {
  this.map = function(durationFraction) {
    var s, a = 0.1, p = 0.4;
    if (durationFraction == 0) {
      return 0;
    } 
    if (durationFraction == 1) {
      return 1;
    } 
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) { 
      a = 1; 
      s = p / 4;
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    return -(a * Math.pow(2, 10 * (durationFraction -= 1)) * Math.sin((durationFraction - s) * (2 * Math.PI) / p));
  }
}

function ElasticEaseOut() {
  this.map = function(durationFraction) {
    var s, a = 0.1, p = 0.4;
    if (durationFraction == 0) {
      return 0; 
    }
    if (durationFraction == 1) {
      return 1; 
    }
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) { 
      a = 1; 
      s = p / 4; 
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    return (a * Math.pow(2, - 10 * durationFraction) * Math.sin((durationFraction - s) * (2 * Math.PI) / p) + 1);
  }
}

function ElasticEaseInOut() {
  this.map = function(durationFraction) {
    var s, a = 0.1, p = 0.4;
    if (durationFraction == 0) {
      return 0; 
    }
    if (durationFraction == 1) {
      return 1;
    } 
    if (!p) {
      p = 0.3;
    }
    if (!a || a < 1) { 
      a = 1; 
      s = p / 4; 
    } else {
      s = p / (2 * Math.PI) * Math.asin(1 / a);
    }
    if ((durationFraction *= 2) < 1) {
      return -0.5 * (a * Math.pow(2, 10 * (durationFraction -= 1)) * Math.sin((durationFraction - s) * (2 * Math.PI) / p));
    }
    return a * Math.pow(2, -10 * (durationFraction -= 1)) * Math.sin((durationFraction - s) * (2 * Math.PI) / p) * 0.5 + 1;
  }
}

function BackEaseIn() {
  this.map = function(durationFraction) {
    var s = 1.70158;
    return durationFraction * durationFraction * ((s + 1) * durationFraction - s);
  }
}

function BackEaseOut() {
  this.map = function(durationFraction) {
    var s = 1.70158;
    return (durationFraction = durationFraction - 1) * durationFraction * ((s + 1) * durationFraction + s) + 1;
  }
}

function BackEaseInOut() {
  this.map = function(durationFraction) {
    var s = 1.70158 * 1.525;
    if ((durationFraction *= 2) < 1) {
      return 0.5 * (durationFraction * durationFraction * ((s + 1) * durationFraction - s));
    }
    return 0.5 * ((durationFraction -= 2 ) * durationFraction * ((s + 1) * durationFraction + s) + 2);
  }
}

function BounceEaseIn() {
  this.bo = new BounceEaseOut();
  this.map = function(durationFraction) {
    return 1 - this.bo.map(1 - durationFraction);
  }
}

function BounceEaseOut() {
  this.map = function(durationFraction) {
    if ((durationFraction /= 1) < (1 / 2.75)) {
      return 7.5625 * durationFraction * durationFraction;
    } else if (durationFraction < (2 / 2.75)) {
      return 7.5625 * (durationFraction -= (1.5 / 2.75)) * durationFraction + 0.75;
    } else if (durationFraction < (2.5 / 2.75)) {
      return 7.5625 * (durationFraction -= (2.25 / 2.75)) * durationFraction + 0.9375;
    } else {
      return 7.5625 * (durationFraction -= (2.625 / 2.75)) * durationFraction + 0.984375;
    } 
  }
}

function BounceEaseInOut() {
  this.bi = new BounceEaseIn();
  this.bo = new BounceEaseOut();

  this.map = function(durationFraction) {
    if (durationFraction < 0.5) {
      return this.bi.map(durationFraction * 2) * 0.5;
    }
    return this.bo.map(durationFraction * 2 - 1) * 0.5 + 0.5;
  }
}

/**
 * Key frames
 */
function KeyEases(numIntervals, eases) {
  this.eases = new Array();

  if (eases == undefined || eases[0] == undefined) {
    for (var i = 0; i < numIntervals; ++i) {
      this.eases[this.eases.length] = new LinearEase();
    }
  } else if (eases.length < numIntervals) {
    for (var i = 0; i < numIntervals; ++i) {
      this.eases[this.eases.length] = eases[0];
    }
  } else {
    for (var i = 0; i < numIntervals; ++i) {
      this.eases[this.eases.length] = eases[i];
    }
  }

  this.interpolate = function(interval, fraction) {
      return this.eases[interval].map(fraction);
  }
}

function KeyTimes(times) {
  this.times = new Array();

  if (times[0] != 0) {
    throw "First time value must be zero";
  }
  if (times[times.length - 1] != 1) {
    throw "Last time value must be one";
  }
  var prevTime = 0;
  for (var i=0; i<times.length; i++) {
    var time = times[i];
    if (time < prevTime) {
      throw "Time values must be in increasing order";
    }
    this.times[this.times.length] = time;
    prevTime = time;
  }

  this.getInterval = function(fraction) {
    var prevIndex = 0;
    for (var i = 1; i < this.times.length; ++i) {
      var time = this.times[i];
      if (time >= fraction) { 
        // inclusive of start time at next interval.  So fraction==1
        // will return the final interval (times.size() - 1)
        return prevIndex;
      }
      prevIndex = i;
    }
    return prevIndex;
  }

  this.getTime = function(index) {
    return this.times[index];
  }
}

function KeyValues(propertyInterpolator, params) {
  this.values = new Array();
  this.propertyInterpolator = propertyInterpolator;
  this.startValue;

  if (params == undefined) {
    throw "params array cannot be null";
  } else if (params.length == 0) {
    throw "params array must have at least one element";
  }
  if (params.length == 1) {
    // this is a "to" animation; set first element to null
    this.values[this.values.length] = undefined;
  }
  for (var i=0; i<params.length; i++) {
    this.values[this.values.length] = params[i];
  }

  this.getSize = function() {
    return values.length;
  }

  this.setStartValue = function(startValue) {
    if (this.isToAnimation()) {
      this.startValue = startValue;
    }
  }

  this.isToAnimation = function() {
    return (values.get(0) == undefined);
  }

  this.getValue = function(i0, i1, fraction) {
    var value;
    var lowerValue = this.values[i0];
    if (lowerValue == undefined) {
      // "to" animation
      lowerValue = startValue;
    }
    if (i0 == i1) {
      // trivial case
      value = lowerValue;
    } else {
      var v0 = lowerValue;
      var v1 = this.values[i1];
      value = this.propertyInterpolator.interpolate(v0, v1, fraction);
    }
    return value;
  }
}

function KeyFrames(timeValueMap, propertyInterpolator, ease) {
  this.keyValues;
  this.keyTimes;
  this.eases;

  this.__init = function(timeValueMap, propertyInterpolator, eases) {
    var __keyValues = new Array();
    var __keyTimes = new Array();
    for (var keyTime in timeValueMap) {
      __keyTimes[__keyTimes.length] = keyTime;
    }
    __keyTimes.sort();
    for (var i=0; i<__keyTimes.length; i++) {
      var k = __keyTimes[i];
      var v = timeValueMap[k];
      __keyValues[__keyValues.length] = v;
    }
    var numFrames = __keyValues.length;
    this.keyTimes = new KeyTimes(__keyTimes);
    this.keyValues = new KeyValues(propertyInterpolator, __keyValues);
    this.eases = new KeyEases(numFrames - 1, eases);
  }

  this.getKeyValues = function() {
    return this.keyValues;
  }

  this.getKeyTimes = function() {
    return this.keyTimes;
  }

  this.getInterval = function(fraction) {
    return this.keyTimes.getInterval(fraction);
  }

  this.getValue = function(fraction) {
    // First, figure out the real fraction to use, given the
    // interpolation type and keyTimes
    var interval = this.getInterval(fraction);
    var t0 = this.keyTimes.getTime(interval);
    var t1 = this.keyTimes.getTime(interval + 1);
    var t = (fraction - t0) / (t1 - t0);
    var interpolatedT = this.eases.interpolate(interval, t);
    // clamp to avoid problems with buggy interpolators
    if (interpolatedT < 0) {
      interpolatedT = 0;
    } else if (interpolatedT > 1) {
      interpolatedT = 1;
    }
    return this.keyValues.getValue(interval, (interval + 1), interpolatedT);
  }
  
  this.__init(timeValueMap, propertyInterpolator, [ease]);
}

function PropertyInfo(mainObject, field, from, to, interpolator) {
  this.mainObject = mainObject;
  this.field = field;
  this.from = from;
  this.to = to;
  this.interpolator = interpolator;

  this.updateValue = function(timelinePosition) {
    this.mainObject[field] = interpolator.interpolate(from, to, timelinePosition);
  }
}

function KeyFramesPropertyInfo(mainObject, field, timeValueMap, propertyInterpolator) {
  this.mainObject = mainObject;
  this.field = field;
  this.keyFrames = new KeyFrames(timeValueMap, propertyInterpolator);

  this.updateValue = function(timelinePosition) {
    var value = this.keyFrames.getValue(timelinePosition);
    this.mainObject[field] = value;
  }
}

function EventHandler(eventName, handler) {
  this.eventName = eventName;
  this.handler = handler;
}

function Stack() {
  var elements = new Array;
  var liveCount = 0;

  this.empty = function() {
    return (liveCount == 0);
  }

  this.peek = function() {
    return elements[liveCount-1];
  }

  this.pop = function() {
    var toReturn = this.peek();
    liveCount--;
    delete elements[liveCount];
    return toReturn;
  }

  this.push = function(element) {
    elements[liveCount] = element;
    liveCount++;
  }
}

function Timeline(mainObject) {
  this.durationFraction = 0;
  this.duration = 500;
  this.timeUntilPlay = 0;
  this.initialDelay = 0;
  this.timelinePosition = 0;
  this.toCancelAtCycleBreak = false;
  this.ease = new LinearEase();

  this.cycleDelay = 0;
  this.repeatCount = 0;
  this.repeatBehavior;
  this.doneCount = 0;

  var mainObject = mainObject;
  var handlers = new Array;
  var properties = new Array;
  var stateStack = new Stack();
  var id = timelineId++;

  stateStack.push(TimelineState.IDLE);

  this.getMainObject = function() {
    return mainObject;
  }

  var getId = function() {
    return id;
  }

  var getProperties = function() {
    return properties;
  }

  var addProperty = function(property) {
    var currProperties = getProperties();
    currProperties[currProperties.length] = property;
  }

  this.addPropertyToInterpolate = function(field, from, to, interpolator) {
    var propInfo = new PropertyInfo(this.getMainObject(), field, from, to, interpolator);
    addProperty(propInfo);
  }

  this.addPropertiesToInterpolate = function(properties) {
    for (var i=0; i<properties.length; i++) {
      var propDefinition = properties[i];
      var propName = propDefinition["property"];
      var interpolator = propDefinition["interpolator"];
      var on = propDefinition["on"];
      if (on == undefined) {
        on = this.getMainObject();
      }

      var keyFrames = propDefinition["goingThrough"];
      if (keyFrames != undefined) {
        var propInfo = new KeyFramesPropertyInfo(on, propName, keyFrames, interpolator);
        addProperty(propInfo);
      } else {
        var from = propDefinition["from"];
        var to = propDefinition["to"];
        var propInfo = new PropertyInfo(on, propName, from, to, interpolator);
        addProperty(propInfo);
      }
    }
  }

  this.addEventListener = function(eventName, handler) {
    var eh = new EventHandler(eventName, handler);
    handlers[handlers.length] = eh;
  }

  this.getState = function() {
    return stateStack.peek();
  }

  this.__popState = function() {
    return stateStack.pop();
  }

  this.__pushState = function(state) {
    if (state == TimelineState.DONE)
      this.doneCount++;
    stateStack.push(state);
  }

  this.__replaceState = function(state) {
    stateStack.pop();
    this.__pushState(state);
  }
  
  this.isDone = function() {
    return (this.doneCount > 0);
  }

  this.supportsReplay = function() {
    return true;
  }

  this.resetDoneFlag = function() {
    this.doneCount = 0;
  }

  this.__play = function(reset, msToSkip) {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      var oldState = this.getState();
      this.timeUntilPlay = this.initialDelay - msToSkip;
      if (this.timeUntilPlay < 0) {
        this.durationFraction = -this.timeUntilPlay / this.duration;
        this.timelinePosition = this.ease.map(this.durationFraction);
        this.timeUntilPlay = 0;
      } else {
        this.durationFraction = 0;
        this.timelinePosition = 0;
      }
      this.__pushState(TimelineState.PLAYING_FORWARD);
      this.__pushState(TimelineState.READY);
      runningTimelines[getId()] = this;

      this.__callbackCallTimelineStateChanged(oldState);
    } else {
      var oldState = this.getState();
      if (oldState == TimelineState.READY) {
        // the timeline remains READY, but after that it will be
        // PLAYING_FORWARD
        this.__popState();
        this.__replaceState(TimelineState.PLAYING_FORWARD);
        this.__pushState(TimelineState.READY);
      } else {
        // change the timeline state
        this.__replaceState(TimelineState.PLAYING_FORWARD);
        if (oldState != this.getState()) {
          this.__callbackCallTimelineStateChanged(oldState);
        }
      }
      if (reset) {
        this.durationFraction = 0;
        this.timelinePosition = 0;
        this.__callbackCallTimelinePulse();
      }
    }
  }
  
  this.play = function() {
    this.playSkipping(0);
  }

  this.playSkipping = function(msToSkip) {
    if ((this.initialDelay + this.duration) < msToSkip) {
      throw new IllegalArgumentException("Required skip longer than initial delay + duration");
    }
    this.__play(false, msToSkip);
  }

  this.replay = function() {
    this.__play(true, 0);
  }

  this.__playReverse = function(reset, msToSkip) {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      var oldState = this.getState();
      this.timeUntilPlay = this.initialDelay - msToSkip;
      if (this.timeUntilPlay < 0) {
        this.durationFraction = 1 + this.timeUntilPlay / this.duration;
        this.timelinePosition = this.ease.map(this.durationFraction);
        this.timeUntilPlay = 0;
      } else {
        this.durationFraction = 1;
        this.timelinePosition = 1;
      }
      this.__pushState(TimelineState.PLAYING_REVERSE);
      this.__pushState(TimelineState.READY);
      runningTimelines[getId()] = this;

      this.__callbackCallTimelineStateChanged(oldState);
    } else {
      var oldState = this.getState();
      if (oldState == TimelineState.READY) {
        // the timeline remains READY, but after that it will be
        // PLAYING_REVERSE
        this.__popState();
        this.__replaceState(TimelineState.PLAYING_REVERSE);
        this.__pushState(TimelineState.READY);
      } else {
        // change the timeline state
        this.__replaceState(TimelineState.PLAYING_REVERSE);
        if (oldState != this.getState()) {
          this.__callbackCallTimelineStateChanged(oldState);
        }
      }
      if (reset) {
        this.durationFraction = 1;
        this.timelinePosition = 1;
        this.__callbackCallTimelinePulse();
      }
    }
  }

  this.playReverse = function() {
    this.playReverseSkipping(false, 0);
  }

  this.playReverseSkipping = function(msToSkip) {
    if ((this.initialDelay + this.duration) < msToSkip) {
      throw "Required skip longer than initial delay + duration";
    }
    this.__playReverse(false, msToSkip);
  }

  this.replayReverse = function() {
    this.__playReverse(true, 0);
  }

  this.__playLoop = function(msToSkip) {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      var oldState = this.getState();
      this.timeUntilPlay = this.initialDelay - msToSkip;
      if (this.timeUntilPlay < 0) {
        this.durationFraction = -this.timeUntilPlay / this.duration;
        this.timelinePosition = this.ease.map(this.durationFraction);
        this.timeUntilPlay = 0;
      } else {
        this.durationFraction = 0;
        this.timelinePosition = 0;
      }
      this.__pushState(TimelineState.PLAYING_FORWARD);
      this.__pushState(TimelineState.READY);
      this.toCancelAtCycleBreak = false;

      runningTimelines[getId()] = this;
      this.__callbackCallTimelineStateChanged(oldState);
    } else {
      this.toCancelAtCycleBreak = false;
    }
  }

  this.playLoopSkipping = function(loopCount, repeatBehavior, msToSkip) {
    if ((this.initialDelay + this.duration) < msToSkip) {
      throw "Required skip longer than initial delay + duration";
    }
    this.repeatCount = loopCount;
    this.repeatBehavior = repeatBehavior;
    this.__playLoop(msToSkip);
  }
  
  this.playInfiniteLoop = function(repeatBehavior) {
    this.playLoop(-1, repeatBehavior);
  }

  this.playInfiniteLoopSkipping = function(repeatBehavior, msToSkip) {
    this.playLoopSkipping(-1, repeatBehavior, msToSkip);
  }

  this.playLoop = function(loopCount, repeatBehavior) {
    this.playLoopSkipping(loopCount, repeatBehavior, 0);
  }

  this.cancelAtCycleBreak = function() {
    this.toCancelAtCycleBreak = true;
  }

  this.cancel = function() {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      return;
    }
    delete runningTimelines[getId()];
    var oldState = this.getState();
    while (this.getState() != TimelineState.IDLE) {
      this.__popState();
    }
    this.__pushState(TimelineState.CANCELLED);
    this.__callbackCallTimelineStateChanged(oldState);
    this.__popState();
    this.__callbackCallTimelineStateChanged(TimelineState.CANCELLED);
  }

  this.end = function() {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      return;
    }
    delete runningTimelines[getId()];
    var oldState = timeline.getState();
    var endFraction = timeline.durationFraction;
    while (this.getState() != TimelineState.IDLE) {
      var state = this.__popState();
      if (state == TimelineState.PLAYING_FORWARD) {
        endFraction = 1;
      }
      if (state == TimelineState.PLAYING_REVERSE) {
        endFraction = 0;
      }
    }
    this.durationFraction = endFraction;
    this.timelinePosition = endFraction;
    this.__callbackCallTimelinePulse();
    this.__pushState(TimelineState.DONE);
    this.__callbackCallTimelineStateChanged(oldState);
    this.__popState();
    this.__callbackCallTimelineStateChanged(TimelineState.DONE);
  }

  this.abort = function() {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      return;
    }
    delete runningTimelines[getId()];
    while (this.getState() != TimelineState.IDLE) {
      this.__popState();
    }
  }

  this.suspend = function() {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      return;
    }
    var oldState = this.getState();
    if ((oldState != TimelineState.PLAYING_FORWARD)
        && (oldState != TimelineState.PLAYING_REVERSE)
        && (oldState != TimelineState.READY)) {
      return;
    }
    this.__pushState(TimelineState.SUSPENDED);
    this.__callbackCallTimelineStateChanged(oldState);
  }

  this.resume = function() {
    var existing = runningTimelines[getId()];
    if (existing == undefined) {
      return;
    }
    var oldState = this.getState();
    if (oldState != TimelineState.SUSPENDED) {
      return;
    }
    this.__popState();
    this.__callbackCallTimelineStateChanged(oldState);
  }

  this.__callbackCallTimelinePulse = function() {
    this.timelinePosition = this.ease.map(this.durationFraction);

    for (var i=0; i<handlers.length; i++) {
      var eventHandler = handlers[i];
      if (eventHandler.eventName == "onpulse") {
        eventHandler.handler(this, this.durationFraction, this.timelinePosition);
      }
    }
    var properties = getProperties();
    for (var i=0; i<properties.length; i++) {
      properties[i].updateValue(this.timelinePosition);
    }
  }
  
  this.__callbackCallTimelineStateChanged = function(oldState) {
    var currState = this.getState();
    this.timelinePosition = this.ease.map(this.durationFraction);
    for (var i=0; i<handlers.length; i++) {
      var eventHandler = handlers[i];
      if (eventHandler.eventName == "onstatechange") {
        eventHandler.handler(this, oldState, this.getState(), 
          this.durationFraction, this.timelinePosition);
      }
    }
    var properties = getProperties();
    for (var i=0; i<properties.length; i++) {
      properties[i].updateValue(this.timelinePosition);
    }
  }
}

function TimelineScenario() {
  this.waitingActors = new Array();
  this.runningActors = new Array();
  this.doneActors = new Array();
  var mapping = new Array();
  
  this.dependencies = {};
  this.state = undefined;
  this.statePriorToSuspension = undefined;
  this.isLooping = false;
  this.id = timelineScenarioId++;
  
  var handlers = new Array();
  
  this.__checkDependencyParam = function(scenarioActor) {
    if (this.waitingActors.indexOf(scenarioActor) == -1) {
      throw "Must be first added with addScenarioActor() API";
    }
  }
  
  this.__checkDoneActors = function() {
    for (var i=this.runningActors.length-1; i>=0; i--) {
      var stillRunning = this.runningActors[i];
      if (stillRunning.isDone()) {
        this.doneActors[this.doneActors.length] = stillRunning;
        this.runningActors.splice(i, 1);
      }
    }
  }

  this.getReadyActors = function() {
    if (this.state == TimelineScenarioState.SUSPENDED)
      return [];

    this.__checkDoneActors();

    var result = new Array();
    for (var i=this.waitingActors.length - 1; i>=0; i--) {
      var waitingActor = this.waitingActors[i];
      var canRun = true;
      var waitingActorId = mapping.indexOf(waitingActor);
      var toWaitFor = this.dependencies[waitingActorId];
      if (toWaitFor != undefined) {
        for (var j = 0; j < toWaitFor.length; j++) {
          var actorToWaitFor = toWaitFor[j];
          if (this.doneActors.indexOf(actorToWaitFor) == -1) {
            canRun = false;
            break;
          }
        }
      }
      if (canRun) {
        this.runningActors[this.runningActors.length] = waitingActor;
        this.waitingActors.splice(i, 1);
        result[result.length] = waitingActor;
      }
    }

    if ((this.waitingActors.length == 0) && (this.runningActors.length == 0)) {
      if (!this.isLooping) {
        this.state = TimelineScenarioState.DONE;
      } else {
        for (var i = 0; i < this.doneActors.length; i++) {
          var done = this.doneActors[i];
          done.resetDoneFlag();
          this.waitingActors[this.waitingActors.length] = done;
        }
        this.doneActors.length = 0;
      }
    }
    return result;
  }

  this.cancel = function() {
    var oldState = this.state;
    if (oldState != TimelineScenarioState.PLAYING)
      return;
    this.state = TimelineScenarioState.DONE;

    for (var i = 0; i < this.waitingActors.length; i++) {
      var waiting = this.waitingActors[i];
      if (waiting instanceof Timeline) {
        waiting.cancel();
      }
    }
    for (var i = 0; i < this.runningActors.length; i++) {
      var running = this.runningActors[i];
      if (running instanceof Timeline) {
        running.cancel();
      }
    }
  }

  this.suspend = function() {
    var oldState = this.state;
    if (oldState != TimelineScenarioState.PLAYING)
      return;
    this.statePriorToSuspension = oldState;
    this.state = TimelineScenarioState.SUSPENDED;

    for (var i = 0; i < this.runningActors.length; i++) {
      var running = this.runningActors[i];
      if (running instanceof Timeline) {
        running.suspend();
      }
    }
  }

  this.resume = function() {
    var oldState = this.state;
    if (oldState != TimelineScenarioState.SUSPENDED)
      return;
    this.state = this.statePriorToSuspension;

    for (var i = 0; i < this.runningActors.length; i++) {
      var running = this.runningActors[i];
      if (running instanceof Timeline) {
        running.resume();
      }
    }
  }
  
  this.__playScenario = function() {
    runningScenarios[this.id] = this;
    var readyActors = this.getReadyActors();
    for (var i = 0; i < readyActors.length; i++) {
      var readyActor = readyActors[i];
      readyActor.play();
    }
  }

  this.__callbackCallTimelineScenarioEnded = function() {
    for (var i=0; i<handlers.length; i++) {
      var eventHandler = handlers[i];
      if (eventHandler.eventName == "ondone") {
        eventHandler.handler(this);
      }
    }
  }

  this.addEventListener = function(eventName, handler) {
    var eh = new EventHandler(eventName, handler);
    handlers[handlers.length] = eh;
  }

  this.addScenarioActor = function(scenarioActor) {
    if (scenarioActor.isDone()) {
      throw "Already finished";
    }
    this.waitingActors[this.waitingActors.length] = scenarioActor;
    mapping[mapping.length] = scenarioActor;
  }

  this.addDependency = function(actor, waitFor) {
    // check params
    this.__checkDependencyParam(actor);
    for (var i = 0; i < waitFor.length; i++) {
      var wait = waitFor[i];
      this.__checkDependencyParam(wait);
    }

    var actorId = mapping.indexOf(actor);
    if (this.dependencies[actorId] == undefined) {
      this.dependencies[actorId] = new Array();
    }
    var deps = this.dependencies[actorId];
    for (var i = 0; i < waitFor.length; i++) {
      var wait = waitFor[i];
      deps[deps.length] = wait;
  //      alert("Added dependency of " + mapping.indexOf(wait) + " on " + actorId);
    }
  }

  this.play = function() {
    this.isLooping = false;
    this.state = TimelineScenarioState.PLAYING;
    this.__playScenario();
  }

  this.playLoop = function() {
    for (var i = 0; i < this.waitingActors.length; i++) {
      var actor = this.waitingActors[i];
      if (!actor.supportsReplay())
      throw "Can't loop scenario with actor(s) that don't support replay";
    }
    this.isLooping = true;
    this.state = TimelineScenarioState.PLAYING;
    this.__playScenario();
  }
}

var runningTimelines = {};
var runningScenarios = {};

globalTimerCallback = function() {
  var currTime = new Date().getTime();
  var passedSinceLastIteration = currTime - lastTime;
  var liveTimelines = 0;
  var totalTimelines = 0;
  var liveScenarios = 0;
  var totalScenarios = 0;
  for (var timelineId in runningTimelines) {
    totalTimelines++;
    var timeline = runningTimelines[timelineId];
    var timelineState = timeline.getState();
    
    if (timeline.getState() == TimelineState.SUSPENDED) {
      continue;
    }

    var timelineWasInReadyState = false;
    if (timeline.getState() == TimelineState.READY) {
      if ((timeline.timeUntilPlay - passedSinceLastIteration) > 0) {
        // still needs to wait in the READY state
        timeline.timeUntilPlay -= passedSinceLastIteration;
        continue;
      }

      // can go from READY to PLAYING
      timelineWasInReadyState = true;
      timeline.__popState();
      timeline.__callbackCallTimelineStateChanged(TimelineState.READY);
    }

    var hasEnded = false;
    if (timelineState == TimelineState.PLAYING_FORWARD) {
      if (!timelineWasInReadyState) {
        timeline.durationFraction = timeline.durationFraction
          + passedSinceLastIteration / timeline.duration;
      }
      if (timeline.durationFraction > 1) {
        timeline.durationFraction = 1;
        timeline.timelinePosition = 1;
        if (timeline.repeatCount != 0) {
          var stopLoopingAnimation = timeline.toCancelAtCycleBreak;
          var loopsToLive = timeline.repeatCount;
          if (loopsToLive > 0) {
            loopsToLive--;
            stopLoopingAnimation = stopLoopingAnimation || (loopsToLive == 0);
            timeline.repeatCount = loopsToLive;
          }
          if (stopLoopingAnimation) {
            // end looping animation
            hasEnded = true;
          } else {
            if (timeline.repeatBehavior == RepeatBehavior.REVERSE) {
              timeline.__replaceState(TimelineState.PLAYING_REVERSE);
              if (timeline.cycleDelay > 0) {
                timeline.__pushState(TimelineState.READY);
                timeline.timeUntilPlay = timeline.cycleDelay;
              }
              timeline.__callbackCallTimelineStateChanged(TimelineState.PLAYING_FORWARD);
            } else {
              timeline.durationFraction = 0;
              timeline.timelinePosition = 0;
              if (timeline.cycleDelay > 0) {
                timeline.__pushState(TimelineState.READY);
                timeline.timeUntilPlay = timeline.cycleDelay;
                timeline.__callbackCallTimelineStateChanged(TimelineState.PLAYING_FORWARD);
              } else {
                // it's still playing forward, but lets
                // the app code know that the new loop has begun
                timeline.__callbackCallTimelineStateChanged(TimelineState.PLAYING_FORWARD);
              }
            }
          }
        } else {
          hasEnded = true;
        }
      }
      timeline.__callbackCallTimelinePulse();
    }
    if (timelineState == TimelineState.PLAYING_REVERSE) {
      if (!timelineWasInReadyState) {
        timeline.durationFraction = timeline.durationFraction
          - passedSinceLastIteration / timeline.duration;
      }
      if (timeline.durationFraction < 0) {
        timeline.durationFraction = 0;
        timeline.timelinePosition = 0;
        if (timeline.repeatCount != 0) {
          var stopLoopingAnimation = timeline.toCancelAtCycleBreak;
          var loopsToLive = timeline.repeatCount;
          if (loopsToLive > 0) {
            loopsToLive--;
            stopLoopingAnimation = stopLoopingAnimation || (loopsToLive == 0);
            timeline.repeatCount = loopsToLive;
          }
          if (stopLoopingAnimation) {
            // end looping animation
            hasEnded = true;
          } else {
            timeline.__replaceState(TimelineState.PLAYING_FORWARD);
            if (timeline.cycleDelay > 0) {
              timeline.__pushState(TimelineState.READY);
              timeline.timeUntilPlay = timeline.cycleDelay;
            }
            timeline.__callbackCallTimelineStateChanged(TimelineState.PLAYING_REVERSE);
          }
        } else {
          hasEnded = true;
        }
      }
      timeline.__callbackCallTimelinePulse();
    }

    if (hasEnded) {
      var oldState = timeline.getState();
      timeline.__replaceState(TimelineState.DONE);
      timeline.__callbackCallTimelineStateChanged(oldState);
      timeline.__popState();
      timeline.__callbackCallTimelineStateChanged(TimelineState.DONE);
      delete runningTimelines[timelineId];
    } else {
      liveTimelines++;
    }
  }
  
  for (var scenarioId in runningScenarios) {
    totalScenarios++;
    var scenario = runningScenarios[scenarioId];
    var scenarioState = scenario.state;
    if (scenarioState == TimelineScenarioState.DONE) {
      delete runningScenarios[scenarioId];
      scenario.__callbackCallTimelineScenarioEnded();
      continue;
    }
    liveScenarios++;
    var readyActors = scenario.getReadyActors();
    if (readyActors.length > 0) {
      for (var i = 0; i < readyActors.length; i++) {
        var readyActor = readyActors[i];
        readyActor.play();
      }
    }
  }
	
  //  document.title = liveTimelines + " live timeline(s) out of " + totalTimelines;
 // document.title = liveScenarios + " live scenario(s) out of " + totalScenarios;
  lastTime = currTime;
}

var timerCallbackId = setInterval(globalTimerCallback.bind(), 40);

setPulseRate = function(pulseMsDelay) {
  clearInterval(timerCallbackId);
  timerCallbackId = setInterval(globalTimerCallback.bind(), 20);
}


//

exports.Timeline = Timeline;
exports.TimelineState = TimelineState;
exports.TimelineScenario = TimelineScenario;
exports.TimelineScenarioState = TimelineScenarioState;
exports.TimelineRepeatBehavior = RepeatBehavior;
exports.EasingFunctions = {
    Linear: LinearEase,
    Sine: SineEase,
    QuadraticIn: QuadraticEaseIn,
    QuadraticOut: QuadraticEaseOut,
    QuadraticInOut: QuadraticEaseInOut,
    CubicIn: CubicEaseIn,
    CubicOut: CubicEaseOut,
    CubicInOut: CubicEaseInOut,
    QuarticIn: QuarticEaseIn,
    QuarticOut: QuarticEaseOut,
    QuarticInOut: QuarticEaseInOut,
    SinusoidalIn: SinusoidalEaseIn,
    SinusoidalOut: SinusoidalEaseOut,
    SinusoidalInOut: SinusoidalEaseInOut,
    ExponentialIn: ExponentialEaseIn,
    ExponentialOut: ExponentialEaseOut,
    ExponentialInOut: ExponentialEaseInOut,
    CircularIn: CircularEaseIn,
    CircularOut: CircularEaseOut,
    CircularInOut: CircularEaseInOut,
    ElasticIn: ElasticEaseIn,
    ElasticOut: ElasticEaseOut,
    ElasticInOut: ElasticEaseInOut,
    BackIn: BackEaseIn,
    BackOut: BackEaseOut,
    BackInOut: BackEaseInOut,
    BounceIn: BounceEaseIn,
    BounceOut: BounceEaseOut,
    BounceInOut: BounceEaseInOut,
};

});
require.register("djdeath-trident-js/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"trident-js","version":"0.0.1","description":"Javascript animation framework","author":"","repo":"djdeath/trident-js","dependencies":{},"main":"trident.js","scripts":["trident.js"],"json":["component.json"]}');
});
require.register("djdeath-noflo-tween/index.js", function(exports, require, module){
/*
 * This file can be used for general library features of noflo-tween.
 *
 * The library features can be made available as CommonJS modules that the
 * components in this project utilize.
 */

});
require.register("djdeath-noflo-tween/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-tween","description":"Tween components for NoFlo.","author":"Lionel Landwerlin","repo":"djdeath/noflo-tween","version":"0.0.1","keywords":[],"dependencies":{"noflo/noflo":"*","djdeath/trident-js":"*"},"scripts":["components/Tween.js","index.js"],"json":["component.json"],"noflo":{"components":{"Tween":"components/Tween.js"}}}');
});
require.register("djdeath-noflo-tween/components/Tween.js", function(exports, require, module){
var Tween, noflo, trident,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

noflo = require('noflo');

trident = require('trident-js');

Tween = (function(_super) {
  __extends(Tween, _super);

  Tween.prototype.description = 'Tweener component';

  Tween.prototype.icon = 'cogs';

  function Tween() {
    this.inPorts = {
      start: new noflo.Port('bang'),
      pause: new noflo.Port('bang'),
      unpause: new noflo.Port('bang'),
      stop: new noflo.Port('bang'),
      from: new noflo.Port('number'),
      to: new noflo.Port('number'),
      duration: new noflo.Port('number'),
      repeat: new noflo.Port('number'),
      autoreverse: new noflo.Port('boolean'),
      easing: new noflo.Port('string')
    };
    this.outPorts = {
      started: new noflo.Port('bang'),
      stopped: new noflo.Port('bang'),
      value: new noflo.Port('bang')
    };
    this.inPorts.from.on('data', (function(_this) {
      return function(value) {
        _this.getTween();
        return _this.startValue = parseFloat(value);
      };
    })(this));
    this.inPorts.to.on('data', (function(_this) {
      return function(value) {
        _this.getTween();
        return _this.stopValue = parseFloat(value);
      };
    })(this));
    this.inPorts.duration.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().duration = parseFloat(value);
      };
    })(this));
    this.inPorts.repeat.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().repeatCount = parseInt(value);
      };
    })(this));
    this.inPorts.autoreverse.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().repeatBehavior = value ? trident.TimelineRepeatBehavior.REVERSE : trident.TimelineRepeatBehavior.NORMAL;
      };
    })(this));
    this.inPorts.easing.on('data', (function(_this) {
      return function(value) {
        var ease;
        ease = _this.getEasing(value);
        if (!ease) {
          return;
        }
        return _this.easing = ease;
      };
    })(this));
    this.inPorts.start.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().play();
      };
    })(this));
    this.inPorts.stop.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().cancel();
      };
    })(this));
    this.inPorts.pause.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().suspend();
      };
    })(this));
    this.inPorts.unpause.on('data', (function(_this) {
      return function(value) {
        return _this.getTween().resume();
      };
    })(this));
  }

  Tween.prototype.getEasing = function(name) {
    var lowName, s;
    lowName = name.toLowerCase();
    s = lowName;
    s = s.replace(/bounce/, "Bounce");
    s = s.replace(/linear/, "Linear");
    s = s.replace(/qua/, "Qua");
    s = s.replace(/cubic/, "Cubic");
    s = s.replace(/sin/, "Sin");
    s = s.replace(/circ/, "Circ");
    s = s.replace(/back/, "Back");
    s = s.replace(/elastic/, "Elastic");
    s = s.replace(/in$/, "In");
    s = s.replace(/out$/, "Out");
    s = s.replace(/inout$/, "InOut");
    if (!trident.EasingFunctions[s]) {
      return null;
    }
    return new trident.EasingFunctions[s]();
  };

  Tween.prototype.getTween = function() {
    if (this.tween) {
      return this.tween;
    }
    this.startValue = 0.0;
    this.stopValue = 1.0;
    this.tween = new trident.Timeline();
    this.easing = this.getEasing('linear');
    this.tween.addEventListener('onpulse', (function(_this) {
      return function(timeline, durationFraction, timelinePosition) {
        var value;
        if (!_this.outPorts.value.isAttached()) {
          return;
        }
        value = _this.startValue + _this.easing.map(durationFraction) * (_this.stopValue - _this.startValue);
        _this.outPorts.value.send(value);
        return _this.outPorts.value.disconnect();
      };
    })(this));
    this.tween.addEventListener('onstatechange', (function(_this) {
      return function(timeline, oldState, newState, durationFraction, timelinePosition) {
        if (newState === trident.TimelineState.PLAYING_FORWARD || newState === trident.TimelineState.PLAYING_REVERSE) {
          if (_this.outPorts.started.isAttached()) {
            _this.outPorts.started.send(true);
            _this.outPorts.started.disconnect();
          }
        }
        if (newState === trident.TimelineState.DONE || newState === trident.TimelineState.CANCELLED) {
          if (_this.outPorts.stopped.isAttached()) {
            _this.outPorts.stopped.send(true);
            return _this.outPorts.stopped.disconnect();
          }
        }
      };
    })(this));
    return this.tween;
  };

  Tween.prototype.shutdown = function() {
    if (!this.tween) {
      return;
    }
    this.tween.kill();
    return delete this.tween;
  };

  return Tween;

})(noflo.Component);

exports.getComponent = function() {
  return new Tween;
};

});
require.register("noflo-noflo-runtime-base/src/Base.js", function(exports, require, module){
var BaseTransport, protocols;

protocols = {
  Runtime: require('./protocol/Runtime'),
  Graph: require('./protocol/Graph'),
  Network: require('./protocol/Network'),
  Component: require('./protocol/Component')
};

BaseTransport = (function() {
  function BaseTransport(options) {
    this.options = options;
    if (!this.options) {
      this.options = {};
    }
    this.version = '0.4';
    this.runtime = new protocols.Runtime(this);
    this.graph = new protocols.Graph(this);
    this.network = new protocols.Network(this);
    this.component = new protocols.Component(this);
    this.context = null;
  }

  BaseTransport.prototype.send = function(protocol, topic, payload, context) {};

  BaseTransport.prototype.receive = function(protocol, topic, payload, context) {
    this.context = context;
    switch (protocol) {
      case 'runtime':
        return this.runtime.receive(topic, payload, context);
      case 'graph':
        return this.graph.receive(topic, payload, context);
      case 'network':
        return this.network.receive(topic, payload, context);
      case 'component':
        return this.component.receive(topic, payload, context);
    }
  };

  return BaseTransport;

})();

module.exports = BaseTransport;

});
require.register("noflo-noflo-runtime-base/src/protocol/Graph.js", function(exports, require, module){
var GraphProtocol, noflo;

noflo = require('noflo');

GraphProtocol = (function() {
  function GraphProtocol(transport) {
    this.transport = transport;
    this.graphs = {};
  }

  GraphProtocol.prototype.send = function(topic, payload, context) {
    return this.transport.send('graph', topic, payload, context);
  };

  GraphProtocol.prototype.receive = function(topic, payload, context) {
    var graph;
    if (topic !== 'clear') {
      graph = this.resolveGraph(payload, context);
      if (!graph) {
        return;
      }
    }
    switch (topic) {
      case 'clear':
        return this.initGraph(payload, context);
      case 'addnode':
        return this.addNode(graph, payload, context);
      case 'removenode':
        return this.removeNode(graph, payload, context);
      case 'renamenode':
        return this.renameNode(graph, payload, context);
      case 'addedge':
        return this.addEdge(graph, payload, context);
      case 'removeedge':
        return this.removeEdge(graph, payload, context);
      case 'addinitial':
        return this.addInitial(graph, payload, context);
      case 'removeinitial':
        return this.removeInitial(graph, payload, context);
      case 'addinport':
        return this.addInport(graph, payload, context);
      case 'removeinport':
        return this.removeInport(graph, payload, context);
      case 'addoutport':
        return this.addOutport(graph, payload, context);
      case 'removeoutport':
        return this.removeOutport(graph, payload, context);
    }
  };

  GraphProtocol.prototype.resolveGraph = function(payload, context) {
    if (!payload.graph) {
      this.send('error', new Error('No graph specified'), context);
      return;
    }
    if (!this.graphs[payload.graph]) {
      this.send('error', new Error('Requested graph not found'), context);
      return;
    }
    return this.graphs[payload.graph];
  };

  GraphProtocol.prototype.initGraph = function(payload, context) {
    var fullName, graph;
    if (!payload.id) {
      this.send('error', new Error('No graph ID provided'), context);
      return;
    }
    if (!payload.name) {
      payload.name = 'NoFlo runtime';
    }
    graph = new noflo.Graph(payload.name);
    fullName = payload.id;
    if (payload.library) {
      graph.properties.library = payload.library;
      fullName = "" + payload.library + "/" + fullName;
    }
    graph.baseDir = this.transport.options.baseDir;
    this.subscribeGraph(payload.id, graph, context);
    if (!payload.main) {
      this.transport.component.registerGraph(fullName, graph, context);
    }
    return this.graphs[payload.id] = graph;
  };

  GraphProtocol.prototype.subscribeGraph = function(id, graph, context) {
    graph.on('addNode', (function(_this) {
      return function(node) {
        node.graph = id;
        return _this.send('addnode', node, context);
      };
    })(this));
    graph.on('removeNode', (function(_this) {
      return function(node) {
        node.graph = id;
        return _this.send('removenode', node, context);
      };
    })(this));
    graph.on('renameNode', (function(_this) {
      return function(oldId, newId) {
        return _this.send('renamenode', {
          from: oldId,
          to: newId,
          graph: id
        }, context);
      };
    })(this));
    graph.on('addEdge', (function(_this) {
      return function(edge) {
        var edgeData;
        edgeData = {
          src: edge.from,
          tgt: edge.to,
          metadata: edge.metadata,
          graph: id
        };
        return _this.send('addedge', edgeData, context);
      };
    })(this));
    graph.on('removeEdge', (function(_this) {
      return function(edge) {
        var edgeData;
        edgeData = {
          src: edge.from,
          tgt: edge.to,
          metadata: edge.metadata,
          graph: id
        };
        return _this.send('removeedge', edgeData, context);
      };
    })(this));
    graph.on('addInitial', (function(_this) {
      return function(iip) {
        var iipData;
        iipData = {
          src: iip.from,
          tgt: iip.to,
          metadata: iip.metadata,
          graph: id
        };
        return _this.send('addinitial', iipData, context);
      };
    })(this));
    return graph.on('removeInitial', (function(_this) {
      return function(iip) {
        var iipData;
        iipData = {
          src: iip.from,
          tgt: iip.to,
          metadata: iip.metadata,
          graph: id
        };
        return _this.send('removeinitial', iipData, context);
      };
    })(this));
  };

  GraphProtocol.prototype.addNode = function(graph, node, context) {
    if (!(node.id || node.component)) {
      this.send('error', new Error('No ID or component supplied'), context);
      return;
    }
    return graph.addNode(node.id, node.component, node.metadata);
  };

  GraphProtocol.prototype.removeNode = function(graph, payload) {
    if (!payload.id) {
      this.send('error', new Error('No ID supplied'), context);
      return;
    }
    return graph.removeNode(payload.id);
  };

  GraphProtocol.prototype.renameNode = function(graph, payload, context) {
    if (!(payload.from || payload.to)) {
      this.send('error', new Error('No from or to supplied'), context);
      return;
    }
    return graph.renameNode(payload.from, payload.to);
  };

  GraphProtocol.prototype.addEdge = function(graph, edge, context) {
    if (!(edge.src || edge.tgt)) {
      this.send('error', new Error('No src or tgt supplied'), context);
      return;
    }
    return graph.addEdge(edge.src.node, edge.src.port, edge.tgt.node, edge.tgt.port, edge.metadata);
  };

  GraphProtocol.prototype.removeEdge = function(graph, edge, context) {
    if (!(edge.src || edge.tgt)) {
      this.send('error', new Error('No src or tgt supplied'), context);
      return;
    }
    return graph.removeEdge(edge.src.node, edge.src.port, edge.tgt.node, edge.tgt.port);
  };

  GraphProtocol.prototype.addInitial = function(graph, payload, context) {
    if (!(payload.src || payload.tgt)) {
      this.send('error', new Error('No src or tgt supplied'), context);
      return;
    }
    return graph.addInitial(payload.src.data, payload.tgt.node, payload.tgt.port, payload.metadata);
  };

  GraphProtocol.prototype.removeInitial = function(graph, payload, context) {
    if (!payload.tgt) {
      this.send('error', new Error('No tgt supplied'), context);
      return;
    }
    return graph.removeInitial(payload.tgt.node, payload.tgt.port);
  };

  GraphProtocol.prototype.addInport = function(graph, payload, context) {
    if (!(payload["public"] || payload.node || payload.port)) {
      this.send('error', new Error('Missing exported inport information'), context);
      return;
    }
    return graph.addInport(payload["public"], payload.node, payload.port, payload.metadata);
  };

  GraphProtocol.prototype.removeInport = function(graph, payload, context) {
    if (!payload["public"]) {
      this.send('error', new Error('Missing exported inport name'), context);
      return;
    }
    return graph.removeInport(payload["public"]);
  };

  GraphProtocol.prototype.addOutport = function(graph, payload, context) {
    if (!(payload["public"] || payload.node || payload.port)) {
      this.send('error', new Error('Missing exported outport information'), context);
      return;
    }
    return graph.addOutport(payload["public"], payload.node, payload.port, payload.metadata);
  };

  GraphProtocol.prototype.removeOutport = function(graph, payload, context) {
    if (!payload["public"]) {
      this.send('error', new Error('Missing exported outport name'), context);
      return;
    }
    return graph.removeOutport(payload["public"]);
  };

  return GraphProtocol;

})();

module.exports = GraphProtocol;

});
require.register("noflo-noflo-runtime-base/src/protocol/Network.js", function(exports, require, module){
var NetworkProtocol, noflo, prepareSocketEvent;

noflo = require('noflo');

prepareSocketEvent = function(event, req) {
  var payload;
  payload = {
    id: event.id,
    graph: req.graph
  };
  if (event.socket.from) {
    payload.src = {
      node: event.socket.from.process.id,
      port: event.socket.from.port
    };
  }
  if (event.socket.to) {
    payload.tgt = {
      node: event.socket.to.process.id,
      port: event.socket.to.port
    };
  }
  if (event.subgraph) {
    payload.subgraph = event.subgraph;
  }
  if (event.group) {
    payload.group = event.group;
  }
  if (event.data) {
    if (event.data.toJSON) {
      payload.data = event.data.toJSON();
    }
    if (event.data.toString) {
      payload.data = event.data.toString();
      if (payload.data === '[object Object]') {
        try {
          payload.data = JSON.parse(JSON.stringify(event.data));
        } catch (_error) {}
      }
    } else {
      payload.data = event.data;
    }
  }
  if (event.subgraph) {
    payload.subgraph = event.subgraph;
  }
  return payload;
};

NetworkProtocol = (function() {
  function NetworkProtocol(transport) {
    this.transport = transport;
    this.networks = {};
  }

  NetworkProtocol.prototype.send = function(topic, payload, context) {
    return this.transport.send('network', topic, payload, context);
  };

  NetworkProtocol.prototype.receive = function(topic, payload, context) {
    var graph;
    graph = this.resolveGraph(payload, context);
    if (!graph) {
      return;
    }
    switch (topic) {
      case 'start':
        return this.initNetwork(graph, payload, context);
      case 'stop':
        return this.stopNetwork(graph, payload, context);
    }
  };

  NetworkProtocol.prototype.resolveGraph = function(payload, context) {
    if (!payload.graph) {
      this.send('error', new Error('No graph specified'), context);
      return;
    }
    if (!this.transport.graph.graphs[payload.graph]) {
      this.send('error', new Error('Requested graph not found'), context);
      return;
    }
    return this.transport.graph.graphs[payload.graph];
  };

  NetworkProtocol.prototype.initNetwork = function(graph, payload, context) {
    graph.componentLoader = this.transport.component.getLoader(graph.baseDir);
    return noflo.createNetwork(graph, (function(_this) {
      return function(network) {
        _this.networks[payload.graph] = network;
        _this.subscribeNetwork(network, payload, context);
        return network.connect(function() {
          network.sendInitials();
          return graph.on('addInitial', function() {
            return network.sendInitials();
          });
        });
      };
    })(this), true);
  };

  NetworkProtocol.prototype.subscribeNetwork = function(network, payload, context) {
    network.on('start', (function(_this) {
      return function(event) {
        return _this.send('started', {
          time: event.start,
          graph: payload.graph
        }, context);
      };
    })(this));
    network.on('icon', (function(_this) {
      return function(event) {
        event.graph = payload.graph;
        return _this.send('icon', event, context);
      };
    })(this));
    network.on('connect', (function(_this) {
      return function(event) {
        return _this.send('connect', prepareSocketEvent(event, payload), context);
      };
    })(this));
    network.on('begingroup', (function(_this) {
      return function(event) {
        return _this.send('begingroup', prepareSocketEvent(event, payload), context);
      };
    })(this));
    network.on('data', (function(_this) {
      return function(event) {
        return _this.send('data', prepareSocketEvent(event, payload), context);
      };
    })(this));
    network.on('endgroup', (function(_this) {
      return function(event) {
        return _this.send('endgroup', prepareSocketEvent(event, payload), context);
      };
    })(this));
    network.on('disconnect', (function(_this) {
      return function(event) {
        return _this.send('disconnect', prepareSocketEvent(event, payload), context);
      };
    })(this));
    return network.on('end', (function(_this) {
      return function(event) {
        return _this.send('stopped', {
          time: new Date,
          uptime: event.uptime,
          graph: payload.graph
        }, context);
      };
    })(this));
  };

  NetworkProtocol.prototype.stopNetwork = function(graph, payload, context) {
    if (!this.networks[payload.graph]) {
      return;
    }
    return this.networks[payload.graph].stop();
  };

  return NetworkProtocol;

})();

module.exports = NetworkProtocol;

});
require.register("noflo-noflo-runtime-base/src/protocol/Component.js", function(exports, require, module){
var ComponentProtocol, noflo;

noflo = require('noflo');

ComponentProtocol = (function() {
  ComponentProtocol.prototype.loaders = {};

  function ComponentProtocol(transport) {
    this.transport = transport;
  }

  ComponentProtocol.prototype.send = function(topic, payload, context) {
    return this.transport.send('component', topic, payload, context);
  };

  ComponentProtocol.prototype.receive = function(topic, payload, context) {
    switch (topic) {
      case 'list':
        return this.listComponents(payload, context);
      case 'getsource':
        return this.getSource(payload, context);
      case 'source':
        return this.setSource(payload, context);
    }
  };

  ComponentProtocol.prototype.getLoader = function(baseDir) {
    if (!this.loaders[baseDir]) {
      this.loaders[baseDir] = new noflo.ComponentLoader(baseDir);
    }
    return this.loaders[baseDir];
  };

  ComponentProtocol.prototype.listComponents = function(payload, context) {
    var baseDir, loader;
    baseDir = this.transport.options.baseDir;
    loader = this.getLoader(baseDir);
    return loader.listComponents((function(_this) {
      return function(components) {
        return Object.keys(components).forEach(function(component) {
          return _this.processComponent(loader, component, context);
        });
      };
    })(this));
  };

  ComponentProtocol.prototype.getSource = function(payload, context) {
    var baseDir, loader;
    baseDir = this.transport.options.baseDir;
    loader = this.getLoader(baseDir);
    return loader.getSource(payload.name, (function(_this) {
      return function(err, component) {
        if (err) {
          _this.send('error', err, context);
          return;
        }
        return _this.send('source', component, context);
      };
    })(this));
  };

  ComponentProtocol.prototype.setSource = function(payload, context) {
    var baseDir, loader;
    baseDir = this.transport.options.baseDir;
    loader = this.getLoader(baseDir);
    return loader.setSource(payload.library, payload.name, payload.code, payload.language, (function(_this) {
      return function(err) {
        if (err) {
          _this.send('error', err, context);
          return;
        }
        return _this.processComponent(loader, loader.normalizeName(payload.library, payload.name), context);
      };
    })(this));
  };

  ComponentProtocol.prototype.processComponent = function(loader, component, context) {
    return loader.load(component, (function(_this) {
      return function(instance) {
        if (!instance.isReady()) {
          instance.once('ready', function() {
            return _this.sendComponent(component, instance, context);
          });
          return;
        }
        return _this.sendComponent(component, instance, context);
      };
    })(this), true);
  };

  ComponentProtocol.prototype.sendComponent = function(component, instance, context) {
    var icon, inPorts, outPorts, port, portName, _ref, _ref1;
    inPorts = [];
    outPorts = [];
    _ref = instance.inPorts;
    for (portName in _ref) {
      port = _ref[portName];
      if (!port || typeof port === 'function' || !port.canAttach) {
        continue;
      }
      inPorts.push({
        id: portName,
        type: port.getDataType ? port.getDataType() : void 0,
        required: port.isRequired ? port.isRequired() : void 0,
        addressable: port.isAddressable ? port.isAddressable() : void 0,
        description: port.getDescription ? port.getDescription() : void 0
      });
    }
    _ref1 = instance.outPorts;
    for (portName in _ref1) {
      port = _ref1[portName];
      if (!port || typeof port === 'function' || !port.canAttach) {
        continue;
      }
      outPorts.push({
        id: portName,
        type: port.getDataType ? port.getDataType() : void 0,
        required: port.isRequired ? port.isRequired() : void 0,
        addressable: port.isAddressable ? port.isAddressable() : void 0,
        description: port.getDescription ? port.getDescription() : void 0
      });
    }
    icon = instance.getIcon ? instance.getIcon() : 'blank';
    return this.send('component', {
      name: component,
      description: instance.description,
      subgraph: instance.isSubgraph(),
      icon: icon,
      inPorts: inPorts,
      outPorts: outPorts
    }, context);
  };

  ComponentProtocol.prototype.registerGraph = function(id, graph, context) {
    var loader, send;
    send = (function(_this) {
      return function() {
        return _this.processComponent(loader, id, context);
      };
    })(this);
    loader = this.getLoader(graph.baseDir);
    loader.listComponents((function(_this) {
      return function(components) {
        loader.registerComponent('', id, graph);
        return send();
      };
    })(this));
    graph.on('addNode', send);
    graph.on('removeNode', send);
    graph.on('renameNode', send);
    graph.on('addEdge', send);
    graph.on('removeEdge', send);
    graph.on('addInitial', send);
    return graph.on('removeInitial', send);
  };

  return ComponentProtocol;

})();

module.exports = ComponentProtocol;

});
require.register("noflo-noflo-runtime-base/src/protocol/Runtime.js", function(exports, require, module){
var RuntimeProtocol, noflo;

noflo = require('noflo');

RuntimeProtocol = (function() {
  function RuntimeProtocol(transport) {
    this.transport = transport;
  }

  RuntimeProtocol.prototype.send = function(topic, payload, context) {
    return this.transport.send('runtime', topic, payload, context);
  };

  RuntimeProtocol.prototype.receive = function(topic, payload, context) {
    switch (topic) {
      case 'getruntime':
        return this.getRuntime(payload, context);
      case 'packet':
        return this.receivePacket(payload, context);
    }
  };

  RuntimeProtocol.prototype.getRuntime = function(payload, context) {
    var type;
    type = this.transport.type;
    if (!type) {
      if (noflo.isBrowser()) {
        type = 'noflo-browser';
      } else {
        type = 'noflo-nodejs';
      }
    }
    return this.send('runtime', {
      type: type,
      version: this.transport.version,
      capabilities: ['protocol:graph', 'protocol:component', 'protocol:network', 'component:setsource', 'component:getsource']
    }, context);
  };

  RuntimeProtocol.prototype.receivePacket = function(payload, context) {
    return this.send('error', new Error('Packets not supported yet'), context);
  };

  return RuntimeProtocol;

})();

module.exports = RuntimeProtocol;

});
require.register("djdeath-noflo-runtime-websocket/runtime/network.js", function(exports, require, module){
var WebSocketServer = require('websocket').server;
var Base = require('noflo-runtime-base');

function WebSocketRuntime (options) {
  if (!options) {
    options = {};
  }
  this.connections = [];
  if (options.catchExceptions) {
    process.on('uncaughtException', function (err) {
      this.connections.forEach(function (connection) {
        this.send('network', 'error', {
          message: err.toString()
        }, {
          connection: connection
        });
      }.bind(this));
    }.bind(this));
  }

  if (options.captureOutput) {
    this.startCapture();
  }

  this.prototype.constructor.apply(this, arguments);
  this.receive = this.prototype.receive;
}
WebSocketRuntime.prototype = Base;
WebSocketRuntime.prototype.send = function (protocol, topic, payload, context) {
  if (!context.connection || !context.connection.connected) {
    return;
  }
  context.connection.sendUTF(JSON.stringify({
    protocol: protocol,
    command: topic,
    payload: payload
  }));
};

WebSocketRuntime.prototype.startCapture = function () {
  this.originalStdOut = process.stdout.write;
  process.stdout.write = function (string, encoding, fd) {
    this.connections.forEach(function (connection) {
      this.send('network', 'output', {
        message: string.replace(/\n$/, '')
      }, {
        connection: connection
      });
    }.bind(this));
  }.bind(this);
};

WebSocketRuntime.prototype.stopCapture = function () {
  if (!this.originalStdOut) {
    return;
  }
  process.stdout.write = this.originalStdOut;
};

module.exports = function (httpServer, options) {
  var wsServer = new WebSocketServer({
    httpServer: httpServer
  });

  var runtime = new WebSocketRuntime(options);
  var handleMessage = function (message, connection) {
    if (message.type == 'utf8') {
      try {
        var contents = JSON.parse(message.utf8Data);
      } catch (e) {
        return;
      }
      runtime.receive(contents.protocol, contents.command, contents.payload, {
        connection: connection
      });
    }
  };

  wsServer.on('request', function (request) {
    var connection = request.accept('noflo', request.origin);
    runtime.connections.push(connection);
    connection.on('message', function (message) {
      handleMessage(message, connection);
    });
    connection.on('close', function () {
      if (runtime.connections.indexOf(connection) === -1) {
        return;
      }
      runtime.connections.splice(runtime.connections.indexOf(connection), 1);
    });
  });

  return runtime;
};

});
require.register("noflo-iot/index.js", function(exports, require, module){
/*
 * This file can be used for general library features that are exposed as CommonJS modules
 * that the components then utilize
 */
module.exports = require("/noflo");

});
require.register("noflo-iot/component.json", function(exports, require, module){
module.exports = JSON.parse('{"name":"noflo-iot","description":"NoFlo IoT components","author":{"name":"Lionel Landwerlin","email":"lionel.g.landwerlin@linux.intel.com"},"repo":"djdeath/noflo-iot","version":"0.0.1","keywords":[],"dependencies":{"jashkenas/underscore":"*","noflo/noflo":"*","noflo/noflo-core":"*","noflo/noflo-strings":"*","noflo/noflo-packets":"*","noflo/noflo-objects":"*","noflo/noflo-routers":"*","noflo/noflo-groups":"*","noflo/noflo-flow":"*","noflo/fbp":"*","djdeath/noflo-xml":"*","djdeath/noflo-filesystem":"*","djdeath/noflo-math":"iot","djdeath/noflo-galileo":"*","djdeath/noflo-micro":"*","djdeath/noflo-tween":"*","djdeath/noflo-runtime-websocket":"componentization"},"scripts":["index.js"],"json":["component.json"]}');
});



require.register("noflo-noflo/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo",
  "description": "Flow-Based Programming environment for JavaScript",
  "keywords": [
    "fbp",
    "workflow",
    "flow"
  ],
  "repo": "noflo/noflo",
  "version": "0.5.0",
  "dependencies": {
    "component/emitter": "*",
    "component/underscore": "*",
    "noflo/fbp": "*"
  },
  "development": {},
  "license": "MIT",
  "main": "src/lib/NoFlo.js",
  "scripts": [
    "src/lib/Graph.js",
    "src/lib/InternalSocket.js",
    "src/lib/BasePort.js",
    "src/lib/InPort.js",
    "src/lib/OutPort.js",
    "src/lib/Ports.js",
    "src/lib/Port.js",
    "src/lib/ArrayPort.js",
    "src/lib/Component.js",
    "src/lib/AsyncComponent.js",
    "src/lib/LoggingComponent.js",
    "src/lib/ComponentLoader.js",
    "src/lib/NoFlo.js",
    "src/lib/Network.js",
    "src/lib/Platform.js",
    "src/lib/Journal.js",
    "src/lib/Utils.js",
    "src/components/Graph.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "Graph": "src/components/Graph.js"
    }
  }
}
});
require.register("noflo-noflo-core/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-core",
  "description": "NoFlo Essentials",
  "repo": "noflo/noflo-core",
  "version": "0.1.0",
  "author": {
    "name": "Henri Bergius",
    "email": "henri.bergius@iki.fi"
  },
  "contributors": [
    {
      "name": "Kenneth Kan",
      "email": "kenhkan@gmail.com"
    },
    {
      "name": "Ryan Shaw",
      "email": "ryanshaw@unc.edu"
    }
  ],
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*",
    "component/underscore": "*"
  },
  "scripts": [
    "components/Callback.js",
    "components/DisconnectAfterPacket.js",
    "components/Drop.js",
    "components/Group.js",
    "components/Kick.js",
    "components/Merge.js",
    "components/Output.js",
    "components/Repeat.js",
    "components/RepeatAsync.js",
    "components/Split.js",
    "components/RunInterval.js",
    "components/RunTimeout.js",
    "components/MakeFunction.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "Callback": "components/Callback.js",
      "DisconnectAfterPacket": "components/DisconnectAfterPacket.js",
      "Drop": "components/Drop.js",
      "Group": "components/Group.js",
      "Kick": "components/Kick.js",
      "Merge": "components/Merge.js",
      "Output": "components/Output.js",
      "Repeat": "components/Repeat.js",
      "RepeatAsync": "components/RepeatAsync.js",
      "Split": "components/Split.js",
      "RunInterval": "components/RunInterval.js",
      "RunTimeout": "components/RunTimeout.js",
      "MakeFunction": "components/MakeFunction.js"
    }
  }
}
});
require.register("noflo-noflo-strings/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-strings",
  "description": "String Utilities for NoFlo",
  "author": "Henri Bergius <henri.bergius@iki.fi>",
  "repo": "noflo/noflo-strings",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*",
    "component/underscore": "*"
  },
  "scripts": [
    "components/CompileString.js",
    "components/Filter.js",
    "components/SendString.js",
    "components/SplitStr.js",
    "components/StringTemplate.js",
    "components/Replace.js",
    "components/Jsonify.js",
    "components/ParseJson.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "font",
    "components": {
      "CompileString": "components/CompileString.js",
      "Filter": "components/Filter.js",
      "SendString": "components/SendString.js",
      "SplitStr": "components/SplitStr.js",
      "StringTemplate": "components/StringTemplate.js",
      "Replace": "components/Replace.js",
      "Jsonify": "components/Jsonify.js",
      "ParseJson": "components/ParseJson.js"
    }
  }
}
});
require.register("noflo-noflo-packets/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-packets",
  "description": "Packet Utilities for NoFlo",
  "version": "0.1.4",
  "author": "Kenneth Kan <kenhkan@gmail.com>",
  "repo": "kenhkan/packets",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*",
    "component/underscore": "*"
  },
  "scripts": [
    "components/CountPackets.js",
    "components/Unzip.js",
    "components/Defaults.js",
    "components/DoNotDisconnect.js",
    "components/DisconnectAfter.js",
    "components/OnlyDisconnect.js",
    "components/SplitPacket.js",
    "components/Range.js",
    "components/Flatten.js",
    "components/Compact.js",
    "components/Zip.js",
    "components/SendWith.js",
    "components/FilterPackets.js",
    "components/FilterByValue.js",
    "components/FilterByPosition.js",
    "components/FilterPacket.js",
    "components/UniquePacket.js",
    "components/GroupByPacket.js",
    "components/LastPacket.js",
    "components/Counter.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "dropbox",
    "components": {
      "CountPackets": "components/CountPackets.js",
      "Unzip": "components/Unzip.js",
      "Defaults": "components/Defaults.js",
      "DoNotDisconnect": "components/DoNotDisconnect.js",
      "DisconnectAfter": "components/DisconnectAfter.js",
      "OnlyDisconnect": "components/OnlyDisconnect.js",
      "SplitPacket": "components/SplitPacket.js",
      "Range": "components/Range.js",
      "Flatten": "components/Flatten.js",
      "Compact": "components/Compact.js",
      "Zip": "components/Zip.js",
      "SendWith": "components/SendWith.js",
      "FilterPackets": "components/FilterPackets.js",
      "FilterByValue": "components/FilterByValue.js",
      "FilterByPosition": "components/FilterByPosition.js",
      "FilterPacket": "components/FilterPacket.js",
      "UniquePacket": "components/UniquePacket.js",
      "GroupByPacket": "components/GroupByPacket.js",
      "LastPacket": "components/LastPacket.js",
      "Counter": "components/Counter.js"
    }
  }
}
});
require.register("noflo-noflo-objects/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-objects",
  "description": "Object Utilities for NoFlo",
  "version": "0.1.0",
  "keywords": [
    "noflo",
    "objects",
    "utilities"
  ],
  "author": "Kenneth Kan <kenhkan@gmail.com>",
  "repo": "noflo/objects",
  "dependencies": {
    "noflo/noflo": "*",
    "component/underscore": "*"
  },
  "scripts": [
    "components/Extend.js",
    "components/MergeObjects.js",
    "components/SplitObject.js",
    "components/ReplaceKey.js",
    "components/Keys.js",
    "components/Size.js",
    "components/Values.js",
    "components/Join.js",
    "components/ExtractProperty.js",
    "components/InsertProperty.js",
    "components/SliceArray.js",
    "components/SplitArray.js",
    "components/FilterPropertyValue.js",
    "components/FlattenObject.js",
    "components/MapProperty.js",
    "components/RemoveProperty.js",
    "components/MapPropertyValue.js",
    "components/GetObjectKey.js",
    "components/UniqueArray.js",
    "components/SetProperty.js",
    "components/SimplifyObject.js",
    "components/DuplicateProperty.js",
    "components/CreateObject.js",
    "components/CreateDate.js",
    "components/SetPropertyValue.js",
    "components/CallMethod.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "list",
    "components": {
      "Extend": "components/Extend.js",
      "MergeObjects": "components/MergeObjects.js",
      "SplitObject": "components/SplitObject.js",
      "ReplaceKey": "components/ReplaceKey.js",
      "Keys": "components/Keys.js",
      "Size": "components/Size.js",
      "Values": "components/Values.js",
      "Join": "components/Join.js",
      "ExtractProperty": "components/ExtractProperty.js",
      "InsertProperty": "components/InsertProperty.js",
      "SliceArray": "components/SliceArray.js",
      "SplitArray": "components/SplitArray.js",
      "FilterPropertyValue": "components/FilterPropertyValue.js",
      "FlattenObject": "components/FlattenObject.js",
      "MapProperty": "components/MapProperty.js",
      "RemoveProperty": "components/RemoveProperty.js",
      "MapPropertyValue": "components/MapPropertyValue.js",
      "GetObjectKey": "components/GetObjectKey.js",
      "UniqueArray": "components/UniqueArray.js",
      "SetProperty": "components/SetProperty.js",
      "SimplifyObject": "components/SimplifyObject.js",
      "DuplicateProperty": "components/DuplicateProperty.js",
      "CreateObject": "components/CreateObject.js",
      "CreateDate": "components/CreateDate.js",
      "SetPropertyValue": "components/SetPropertyValue.js",
      "CallMethod": "components/CallMethod.js"
    }
  }
}
});
require.register("noflo-noflo-routers/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-routers",
  "description": "Routing Packets in NoFlo",
  "keywords": [
    "noflo",
    "routing"
  ],
  "author": "Kenneth Kan <kenhkan@gmail.com>",
  "version": "0.1.0",
  "dependencies": {
    "noflo/noflo": "*",
    "component/underscore": "*"
  },
  "scripts": [
    "components/ControlledSequence.js",
    "components/KickRouter.js",
    "components/PacketRouter.js",
    "components/RegexpRouter.js",
    "components/SplitInSequence.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "code-fork",
    "components": {
      "ControlledSequence": "components/ControlledSequence.js",
      "KickRouter": "components/KickRouter.js",
      "PacketRouter": "components/PacketRouter.js",
      "RegexpRouter": "components/RegexpRouter.js",
      "SplitInSequence": "components/SplitInSequence.js"
    }
  },
  "repo": "https://raw.github.com/noflo/noflo-routers"
}
});
require.register("noflo-noflo-groups/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-groups",
  "description": "Group Utilities for NoFlo",
  "keywords": [
    "noflo",
    "groups",
    "utilities"
  ],
  "author": "Kenneth Kan <kenhkan@gmail.com>",
  "version": "0.1.0",
  "repo": "kenhkan/groups",
  "dependencies": {
    "component/underscore": "*",
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/ReadGroups.js",
    "components/RemoveGroups.js",
    "components/Regroup.js",
    "components/Group.js",
    "components/GroupZip.js",
    "components/FilterByGroup.js",
    "components/Objectify.js",
    "components/ReadGroup.js",
    "components/SendByGroup.js",
    "components/CollectGroups.js",
    "components/CollectObject.js",
    "components/CollectTree.js",
    "components/FirstGroup.js",
    "components/MapGroup.js",
    "components/MergeGroups.js",
    "components/GroupByObjectKey.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "tags",
    "components": {
      "ReadGroups": "components/ReadGroups.js",
      "RemoveGroups": "components/RemoveGroups.js",
      "Regroup": "components/Regroup.js",
      "Group": "components/Group.js",
      "GroupZip": "components/GroupZip.js",
      "FilterByGroup": "components/FilterByGroup.js",
      "Objectify": "components/Objectify.js",
      "ReadGroup": "components/ReadGroup.js",
      "SendByGroup": "components/SendByGroup.js",
      "CollectGroups": "components/CollectGroups.js",
      "CollectObject": "components/CollectObject.js",
      "CollectTree": "components/CollectTree.js",
      "FirstGroup": "components/FirstGroup.js",
      "MapGroup": "components/MapGroup.js",
      "MergeGroups": "components/MergeGroups.js",
      "GroupByObjectKey": "components/GroupByObjectKey.js"
    }
  }
}
});
require.register("noflo-noflo-flow/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-flow",
  "description": "Flow Control for NoFlo",
  "author": "Henri Bergius <henri.bergius@iki.fi>",
  "repo": "noflo/noflo-dom",
  "version": "0.2.0",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/Concat.js",
    "components/Gate.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "random",
    "components": {
      "Concat": "components/Concat.js",
      "Gate": "components/Gate.js"
    }
  }
}
});

require.register("djdeath-noflo-xml/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-xml",
  "description": "XML components for the NoFlo flow-based programming environment",
  "author": "Henri Bergius <henri.bergius@iki.fi>",
  "repo": "noflo/noflo-xml",
  "version": "0.0.2",
  "keywords": [],
  "scripts": [
    "index.js"
  ],
  "json": [
    "component.json"
  ]
}
});
require.register("djdeath-noflo-filesystem/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-filesystem",
  "description": "Filesystem components for the NoFlo flow-based programming environment",
  "author": "Henri Bergius <henri.bergius@iki.fi>",
  "version": "1.0.4",
  "repo": "noflo/noflo-filesystem",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/BaseName.js",
    "components/CopyFile.js",
    "components/CopyTree.js",
    "components/DirName.js",
    "components/DirectoryBuffer.js",
    "components/DirectoryGroupBuffer.js",
    "components/ExtName.js",
    "components/MakeDir.js",
    "components/MimeRouter.js",
    "components/MimeDocumentRouter.js",
    "components/ReadDir.js",
    "components/ReadFile.js",
    "components/ReadFileSync.js",
    "components/ReadFileRaw.js",
    "components/Stat.js",
    "components/WriteFile.js",
    "components/WriteFileRaw.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "BaseName": "components/BaseName.js",
      "CopyFile": "components/CopyFile.js",
      "CopyTree": "components/CopyTree.js",
      "DirName": "components/DirName.js",
      "DirectoryBuffer": "components/DirectoryBuffer.js",
      "DirectoryGroupBuffer": "components/DirectoryGroupBuffer.js",
      "ExtName": "components/ExtName.js",
      "MakeDir": "components/MakeDir.js",
      "MimeRouter": "components/MimeRouter.js",
      "MimeDocumentRouter": "components/MimeDocumentRouter.js",
      "ReadDir": "components/ReadDir.js",
      "ReadFile": "components/ReadFile.js",
      "ReadFileSync": "components/ReadFileSync.js",
      "ReadFileRaw": "components/ReadFileRaw.js",
      "Stat": "components/Stat.js",
      "WriteFile": "components/WriteFile.js",
      "WriteFileRaw": "components/WriteFileRaw.js"
    }
  }
}
});
require.register("djdeath-noflo-math/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-math",
  "description": "Mathematical components for NoFlo",
  "author": "Henri Bergius <henri.bergius@iki.fi>",
  "repo": "noflo/noflo-math",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/Add.js",
    "components/Ceil.js",
    "components/Subtract.js",
    "components/Multiply.js",
    "components/Divide.js",
    "components/Floor.js",
    "components/CalculateAngle.js",
    "components/CalculateDistance.js",
    "components/Compare.js",
    "components/CountSum.js",
    "components/Modulo.js",
    "components/Round.js",
    "lib/MathComponent.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "icon": "plus-circle",
    "components": {
      "Add": "components/Add.js",
      "Ceil": "components/Ceil.js",
      "Subtract": "components/Subtract.js",
      "Multiply": "components/Multiply.js",
      "Divide": "components/Divide.js",
      "Floor": "components/Floor.js",
      "CalculateAngle": "components/CalculateAngle.js",
      "CalculateDistance": "components/CalculateDistance.js",
      "Compare": "components/Compare.js",
      "CountSum": "components/CountSum.js",
      "Modulo": "components/Modulo.js",
      "Round": "components/Round.js"
    }
  }
}
});
require.register("djdeath-noflo-galileo/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-galileo",
  "description": "Intel Galileo Gpio/Pwm components for NoFlo.",
  "author": {
    "name": "Lionel Landwerlin",
    "email": "lionel.g.landwerlin@linux.intel.com"
  },
  "repo": "djdeath/noflo-galileo",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/Gpio.js",
    "components/Pwm.js",
    "components/PwmValues.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "Gpio": "components/Gpio.js",
      "Pwm": "components/Pwm.js",
      "PwmValues": "components/PwmValues.js"
    }
  }
}
});
require.register("djdeath-noflo-micro/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-micro",
  "description": "Basic micro controller components for NoFlo.",
  "author": {
    "name": "Lionel Landwerlin",
    "email": "lionel.g.landwerlin@linux.intel.com"
  },
  "repo": "djdeath/noflo-micro",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*"
  },
  "scripts": [
    "components/DigitalRead.js",
    "components/DigitalWrite.js",
    "components/MonitorPin.js",
    "components/PwmWrite.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "DigitalRead": "components/DigitalRead.js",
      "DigitalWrite": "components/DigitalWrite.js",
      "MonitorPin": "components/MonitorPin.js",
      "PwmWrite": "components/PwmWrite.js"
    }
  }
}
});
require.register("djdeath-trident-js/component.json", function(exports, require, module){
module.exports = {
  "name": "trident-js",
  "version": "0.0.1",
  "description": "Javascript animation framework",
  "author": "",
  "repo": "djdeath/trident-js",
  "dependencies": {},
  "main": "trident.js",
  "scripts": [
    "trident.js"
  ],
  "json": [
    "component.json"
  ]
}
});
require.register("djdeath-noflo-tween/component.json", function(exports, require, module){
module.exports = {
  "name": "noflo-tween",
  "description": "Tween components for NoFlo.",
  "author": "Lionel Landwerlin",
  "repo": "djdeath/noflo-tween",
  "version": "0.0.1",
  "keywords": [],
  "dependencies": {
    "noflo/noflo": "*",
    "djdeath/trident-js": "*"
  },
  "scripts": [
    "components/Tween.js",
    "index.js"
  ],
  "json": [
    "component.json"
  ],
  "noflo": {
    "components": {
      "Tween": "components/Tween.js"
    }
  }
}
});



















require.alias("jashkenas-underscore/underscore.js", "noflo-iot/deps/underscore/underscore.js");
require.alias("jashkenas-underscore/underscore.js", "noflo-iot/deps/underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "underscore/index.js");
require.alias("jashkenas-underscore/underscore.js", "jashkenas-underscore/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-iot/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-iot/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-iot/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-iot/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-iot/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-iot/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-iot/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-iot/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-iot/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-iot/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-iot/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-iot/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-iot/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-iot/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-iot/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-iot/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-iot/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-iot/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-iot/deps/noflo/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-core/components/Callback.js", "noflo-iot/deps/noflo-core/components/Callback.js");
require.alias("noflo-noflo-core/components/DisconnectAfterPacket.js", "noflo-iot/deps/noflo-core/components/DisconnectAfterPacket.js");
require.alias("noflo-noflo-core/components/Drop.js", "noflo-iot/deps/noflo-core/components/Drop.js");
require.alias("noflo-noflo-core/components/Group.js", "noflo-iot/deps/noflo-core/components/Group.js");
require.alias("noflo-noflo-core/components/Kick.js", "noflo-iot/deps/noflo-core/components/Kick.js");
require.alias("noflo-noflo-core/components/Merge.js", "noflo-iot/deps/noflo-core/components/Merge.js");
require.alias("noflo-noflo-core/components/Output.js", "noflo-iot/deps/noflo-core/components/Output.js");
require.alias("noflo-noflo-core/components/Repeat.js", "noflo-iot/deps/noflo-core/components/Repeat.js");
require.alias("noflo-noflo-core/components/RepeatAsync.js", "noflo-iot/deps/noflo-core/components/RepeatAsync.js");
require.alias("noflo-noflo-core/components/Split.js", "noflo-iot/deps/noflo-core/components/Split.js");
require.alias("noflo-noflo-core/components/RunInterval.js", "noflo-iot/deps/noflo-core/components/RunInterval.js");
require.alias("noflo-noflo-core/components/RunTimeout.js", "noflo-iot/deps/noflo-core/components/RunTimeout.js");
require.alias("noflo-noflo-core/components/MakeFunction.js", "noflo-iot/deps/noflo-core/components/MakeFunction.js");
require.alias("noflo-noflo-core/index.js", "noflo-iot/deps/noflo-core/index.js");
require.alias("noflo-noflo-core/index.js", "noflo-core/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-core/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-core/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-core/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-core/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-core/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-core/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-core/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-core/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-core/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-core/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-core/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-core/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-core/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-core/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-core/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-core/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-core/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-core/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-core/deps/underscore/index.js");

require.alias("noflo-noflo-strings/components/CompileString.js", "noflo-iot/deps/noflo-strings/components/CompileString.js");
require.alias("noflo-noflo-strings/components/Filter.js", "noflo-iot/deps/noflo-strings/components/Filter.js");
require.alias("noflo-noflo-strings/components/SendString.js", "noflo-iot/deps/noflo-strings/components/SendString.js");
require.alias("noflo-noflo-strings/components/SplitStr.js", "noflo-iot/deps/noflo-strings/components/SplitStr.js");
require.alias("noflo-noflo-strings/components/StringTemplate.js", "noflo-iot/deps/noflo-strings/components/StringTemplate.js");
require.alias("noflo-noflo-strings/components/Replace.js", "noflo-iot/deps/noflo-strings/components/Replace.js");
require.alias("noflo-noflo-strings/components/Jsonify.js", "noflo-iot/deps/noflo-strings/components/Jsonify.js");
require.alias("noflo-noflo-strings/components/ParseJson.js", "noflo-iot/deps/noflo-strings/components/ParseJson.js");
require.alias("noflo-noflo-strings/index.js", "noflo-iot/deps/noflo-strings/index.js");
require.alias("noflo-noflo-strings/index.js", "noflo-strings/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-strings/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-strings/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-strings/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-strings/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-strings/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-strings/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-strings/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-strings/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-strings/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-strings/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-strings/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-strings/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-strings/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-strings/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-strings/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-strings/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-strings/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-strings/deps/underscore/index.js");

require.alias("noflo-noflo-packets/components/CountPackets.js", "noflo-iot/deps/noflo-packets/components/CountPackets.js");
require.alias("noflo-noflo-packets/components/Unzip.js", "noflo-iot/deps/noflo-packets/components/Unzip.js");
require.alias("noflo-noflo-packets/components/Defaults.js", "noflo-iot/deps/noflo-packets/components/Defaults.js");
require.alias("noflo-noflo-packets/components/DoNotDisconnect.js", "noflo-iot/deps/noflo-packets/components/DoNotDisconnect.js");
require.alias("noflo-noflo-packets/components/DisconnectAfter.js", "noflo-iot/deps/noflo-packets/components/DisconnectAfter.js");
require.alias("noflo-noflo-packets/components/OnlyDisconnect.js", "noflo-iot/deps/noflo-packets/components/OnlyDisconnect.js");
require.alias("noflo-noflo-packets/components/SplitPacket.js", "noflo-iot/deps/noflo-packets/components/SplitPacket.js");
require.alias("noflo-noflo-packets/components/Range.js", "noflo-iot/deps/noflo-packets/components/Range.js");
require.alias("noflo-noflo-packets/components/Flatten.js", "noflo-iot/deps/noflo-packets/components/Flatten.js");
require.alias("noflo-noflo-packets/components/Compact.js", "noflo-iot/deps/noflo-packets/components/Compact.js");
require.alias("noflo-noflo-packets/components/Zip.js", "noflo-iot/deps/noflo-packets/components/Zip.js");
require.alias("noflo-noflo-packets/components/SendWith.js", "noflo-iot/deps/noflo-packets/components/SendWith.js");
require.alias("noflo-noflo-packets/components/FilterPackets.js", "noflo-iot/deps/noflo-packets/components/FilterPackets.js");
require.alias("noflo-noflo-packets/components/FilterByValue.js", "noflo-iot/deps/noflo-packets/components/FilterByValue.js");
require.alias("noflo-noflo-packets/components/FilterByPosition.js", "noflo-iot/deps/noflo-packets/components/FilterByPosition.js");
require.alias("noflo-noflo-packets/components/FilterPacket.js", "noflo-iot/deps/noflo-packets/components/FilterPacket.js");
require.alias("noflo-noflo-packets/components/UniquePacket.js", "noflo-iot/deps/noflo-packets/components/UniquePacket.js");
require.alias("noflo-noflo-packets/components/GroupByPacket.js", "noflo-iot/deps/noflo-packets/components/GroupByPacket.js");
require.alias("noflo-noflo-packets/components/LastPacket.js", "noflo-iot/deps/noflo-packets/components/LastPacket.js");
require.alias("noflo-noflo-packets/components/Counter.js", "noflo-iot/deps/noflo-packets/components/Counter.js");
require.alias("noflo-noflo-packets/index.js", "noflo-iot/deps/noflo-packets/index.js");
require.alias("noflo-noflo-packets/index.js", "noflo-packets/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-packets/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-packets/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-packets/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-packets/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-packets/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-packets/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-packets/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-packets/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-packets/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-packets/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-packets/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-packets/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-packets/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-packets/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-packets/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-packets/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-packets/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-packets/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-packets/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-packets/deps/underscore/index.js");

require.alias("noflo-noflo-objects/components/Extend.js", "noflo-iot/deps/noflo-objects/components/Extend.js");
require.alias("noflo-noflo-objects/components/MergeObjects.js", "noflo-iot/deps/noflo-objects/components/MergeObjects.js");
require.alias("noflo-noflo-objects/components/SplitObject.js", "noflo-iot/deps/noflo-objects/components/SplitObject.js");
require.alias("noflo-noflo-objects/components/ReplaceKey.js", "noflo-iot/deps/noflo-objects/components/ReplaceKey.js");
require.alias("noflo-noflo-objects/components/Keys.js", "noflo-iot/deps/noflo-objects/components/Keys.js");
require.alias("noflo-noflo-objects/components/Size.js", "noflo-iot/deps/noflo-objects/components/Size.js");
require.alias("noflo-noflo-objects/components/Values.js", "noflo-iot/deps/noflo-objects/components/Values.js");
require.alias("noflo-noflo-objects/components/Join.js", "noflo-iot/deps/noflo-objects/components/Join.js");
require.alias("noflo-noflo-objects/components/ExtractProperty.js", "noflo-iot/deps/noflo-objects/components/ExtractProperty.js");
require.alias("noflo-noflo-objects/components/InsertProperty.js", "noflo-iot/deps/noflo-objects/components/InsertProperty.js");
require.alias("noflo-noflo-objects/components/SliceArray.js", "noflo-iot/deps/noflo-objects/components/SliceArray.js");
require.alias("noflo-noflo-objects/components/SplitArray.js", "noflo-iot/deps/noflo-objects/components/SplitArray.js");
require.alias("noflo-noflo-objects/components/FilterPropertyValue.js", "noflo-iot/deps/noflo-objects/components/FilterPropertyValue.js");
require.alias("noflo-noflo-objects/components/FlattenObject.js", "noflo-iot/deps/noflo-objects/components/FlattenObject.js");
require.alias("noflo-noflo-objects/components/MapProperty.js", "noflo-iot/deps/noflo-objects/components/MapProperty.js");
require.alias("noflo-noflo-objects/components/RemoveProperty.js", "noflo-iot/deps/noflo-objects/components/RemoveProperty.js");
require.alias("noflo-noflo-objects/components/MapPropertyValue.js", "noflo-iot/deps/noflo-objects/components/MapPropertyValue.js");
require.alias("noflo-noflo-objects/components/GetObjectKey.js", "noflo-iot/deps/noflo-objects/components/GetObjectKey.js");
require.alias("noflo-noflo-objects/components/UniqueArray.js", "noflo-iot/deps/noflo-objects/components/UniqueArray.js");
require.alias("noflo-noflo-objects/components/SetProperty.js", "noflo-iot/deps/noflo-objects/components/SetProperty.js");
require.alias("noflo-noflo-objects/components/SimplifyObject.js", "noflo-iot/deps/noflo-objects/components/SimplifyObject.js");
require.alias("noflo-noflo-objects/components/DuplicateProperty.js", "noflo-iot/deps/noflo-objects/components/DuplicateProperty.js");
require.alias("noflo-noflo-objects/components/CreateObject.js", "noflo-iot/deps/noflo-objects/components/CreateObject.js");
require.alias("noflo-noflo-objects/components/CreateDate.js", "noflo-iot/deps/noflo-objects/components/CreateDate.js");
require.alias("noflo-noflo-objects/components/SetPropertyValue.js", "noflo-iot/deps/noflo-objects/components/SetPropertyValue.js");
require.alias("noflo-noflo-objects/components/CallMethod.js", "noflo-iot/deps/noflo-objects/components/CallMethod.js");
require.alias("noflo-noflo-objects/index.js", "noflo-iot/deps/noflo-objects/index.js");
require.alias("noflo-noflo-objects/index.js", "noflo-objects/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-objects/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-objects/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-objects/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-objects/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-objects/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-objects/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-objects/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-objects/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-objects/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-objects/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-objects/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-objects/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-objects/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-objects/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-objects/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-objects/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-objects/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-objects/deps/underscore/index.js");

require.alias("noflo-noflo-routers/components/ControlledSequence.js", "noflo-iot/deps/noflo-routers/components/ControlledSequence.js");
require.alias("noflo-noflo-routers/components/KickRouter.js", "noflo-iot/deps/noflo-routers/components/KickRouter.js");
require.alias("noflo-noflo-routers/components/PacketRouter.js", "noflo-iot/deps/noflo-routers/components/PacketRouter.js");
require.alias("noflo-noflo-routers/components/RegexpRouter.js", "noflo-iot/deps/noflo-routers/components/RegexpRouter.js");
require.alias("noflo-noflo-routers/components/SplitInSequence.js", "noflo-iot/deps/noflo-routers/components/SplitInSequence.js");
require.alias("noflo-noflo-routers/index.js", "noflo-iot/deps/noflo-routers/index.js");
require.alias("noflo-noflo-routers/index.js", "noflo-routers/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-routers/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-routers/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-routers/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-routers/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-routers/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-routers/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-routers/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-routers/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-routers/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-routers/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-routers/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-routers/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-routers/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-routers/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-routers/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-routers/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-routers/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-routers/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-routers/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-routers/deps/underscore/index.js");

require.alias("noflo-noflo-groups/components/ReadGroups.js", "noflo-iot/deps/noflo-groups/components/ReadGroups.js");
require.alias("noflo-noflo-groups/components/RemoveGroups.js", "noflo-iot/deps/noflo-groups/components/RemoveGroups.js");
require.alias("noflo-noflo-groups/components/Regroup.js", "noflo-iot/deps/noflo-groups/components/Regroup.js");
require.alias("noflo-noflo-groups/components/Group.js", "noflo-iot/deps/noflo-groups/components/Group.js");
require.alias("noflo-noflo-groups/components/GroupZip.js", "noflo-iot/deps/noflo-groups/components/GroupZip.js");
require.alias("noflo-noflo-groups/components/FilterByGroup.js", "noflo-iot/deps/noflo-groups/components/FilterByGroup.js");
require.alias("noflo-noflo-groups/components/Objectify.js", "noflo-iot/deps/noflo-groups/components/Objectify.js");
require.alias("noflo-noflo-groups/components/ReadGroup.js", "noflo-iot/deps/noflo-groups/components/ReadGroup.js");
require.alias("noflo-noflo-groups/components/SendByGroup.js", "noflo-iot/deps/noflo-groups/components/SendByGroup.js");
require.alias("noflo-noflo-groups/components/CollectGroups.js", "noflo-iot/deps/noflo-groups/components/CollectGroups.js");
require.alias("noflo-noflo-groups/components/CollectObject.js", "noflo-iot/deps/noflo-groups/components/CollectObject.js");
require.alias("noflo-noflo-groups/components/CollectTree.js", "noflo-iot/deps/noflo-groups/components/CollectTree.js");
require.alias("noflo-noflo-groups/components/FirstGroup.js", "noflo-iot/deps/noflo-groups/components/FirstGroup.js");
require.alias("noflo-noflo-groups/components/MapGroup.js", "noflo-iot/deps/noflo-groups/components/MapGroup.js");
require.alias("noflo-noflo-groups/components/MergeGroups.js", "noflo-iot/deps/noflo-groups/components/MergeGroups.js");
require.alias("noflo-noflo-groups/components/GroupByObjectKey.js", "noflo-iot/deps/noflo-groups/components/GroupByObjectKey.js");
require.alias("noflo-noflo-groups/index.js", "noflo-iot/deps/noflo-groups/index.js");
require.alias("noflo-noflo-groups/index.js", "noflo-groups/index.js");
require.alias("component-underscore/index.js", "noflo-noflo-groups/deps/underscore/index.js");

require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-groups/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-groups/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-groups/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-groups/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-groups/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-groups/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-groups/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-groups/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-groups/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-groups/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-groups/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-groups/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-groups/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-groups/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-groups/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-groups/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-groups/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-groups/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-groups/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-flow/components/Concat.js", "noflo-iot/deps/noflo-flow/components/Concat.js");
require.alias("noflo-noflo-flow/components/Gate.js", "noflo-iot/deps/noflo-flow/components/Gate.js");
require.alias("noflo-noflo-flow/index.js", "noflo-iot/deps/noflo-flow/index.js");
require.alias("noflo-noflo-flow/index.js", "noflo-flow/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-flow/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-flow/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-flow/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-flow/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-flow/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-flow/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-flow/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-flow/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-flow/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-flow/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-flow/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-flow/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-flow/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-flow/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-flow/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-flow/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-flow/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-iot/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-iot/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("djdeath-noflo-xml/index.js", "noflo-iot/deps/noflo-xml/index.js");
require.alias("djdeath-noflo-xml/index.js", "noflo-xml/index.js");

require.alias("djdeath-noflo-filesystem/components/BaseName.js", "noflo-iot/deps/noflo-filesystem/components/BaseName.js");
require.alias("djdeath-noflo-filesystem/components/CopyFile.js", "noflo-iot/deps/noflo-filesystem/components/CopyFile.js");
require.alias("djdeath-noflo-filesystem/components/CopyTree.js", "noflo-iot/deps/noflo-filesystem/components/CopyTree.js");
require.alias("djdeath-noflo-filesystem/components/DirName.js", "noflo-iot/deps/noflo-filesystem/components/DirName.js");
require.alias("djdeath-noflo-filesystem/components/DirectoryBuffer.js", "noflo-iot/deps/noflo-filesystem/components/DirectoryBuffer.js");
require.alias("djdeath-noflo-filesystem/components/DirectoryGroupBuffer.js", "noflo-iot/deps/noflo-filesystem/components/DirectoryGroupBuffer.js");
require.alias("djdeath-noflo-filesystem/components/ExtName.js", "noflo-iot/deps/noflo-filesystem/components/ExtName.js");
require.alias("djdeath-noflo-filesystem/components/MakeDir.js", "noflo-iot/deps/noflo-filesystem/components/MakeDir.js");
require.alias("djdeath-noflo-filesystem/components/MimeRouter.js", "noflo-iot/deps/noflo-filesystem/components/MimeRouter.js");
require.alias("djdeath-noflo-filesystem/components/MimeDocumentRouter.js", "noflo-iot/deps/noflo-filesystem/components/MimeDocumentRouter.js");
require.alias("djdeath-noflo-filesystem/components/ReadDir.js", "noflo-iot/deps/noflo-filesystem/components/ReadDir.js");
require.alias("djdeath-noflo-filesystem/components/ReadFile.js", "noflo-iot/deps/noflo-filesystem/components/ReadFile.js");
require.alias("djdeath-noflo-filesystem/components/ReadFileSync.js", "noflo-iot/deps/noflo-filesystem/components/ReadFileSync.js");
require.alias("djdeath-noflo-filesystem/components/ReadFileRaw.js", "noflo-iot/deps/noflo-filesystem/components/ReadFileRaw.js");
require.alias("djdeath-noflo-filesystem/components/Stat.js", "noflo-iot/deps/noflo-filesystem/components/Stat.js");
require.alias("djdeath-noflo-filesystem/components/WriteFile.js", "noflo-iot/deps/noflo-filesystem/components/WriteFile.js");
require.alias("djdeath-noflo-filesystem/components/WriteFileRaw.js", "noflo-iot/deps/noflo-filesystem/components/WriteFileRaw.js");
require.alias("djdeath-noflo-filesystem/index.js", "noflo-iot/deps/noflo-filesystem/index.js");
require.alias("djdeath-noflo-filesystem/index.js", "noflo-filesystem/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "djdeath-noflo-filesystem/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "djdeath-noflo-filesystem/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-filesystem/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("djdeath-noflo-math/components/Add.js", "noflo-iot/deps/noflo-math/components/Add.js");
require.alias("djdeath-noflo-math/components/Ceil.js", "noflo-iot/deps/noflo-math/components/Ceil.js");
require.alias("djdeath-noflo-math/components/Subtract.js", "noflo-iot/deps/noflo-math/components/Subtract.js");
require.alias("djdeath-noflo-math/components/Multiply.js", "noflo-iot/deps/noflo-math/components/Multiply.js");
require.alias("djdeath-noflo-math/components/Divide.js", "noflo-iot/deps/noflo-math/components/Divide.js");
require.alias("djdeath-noflo-math/components/Floor.js", "noflo-iot/deps/noflo-math/components/Floor.js");
require.alias("djdeath-noflo-math/components/CalculateAngle.js", "noflo-iot/deps/noflo-math/components/CalculateAngle.js");
require.alias("djdeath-noflo-math/components/CalculateDistance.js", "noflo-iot/deps/noflo-math/components/CalculateDistance.js");
require.alias("djdeath-noflo-math/components/Compare.js", "noflo-iot/deps/noflo-math/components/Compare.js");
require.alias("djdeath-noflo-math/components/CountSum.js", "noflo-iot/deps/noflo-math/components/CountSum.js");
require.alias("djdeath-noflo-math/components/Modulo.js", "noflo-iot/deps/noflo-math/components/Modulo.js");
require.alias("djdeath-noflo-math/components/Round.js", "noflo-iot/deps/noflo-math/components/Round.js");
require.alias("djdeath-noflo-math/lib/MathComponent.js", "noflo-iot/deps/noflo-math/lib/MathComponent.js");
require.alias("djdeath-noflo-math/index.js", "noflo-iot/deps/noflo-math/index.js");
require.alias("djdeath-noflo-math/index.js", "noflo-math/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "djdeath-noflo-math/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "djdeath-noflo-math/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "djdeath-noflo-math/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "djdeath-noflo-math/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "djdeath-noflo-math/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "djdeath-noflo-math/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "djdeath-noflo-math/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "djdeath-noflo-math/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "djdeath-noflo-math/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "djdeath-noflo-math/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "djdeath-noflo-math/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "djdeath-noflo-math/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-math/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "djdeath-noflo-math/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "djdeath-noflo-math/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "djdeath-noflo-math/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "djdeath-noflo-math/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "djdeath-noflo-math/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-math/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("djdeath-noflo-galileo/components/Gpio.js", "noflo-iot/deps/noflo-galileo/components/Gpio.js");
require.alias("djdeath-noflo-galileo/components/Pwm.js", "noflo-iot/deps/noflo-galileo/components/Pwm.js");
require.alias("djdeath-noflo-galileo/components/PwmValues.js", "noflo-iot/deps/noflo-galileo/components/PwmValues.js");
require.alias("djdeath-noflo-galileo/index.js", "noflo-iot/deps/noflo-galileo/index.js");
require.alias("djdeath-noflo-galileo/index.js", "noflo-galileo/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "djdeath-noflo-galileo/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "djdeath-noflo-galileo/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "djdeath-noflo-galileo/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "djdeath-noflo-galileo/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "djdeath-noflo-galileo/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "djdeath-noflo-galileo/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "djdeath-noflo-galileo/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "djdeath-noflo-galileo/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-galileo/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "djdeath-noflo-galileo/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "djdeath-noflo-galileo/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-galileo/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("djdeath-noflo-micro/components/DigitalRead.js", "noflo-iot/deps/noflo-micro/components/DigitalRead.js");
require.alias("djdeath-noflo-micro/components/DigitalWrite.js", "noflo-iot/deps/noflo-micro/components/DigitalWrite.js");
require.alias("djdeath-noflo-micro/components/MonitorPin.js", "noflo-iot/deps/noflo-micro/components/MonitorPin.js");
require.alias("djdeath-noflo-micro/components/PwmWrite.js", "noflo-iot/deps/noflo-micro/components/PwmWrite.js");
require.alias("djdeath-noflo-micro/index.js", "noflo-iot/deps/noflo-micro/index.js");
require.alias("djdeath-noflo-micro/index.js", "noflo-micro/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "djdeath-noflo-micro/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "djdeath-noflo-micro/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "djdeath-noflo-micro/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "djdeath-noflo-micro/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "djdeath-noflo-micro/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "djdeath-noflo-micro/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "djdeath-noflo-micro/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "djdeath-noflo-micro/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "djdeath-noflo-micro/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "djdeath-noflo-micro/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "djdeath-noflo-micro/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "djdeath-noflo-micro/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-micro/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "djdeath-noflo-micro/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "djdeath-noflo-micro/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "djdeath-noflo-micro/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "djdeath-noflo-micro/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "djdeath-noflo-micro/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-micro/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("djdeath-noflo-tween/components/Tween.js", "noflo-iot/deps/noflo-tween/components/Tween.js");
require.alias("djdeath-noflo-tween/index.js", "noflo-iot/deps/noflo-tween/index.js");
require.alias("djdeath-noflo-tween/index.js", "noflo-tween/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "djdeath-noflo-tween/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "djdeath-noflo-tween/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "djdeath-noflo-tween/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "djdeath-noflo-tween/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "djdeath-noflo-tween/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "djdeath-noflo-tween/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "djdeath-noflo-tween/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "djdeath-noflo-tween/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "djdeath-noflo-tween/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "djdeath-noflo-tween/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "djdeath-noflo-tween/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "djdeath-noflo-tween/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-tween/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "djdeath-noflo-tween/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "djdeath-noflo-tween/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "djdeath-noflo-tween/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "djdeath-noflo-tween/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "djdeath-noflo-tween/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "djdeath-noflo-tween/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("djdeath-trident-js/trident.js", "djdeath-noflo-tween/deps/trident-js/trident.js");
require.alias("djdeath-trident-js/trident.js", "djdeath-noflo-tween/deps/trident-js/index.js");
require.alias("djdeath-trident-js/trident.js", "djdeath-trident-js/index.js");
require.alias("djdeath-noflo-runtime-websocket/runtime/network.js", "noflo-iot/deps/noflo-runtime-websocket/runtime/network.js");
require.alias("djdeath-noflo-runtime-websocket/runtime/network.js", "noflo-iot/deps/noflo-runtime-websocket/index.js");
require.alias("djdeath-noflo-runtime-websocket/runtime/network.js", "noflo-runtime-websocket/index.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/src/Base.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Graph.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/src/protocol/Graph.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Network.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/src/protocol/Network.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Component.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/src/protocol/Component.js");
require.alias("noflo-noflo-runtime-base/src/protocol/Runtime.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/src/protocol/Runtime.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "djdeath-noflo-runtime-websocket/deps/noflo-runtime-base/index.js");
require.alias("noflo-noflo/src/lib/Graph.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Graph.js");
require.alias("noflo-noflo/src/lib/InternalSocket.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/InternalSocket.js");
require.alias("noflo-noflo/src/lib/BasePort.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/BasePort.js");
require.alias("noflo-noflo/src/lib/InPort.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/InPort.js");
require.alias("noflo-noflo/src/lib/OutPort.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/OutPort.js");
require.alias("noflo-noflo/src/lib/Ports.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Ports.js");
require.alias("noflo-noflo/src/lib/Port.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Port.js");
require.alias("noflo-noflo/src/lib/ArrayPort.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/ArrayPort.js");
require.alias("noflo-noflo/src/lib/Component.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Component.js");
require.alias("noflo-noflo/src/lib/AsyncComponent.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/AsyncComponent.js");
require.alias("noflo-noflo/src/lib/LoggingComponent.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/LoggingComponent.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/NoFlo.js");
require.alias("noflo-noflo/src/lib/Network.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Network.js");
require.alias("noflo-noflo/src/lib/Platform.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Platform.js");
require.alias("noflo-noflo/src/lib/Journal.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Journal.js");
require.alias("noflo-noflo/src/lib/Utils.js", "noflo-noflo-runtime-base/deps/noflo/src/lib/Utils.js");
require.alias("noflo-noflo/src/components/Graph.js", "noflo-noflo-runtime-base/deps/noflo/src/components/Graph.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo-runtime-base/deps/noflo/index.js");
require.alias("component-emitter/index.js", "noflo-noflo/deps/emitter/index.js");

require.alias("component-underscore/index.js", "noflo-noflo/deps/underscore/index.js");

require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/lib/fbp.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-noflo/deps/fbp/index.js");
require.alias("noflo-fbp/lib/fbp.js", "noflo-fbp/index.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/index.js");
require.alias("noflo-noflo-runtime-base/src/Base.js", "noflo-noflo-runtime-base/index.js");
require.alias("djdeath-noflo-runtime-websocket/runtime/network.js", "djdeath-noflo-runtime-websocket/index.js");
require.alias("noflo-noflo/src/lib/ComponentLoader.js", "noflo-noflo/src/lib/nodejs/ComponentLoader.js");
require.alias("noflo-noflo/src/lib/NoFlo.js", "noflo-noflo/lib/NoFlo.js");


var http = require('http');
var runtime = require('noflo-runtime-websocket');

var baseDir = '/noflo-iot';
var host = 'localhost';
var port = 5555;
var interval = 10 * 60 * 1000;

var server = http.createServer(function () {});
var rt = runtime(server, {
  baseDir: baseDir,
  captureOutput: false,
  catchExceptions: true
});

var NoFlo = require('noflo-iot');
var loader = new NoFlo.ComponentLoader('/noflo-iot');
console.log('listing components');
loader.listComponents(function(components) {
    console.log(components);
});

server.listen(port, function () {
  console.log('NoFlo runtime listening at ws://' + host + ':' + port);
  console.log('Using ' + baseDir + ' for component loading');
});
