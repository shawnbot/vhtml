import emptyTags from './empty-tags';

// escape an attribute
let esc = str => String(str).replace(/[&<>"']/g, s=>`&${map[s]};`);
let map = {'&':'amp','<':'lt','>':'gt','"':'quot',"'":'apos'};
let setInnerHTMLAttr = 'dangerouslySetInnerHTML';
let DOMAttributeNames = {
	className: 'class',
	htmlFor: 'for'
};

let sanitized = {};

/** Hyperscript reviver that constructs a sanitized HTML string. */
export default function h(name, attrs) {
	let stack=[], s = [];
	attrs = attrs || {};
	for (let i=arguments.length; i-- > 2; ) {
		stack.push(arguments[i]);
	}

	// Sortof component support!
	if (typeof name==='function') {
		attrs.children = stack.reverse();
		return name(attrs);
		// return name(attrs, stack.reverse());
	}

	if (name) {
		s.push('<', name);
		if (attrs) for (let i in attrs) {
			if (attrs[i]!==false && attrs[i]!=null && i !== setInnerHTMLAttr) {
				s.push(' ', DOMAttributeNames[i] ? DOMAttributeNames[i] : esc(i), '="', esc(attrs[i]), '"');
			}
		}
		s.push('>');
	}

	if (emptyTags.indexOf(name) === -1) {
		if (attrs[setInnerHTMLAttr]) {
			s.push(attrs[setInnerHTMLAttr].__html);
		}
		else while (stack.length) {
			let child = stack.pop();
			if (child) {
				if (child.pop) {
					for (let i=child.length; i--; ) stack.push(child[i]);
				}
				else {
					s.push(sanitized[child] === true ? child : esc(child));
				}
			}
		}

		if (name) {
			s.push(`</${name}>`);
		}
	}

	s = s.join('');
	sanitized[s] = true;
	return s;
}
