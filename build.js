#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const config = require('./build-config');

class ExtensionBuilder {
    constructor(browser) {
        this.browser = browser;
        this.distDir = `dist/${browser}`;
    }

    async build() {
        try {
            console.log(`Building for ${this.browser}...`);

            await this.createDistDirectory();
            await this.copyFiles();
            await this.modifyFilesForBrowser();
            await this.generateManifest();

            this.logSuccess();
        } catch (error) {
            this.logError(error);
        }
    }

    async createDistDirectory() {
        await fs.ensureDir(this.distDir);
    }

    async copyFiles() {
        for (const file of config.filesToCopy) {
            await this.copyFile(file);
        }
    }

    async copyFile(file) {
        const sourcePath = path.join(config.sourceDir, file);
        const destPath = path.join(this.distDir, file);

        if (await fs.pathExists(sourcePath)) {
            const stat = await fs.stat(sourcePath);
            if (stat.isDirectory()) {
                await fs.copy(sourcePath, destPath);
            } else {
                await fs.copyFile(sourcePath, destPath);
            }
            console.log(`✓ Copied ${file}`);
        } else {
            console.log(`⚠ Skipped ${file} (not found)`);
        }
    }

    async modifyFilesForBrowser() {
        if (this.browser === 'firefox') {
            const bgPath = path.join(this.distDir, 'bg.js');
            let bgContent = await fs.readFile(bgPath, 'utf8');
            bgContent = bgContent.replace(/importScripts\('browser-polyfill\.js'\);\s*\n?/g, '');
            await fs.writeFile(bgPath, bgContent);
            console.log(`✓ Modified bg.js for Firefox (removed importScripts)`);
        }
    }

    async generateManifest() {
        const manifest = this.createManifest();
        const manifestPath = path.join(this.distDir, 'manifest.json');

        await fs.writeJson(manifestPath, manifest, { spaces: 2 });
        console.log(`✓ Generated manifest.json for ${this.browser}`);
    }

    createManifest() {
        const manifest = { ...config.manifest };
        manifest.background = config.browserConfigs[this.browser].background;
        return manifest;
    }

    logSuccess() {
        console.log(`\n✓ Build complete for ${this.browser}!`);
        console.log(`✓ Output directory: ${this.distDir}`);
    }

    logError(error) {
        console.error('✗ Build failed:', error);
        process.exit(1);
    }
}

// CLI handling
function validateArgs() {
    const browser = process.argv[2];

    if (!browser || !config.browsers.includes(browser)) {
        console.error('Usage: node build.js [firefox|chrome]');
        process.exit(1);
    }

    return browser;
}

// Main execution
async function main() {
    const browser = validateArgs();
    const builder = new ExtensionBuilder(browser);
    await builder.build();
}

main(); 