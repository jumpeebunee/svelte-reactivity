/**
 * @param {any} thing
 * @returns {thing is Function}
 */

export function is_function(thing) {
  return typeof thing === "function";
}
