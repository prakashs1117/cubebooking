'use strict';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  grey: '\x1b[90m',
};

const log = {
  info: m => console.log(`${c.cyan}ℹ${c.reset}  ${m}`),
  ok: m => console.log(`${c.green}✔${c.reset}  ${m}`),
  warn: m => console.log(`${c.yellow}⚠${c.reset}  ${m}`),
  error: m => console.log(`${c.red}✖${c.reset}  ${m}`),
  step: m => console.log(`\n${c.bold}${c.blue}▶  ${m}${c.reset}`),
  changed: (file, from, to) =>
    console.log(
      `   ${c.grey}${file}${c.reset}\n     ${c.red}− ${from}${c.reset}\n     ${c.green}+ ${to}${c.reset}`,
    ),
  skipped: (file, val) =>
    console.log(`   ${c.grey}${file} — unchanged (${val})${c.reset}`),
  header: () => {
    console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════╗`);
    console.log(`║       RN App Rebrand Wizard          ║`);
    console.log(`╚══════════════════════════════════════╝${c.reset}\n`);
  },
  planHeader: () => {
    console.log(`\n${c.bold}${c.cyan}╔══════════════════════════════════════╗`);
    console.log(`║       RN Version Bump                ║`);
    console.log(`╚══════════════════════════════════════╝${c.reset}\n`);
  },
};

module.exports = { log, c };
