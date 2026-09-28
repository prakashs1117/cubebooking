/* @ds-bundle: {"format":4,"namespace":"LiquidCarbon","components":[{"name":"Button"},{"name":"Input"},{"name":"Card"},{"name":"Switch"},{"name":"Checkbox"},{"name":"Select"},{"name":"Avatar"},{"name":"Table"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) { if (keys.indexOf(k) < 0) r[k] = o[k]; } return r; }

  function Button(p) {
    var variant = p.variant || 'default', size = p.size || 'default';
    var rest = omit(p, ['variant', 'size', 'className', 'children']);
    rest.className = cx('lc-btn', 'lc-btn--' + variant, 'lc-btn--size-' + size, p.className);
    if (!rest.type) rest.type = 'button';
    return h('button', rest, p.children);
  }

  function Label(p) {
    var rest = omit(p, ['className', 'children']);
    rest.className = cx('lc-label', p.className);
    return h('label', rest, p.children);
  }

  function Input(p) {
    var rest = omit(p, ['className', 'label', 'description', 'id']);
    var id = p.id || (p.label ? 'lc-in-' + String(p.label).replace(/\W+/g, '-').toLowerCase() : undefined);
    rest.id = id;
    rest.className = cx('lc-input', p.className);
    var input = h('input', rest);
    if (!p.label && !p.description) return input;
    return h('div', { className: 'lc-field' },
      p.label ? h(Label, { htmlFor: id }, p.label) : null,
      input,
      p.description ? h('p', { className: 'lc-field__desc' }, p.description) : null);
  }

  function Card(p) {
    var rest = omit(p, ['className', 'title', 'description', 'footer', 'children']);
    rest.className = cx('lc-card', p.className);
    return h('div', rest,
      (p.title || p.description) ? h('div', { className: 'lc-card__header' },
        p.title ? h('div', { className: 'lc-card__title' }, p.title) : null,
        p.description ? h('div', { className: 'lc-card__desc' }, p.description) : null) : null,
      p.children != null ? h('div', { className: 'lc-card__content' }, p.children) : null,
      p.footer ? h('div', { className: 'lc-card__footer' }, p.footer) : null);
  }

  function Switch(p) {
    var controlled = p.checked !== undefined;
    var st = React.useState(!!p.defaultChecked);
    var on = controlled ? !!p.checked : st[0];
    function toggle() {
      if (p.disabled) return;
      if (!controlled) st[1](!on);
      if (p.onCheckedChange) p.onCheckedChange(!on);
    }
    return h('button', {
      type: 'button', role: 'switch', 'aria-checked': on, 'aria-label': p['aria-label'], id: p.id,
      disabled: p.disabled, onClick: toggle,
      className: cx('lc-switch', on && 'lc-switch--on', p.className)
    }, h('span', { className: 'lc-switch__thumb' }));
  }

  function Checkbox(p) {
    var controlled = p.checked !== undefined;
    var st = React.useState(!!p.defaultChecked);
    var on = controlled ? !!p.checked : st[0];
    function toggle() {
      if (p.disabled) return;
      if (!controlled) st[1](!on);
      if (p.onCheckedChange) p.onCheckedChange(!on);
    }
    return h('button', {
      type: 'button', role: 'checkbox', 'aria-checked': on, 'aria-label': p['aria-label'], id: p.id,
      disabled: p.disabled, onClick: toggle,
      className: cx('lc-checkbox', on && 'lc-checkbox--on', p.className)
    }, on ? h('svg', { viewBox: '0 0 24 24', width: 12, height: 12, 'aria-hidden': true },
      h('path', { d: 'M20 6 9 17l-5-5', fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' })) : null);
  }

  function Select(p) {
    var rest = omit(p, ['className', 'options', 'placeholder']);
    rest.className = 'lc-select__native';
    var opts = (p.options || []).map(function (o) {
      var v = typeof o === 'string' ? o : o.value, l = typeof o === 'string' ? o : o.label;
      return h('option', { key: v, value: v }, l);
    });
    if (p.placeholder) opts.unshift(h('option', { key: '__ph', value: '', disabled: true }, p.placeholder));
    if (p.placeholder && rest.value === undefined && rest.defaultValue === undefined) rest.defaultValue = '';
    return h('span', { className: cx('lc-select', p.className) },
      h('select', rest, opts),
      h('svg', { className: 'lc-select__chev', viewBox: '0 0 24 24', width: 16, height: 16, 'aria-hidden': true },
        h('path', { d: 'm6 9 6 6 6-6', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' })));
  }

  function Avatar(p) {
    var size = p.size || 32;
    var initials = p.fallback || (p.name ? p.name.split(/\s+/).map(function (s) { return s[0]; }).slice(0, 2).join('').toUpperCase() : '');
    return h('span', { className: cx('lc-avatar', p.className), style: { width: size, height: size, fontSize: Math.round(size * 0.4) }, title: p.name },
      p.src ? h('img', { src: p.src, alt: p.name || '' }) : h('span', { 'aria-hidden': !p.name }, initials));
  }

  function Table(p) {
    var cols = p.columns || [];
    return h('div', { className: cx('lc-table', p.className) },
      h('table', null,
        h('thead', null, h('tr', null, cols.map(function (c) {
          return h('th', { key: c.key, style: { textAlign: c.align || 'left' } }, c.header);
        }))),
        h('tbody', null, (p.rows || []).map(function (r, i) {
          return h('tr', { key: r.id != null ? r.id : i }, cols.map(function (c) {
            return h('td', { key: c.key, style: { textAlign: c.align || 'left' } }, c.render ? c.render(r) : r[c.key]);
          }));
        }))));
  }

  var api = { Button: Button, Input: Input, Label: Label, Card: Card, Switch: Switch, Checkbox: Checkbox, Select: Select, Avatar: Avatar, Table: Table };
  window.LiquidCarbon = window.LiquidCarbon || {};
  for (var k in api) window.LiquidCarbon[k] = api[k];
})();
