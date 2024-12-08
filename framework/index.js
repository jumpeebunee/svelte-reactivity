import {
  rest_props,
  spread_props,
} from "./src/internal/client/reactivity/props.js";

const props = {
  count: 23,
  name: "alex",
};

const p = rest_props(props, ["count"], "test");
const p1 = spread_props({ name: "egor" }, 23, [1, 2, 3], null, testik, props);
