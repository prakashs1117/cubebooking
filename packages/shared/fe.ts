// ============================================================================
// @demand/shared/fe — FluentEdge-only entry
// ============================================================================
// Pure design tokens, product constants, and domain type skeletons — no
// runtime service/axios dependencies. Import this from React Native (and web)
// FluentEdge code to avoid pulling the Demand-Management service layer (and its
// @babel/runtime / axios deps) into the bundle.
// ============================================================================

export * from "./design/tokens";
export * from "./design/constants";
export * from "./design/features";
export * from "./types/fluentedge";
