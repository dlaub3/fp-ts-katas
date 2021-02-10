import { Highlighter } from "@catpic/console-highlighter";

const highlighter = new Highlighter({ theme: "dracula" });

highlighter.highlight.cyan`This is version ${"1.0.3"}`;
