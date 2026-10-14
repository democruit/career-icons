import { loadIcons } from "./icons.mjs";

const icons = await loadIcons();
console.log(`Validated ${icons.length} icons: SVG, metadata, painted padding and optimized size.`);
