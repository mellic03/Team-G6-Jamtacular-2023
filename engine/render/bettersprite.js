

class BSprite
{
    p5p_sprite;
    world_pos;

    constructor( x, y, w, h )
    {
        this.p5p_sprite = new Sprite(w, h);
        this.p5p_sprite.x = 0;
        this.p5p_sprite.y = 0;

        this.world_pos = new vec2(x, y);
    };


    draw( engine )
    {

    };

};




class SpriteSystem
{
    allocator;
    draw_queue      = [  ];
    last_draw_queue = [  ];

    preload( engine )
    {
        this.allocator = new Allocator(BSprite);
    };


    setup( engine )
    {

    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const view_pos = render.view_pos;

        // Stop drawing sprites that aren't supposed to be drawn.
        while (this.last_draw_queue.length > 0)
        {
            const id = this.last_draw_queue.pop();
            const sprite = this.allocator.get(id);
            sprite.p5p_sprite.autoDraw = true;
        }


        // Start drawing sprites that are supposed to be drawn.
        while (this.draw_queue.length > 0)
        {
            const id = this.draw_queue.pop();
            const sprite = this.allocator.get(id);

            sprite.p5p_sprite.autoDraw = true;

            sprite.p5p_sprite.x = sprite.world_pos.x - view_pos[0];
            sprite.p5p_sprite.y = sprite.world_pos.y - view_pos[1];

            this.last_draw_queue.push(id);
        }
    };


    __draw_sprite( sprite )
    {

    };


    drawSprite( id )
    {
        this.draw_queue.push(id);
    };


    create( args )
    {
        return this.allocator.create( args );
    };


    get( id )
    {
        return this.allocator.get(id);
    };


    destroy( id )
    {
        this.allocator.destroy(id);
    };


};

