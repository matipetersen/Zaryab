export type Ab = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type Mods = Record<Ab, number>;
export type Side = 'pc' | 'foe';
export type DmgType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold' | 'lightning' | 'thunder' | 'acid' | 'poison'
  | 'necrotic' | 'radiant' | 'psychic' | 'force' | 'none';

export type CondId =
  | 'prone' | 'blinded' | 'poisoned' | 'frightened' | 'charmed' | 'paralyzed' | 'stunned' | 'restrained' | 'invisible'
  | 'burning' | 'dodging' | 'bless' | 'bane' | 'shieldFaith' | 'hex' | 'hunterMark' | 'hexCurse' | 'enfeebled'
  | 'wrathSmite' | 'radiantSoul' | 'rallied' | 'vulnerable' | 'guided' | 'aided' | 'sharp' | 'weakened' | 'ambusher'
  | 'noHeal' | 'spiritGuard' | 'deathWard' | 'ensnare' | 'faerie' | 'flameFist' | 'taunted' | 'disadvNext' | 'surgeUsed' | 'sneakUsed' | 'disengaged' | 'helped' | 'grappled' | 'ready' | 'sprinting';

export interface Status { id: CondId; turns: number; src?: number; val?: number; dot?: string; /** Puesto durante el turno de quien lo tiene: no se descuenta al terminar ese turno. */ fresh?: boolean; /** Termina si quien lo lanzó pierde la concentración. */ conc?: boolean }

export interface DmgPart { dice: string; type: DmgType }

export interface Weapon {
  id: string; name: string; range: number;         // en casillas (5 ft)
  longRange?: number; toHit: number; dmg: DmgPart[];
  ranged?: boolean; finesse?: boolean; bonusAction?: boolean; // ataques como acción adicional (golpes de ki)
  magic?: boolean; note?: string; sharp?: boolean;
}

export type MKind = 'melee' | 'ranged' | 'save' | 'heal' | 'summon' | 'buff';
export interface MAction {
  id: string; name: string; kind: MKind;
  toHit?: number; reach: number;                    // casillas
  dmg?: DmgPart[]; half?: boolean;
  save?: { ab: Ab; dc: number; cond?: CondId; turns?: number; dot?: string };
  aoe?: number;                                     // radio en casillas (explosión centrada en el actor o en el objetivo)
  aoeSelf?: boolean;
  recharge?: number;                                // se recarga con d6 >= recharge
  multiattack?: number;                             // nº de veces (para acciones de multiataque)
  spellSlots?: number;                              // lanza usando "slot" de monstruo
  heal?: string; note?: string;
}

export interface MonsterDef {
  id: string; name: string; type: string; cr: string; hp: number; ac: number; speed: number; fly?: number;
  mods: Mods; prof: number; saves?: Partial<Mods>;
  actions: MAction[]; multiattack?: string[];       // ids de acciones que usa en su Multiataque
  resist?: DmgType[]; immune?: DmgType[]; vuln?: DmgType[]; condImmune?: CondId[];
  traits?: string[]; xp: number; color: string; glyph: string; sprite: Sprite;
  onDeath?: { name: string; dmg: DmgPart[]; radius: number; dc: number; ab: Ab; cond?: CondId };
  regen?: number; undead?: boolean; size?: 1 | 2 | 3;
  lore?: string;
}
export type Sprite = 'humanoid' | 'beast' | 'construct' | 'undead' | 'elemental' | 'djinn' | 'mirror' | 'colossus' | 'swarm' | 'wall' | 'pylon' | 'serpent';

export interface Unit {
  /** Reacción gastada en esta ronda (ataque de oportunidad). Se recupera al empezar su turno. */ reactionUsed?: boolean; /** Sorprendido: pierde su primer turno y no puede reaccionar hasta entonces. */ surprised?: boolean; /** Marca interna: el turno perdido por sorpresa se salta solo. */ lostTurn?: boolean;
  uid: number; id: string; name: string; side: Side; ai: boolean; color: string; glyph: string; sprite: Sprite;
  x: number; y: number; size: number;
  mods: Mods; saves: Mods; prof: number; level: number;
  hp: number; maxHp: number; temp: number; ac: number; speed: number; fly: boolean;
  spellMod: number; spellDC: number; spellAtk: number;
  weapons: Weapon[]; abilities: string[]; actions: MAction[]; multiattack: string[];
  res: Record<string, number>; resMax: Record<string, number>;
  statuses: Status[]; conc?: { id: string; targets: number[] };
  death: { succ: number; fail: number }; down: boolean; dead: boolean; stable: boolean;
  moveLeft: number; actionUsed: boolean; bonusUsed: boolean; extraActions: number; attacksMade: number; acted: boolean;
  initiative: number; resist: DmgType[]; immune: DmgType[]; vuln: DmgType[]; condImmune: CondId[];
  traits: string[]; xp: number; cr?: string; undead: boolean;
  onDeath?: MonsterDef['onDeath']; regen: number; rechargeReady: Record<string, boolean>;
  extraAtk?: number; pcId?: string; summoned?: boolean; turnsTaken: number; portrait?: string; fled?: boolean; initBonus?: number;
}

export interface Tile { obj?: string; /** CD para descubrir el objeto (oculto hasta entonces). */ hid?: number; ch: string; kind: 'floor' | 'diff' | 'wall' | 'cover' | 'hazard' | 'water' | 'high' | 'mark' | 'door'; h: number; cost: number; blocked: boolean; hp?: number; maxHp?: number; flam?: boolean; boom?: boolean; turns?: number }
export interface MapDef {
  id: string; name: string; rows: string[]; theme: 'tavern' | 'alley' | 'aqueduct' | 'mirror' | 'plaza' | 'mine' | 'garden' | 'crater' | 'market' | 'ruins' | 'sanctum';
  intro?: string; objective: string; marks?: string[]; objs?: { x: number; y: number; id: string }[]; /** Trampas sembradas por el enemigo (ocultas hasta que se las busca o se pisan). */ traps?: { x: number; y: number; kind: 'mina' | 'red' | 'foso'; dc?: number; disarm?: number }[];
}
export type BEvent =
  | { t: 'log'; text: string; cls?: string }
  | { t: 'float'; uid: number; text: string; cls: string }
  | { t: 'move'; uid: number; path: { x: number; y: number }[] }
  | { t: 'hit'; uid: number } | { t: 'death'; uid: number } | { t: 'spawn'; uid: number }
  | { t: 'fx'; kind: string; x: number; y: number; x2?: number; y2?: number }
  | { t: 'tile'; kind: 'break' | 'ignite' | 'build' | 'burnout' | 'boom' | 'door'; x: number; y: number }
  | { t: 'snap'; uid: number; x: number; y: number }
  | { t: 'turn'; uid: number } | { t: 'round'; n: number }
  | { t: 'end'; result: 'victory' | 'defeat' };
