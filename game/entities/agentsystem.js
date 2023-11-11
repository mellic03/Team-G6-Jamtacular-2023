
const NUM_FACTORIES = 4;
const MAX_AGENTS = 100;


class AgentSystem
{
    agentGroup;
    sprites      = [  ];
    costs        = [  ];
    constructors = [  ];

    agents       = [  ];
    active       = [  ];
    num_active   = 0;
    current_idx  = 0;


    preload( engine )
    {
        this.agentGroup = new Group();

        this.sprites[AGENT_GATHERER_IDX] = new BSprite(0, 0, 64, 64, this.agentGroup);
        this.sprites[AGENT_GATHERER_IDX].image(loadImage("gatherer.png"));

        this.sprites[AGENT_GUARD_IDX] = new BSprite(0, 0, 64, 64, this.agentGroup);
        this.sprites[AGENT_GUARD_IDX].image(loadImage("guard.png"));

        this.sprites[AGENT_SECURITY_IDX] = new BSprite(0, 0, 64, 64, this.agentGroup);
        this.sprites[AGENT_SECURITY_IDX].image(loadImage("security.png"));

        this.sprites[AGENT_REE_IDX] = new BSprite(0, 0, 64, 64, this.agentGroup);
        this.sprites[AGENT_REE_IDX].image(loadImage("game/assets/rifle/rifle1.png"));

        guard0 = loadImage("game/assets/guard/0.png", (img) => {img.resize(32, 64)});
        guard1 = loadImage("game/assets/guard/1.png", (img) => {img.resize(32, 64)});
        guard2 = loadImage("game/assets/guard/2.png", (img) => {img.resize(32, 64)});
        guard3 = loadImage("game/assets/guard/3.png", (img) => {img.resize(32, 64)});
    };


    setup( engine )
    {
        this.costs[AGENT_GATHERER_IDX] = 10;
        this.costs[AGENT_GUARD_IDX]    = 50;
        this.costs[AGENT_SECURITY_IDX] = 100;
        this.costs[AGENT_REE_IDX]      = 0;

        this.constructors[AGENT_GATHERER_IDX] = Gatherer;
        this.constructors[AGENT_GUARD_IDX]    = Guard;
        this.constructors[AGENT_SECURITY_IDX] = Security;
        this.constructors[AGENT_REE_IDX]      = Human;

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
        const physics = engine.getSystem("physics");

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
                this.destroyAgent(i);
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

                if (collector.isFriendly() == false)
                {
                    continue;
                }
            
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
        const id = this.current_idx;
        const TYPE = type - AGENT_OFFSET;

        this.agents[id] = new this.constructors[TYPE](this.sprites[TYPE]);
        this.agents[id].reset(this.sprites[TYPE], parent);

        if (parent != undefined)
        {
            this.agents[id].body.position[0] = parent.position[0] + random(-200, +200);
            this.agents[id].body.position[1] = parent.position[1] + random(-200, +200);

            // this.agents[id].set_target(
            //     parent.position[0] + random(-200, +200),
            //     parent.position[1] + random(-200, +200)
            // );
        }

        this.agents[id].body.label = type;
        this.agents[id].body.generic_data = this.agents[id];
        this.active[id] = true;

        this.num_active += 1;
        this.current_idx = (this.current_idx + 1) % MAX_AGENTS;

        return id;
    };


    destroyAgent( id )
    {
        this.active[id] = false;
        this.num_active -= 1;
    };


    costOf( type )
    {
        const TYPE = type - AGENT_OFFSET;
        return this.costs[TYPE];
    };


    addBodies()
    {
        const physics = engine.getSystem("physics");
    
        for (let i=0; i<MAX_AGENTS; i++)
        {
            if (this.active[i] == false)
            {
                continue;
            }
        
            physics.grid.addBody(this.agents[i].body);
        }
    };

};

