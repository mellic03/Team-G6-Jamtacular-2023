
/*
    Player does not necessarily mean a literal player character.
    The Player class contains logic relevant to player input.
*/



class Player
{
    block_type  = BLOCK_AIR;
    block_width = 8.0;
    block_ksize = 8.0;

    move_speed   = 2.5;
    acceleration = 0.05;
    drag         = 0.01;
    max_velocity = 1.0;

    tool_mode    = 0;

    target       = [0.0, 0.0];
    light_a      = [-1.0, 0.0];
    light_b      = [+1.0, 0.0];
    position     = [0.0, 0.0];
    velocity     = [0.0, 0.0];

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
        const render  = engine.getSystem("render");
        const UIsys  = engine.getSystem("ui");
        const viewport_w = render.res_x * (1.0 - UIsys.proportion_ui);
        const viewport_h = render.res_y;

        fill(100, 255, 100);
        circle(viewport_w/2, viewport_h/2, 20);

        fill(255, 100, 100);
        circle(...render.world_to_screen(...this.target), 20);

        fill(255, 50, 50);
        circle(...render.world_to_screen(...this.light_a), 20);

        fill(50, 255, 50);
        circle(...render.world_to_screen(...this.light_b), 20);


        this.input(engine);
    };


    input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        this.mouse_input(engine);
        this.key_input(engine);

        const x = render.view_pos[0];
        const y = render.view_pos[1];
        let dx = this.velocity[0];
        let dy = this.velocity[1];
        let mag = Math.sqrt(dx**2 + dy**2);
        let data = terrain.nearest_intersection(x, y, dx/mag, dy/mag);

        const px = data[0];
        const py = data[1];

        const distance = dist(x, y, px, py);

        if (distance < 1.0 * deltaTime)
        {
            this.velocity[0] -= (1.0 / distance) * Math.sign(this.velocity[0]);
            this.velocity[1] -= (1.0 / distance) * Math.sign(this.velocity[1]);
        }
    };


    mouse_input( engine )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");

        if (keylog.mouseLocked())
        {
            return;
        }

        const viewport_w = render.viewport_w;
        const viewport_h = render.viewport_h;

        const pos = render.view_pos;
        terrain.unlock(pos[0], pos[1], viewport_w, viewport_h);


        if (mouseIsPressed)
        {
            if (this.tool_mode == 1)
            {
                this.target = render.screen_to_world(mouseX, mouseY);
                return;
            }

            if (this.tool_mode == 2)
            {
                console.log("woop");
                this.light_a = render.screen_to_world(mouseX, mouseY);
                return;
            }

            if (this.tool_mode == 3)
            {
                this.light_b = render.screen_to_world(mouseX, mouseY);
                return;
            }


            let world_pos = render.screen_to_world(mouseX, mouseY);
            terrain.placeSphere(...world_pos, this.block_type, this.block_ksize, this.block_width);
        }
    
        terrain.lock();
    };


    key_input( engine )
    {
        const render  = engine.getSystem("render");

        if (keyIsDown(KEYCODES.D))
        {
            this.velocity[0] += this.acceleration;
        }
    
        if (keyIsDown(KEYCODES.A))
        {
            this.velocity[0] -= this.acceleration;
        }

        if (keyIsDown(KEYCODES.S))
        {
            this.velocity[1] += this.acceleration;
        }
    
        if (keyIsDown(KEYCODES.W))
        {
            this.velocity[1] -= this.acceleration;
        }


        /*
            Dampening scales exponentially with the magnitude of velocity.

            --> y = (1 - drag) / (x + 1)
        */

        // const dampening = (1.0 - this.drag) / (this.velocity.magSq() + 1);
        // this.velocity.mult(min(dampening, 0.9));



        this.velocity = velocityDampening(this.drag, ...this.velocity);

        this.position[0] += deltaTime * this.velocity[0];
        this.position[1] += deltaTime * this.velocity[1];

        render.setView(...this.position);
    };

};