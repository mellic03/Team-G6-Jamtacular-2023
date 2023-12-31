

class BSprite
{
    p5p_sprite;
    img;

    constructor( x=0, y=0, w=128, h=128, spritegroup=undefined )
    {
        if (spritegroup == undefined)
        {
            this.p5p_sprite = new Sprite(x, y);
        }

        else
        {
            this.p5p_sprite = new spritegroup.Sprite(x, y);
        }

        this.p5p_sprite.w = w;
        this.p5p_sprite.h = h;
        this.p5p_sprite.collider = "none";
        this.p5p_sprite.autoDraw = false;
        this.p5p_sprite.autoUpdate = true;
    };

    draw( x, y )
    {
        const render = engine.getSystem("render");
        const screen_pos = render.world_to_screen(x, y);
        const size = render.world_to_screen_dist(128);

        this.p5p_sprite.x = screen_pos[0];
        this.p5p_sprite.y = screen_pos[1];

        this.p5p_sprite.draw();

        // translate(this.p5p().x, this.p5p().y);
        // rotate(this.p5p().rotation);
        // translate(-this.p5p().x, -this.p5p().y);

        // image(this.img, ...screen_pos, size, size);

        // translate(this.p5p().x, this.p5p().y);
        // rotate(-this.p5p().rotation);
        // translate(-this.p5p().x, -this.p5p().y);
    };

    p5p()
    {
        return this.p5p_sprite;
    };

    image( img )
    {
        this.img = img;
        this.p5p().image = img;
    };

    setRotation( r )
    {
        this.p5p().rotation = r;
    }
    
    lerpRotation( r, alpha )
    {
        this.p5p().rotation = (1.0 - alpha) * this.p5p().rotation + alpha*r;
    }


};



