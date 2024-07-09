/* eslint-disable @typescript-eslint/no-explicit-any */
import { Atom, SyncPayload } from "@rbxts/charm";

declare function SyncAtoms<T extends Record<string, Atom<any>>>(payload: SyncPayload<T>, atoms: T, mapType: any): void;
export { SyncAtoms };
