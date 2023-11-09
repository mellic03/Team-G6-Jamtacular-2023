
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


    constructor( sprite)
    {
        this.sprite = sprite;
    };


    draw( engine )
    {
        this.sprite.draw(...this.position);
    };


    createAgent( type )
    {
        const cost = costof_agent(type);

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
        this.player_factory = new Factory(this.sprites[FACTORY_PLAYER], FACTORY_PLAYER);
        this.player_factory.createAgent(AGENT_GATHERER);
        allSprites.autoDraw = false;
    };


    draw( engine )
    {
        this.player_factory.draw(engine);
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

