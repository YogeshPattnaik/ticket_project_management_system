"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionManager = void 0;
class VersionManager {
    static parseVersion(version) {
        const parts = version.replace(/^v/, '').split('.');
        return {
            version,
            major: parseInt(parts[0] || '0', 10),
            minor: parseInt(parts[1] || '0', 10),
            patch: parseInt(parts[2] || '0', 10),
        };
    }
    static compareVersions(v1, v2) {
        const version1 = this.parseVersion(v1);
        const version2 = this.parseVersion(v2);
        if (version1.major !== version2.major) {
            return version1.major - version2.major;
        }
        if (version1.minor !== version2.minor) {
            return version1.minor - version2.minor;
        }
        return version1.patch - version2.patch;
    }
    static isValidVersion(version) {
        return /^v?\d+\.\d+\.\d+$/.test(version);
    }
    static getNextVersion(currentVersion, type) {
        const version = this.parseVersion(currentVersion);
        switch (type) {
            case 'major':
                return `v${version.major + 1}.0.0`;
            case 'minor':
                return `v${version.major}.${version.minor + 1}.0`;
            case 'patch':
                return `v${version.major}.${version.minor}.${version.patch + 1}`;
        }
    }
    static extractApiVersion(path) {
        const match = path.match(/\/api\/v(\d+)/);
        return match ? `v${match[1]}` : null;
    }
    static extractMigrationVersion(filename) {
        const match = filename.match(/V(\d+)__/);
        return match ? `V${match[1]}` : null;
    }
}
exports.VersionManager = VersionManager;
//# sourceMappingURL=version-manager.js.map