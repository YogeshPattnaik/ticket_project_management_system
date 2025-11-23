export interface VersionInfo {
    version: string;
    major: number;
    minor: number;
    patch: number;
}
export declare class VersionManager {
    static parseVersion(version: string): VersionInfo;
    static compareVersions(v1: string, v2: string): number;
    static isValidVersion(version: string): boolean;
    static getNextVersion(currentVersion: string, type: 'major' | 'minor' | 'patch'): string;
    static extractApiVersion(path: string): string | null;
    static extractMigrationVersion(filename: string): string | null;
}
//# sourceMappingURL=version-manager.d.ts.map