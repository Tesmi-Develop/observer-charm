import { atom } from "@rbxts/charm";
import { AtomObserver } from "@rbxts/observer-charm";

const observer = new AtomObserver();
observer.Start();

const newAtom = atom({
	a: 1,
	b: 2,
});

const newAtom2 = atom({
	a: 10,
	b: 22,
});

observer.Connect(newAtom, (value) => {
	print(value);
});

observer.Connect(newAtom2, (value) => {
	print(value);
});

task.wait(3);
print("starting");
newAtom({
	a: 3,
	b: 4,
});

newAtom2({
	...newAtom2(),
	a: 31,
});
