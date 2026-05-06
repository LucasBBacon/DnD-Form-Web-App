import { test, expect } from "vitest";
import { roll4d6DropLowest, rollDice } from "./dice";

test("rolls a d6 in range", () => {
	const result = rollDice({ count: 1, faces: 6 });
	expect(result).toBeGreaterThan(0);
	expect(result).toBeLessThan(7);
});

test("supports injected deterministic RNG", () => {
	const result = rollDice({ count: 2, faces: 8 }, () => 0);
	expect(result).toBe(2);
});

test("roll4d6DropLowest uses injected RNG", () => {
	const seq = [0.99, 0.5, 0.25, 0.0];
	let idx = 0;
	const random = () => {
		const value = seq[idx] ?? 0;
		idx += 1;
		return value;
	};

	// d6 values: 6, 4, 2, 1 -> drop 1 => 12
	expect(roll4d6DropLowest(random)).toBe(12);
});