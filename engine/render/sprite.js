

class BSprite
{
    p5p_sprite;
    world_pos;

    constructor( x, y, w, h )
    {
        this.p5p_sprite = new Sprite(w, h);
        this.p5p_sprite.x = 0;
        this.p5p_sprite.y = 0;

        this.world_pos = [x, y];
    };


    draw()
    {
        const render = engine.getSystem("render");
    
        const screen_pos = render.world_to_screen(...this.world_pos);
        this.p5p_sprite.x = screen_pos[0];
        this.p5p_sprite.y = screen_pos[1];

        this.p5p_sprite.draw();
    };


    drawXY( x, y )
    {
        const this_pos = this.world_pos;
        this.world_pos = [x, y];
        this.draw();

        this.world_pos = this_pos;
    };


    image( img )
    {
        this.p5p_sprite.image = img;
    };

};

