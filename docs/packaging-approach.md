# Packaging Approach

This document explains the bundling architecture and design decisions for this library.

## Overview: Multi-Entry Bundling

This project uses **multi-entry bundling** with conditional exports in `package.json`. This is a **relatively standard approach** for modern libraries with optional dependencies.

The configuration creates multiple entry points that users can import selectively:

```typescript
import { someUtil } from '@lichens-innovation/ts-common';        // Core only
import { excelUtil } from '@lichens-innovation/ts-common/excel'; // + exceljs
import { csvUtil } from '@lichens-innovation/ts-common/csv';     // + papaparse
import { pdfUtil } from '@lichens-innovation/ts-common/pdf';     // + jspdf
import { webUtil } from '@lichens-innovation/ts-common/web';     // Browser APIs
import { mimeUtil } from '@lichens-innovation/ts-common/mime';   // + mime
```

## Architecture Components

### 1. tsup Configuration

```typescript
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    excel: 'src/excel/index.ts',
    csv: 'src/csv/index.ts',
    pdf: 'src/pdf/index.ts',
    web: 'src/web/index.ts',
    mime: 'src/mime/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  // ...
});
```

This generates:
- `dist/index.js` + `dist/index.cjs` + `dist/index.d.ts`
- `dist/excel.js` + `dist/excel.cjs` + `dist/excel.d.ts`
- And so on for each module...

### 2. Package.json Exports

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./excel": {
      "types": "./dist/excel.d.ts",
      "import": "./dist/excel.js",
      "require": "./dist/excel.cjs",
      "default": "./dist/excel.js"
    }
    // ... other subpaths
  }
}
```

### 3. Peer Dependencies Strategy

```json
{
  "peerDependencies": {
    "exceljs": "^4.4.0",
    "papaparse": "^5.4.1",
    // ...
  },
  "peerDependenciesMeta": {
    "exceljs": { "optional": true },
    "papaparse": { "optional": true }
    // ...
  }
}
```

Users only install what they need.

## ✅ Advantages (PROS)

### 1. Optimal Tree-Shaking

Users only import what they need:
```typescript
// Only core utilities are bundled in the final application
import { someUtil } from '@lichens-innovation/ts-common';
```

The bundle size is minimal because unused modules are never included.

### 2. Elegant Optional Dependencies Management

- Peer dependencies are marked as `optional: true`
- No need to install `exceljs` if you don't use `/excel`
- Reduces `node_modules` size for end users
- No dependency bloat

### 3. Modern Conditional Exports

```json
"./excel": {
  "types": "./dist/excel.d.ts",
  "import": "./dist/excel.js",      // ESM
  "require": "./dist/excel.cjs",    // CommonJS
  "default": "./dist/excel.js"
}
```

Automatic ESM/CJS support based on the consuming environment.

### 4. Environment Isolation

- **Core**: Environment-agnostic (Node/Browser/React Native)
- **/web**: Browser-only (uses DOM APIs)
- **/excel**, **/pdf**: Primarily Node.js
- Prevents "window is not defined" errors in Node
- Clear separation of concerns

### 5. Development Performance

- `splitting: false` simplifies debugging
- Each module is self-contained
- Source maps included for easy troubleshooting
- Faster builds with isolated modules

## ⚠️ Disadvantages (CONS)

### 1. Configuration Complexity

Requires maintaining consistency across multiple files:

```
tsup.config.ts ─┐
                ├─> Must stay in sync
package.json   ─┤
                ├─> Paths must match
tsconfig.json  ─┘
```

Any change to module structure requires updates in all three places.

### 2. Potential Code Duplication

If modules share internal code, it may be duplicated across bundles:

```
dist/excel.js   → contains shared utilities
dist/csv.js     → contains the SAME shared utilities
```

With `splitting: false`, no common chunks are created. This increases the npm package size.

### 3. NPM Package Size

- 6 bundles × 2 formats = 12 files + type definitions
- The npm package becomes larger (but end users benefit from smaller bundles)
- More files to download during `npm install`

### 4. Documentation Required

Users need to know they must manually install peer dependencies:

```bash
# Must be documented clearly
npm install exceljs mime
```

Your README documents this well, but it's still a friction point for new users.

### 5. IDE Limitations

Some IDEs struggle with subpath imports:

```typescript
// Sometimes auto-import suggests incorrectly:
import { x } from '@lichens-innovation/ts-common/dist/excel'

// Instead of the correct:
import { x } from '@lichens-innovation/ts-common/excel'
```

May require manual correction or IDE configuration.

## 🔄 Alternative Approaches

### Alternative 1: Mono-Bundle with Side Effects

```typescript
// Single bundle, but with imports that load everything
import '@lichens-innovation/ts-common/excel/register'
```

- ❌ Less elegant
- ❌ Worse tree-shaking
- ✅ Simpler configuration

### Alternative 2: Monorepo with Separate Packages

```
@lichens-innovation/ts-common
@lichens-innovation/ts-common-excel
@lichens-innovation/ts-common-pdf
```

- ✅ Complete isolation
- ✅ Independent versioning
- ❌ More maintenance overhead
- ❌ More packages to manage

### Alternative 3: Dynamic Imports

```typescript
const excel = await import('@lichens-innovation/ts-common/excel')
```

- ✅ Lazy loading
- ✅ Smaller initial bundle
- ❌ Async API complexity
- ❌ More complex error handling

## 🎯 Verdict

**This approach is an excellent modern compromise** for a utility library with optional dependencies. It aligns with current best practices used by projects like:

- `@aws-sdk/*` (AWS SDK v3)
- `@tanstack/query` with adapters
- `unplugin-*` with framework-specific builds
- `@babel/*` packages
- `@types/*` packages

### Recommended Improvements

#### 1. Enable Splitting for Shared Code

```typescript
// tsup.config.ts
export default defineConfig({
  splitting: true,  // Create common chunks
  // ...
});
```

This would reduce duplication but increase output complexity.

#### 2. Add Export Validation Script

```bash
npm install -D publint
```

```json
{
  "scripts": {
    "validate:exports": "publint"
  }
}
```

Validates that your exports are correctly configured and accessible.

#### 3. Consider Watch Mode for Development

```json
{
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup"
  }
}
```

Enables faster iteration during development.

#### 4. Add Package Size Monitoring

```bash
npm install -D @packagephobia/cli
```

```json
{
  "scripts": {
    "size": "packagephobia ."
  }
}
```

Track package size changes over time.

## Summary

This multi-entry bundling approach is a **modern and professional solution** ✅ with acceptable trade-offs for the benefits gained.

**Primary benefit**: Users get optimal bundle sizes and only install dependencies they actually use.

**Primary trade-off**: Increased configuration complexity and maintenance overhead.

The approach is well-suited for:
- ✅ Utility libraries with optional features
- ✅ Libraries targeting multiple environments (Node/Browser)
- ✅ Projects with large optional dependencies
- ✅ Teams comfortable with modern build tools

It may not be ideal for:
- ❌ Simple libraries with few dependencies
- ❌ Projects requiring maximum simplicity over optimization
- ❌ Teams new to modern bundling tools

## References

- [Node.js Package Entry Points](https://nodejs.org/api/packages.html#package-entry-points)
- [tsup Documentation](https://tsup.egoist.dev/)
- [Package Exports Best Practices](https://2ality.com/2019/10/hybrid-npm-packages.html)
