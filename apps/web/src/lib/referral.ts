import { customAlphabet } from 'nanoid';

// Generate referral code (exclude confusing chars: 0,O,1,I,l)
const nanoid = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

export function generateReferralCode(): string {
  return nanoid();
}

const ADJECTIVES = [
  'Stealthy', 'Savvy', 'Crypto', 'AI', 'Quantum', 'Viral',
  'NoCode', 'Product', 'Design', 'Ops', 'Cloud', 'Security',
  'Data', 'Growth', 'Agile', 'DevOps', 'Full-Stack', 'Lean'
];

const ROLES = [
  'Marketer', 'Engineer', 'Founder', 'Trader', 'Growth Hacker',
  'Operator', 'Designer', 'Analyst', 'Architect', 'PM',
  'Developer', 'Strategist', 'Consultant', 'Director', 'Manager'
];

export function generatePersonaName(seed: number): string {
  const adjIndex = seed % ADJECTIVES.length;
  const roleIndex = Math.floor(seed / ADJECTIVES.length) % ROLES.length;
  const number = seed % 1000;
  
  return `${ADJECTIVES[adjIndex]} ${ROLES[roleIndex]} #${number}`;
}

export function calculatePosition(basePoints: number, bonusPoints: number = 0): number {
  // Lower effective points = higher position (closer to #1)
  return basePoints - bonusPoints;
}

export const GHOST_HEAD = 1331; // Pre-seed offset
export const MOVE_PER_REFERRAL = 7;
export const MAX_REFERRAL_BONUS = 300; // Can't move up more than 300 spots total
