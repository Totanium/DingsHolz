'use strict';

/**
 * Erzeugt ein DOM-Element.
 * props: 'class', 'style' (Objekt), 'onXyz' (Event-Handler) oder beliebige Attribute.
 * children: Element, Text oder Array davon (null/undefined werden ignoriert).
 */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'style') Object.assign(node.style, value);
    else if (key.startsWith('on')) node.addEventListener(key.slice(2).toLowerCase(), value);
    else node.setAttribute(key, value);
  }
  node.append(...[].concat(children).filter((child) => child !== null && child !== undefined));
  return node;
}

/** Zahl im deutschen Format, höchstens eine Nachkommastelle. */
function formatNumber(value) {
  return value.toLocaleString('de-DE', { maximumFractionDigits: 1 });
}
