import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { unescapeHtml } from "https://deno.land/x/escape/mod.ts";
import { writeCSVObjects } from "https://deno.land/x/csv/mod.ts";

const endpoint = "https://en.m.wiktionary.org";
let route = "/w/index.php?title=Category:Arabic_3-letter_roots";

const roots = [];

const seen: Set<string> = new Set();

do {
  seen.add(route);
  const textResponse = await fetch(endpoint + route);
  const textData = await textResponse.text();
  const document = new DOMParser().parseFromString(textData, "text/html");
  for (const li of document.querySelectorAll(".mw-category-group li")) {
    const matches = li.outerHTML.match(
      /<a href="([^"]*)"[^>]*>Arabic terms belonging to the root (.*)<\/a>.*\((\d+) c, (\d+) e\)/
    );
    if (matches) {
      const link = endpoint + matches[1];
      const root = matches[2];
      const subcategories = +matches[3];
      const entries = +matches[4];
      roots.push({ link, root, subcategories, entries });
    }
  }
  const nextPage = [...document.querySelectorAll("#mw-subcategories > a")].map(
    (a) => a.outerHTML.match(/href="([^"]*)"/)[1]
  )[1];

  if (nextPage) {
    route = unescapeHtml(nextPage);
    if (seen.has(route)) break;
  } else break;
} while (true);

const f = await Deno.open("./roots.csv", {
  write: true,
  create: true,
  truncate: true,
});
const header = ["root", "subcategories", "entries", "link"];

await writeCSVObjects(f, roots, { header });
