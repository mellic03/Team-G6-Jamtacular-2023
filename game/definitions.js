

// BLOCKS
// --------------------------------------------------------
const SILVER_VALUE = 1.0;
const GOLD_VALUE   = 10.0;
// --------------------------------------------------------



// AGENT
// --------------------------------------------------------
const AGENT_OFFSET = 50;

const AGENT_GATHERER_IDX = 0;
const AGENT_GUARD_IDX    = 1;
const AGENT_SECURITY_IDX = 2;
const AGENT_SOLDIER_IDX      = 3;
const AGENT_SOLDIER_BAD_IDX  = 4;
const FRIENDLY_AGENT_IDX = 5; 
const UNFRIENDLY_AGENT_IDX = 6; 
const PLAYER_AGENT_IDX = 7;

const AGENT_GATHERER = AGENT_OFFSET + AGENT_GATHERER_IDX;
const AGENT_GUARD    = AGENT_OFFSET + AGENT_GUARD_IDX;
const AGENT_SECURITY = AGENT_OFFSET + AGENT_SECURITY_IDX;
const AGENT_SOLDIER      = AGENT_OFFSET + AGENT_SOLDIER_IDX;
const AGENT_SOLDIER_BAD  = AGENT_OFFSET + AGENT_SOLDIER_BAD_IDX;

const FRIENDLY_AGENT   = AGENT_OFFSET + FRIENDLY_AGENT_IDX;
const UNFRIENDLY_AGENT = AGENT_OFFSET + UNFRIENDLY_AGENT_IDX;
const PLAYER_AGENT     = AGENT_OFFSET + PLAYER_AGENT_IDX;

const AGENT_HEAL_TIME = 5000.0;

const COST_GATHERER  = 10.0;
const COST_GUARD     = 50.0;
const COST_SECURITY  = 200.0;

const AGENT_COSTS = [
    COST_GATHERER,
    COST_GUARD,
    COST_SECURITY
];
// --------------------------------------------------------



// BULLET
// --------------------------------------------------------
const BULLET_OFFSET = 100;

const MUZZLE_FLASH_COLOR = [0.5, 0.5, 0.25];
const HIT_FLASH_COLOR    = [0.5, 0.5, 0.25];
const BULLET_COLOR       = [200, 200, 100];


const PLAYER_BULLET_IDX     = 0;
const FRIENDLY_BULLET_IDX   = 1;
const UNFRIENDLY_BULLET_IDX = 2;

const PLAYER_BULLET     = BULLET_OFFSET + PLAYER_BULLET_IDX;
const FRIENDLY_BULLET   = BULLET_OFFSET + FRIENDLY_BULLET_IDX;
const UNFRIENDLY_BULLET = BULLET_OFFSET + UNFRIENDLY_BULLET_IDX;

const IMG_BULLET = 0;
const MAX_BULLETS = 100;
// --------------------------------------------------------



let __dev_mode = false;

function is_devmode()
{
    return (__dev_mode == true);
};

function set_devmode( flag )
{
    __dev_mode = (flag == true);
}



