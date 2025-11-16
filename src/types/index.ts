/**
 * Core type definitions for the self-hosted debrid service
 */

export interface TorrentFile {
  name: string;
  path: string;
  length: number;
  offset?: number;
}

export interface TorrentInfo {
  infoHash: string;
  name: string;
  files: TorrentFile[];
  length: number;
  magnetURI?: string;
}

export interface StreamSource {
  name: string;
  title?: string;
  url: string;
  behaviorHints?: {
    bingeGroup?: string;
    notWebReady?: boolean;
  };
}

export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  resources: string[];
  types: string[];
  catalogs: any[];
  idPrefixes?: string[];
  behaviorHints?: {
    configurable?: boolean;
    configurationRequired?: boolean;
  };
}

export interface StremioStreamRequest {
  type: string;
  id: string;
}

export interface StremioStreamResponse {
  streams: StreamSource[];
}

export interface MediaFusionResolveRequest {
  infoHash?: string;
  magnet?: string;
  torrentUrl?: string;
  fileIndex?: number;
}

export interface MediaFusionResolveResponse {
  url: string;
  name: string;
  size: number;
  ready: boolean;
}

export interface DebridProviderOptions {
  timeout?: number;
  maxConnections?: number;
  downloadPath?: string;
}

export interface TorrentEngineStatus {
  infoHash: string;
  progress: number;
  downloadSpeed: number;
  uploadSpeed: number;
  numPeers: number;
  downloaded: number;
  uploaded: number;
  ready: boolean;
}

export interface Config {
  port: number;
  nodeEnv: string;
  baseUrl: string;
  authToken?: string;
  torrentTimeout: number;
  maxTorrents: number;
  downloadPath: string;
}
