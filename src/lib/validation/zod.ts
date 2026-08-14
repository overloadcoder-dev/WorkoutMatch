import { z } from 'zod';

// WorkoutMatch ships a strict CSP without unsafe-eval. Disable Zod's optional
// JIT schema compilation before any application schema is constructed.
z.config({ jitless: true });

export { z };
