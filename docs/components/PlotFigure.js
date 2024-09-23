import * as Plot from "@observablehq/plot";
import { h, withDirectives } from "vue";
// Converts the real DOM to virtual DOM (for client-side hydration).
function toHyperScript(node) {
  if (node.nodeType === 3) return node.nodeValue; // TextNode
  const props = {};
  for (const name of node.getAttributeNames())
    props[name] = node.getAttribute(name);
  const children = [];
  for (let child = node.firstChild; child; child = child.nextSibling)
    children.push(toHyperScript(child));
  return h(node.tagName, props, children);
}

export default {
  props: {
    codeString: string,
    options: Object,
  },
  render() {
    console.log("RENDER");
    const plot = Plot.plot({
      marks: [Plot.dotX([1, 2, 3], { x: (d) => d })],
      height: 400,
      width: 400,
    });
    const replace = (el) => {
      while (el.lastChild) el.lastChild.remove();
      el.append(plot);
    };
    return withDirectives(h("span", [toHyperScript(plot)]), [
      [{ mounted: replace, updated: replace }],
    ]);
  },
};
