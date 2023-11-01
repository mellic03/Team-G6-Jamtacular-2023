
/*
    Factories create entities like collectors.
*/

class Factory
{

};





class FactorySystem
{
    allocator = new Allocator(Factory);

    player_factory_id;
    factory_ids = [  ];

    player_factory_img;


    preload( engine )
    {
        this.player_factory_img = loadImage("factory.png");
    };


    setup( engine )
    {
        this.player_factory_id = this.allocator.create();
        this.factory_ids.push(this.player_factory_id);

        const spritesys = engine.getSystem("sprite");
        this.sid = spritesys.create([150, 0, 200, 200]);
    };


    draw( engine )
    {
        const spritesys = engine.getSystem("sprite");

        spritesys.drawSprite(this.sid);

        for (let id of this.factory_ids)
        {
            const factory = this.allocator.get(id);

        }
    };

};

