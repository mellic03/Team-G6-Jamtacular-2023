
const FACTORY_PLAYER = 0;


/*
    Factories create entities like collectors.
*/
class Factory
{
    sprite;
    position   = [0, 0];
    monies     = 1000.0;
    collectors = [  ];


    constructor( x, y, sprite )
    {
        this.position = [x, y];
        this.sprite = sprite;
    };


    draw( engine )
    {
        this.sprite.draw(...this.position);

        const render = engine.getSystem("render");
        const player = engine.getSystem("player");
        const keylog = engine.getSystem("keylog");
        const UIsys  = engine.getSystem("ui");

        if (player.tool_mode != TOOL_INSPECT)
        {
            return;
        }


        if (this != engine.getSystem("factory").player_factory && is_devmode() == false)
        {
            return;
        }

        if (dist(...this.position, ...render.mouse_worldspace) < 32.0)
        {
            fill(0, 0, 0, 100);
            rectMode(CENTER);
            
            const size = render.world_to_screen_dist(64);
            rect(...render.world_to_screen(...this.position), size, size);

            if (keylog.mouseClicked())
            {
                UIsys.modals[MODAL_FACTORY].show(this);
            }
        }
    };


    createAgent( type )
    {
        const cost = engine.getSystem("agent").costOf(type);

        if (this.monies >= cost)
        {
            const agentSys = engine.getSystem("agent");
            agentSys.createAgent(type, this);

            this.monies -= cost;
        }
    };

};



class FactorySystem
{
    player_factory;
    enemy_factories = [  ];

    sprites = [  ];


    preload( engine )
    {
        this.sprites[FACTORY_PLAYER] = new BSprite(0, 0, 32, 32);
        this.sprites[FACTORY_PLAYER].image(loadImage("factory.png"));
    };


    setup( engine )
    {
        this.player_factory = new Factory(0, 0, this.sprites[FACTORY_PLAYER]);
        this.player_factory.createAgent(AGENT_REE);

        this.enemy_factories.push(new Factory(0, 1500, this.sprites[FACTORY_PLAYER]));
        this.enemy_factories[0].createAgent(AGENT_REE);

        allSprites.autoDraw = false;
    };


    draw( engine )
    {
        this.player_factory.draw(engine);

        for (let factory of this.enemy_factories)
        {
            factory.draw(engine);
        }

    };


    createFactory( type )
    {
        // const sprite = new BSprite(0, 0, 100, 100);
        // sprite.image(this.factory_imgs[type]);

        // const factory_id = this.allocator.create([sprite]);
        // this.factory_ids.push(factory_id);

        // this.allocator.get(factory_id).sprite = sprite;

        // return factory_id;
    };


    createAgent( factory_id, type )
    {
        // const agentSys = engine.getSystem("agent");

        // const factory = this.getFactory(factory_id);
        // const cost    = agentSys.costOf(type);

        // if (factory.monies >= cost)
        // {
        //     const collector_id = agentSys.createCollector(type);
        //     factory.agents.push(collector_id);
        //     factory.monies -= cost;
        // }
    };

};

