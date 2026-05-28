import type { Poem } from '../types';
import raw from './poems.json';

export const poems: ReadonlyArray<Poem> = raw as Poem[];
