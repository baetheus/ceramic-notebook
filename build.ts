import * as Glazy from "./read_glazy.ts";
import * as Elements from "./read_elements.ts";

const materials = await Glazy.parseFromFile();
const elements = await Elements.parseFromFile();
