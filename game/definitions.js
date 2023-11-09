

// BLOCKS
// --------------------------------------------------------
const SILVER_VALUE = 1.0;
const GOLD_VALUE   = 10.0;
// --------------------------------------------------------



// AGENT
// --------------------------------------------------------
const AGENT_OFFSET = 900;

const AGENT_GATHERER_IDX = 0;
const AGENT_GUARD_IDX    = 1;
const AGENT_ATTACKER_IDX = 2;
const AGENT_REE_IDX      = 3;

const AGENT_GATHERER = AGENT_OFFSET + AGENT_GATHERER_IDX;
const AGENT_GUARD    = AGENT_OFFSET + AGENT_GUARD_IDX;
const AGENT_ATTACKER = AGENT_OFFSET + AGENT_ATTACKER_IDX;
const AGENT_REE      = AGENT_OFFSET + AGENT_REE_IDX;

const COST_GATHERER  = 10.0;
const COST_GUARD     = 50.0;
const COST_ATTACKER  = 200.0;

const AGENT_COSTS = [
    COST_GATHERER,
    COST_GUARD,
    COST_ATTACKER
];
// --------------------------------------------------------



// BULLET
// --------------------------------------------------------
const BULLET_OFFSET = 1000;

const MUZZLE_FLASH_COLOR = [2, 2, 1];
const HIT_FLASH_COLOR    = [2, 2, 1];
const BULLET_COLOR       = [200, 200, 100];


const PLAYER_BULLET_IDX   = 0;
const GUARD_BULLET_IDX    = 1;
const ATTACKER_BULLET_IDX = 2;
const REE_BULLET_IDX      = 3;

const PLAYER_BULLET   =  BULLET_OFFSET + PLAYER_BULLET_IDX;
const GUARD_BULLET    =  BULLET_OFFSET + GUARD_BULLET_IDX;
const ATTACKER_BULLET =  BULLET_OFFSET + ATTACKER_BULLET_IDX;
const REE_BULLET      =  BULLET_OFFSET + REE_BULLET_IDX;

const IMG_BULLET = 0;
const MAX_BULLETS = 100;
// --------------------------------------------------------




