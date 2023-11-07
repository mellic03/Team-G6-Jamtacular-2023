
const AGENT_GATHERER = 0;
const AGENT_GUARD  = 1;
const AGENT_ATTACKER = 3;

class Agent
{
    sprite;
    body;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    path = [  ];
    current_target = -1;

    constructor( sprite )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 16, 16);
        this.sprite = sprite;
    };


    draw()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        if (this.at_destination() == false)
        {
            this.follow_path();
 
            // if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path, this.current_target);
            }
        }

        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }

        if (this.at_destination())
        {
            this.behaviour();
        }

        this.body.update();
        this.sprite.draw(...this.body.position);
    };


    follow_path( )
    {
        const target = this.path[this.current_target];
        this.body.applyForceTowards(...target, 0.1);

        if (dist(...this.body.position, ...target) < 32.0)
        {
            this.current_target -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];
        this.path = terrain.pathfinder.find(...this.body.position, ...T);
        this.current_target = this.path.length - 2;
    };


    unset_target( )
    {
        this.path = [ ];
        this.current_target = -1;
    };


    at_destination()
    {
        return this.current_target < 0;
    };


    behaviour()
    {

    };

};



class Gatherer extends Agent
{
    behaviour()
    {

    };
};


class Guard extends Agent
{
    behaviour()
    {

    };
};


class Attacker extends Agent
{
    weapon_spread = 0.1;
    timer = 0.0;

    behaviour()
    {
        const player = engine.getSystem("player");
        const bulletSys = engine.getSystem("bullet");
        
        if (this.timer > 500.0)
        {
            bulletSys.create(
                ...this.body.position,
                ...vec2_dir(player.position, this.body.position),
                this.weapon_spread
            );
            this.timer = 0.0;
        }

        this.timer += deltaTime;
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
    };


    setup( engine )
    {
        this.costs[AGENT_GATHERER] = 10;
        this.costs[AGENT_GUARD] = 50;
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

            const collector = this.agents[i];
            collector.draw();
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


    createAgent( type )
    {
        const id = valueof(this.current_idx);

        this.agents[id] = new this.constructors[type](this.sprites[type]);
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

