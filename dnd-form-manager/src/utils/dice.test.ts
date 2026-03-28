const { test, expect } = require('vitest');

test('rolls a dice', () => {
	expect(Math.floor(Math.random() * 6) + 1).toBeGreaterThan(0);
	expect(Math.floor(Math.random() * 6) + 1).toBeLessThan(7);
});