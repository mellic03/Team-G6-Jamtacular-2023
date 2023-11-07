
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

    factory_id = -1;

    constructor( sprite, id=-1 )
    {
        this.sprite = sprite;
        this.factory_id = id;
    };


    draw( engine )
    {
        this.sprite.draw(...this.position);

        // for (let collector of this.collectors)
        // {
        //     collector.draw();
        // }
    };


    createAgent( type )
    {
        const agentSys = engine.getSystem("agent");
        agentSys.createAgent(type, this.factory_id);
    };

};





class FactorySystem
{
    player_factory;
    enemy_factories = [  ];

    sprites = [  ];


    preload( engine )
    {
        this.sprites[FACTORY_PLAYER] = new BSprite();
        this.sprites[FACTORY_PLAYER].image(loadImage("factory.png"));
    };


    setup( engine )
    {
        this.player_factory = new Factory(this.sprites[FACTORY_PLAYER], FACTORY_PLAYER);
        
        allSprites.autoDraw = false;
    };


    draw( engine )
    {
        
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

