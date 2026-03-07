export interface ModuleInclude {
  name: string;
  path: string;
}

export interface ModuleJson {
  namespace?: string;
  name?: string;
  items?: {
    includes?: ModuleInclude[];
  };
}

export interface SitecoreJson {
  $schema?: string;
  modules?: string[];
  plugins?: string[];
  serialization?: {
    defaultMaxRelativeItemPathLength?: number;
    defaultModuleRelativeSerializationPath?: string;
    removeOrphansForRoles?: boolean;
    removeOrphansForUsers?: boolean;
    continueOnItemFailure?: boolean;
    excludedFields?: string[];
    progressiveMetadataPull?: boolean;
  };
  settings?: {
    telemetryEnabled?: boolean;
    cacheAuthenticationToken?: boolean;
    versionComparisonEnabled?: boolean;
    apiClientTimeoutInMinutes?: number;
  };
}

export interface Module {
  name: string;
  path: string;
  folder: string;
  includePaths: string[];
}
