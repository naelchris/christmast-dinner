// Storage stub - no database needed for static site
// Form submission will be handled by Google Forms

export interface IStorage {}

export class StaticStorage implements IStorage {}

export const storage = new StaticStorage();
