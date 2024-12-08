import { is_function, get_descriptor } from "../../shared/utils.js";
import * as e from "../errors.js";

const DEV = true;

/**
  @param {((value?: number) => number)} fn
  @param {1 | -1} [d]
  @returns {number}
*/
// Обновляет стейт, возвращает старое значение;
export function update_prop(fn, d = 1) {
  const value = fn();
  fn(value + d);
  return value;
}

/**
  @param {((value?: number) => number)} fn
  @param {1 | -1} [d]
  @returns {number}
*/
// Обновляет стейт, возвращает новое значение;
export function update_pre_prop(fn, d = 1) {
  const value = fn() + d;
  fn(value);
  return value;
}

/**
 * The proxy handler for rest props (i.e. `const { x, ...rest } = $props()`).
 * Is passed the full `$$props` object and excludes the named props.
 * @type {ProxyHandler<{ props: Record<string | symbol, unknown>, exclude: Array<string | symbol>, name?: string }>}}
 */
const rest_props_handler = {
  // получить значение если его нету в exclude;
  get(target, key) {
    if (target.exclude.includes(key)) return;
    return target.props[key];
  },

  // установить значение не получится
  set(target, key) {
    if (DEV) {
      e.props_rest_readonly(`${target.name}.${String(key)}`);
    }

    return false;
  },

  // проверка на значение если его нету в exclude;
  has(target, key) {
    if (target.exclude.includes(key)) return false;
    return key in target.props;
  },

  // пропертесы key если key нету в exclude;
  getOwnPropertyDescriptor(target, key) {
    if (target.exclude.includes(key)) return;

    if (key in target.props) {
      return {
        enumerable: true,
        configurable: true,
        value: target.props[key],
      };
    }
  },

  // получить все доступные пропсы
  ownKeys(target) {
    return Reflect.ownKeys(target.props).filter(
      (key) => !target.exclude.includes(key)
    );
  },
};

/**
 * @param {Record<string, unknown>} props
 * @param {string[]} exclude
 * @param {string} [name]
 * @returns {Record<string, unknown>}
 */
/*#__NO_SIDE_EFFECTS__*/
export function rest_props(props, exclude, name) {
  return new Proxy(
    DEV ? { props, exclude, name, other: {}, toProxy: [] } : { props, exclude },
    rest_props_handler
  );
}

/**
 * The proxy handler for spread props. Handles the incoming array of props
 * that looks like `() => { dynamic: props }, { static: prop }, ..` and wraps
 * them so that the whole thing is passed to the component as the `$$props` argument.
 * @template {Record<string | symbol, unknown>} T
 * @type {ProxyHandler<{ props: Array<T | (() => T)> }>}}
 */
const spread_props_handler = {
  get(target, key) {
    let i = target.props.length;

    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) return p[key];
    }
  },
  set(target, key, value) {
    let i = target.props.length;

    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (p) {
        const desc = get_descriptor(p, key);
        if (desc && desc.set) {
          desc.set(value);
          return true;
        }
      }
    }
    return false;
  },
  getOwnPropertyDescriptor(target, key) {
    let i = target.props.length;

    while (i--) {
      let p = target.props[i];
      if (is_function(p)) p = p();
      if (typeof p === "object" && p !== null && key in p) {
        const desc = get_descriptor(p, key);

        if (desc && !desc.configurable) {
          desc.configurable = true;
        }

        return desc;
      }
    }
  },
};

/**
 * @param {Array<Record<string, unknown> | (() => Record<string, unknown>)>} props
 * @returns {any}
 */
export function spread_props(...props) {
  return new Proxy({ props }, spread_props_handler);
}
