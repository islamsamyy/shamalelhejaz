const fs = require('fs');

function htmlToJsx(html) {
  let jsx = html;

  // Replace comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Remove raw HTML inline event handlers string attributes
  jsx = jsx.replace(/\s+onclick="[^"]*"/gi, '');
  jsx = jsx.replace(/\s+onsubmit="[^"]*"/gi, '');
  jsx = jsx.replace(/\s+onchange="[^"]*"/gi, '');
  jsx = jsx.replace(/\s+oninput="[^"]*"/gi, '');
  jsx = jsx.replace(/\s+onkeydown="[^"]*"/gi, '');
  jsx = jsx.replace(/\s+onkeyup="[^"]*"/gi, '');

  // Replace class= with className=
  jsx = jsx.replace(/\bclass="/g, 'className="');
  jsx = jsx.replace(/\bfor="/g, 'htmlFor="');
  jsx = jsx.replace(/\btabindex="(-?\d+)"/gi, 'tabIndex={$1}');
  jsx = jsx.replace(/\bautocomplete="/g, 'autoComplete="');
  jsx = jsx.replace(/\bautofocus="/g, 'autoFocus="');

  // Numeric attributes in JSX
  jsx = jsx.replace(/\bcolspan="(\d+)"/gi, 'colSpan={$1}');
  jsx = jsx.replace(/\browspan="(\d+)"/gi, 'rowSpan={$1}');
  jsx = jsx.replace(/\bmaxlength="(\d+)"/gi, 'maxLength={$1}');
  jsx = jsx.replace(/\bminlength="(\d+)"/gi, 'minLength={$1}');
  jsx = jsx.replace(/\brows="(\d+)"/gi, 'rows={$1}');
  jsx = jsx.replace(/\bcols="(\d+)"/gi, 'cols={$1}');
  jsx = jsx.replace(/\bsize="(\d+)"/gi, 'size={$1}');

  // SVG elements casing
  jsx = jsx.replace(/<lineargradient\b/gi, '<linearGradient');
  jsx = jsx.replace(/<\/lineargradient>/gi, '</linearGradient>');
  jsx = jsx.replace(/<radialgradient\b/gi, '<radialGradient');
  jsx = jsx.replace(/<\/radialgradient>/gi, '</radialGradient>');
  jsx = jsx.replace(/<clippath\b/gi, '<clipPath');
  jsx = jsx.replace(/<\/clippath>/gi, '</clipPath>');

  // SVG attributes
  jsx = jsx.replace(/\bviewbox="/gi, 'viewBox="');
  jsx = jsx.replace(/\bpreserveaspectratio="/gi, 'preserveAspectRatio="');
  jsx = jsx.replace(/\bstroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/\bstroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/\bstroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/\bfill-rule="/g, 'fillRule="');
  jsx = jsx.replace(/\bclip-rule="/g, 'clipRule="');
  jsx = jsx.replace(/\bfill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/\bstroke-opacity="/g, 'strokeOpacity="');

  // Boolean attributes in JSX
  jsx = jsx.replace(/\s+checked(?:="[^"]*")?/gi, ' defaultChecked={true}');
  jsx = jsx.replace(/\s+disabled(?:="[^"]*")?/gi, ' disabled={true}');
  jsx = jsx.replace(/\s+required(?:="[^"]*")?/gi, ' required={true}');
  jsx = jsx.replace(/\s+readonly(?:="[^"]*")?/gi, ' readOnly={true}');
  jsx = jsx.replace(/\s+readOnly(?:="[^"]*")?/gi, ' readOnly={true}');
  jsx = jsx.replace(/\s+selected(?:="[^"]*")?/gi, ' defaultValue="selected"');

  // Self closing void tags
  jsx = jsx.replace(/<input([^>]*?)>/gi, (m, attrs) => {
    if (attrs.endsWith('/')) return m;
    return `<input${attrs} />`;
  });
  jsx = jsx.replace(/<img([^>]*?)>/gi, (m, attrs) => {
    if (attrs.endsWith('/')) return m;
    return `<img${attrs} />`;
  });
  jsx = jsx.replace(/<br\s*>/gi, '<br />');
  jsx = jsx.replace(/<hr([^>]*?)>/gi, (m, attrs) => {
    if (attrs.endsWith('/')) return m;
    return `<hr${attrs} />`;
  });

  // Convert style="width: 80%" or style="width: 80%; background-color: red" into style={{ width: '80%' }}
  jsx = jsx.replace(/style="([^"]*)"/gi, (m, styleStr) => {
    const rules = styleStr.split(';').filter(s => s.trim().length > 0);
    const objProps = rules.map(rule => {
      const colonIdx = rule.indexOf(':');
      if (colonIdx === -1) return '';
      const rawKey = rule.slice(0, colonIdx).trim();
      const key = rawKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      const val = rule.slice(colonIdx + 1).trim();
      return `${key}: "${val}"`;
    }).filter(Boolean);
    return `style={{ ${objProps.join(', ')} }}`;
  });

  return jsx;
}

module.exports = { htmlToJsx };
