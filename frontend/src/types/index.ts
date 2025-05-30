// types/index.ts (Barrel file for types)
export * from './User';
export * from './Receipt';
export * from './Category';
export * from './Challenge';
export * from './Report';
export * from './Analytics';
export * from './ApiResponse';
export * from './Common';
export * from './Auth';
export * from './Notification';
export * from './Theme';

// Legacy exports for backward compatibility
export type { User, UserPreferences } from './User';
export type { Receipt, ReceiptItem, OCRData, BoundingBox } from './Receipt';
export type { Category } from './Category';
export type { Challenge, UserChallenge } from './Challenge';
export type { Report } from './Report';
export type { ApiResponse, PaginatedResponse } from './ApiResponse';
