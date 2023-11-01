
/*
    Player does not necessarily mean a literal player character.
    The Player class contains logic relevant to player input.
*/



class Player
{
    block_width = 2.0;
    block_type  = 1.0;

    move_speed  = 5.0;

    acceleration = 0.05;
    drag         = 0.01;

    max_velocity = 1.0;
    velocity     = new vec2(0.0, 0.0);

    constructor()
    {

    };

    preload()
    {

    };

    setup()
    {

    };


    draw( engine )
    {
        this.input(engine);

        const render  = engine.getSystem("render");
        circle(render.res_min/2, render.res_y/2, 20);
    };


    input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");
    

        this.mouse_input(engine);
        this.key_input(engine);


        const x = render.view_pos[0];
        const y = render.view_pos[1];
        let dx = this.velocity.x;
        let dy = this.velocity.y;
        let mag = Math.sqrt(dx**2 + dy**2);

        let data = terrain.nearest_intersection(x, y, dx/mag, dy/mag);
        const px = data[0];
        const py = data[1];
        const nx = data[2];
        const ny = data[3];

        const distance = dist(x, y, px, py);

        if (distance < 60.0 * deltaTime)
        {
            if (nx != 0)
            {
                this.velocity.x -= (1.0 / distance) * Math.sign(this.velocity.x);
            }

            else
            {
                this.velocity.y  -= (1.0 / distance) * Math.sign(this.velocity.y);
            }

        }

    };


    mouse_input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");

        if (keylog.mouseLocked())
        {
            return;
        }


        const pos = render.view_pos;
        terrain.unlock(pos[0], pos[1], render.res_x, render.res_y);

        if (mouseIsPressed)
        {
            const span = this.block_width;
            const mx = pos[0] + mouseX - render.res_min/2;
            const my = pos[1] + mouseY - render.res_min/2;

            const ksize = 16;

            for (let y=my-ksize*span; y<my+ksize*span; y+=span)
            {
                for (let x=mx-ksize*span; x<mx+ksize*span; x+=span)
                {
                    if (dist(x, y, mx, my) < ksize*span)
                    {
                        terrain.placeBlock(x, y, this.block_type, span);
                    }
                }
            }
        }
    
        terrain.lock();
    };


    key_input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");

        if (keylog.keyTapped(KEYCODES.UP))
        {
            this.block_width *= 2;
        }

        if (keylog.keyTapped(KEYCODES.DOWN))
        {
            this.block_width /= 2;
        }


        if (keylog.keyTapped(KEYCODES.LEFT))
        {
            this.block_type -= 1;
            console.log("block_type: " + this.block_type);
        }

        if (keylog.keyTapped(KEYCODES.RIGHT))
        {
            this.block_type += 1;
            console.log("block_type: " + this.block_type);
        }


        if (keyIsDown(KEYCODES.D))
        {
            this.velocity.x += this.acceleration;
        }
    
        if (keyIsDown(KEYCODES.A))
        {
            this.velocity.x -= this.acceleration;
        }

        if (keyIsDown(KEYCODES.S))
        {
            this.velocity.y += this.acceleration;
        }
    
        if (keyIsDown(KEYCODES.W))
        {
            this.velocity.y -= this.acceleration;
        }


        /*
            Dampening scales exponentially with the magnitude of velocity.

            --> y = (1 - drag) / (x + 1)
        */

        const dampening = (1.0 - this.drag) / (this.velocity.magSq() + 1);
        this.velocity.mult(dampening);

        render.translate(deltaTime*this.velocity.x, deltaTime*this.velocity.y);
    };

};