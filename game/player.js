

const TOOL_SELECT  = 0;
const SELECTION_GATHER = 0;
const SELECTION_DEFEND = 1;
const SELECTION_ATTACK = 3;

const TOOL_TERRAIN = 1;
const TOOL_TARGET  = 2;


class Player
{
    block_type  = BLOCK_AIR;
    block_width = 8.0;
    block_ksize = 8.0;

    move_speed   = 2.5;
    acceleration = 0.05;
    drag         = 0.01;
    max_velocity = 1.0;

    tool_mode      = TOOL_TERRAIN;
    selection_mode = SELECTION_GATHER;

    target       = [0.0, 0.0];
    light_a      = [-1.0, 0.0];
    light_b      = [+1.0, 0.0];

    position      = [0.0, 0.1];
    view_offset   = [0.0, 0.0];
    velocity      = [0.0, 0.0];

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
        const render = engine.getSystem("render");
        const UIsys  = engine.getSystem("ui");
        const viewport_w = render.res_x * (1.0 - UIsys.proportion_ui);
        const viewport_h = render.res_y;

        fill(100, 255, 100);
        circle(...render.world_to_screen(...this.position), 20);

        this.input(engine);
    };


    input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        this.mouse_input(engine);
        this.key_input(engine);

        const x = this.position[0];
        const y = this.position[1];
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


    selecting    = false;
    selection_tl = [0.0, 0.0];
    selection_br = [0.0, 0.0];

    tool_select( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        if (keylog.mouseDown() && this.selecting == false)
        {
            engine.setEvent("player", "selection", undefined);
            this.selection_tl = render.screen_to_world(...[mouseX, mouseY]);
            this.selecting = true;
        }

        if (keylog.mouseDragged() && this.selecting == true)
        {
            this.selection_br = render.screen_to_world(mouseX, mouseY);

            rectMode(CORNERS);
            fill(0, 0, 0, 70);
            stroke(255);
            rect(...render.world_to_screen(...this.selection_tl), ...render.world_to_screen(...this.selection_br));

            const min_x = min(this.selection_tl[0], this.selection_br[0]);
            const min_y = min(this.selection_tl[1], this.selection_br[1]);
            const max_x = max(this.selection_tl[0], this.selection_br[0]);
            const max_y = max(this.selection_tl[1], this.selection_br[1]);

            let world_tl = [min_x, min_y];
            let world_br = [max_x, max_y];

            const data = {
                header: "selection",
                tl: world_tl,
                br: world_br
            };

            engine.setEvent("player", "selection", data);
        }


        if (keylog.mouseUp())
        {
            this.selecting = false;
        }


        if (keylog.mouseClicked())
        {
            this.target = render.screen_to_world(mouseX, mouseY);

            const data = {
                header: "target",
                target: this.target
            };

            engine.setEvent("player", "selection", data);
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
    
        switch (this.tool_mode)
        {
            case TOOL_SELECT: this.tool_select(engine); break;
        }

        if (mouseIsPressed)
        {
            switch (this.tool_mode)
            {
                case TOOL_TERRAIN:
                    let world_pos = render.screen_to_world(mouseX, mouseY);
                    terrain.placeSphere(...world_pos, this.block_type, this.block_ksize, this.block_width);    
                    break;

                case TOOL_TARGET:
                    this.target = render.screen_to_world(mouseX, mouseY);
                    break;
            }

            if (this.tool_mode == 3)
            {
                this.light_a = render.screen_to_world(mouseX, mouseY);
                return;
            }

            if (this.tool_mode == 4)
            {
                this.light_b = render.screen_to_world(mouseX, mouseY);
                return;
            }
        }
    
        terrain.lock();
    };


    key_input( engine )
    {
        const render  = engine.getSystem("render");
        const keylog  = engine.getSystem("keylog");

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

        const mouse_worldspace = render.screen_to_world(mouseX, mouseY);

        let dir = vec2_sub(mouse_worldspace, this.position);
        dir = vec2_mult(dir, 0.1);
        
        this.view_offset[0] = dir[0];
        this.view_offset[1] = dir[1];

        render.setView(
            this.position[0] + this.view_offset[0],
            this.position[1] + this.view_offset[1]
        );
    };


};