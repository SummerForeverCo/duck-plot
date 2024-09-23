---
outline: deep
---

<script setup>
import { useData } from 'vitepress'

const { theme, page, frontmatter } = useData()
import * as Plot from "@observablehq/plot"
import * as d3 from "d3";
import {ref} from "vue";

const curve = ref("catmull-rom");
const numbers = d3.range(20).map(d3.randomLcg(42));
</script>

:::plot

```js-vue
Plot.plot({
  marks: [
    Plot.lineY(numbers),
    Plot.dotY(numbers, {x: (d, i) => i, tip: true})
  ]
})
```

:::

:::test

```js-vue
duckPlot
  .table("taxi")
  .x("date")
  .color("Borough")
  .y("count")
  .mark("line");
```

:::
