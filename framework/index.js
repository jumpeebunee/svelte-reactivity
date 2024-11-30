import { rest_props_handler } from "./src/internal/client/reactivity/props.js";

const props = {
  count: 0,
  name: "alex",
};

const p = new Proxy({ props, exclude: ["count"] }, rest_props_handler);
