import { Window } from "happy-dom";

const window = new Window();

// @ts-ignore
global.window = window;
// @ts-ignore
global.document = window.document;
// @ts-ignore
global.navigator = window.navigator;
// @ts-ignore
global.Node = window.Node;
// @ts-ignore
global.Element = window.Element;
// @ts-ignore
global.HTMLElement = window.HTMLElement;
// @ts-ignore
global.HTMLButtonElement = window.HTMLButtonElement;
// @ts-ignore
global.HTMLAnchorElement = window.HTMLAnchorElement;
// @ts-ignore
global.HTMLInputElement = window.HTMLInputElement;
// @ts-ignore
global.HTMLSelectElement = window.HTMLSelectElement;
// @ts-ignore
global.HTMLTextAreaElement = window.HTMLTextAreaElement;
// @ts-ignore
global.Event = window.Event;
// @ts-ignore
global.CustomEvent = window.CustomEvent;
// @ts-ignore
global.MouseEvent = window.MouseEvent;
// @ts-ignore
global.KeyboardEvent = window.KeyboardEvent;
// @ts-ignore
global.FocusEvent = window.FocusEvent;

// Some extra stuff RTL might need
// @ts-ignore
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);
// @ts-ignore
global.cancelAnimationFrame = (id) => clearTimeout(id);
