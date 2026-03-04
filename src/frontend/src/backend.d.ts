import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Internship {
    id: string;
    applyUrl: string;
    domain: string;
    source: string;
    createdAt: bigint;
    role: string;
    deadline: bigint;
    company: string;
    stipend: bigint;
    skills: Array<string>;
    location: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookmark(internshipId: string): Promise<void>;
    addInternship(company: string, role: string, domain: string, skills: Array<string>, stipend: bigint, location: string, deadline: bigint, applyUrl: string, source: string): Promise<string>;
    applyToInternship(internshipId: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteInternship(id: string): Promise<void>;
    getAlerts(): Promise<Array<Internship>>;
    getApplications(): Promise<Array<string>>;
    getBookmarks(): Promise<Array<string>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInternshipById(id: string): Promise<Internship | null>;
    getInternships(): Promise<Array<Internship>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initialize(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    removeBookmark(internshipId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateInternship(id: string, company: string, role: string, domain: string, skills: Array<string>, stipend: bigint, location: string, deadline: bigint, applyUrl: string, source: string): Promise<void>;
}
