import { rest_props } from "./src/internal/client/reactivity/props.js";

const props = {
  count: 0,
  name: "alex",
};

const p = rest_props(props, ["count"], "test");
