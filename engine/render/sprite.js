

class BSprite
{
    p5p_sprite;

    constructor( x=0, y=0, w=32, h=32 )
    {
        this.p5p_sprite = new Sprite(w, h);
        this.p5p_sprite.x = 0;
        this.p5p_sprite.y = 0;
        this.p5p_sprite.collider = "none";
        this.p5p_sprite.autoDraw = false;
        this.p5p_sprite.autoUpdate = false;

        this.position = [x, y];
    };

    draw( x, y )
    {
        const render = engine.getSystem("render");
    
        const screen_pos = render.world_to_screen(x, y);
        this.p5p_sprite.x = screen_pos[0];
        this.p5p_sprite.y = screen_pos[1];
        this.p5p_sprite.draw();
    };

    image( img )
    {
        this.p5p_sprite.image = img;
    };

    p5p()
    {
        return this.p5p_sprite;
    };

    setRotation( r )
    {
        this.p5p_sprite.rotation = r;
    }

};



