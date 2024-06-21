/* eslint-disable @typescript-eslint/no-explicit-any */
import { Atom, subscribe, SyncPayload } from "@rbxts/charm";
import setInterval from "./utils/set-interval";
import { diff } from "./utils/patch";

export class AtomObserver {
	private state = new Map<Atom<any>, unknown>();
	private connections = new Set<() => void>();
	private isStarted = false;
	private isChanging = false;
	private interval = 0;
	private stateSnapshot = new Map<Atom<any>, unknown>();
	private listeners = new Map<Atom<any>, (value: SyncPayload<any>) => void>();

	constructor(interval?: number) {
		this.interval = interval ?? this.interval;
	}

	private addAtom(atom: Atom<any>) {
		this.state.set(atom, atom());
		this.stateSnapshot.set(atom, atom());
	}

	private removeAtom(atom: Atom<any>) {
		this.state.delete(atom);
		this.stateSnapshot.delete(atom);
	}

	public Connect<S>(atom: Atom<S>, listener: (value: SyncPayload<S>) => void): () => void {
		this.addAtom(atom);
		this.listeners.set(atom, listener);

		const connection = subscribe(atom, (state) => {
			this.isChanging = true;
			this.state.set(atom, state);
		});
		this.connections.add(connection);

		return () => {
			this.removeAtom(atom);
			this.listeners.delete(atom);
			connection();
			this.connections.delete(connection);
		};
	}

	public Destroy() {
		this.connections.forEach((disconnect) => disconnect());
	}

	public GenerateHydratePayload(atom: Atom<any>): SyncPayload<any> {
		return {
			type: "init",
			data: atom(),
		};
	}

	private generateSyncPayloadPatch(patch: any): SyncPayload<any> {
		return {
			type: "patch",
			data: patch,
		};
	}

	public Start() {
		if (this.isStarted) return;
		this.isStarted = true;

		this.connections.add(
			setInterval(() => {
				if (!this.isChanging) return;

				const diffs = diff(this.stateSnapshot, this.state);
				this.stateSnapshot = table.clone(this.state);
				this.isChanging = false;

				for (const [atom, patch] of pairs(diffs)) {
					this.listeners.get(atom as Atom<any>)!(this.generateSyncPayloadPatch(patch));
				}
			}, this.interval),
		);
	}
}
