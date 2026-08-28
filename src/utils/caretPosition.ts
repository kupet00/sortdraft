import type { SentenceSpan } from "./sentences";

const MIRROR_STYLE_PROPS = [
  "boxSizing",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "fontStyle",
  "letterSpacing",
  "textTransform",
  "wordSpacing",
  "textIndent",
  "lineHeight",
] as const;

function createMirror(textarea: HTMLTextAreaElement): HTMLDivElement {
  const mirror = document.createElement("div");
  const computed = window.getComputedStyle(textarea);

  mirror.style.position = "absolute";
  mirror.style.visibility = "hidden";
  mirror.style.pointerEvents = "none";
  mirror.style.top = "0";
  mirror.style.left = "-9999px";
  mirror.style.whiteSpace = "pre-wrap";
  mirror.style.wordWrap = "break-word";
  mirror.style.overflowWrap = "break-word";
  mirror.style.width = `${textarea.clientWidth}px`;

  for (const prop of MIRROR_STYLE_PROPS) {
    mirror.style[prop] = computed[prop];
  }

  return mirror;
}

export function measureSentenceCenter(
  textarea: HTMLTextAreaElement,
  text: string,
  span: SentenceSpan,
): number {
  const mirror = createMirror(textarea);
  const before = text.slice(0, span.start);
  const sentence = text.slice(span.start, span.end) || "\u200b";

  mirror.append(document.createTextNode(before));
  const sentenceEl = document.createElement("span");
  sentenceEl.textContent = sentence;
  mirror.appendChild(sentenceEl);

  document.body.appendChild(mirror);
  const center = sentenceEl.offsetTop + sentenceEl.offsetHeight / 2;
  document.body.removeChild(mirror);

  return center;
}
