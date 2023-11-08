
const AGENT_GATHERER = 0;
const AGENT_GUARD    = 1;
const AGENT_ATTACKER = 2;

const COST_GATHERER = 10.0;
const COST_GUARD    = 50.0;
const COST_ATTACKER = 200.0;


const AGENT_COSTS = [
    COST_GATHERER,
    COST_GUARD,
    COST_ATTACKER
];

function costof_agent( type )
{
    return AGENT_COSTS[type];
}


let guard0, guard1, guard2, guard3;



class Agent
{
    sprite;
    body;
    health = 100.0;
    parent = undefined;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    last_target = [ 0, 0 ];
    current_target = [ 0, 0 ];

    path = [  ];
    path_idx = -1;

    constructor( sprite )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 16, 16);
        this.body.drag = 0.2;
        this.sprite = sprite;
    };


    draw()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }


        if (this.at_destination() == false)
        {
            this.follow_path();
 
            // if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path, this.path_idx);
            }
        }


        else
        {
            this.behaviour();
        }

        this.body.update();
        this.sprite.draw(...this.body.position);
    };


    follow_path()
    {
        const target = this.path[this.path_idx];

        this.body.applyForceTowards(...target, 0.05);

        if (dist(...this.body.position, ...target) < 32.0)
        {
            this.path_idx -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];

        this.last_target[0]    = valueof(this.current_target[0]);
        this.last_target[1]    = valueof(this.current_target[1]);
        this.current_target[0] = valueof(T[0]);
        this.current_target[1] = valueof(T[1]);

        this.path = terrain.pathfinder.find(...this.body.position, ...this.current_target);
        this.path_idx = this.path.length - 2;
    };


    at_destination()
    {
        return this.path_idx < 0;
    };


    behaviour()
    {

    };

    onHit()
    {

    };

};


const SILVER_VALUE = 1.0;
const GOLD_VALUE   = 10.0;


class Gatherer extends Agent
{
    materials = [0.0, 0.0];
    holdings  = 0.0;
    capacity  = 5.0;

    dir = [1.0, 0.0];

    r = 0.0;
    rdir = Math.PI;

    was_on_gold = false;
    am_on_gold  = false;

    reversed_path = [];

    returning_home = false;


    at_home()
    {
        return dist(...this.body.position, 0, 0) < 128;
    };


    return_home()
    {
        this.set_target([0, 0]);

        this.reversed_path = [];
        for (let i=this.path.length-1; i>=0; i--)
        {
            this.reversed_path.push(this.path[i]);
        }
    };


    behaviour()
    {
        if (this.at_home() && this.holdings >= this.capacity)
        {
            this.parent.monies += SILVER_VALUE * this.materials[0];
            this.parent.monies += GOLD_VALUE * this.materials[1];

            this.materials[0] = 0;
            this.materials[1] = 0;
            this.holdings = 0.0;

            this.path = this.reversed_path;
            this.path_idx = this.path.length - 2;
            return;
        }

        if (this.holdings < this.capacity)
        {
            this.gather();
        }

        else
        {
            if (this.at_home() == false)
            {
                this.return_home();
            }
        }
    };


    gather()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        const cosr = cos(this.r);
        const sinr = sin(this.r);

        const dx = this.dir[0]*cosr - this.dir[1]*sinr;
        const dy = this.dir[1]*cosr + this.dir[0]*sinr;

        const data = terrain.nearest_intersection(...this.body.position, dx, dy);
        const blocktype = data[4];

        // stroke(255);
        // strokeWeight(4);
        // line(...render.world_to_screen(...this.body.position), ...render.world_to_screen(data[0], data[1]));

        if (blocktype == BLOCK_SILVER || blocktype == BLOCK_GOLD)
        {
            if (dist(...this.body.position, data[0], data[1]) < 16)
            {
                const dir = vec2_sub([data[0], data[1]], this.body.position);

                const x = this.body.position[0] + dir[0]/2;
                const y = this.body.position[1] + dir[1]/2;

                terrain.placeSphere(x, y, BLOCK_AIR, 2, 16);

                this.materials[blocktype - BLOCK_SILVER] += 2*2*16;
                this.holdings += 1;
                // strokeWeight(8);
            }

            else
            {
                this.body.applyForce(dx, dy, 0.001*deltaTime);
                // stroke(255, 255, 255, 100);
                // strokeWeight(1);
            }

            this.am_on_gold = true;

            // line(...render.world_to_screen(...this.body.position), ...render.world_to_screen(data[0], data[1]));
            // strokeWeight(1);
        }

        else
        {
            this.am_on_gold = false;
        }

        if (this.was_on_gold == true && this.am_on_gold == false)
        {
            this.rdir *= -1.0;
        }
        strokeWeight(1);

        this.was_on_gold = valueof(this.am_on_gold);

        this.r += this.rdir * (deltaTime/10.0);
    };

};


class Attacker extends Agent
{
    weapon_spread   = 0.3;
    weapon_cooldown = 0.0;
    reload_time     = 500.0;

    can_see_player()
    {
        const player = engine.getSystem("player");
        const terrain = engine.getSystem("terrain");

        const dir = vec2_dir(player.position, this.body.position);
        const intersection = terrain.nearest_intersection(...this.body.position, ...dir);

        const x = intersection[0];
        const y = intersection[1];

        return distance2(...this.body.position, x, y) > distance2(...this.body.position, ...player.position);
    };


    behaviour()
    {
        const player = engine.getSystem("player");
        const terrain = engine.getSystem("terrain");
        const bulletSys = engine.getSystem("bullet");


        if (this.can_see_player())
        {
            this.sprite.image(guard3)
        }

        else
        {
            this.sprite.image(guard0)
        }



        if (this.weapon_cooldown > this.reload_time)
        {
            // raycast towards player to ensure they are visible to the attacker
            if (this.can_see_player())
            {
                bulletSys.createBullet_startEnd(
                    ...this.body.position,
                    ...player.position,
                    this.weapon_spread,
                    ATTACKER_BULLET
                );
                this.weapon_cooldown = 0.0;
                this.time_since_player = 0.0;
            }

        }


        this.time_since_player += deltaTime;
        this.weapon_cooldown += deltaTime;
    };


    onHit()
    {
        this.health -= 50.0;
    };

};



const NUM_FACTORIES = 4;
const MAX_AGENTS = 100;


class AgentSystem
{
    sprites      = [  ];
    costs        = [  ];
    constructors = [  ];

    agents       = [  ];
    active       = [  ];
    num_active   = 0;
    current_idx  = 0;


    preload( engine )
    {
        this.sprites[AGENT_GATHERER] = new BSprite();
        this.sprites[AGENT_GATHERER].image(loadImage("gatherer.png"));

        this.sprites[AGENT_GUARD] = new BSprite();
        this.sprites[AGENT_GUARD].image(loadImage("guard.png"));

        this.sprites[AGENT_ATTACKER] = new BSprite();
        this.sprites[AGENT_ATTACKER].image(loadImage("attacker.png"));

        guard0 = loadImage("game/assets/guard/0.png", (img) => {img.resize(32, 64)});
        guard1 = loadImage("game/assets/guard/1.png", (img) => {img.resize(32, 64)});
        guard2 = loadImage("game/assets/guard/2.png", (img) => {img.resize(32, 64)});
        guard3 = loadImage("game/assets/guard/3.png", (img) => {img.resize(32, 64)});

    };


    setup( engine )
    {
        this.costs[AGENT_GATHERER] = 10;
        this.costs[AGENT_GUARD]    = 50;
        this.costs[AGENT_ATTACKER] = 100;

        this.constructors[AGENT_GATHERER] = Gatherer;
        this.constructors[AGENT_GUARD]    = Guard;
        this.constructors[AGENT_ATTACKER] = Attacker;

        for (let i=0; i<MAX_AGENTS; i++)
        {
            this.agents.push(null);
            this.active.push(false);
        }
    };


    draw( engine )
    {
        const terrain = engine.getSystem("terrain");
        const player  = engine.getSystem("player");

        if (this.num_active == 0)
        {
            return;
        }

        const data = engine.getEvent("player", "selection");
        this.find_selected(data);

        for (let i=0; i<MAX_AGENTS; i++)
        {
            if (this.active[i] == false)
            {
                continue;
            }

            const agent = this.agents[i];
            agent.draw();

            if (agent.health <= 0.0)
            {
                this.active[i] = false;
            }
        }
    };


    find_selected( data )
    {
        if (data == undefined)
        {
            this.deselect_all();
            return;
        }

        if (data.header == "target")
        {

            for (let i=0; i<MAX_AGENTS; i++)
            {
                if (this.active[i] == false)
                {
                    continue;
                }
    
                const collector = this.agents[i];

                if (collector.selected == true)
                {
                    collector.set_target(data.target);
                    collector.selected = false;
                }
            }
        }

        else if (data.header == "selection")
        {
            const tl = data.tl;
            const br = data.br;

            const xmin = tl[0];
            const ymin = tl[1];
            const xmax = br[0];
            const ymax = br[1];


            for (let i=0; i<MAX_AGENTS; i++)
            {
                if (this.active[i] == false)
                {
                    continue;
                }
    
                const collector = this.agents[i];
            
                const px = collector.body.position[0];
                const py = collector.body.position[1];

                if (xmin < px && px < xmax && ymin < py && py < ymax)
                {
                    const screenspace = engine.getSystem("render").world_to_screen(px, py);
                    collector.selected = true;
                    circle(...screenspace, 20);
                }

                else
                {
                    collector.selected = false;
                }
            }
        }
    };


    deselect_all()
    {
        for (let i=0; i<MAX_AGENTS; i++)
        {
            if (this.active[i] == false)
            {
                continue;
            }

            const collector = this.agents[i];
            collector.selected = false;
        }
    };


    createAgent( type, parent=undefined )
    {
        const id = valueof(this.current_idx);

        this.agents[id] = new this.constructors[type](this.sprites[type]);
        this.agents[id].parent = parent;
        this.active[id] = true;
        this.num_active += 1;

        this.current_idx = (this.current_idx + 1) % MAX_AGENTS;

        return id;
    };


    destroyAgent( id )
    {
        this.active[id] = true;
        this.num_active -= 1;
    };


    costOf( type )
    {
        return this.costs[type];
    };
};

