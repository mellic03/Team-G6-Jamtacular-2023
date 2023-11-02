const FACTORY_PLAYER = 0;



/*
    Factories create entities like collectors.
*/
class Factory
{
    sprite;
    position   = [0, 0];
    monies     = 100.0;
    collectors = [  ];

    constructor( sprite )
    {
        this.sprite = sprite;
    };


    draw( engine )
    {
        // this.sprite.drawXY(...this.position);

        // for (let collector of this.collectors)
        // {
        //     collector.draw();
        // }
    };


    buildCollector( type )
    {
        // const cost = COLLECTOR_COSTS[type];

        // if (this.monies > cost)
        // {
        //     this.collectors.push(new Collector(type));
        //     this.monies -= cost;
        // }
    };

};





class FactorySystem
{
    allocator    = new Allocator(Factory);

    factory_ids  = [  ];
    factory_imgs = [  ];


    preload( engine )
    {
        this.factory_imgs[FACTORY_PLAYER] = loadImage("factory.png");
    };


    setup( engine )
    {

    };


    draw( engine )
    {
        for (let id of this.factory_ids)
        {
            const factory = this.allocator.get(id);
            factory.draw(engine);
        }
    };


    createFactory( type )
    {
        const sprite = new BSprite(0, 0, 100, 100);
        sprite.image(this.factory_imgs[type]);

        const factory_id = this.allocator.create([sprite]);
        this.factory_ids.push(factory_id);

        return factory_id;
    };


    getFactory( id )
    {
        return this.allocator.get(id);
    }


    buildCollector( factory_id, type )
    {
        const collectorSys = engine.getSystem("collector");

        const factory = this.getFactory(factory_id);
        const cost    = collectorSys.costOf(type);

        if (factory.monies > cost)
        {
            const collector_id = collectorSys.createCollector(type);
            factory.collectors.push(collector_id);
            factory.monies -= cost;
        }
    };

};

