#!/usr/bin/env node

/**
 * SVG to React Native Icon Converter
 *
 * This script automatically converts SVG files to React Native components
 * with proper TypeScript interfaces and customizable props.
 *
 * Usage:
 *   node scripts/convert-svg-icons.js
 *
 * Place your .svg files in src/assets/svg-broken-icons/ and run this script.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SVG_DIR = path.join(__dirname, '..', 'src', 'assets', 'svg-broken-icons');
const INDEX_FILE = path.join(SVG_DIR, 'index.ts');

// Convert SVG attributes to React Native props (kebab-case to camelCase)
function convertAttribute(name) {
  return name.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

// Convert kebab-case filename to PascalCase export name
function toPascalCase(filename) {
  return filename
    .replace('.svg', '')
    .replace('-svgrepo-com', '')
    .replace('-minimlistic', '')
    .replace('-minimalistic', '')
    .split('-')
    .filter(part => part.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

// Parse SVG content and extract elements
function parseSvgContent(svgContent) {
  const svgMatch = svgContent.match(/<svg[^>]*>/);
  if (!svgMatch) return null;

  const svgTag = svgMatch[0];
  const viewBox = (svgTag.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 24 24';

  const elements = [];

  // Match path elements
  const pathRegex = /<path[^>]*\/>/g;
  let match;
  while ((match = pathRegex.exec(svgContent)) !== null) {
    elements.push({ type: 'Path', content: match[0] });
  }

  // Match circle elements
  const circleRegex = /<circle[^>]*\/>/g;
  while ((match = circleRegex.exec(svgContent)) !== null) {
    elements.push({ type: 'Circle', content: match[0] });
  }

  // Match rect elements
  const rectRegex = /<rect[^>]*\/>/g;
  while ((match = rectRegex.exec(svgContent)) !== null) {
    elements.push({ type: 'Rect', content: match[0] });
  }

  return { viewBox, elements };
}

// Convert SVG element to TSX format
function convertElementToTsx(element, indent = '      ') {
  const content = element.content;
  const type = element.type;

  // Extract attributes
  const attrRegex = /(\w+(?:-\w+)*)="([^"]*)"/g;
  const attrs = [];
  let match;
  while ((match = attrRegex.exec(content)) !== null) {
    const [, name, value] = match;
    if (name !== 'xmlns') {
      attrs.push({ name, value });
    }
  }

  let tsx = `${indent}<${type}\n`;
  attrs.forEach(attr => {
    const reactAttr = convertAttribute(attr.name);

    // Replace hardcoded colors with {color} prop
    if (
      (reactAttr === 'stroke' || reactAttr === 'fill') &&
      attr.value !== 'none' &&
      attr.value.startsWith('#')
    ) {
      tsx += `${indent}  ${reactAttr}={color}\n`;
    }
    // Convert numeric strokeWidth
    else if (reactAttr === 'strokeWidth' && !isNaN(parseFloat(attr.value))) {
      tsx += `${indent}  ${reactAttr}={${attr.value}}\n`;
    } else {
      tsx += `${indent}  ${reactAttr}="${attr.value}"\n`;
    }
  });
  tsx += `${indent}/>\n`;

  return tsx;
}

// Generate TypeScript component with proper props
function generateTsxComponent(svgData) {
  const { viewBox, elements } = svgData;

  // Determine which components to import
  const componentTypes = new Set(elements.map(e => e.type));
  const namedImports = Array.from(componentTypes).join(', ');

  let tsx = `import * as React from "react"\n`;
  tsx += `import Svg, { ${namedImports} } from "react-native-svg"\n\n`;

  // Add interface for props
  tsx += `interface SvgProps {\n`;
  tsx += `  width?: number;\n`;
  tsx += `  height?: number;\n`;
  tsx += `  color?: string;\n`;
  tsx += `}\n\n`;

  tsx += `function SvgComponent({ width = 24, height = 24, color = "#1C274C", ...props }: SvgProps) {\n`;
  tsx += `  return (\n`;
  tsx += `    <Svg\n`;
  tsx += `      width={width}\n`;
  tsx += `      height={height}\n`;
  tsx += `      viewBox="${viewBox}"\n`;
  tsx += `      fill="none"\n`;
  tsx += `      {...props}\n`;
  tsx += `    >\n`;

  elements.forEach(element => {
    tsx += convertElementToTsx(element);
  });

  tsx += `    </Svg>\n`;
  tsx += `  )\n`;
  tsx += `}\n\n`;
  tsx += `export default SvgComponent\n`;

  return tsx;
}

// Update index.ts with new exports
function updateIndexFile(newExports) {
  let indexContent = '';

  if (fs.existsSync(INDEX_FILE)) {
    indexContent = fs.readFileSync(INDEX_FILE, 'utf-8');
  } else {
    indexContent = '// Auto-generated icon exports\n';
  }

  // Add new exports that don't already exist
  let addedCount = 0;
  newExports.forEach(({ exportName, filename }) => {
    const exportLine = `export { default as ${exportName} } from './${filename}';`;
    if (!indexContent.includes(exportLine)) {
      indexContent += `${exportLine}\n`;
      addedCount++;
    }
  });

  // Sort exports alphabetically
  const lines = indexContent.split('\n').filter(line => line.trim());
  const commentLines = lines.filter(line => line.startsWith('//'));
  const exportLines = lines.filter(line => line.startsWith('export')).sort();

  const sortedContent = [...commentLines, ...exportLines].join('\n') + '\n';

  fs.writeFileSync(INDEX_FILE, sortedContent);
  return addedCount;
}

// Main conversion function
function convertSvgIcons() {
  console.log('🔍 Scanning for SVG files...\n');

  if (!fs.existsSync(SVG_DIR)) {
    console.error(`❌ Directory not found: ${SVG_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SVG_DIR);
  const svgFiles = files.filter(file => file.endsWith('.svg'));

  // Find SVG files that don't have corresponding .tsx files
  const newSvgFiles = svgFiles.filter(svgFile => {
    const tsxFile = svgFile.replace('.svg', '.tsx');
    return !files.includes(tsxFile);
  });

  if (newSvgFiles.length === 0) {
    console.log('✨ No new SVG files to convert. All icons are up to date!');
    return;
  }

  console.log(
    `Found ${newSvgFiles.length} new SVG file${
      newSvgFiles.length > 1 ? 's' : ''
    } to convert\n`,
  );

  let successCount = 0;
  let errorCount = 0;
  const newExports = [];

  newSvgFiles.forEach(file => {
    try {
      const svgPath = path.join(SVG_DIR, file);
      const svgContent = fs.readFileSync(svgPath, 'utf-8');

      const svgData = parseSvgContent(svgContent);

      if (!svgData || svgData.elements.length === 0) {
        console.error(`❌ Failed to parse: ${file}`);
        errorCount++;
        return;
      }

      const tsxContent = generateTsxComponent(svgData);
      const tsxFileName = file.replace('.svg', '.tsx');
      const outputPath = path.join(SVG_DIR, tsxFileName);

      fs.writeFileSync(outputPath, tsxContent);

      // Generate export name
      const exportName = toPascalCase(file) + 'Icon';
      const filename = tsxFileName.replace('.tsx', '');
      newExports.push({ exportName, filename });

      console.log(`✅ Converted: ${file} -> ${tsxFileName}`);
      console.log(`   Export as: ${exportName}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Error converting ${file}:`, error.message);
      errorCount++;
    }
  });

  // Update index.ts with new exports
  const addedExports = updateIndexFile(newExports);

  console.log(`\n${'='.repeat(50)}`);
  console.log('✨ Conversion complete!');
  console.log(
    `✅ Success: ${successCount} file${successCount !== 1 ? 's' : ''}`,
  );
  console.log(`❌ Errors: ${errorCount} file${errorCount !== 1 ? 's' : ''}`);
  console.log(
    `📝 Updated index.ts with ${addedExports} new export${
      addedExports !== 1 ? 's' : ''
    }`,
  );
  console.log(`${'='.repeat(50)}\n`);

  if (successCount > 0) {
    console.log('🎉 New icons are ready to use!');
    console.log('\nUsage example:');
    if (newExports.length > 0) {
      const firstExport = newExports[0].exportName;
      console.log(
        `\nimport { ${firstExport} } from '@assets/svg-broken-icons';`,
      );
      console.log(
        `\n<${firstExport} width={24} height={24} color="#007AFF" />`,
      );
    }
    console.log('\n💡 View all icons in the Icon Gallery tab of your app!');
  }
}

// Run the conversion
try {
  convertSvgIcons();
} catch (error) {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
}
