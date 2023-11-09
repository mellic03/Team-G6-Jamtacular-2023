
const TOOL_NONE    = 0;
const TOOL_SELECT  = 1;
const TOOL_TERRAIN = 2;
const TOOL_WEAPON  = 4;
const TOOL_INSPECT = 5;

const TOOL_LIGHT_A = 6;
const TOOL_LIGHT_B = 7;



class Player
{
    player_img;
    sprite;

    block_type  = BLOCK_AIR;
    block_width = 8.0;
    block_ksize = 8.0;

    move_speed   = 2.5;
    acceleration = 0.225;
    drag         = 0.01;
    max_velocity = 1.0;

    health = 100.0;

    weapon_sound;
    weapon_spread = 0.2;
    weapon_cooldown = 100;
    ammo = 100000;

    tool_mode     = TOOL_TERRAIN;

    position      = [0.0, 0.1];
    view_offset   = [0.0, 0.0];
    view_offset2  = [0.0, 0.0];
    velocity      = [0.0, 0.0];

    constructor()
    {

    };

    preload()
    {
        this.player_img = loadImage("game/assets/rifle/rifle1.png");
    };

    setup()
    {
        this.sprite = new BSprite(32, 32, 64, 64, allSprites);
        this.sprite.image(this.player_img);

        this.player_img.resize(128, 128);
    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const UIsys  = engine.getSystem("ui");
        const viewport_w = render.res_x * (1.0 - UIsys.proportion_ui);
        const viewport_h = render.res_y;


        const dir = vec2_dir(render.mouse_worldspace, this.position);

        this.sprite.setRotation(atan2(dir[1], dir[0]));
        this.sprite.draw(...this.position);

        // fill(100, 255, 100);
        // circle(...render.world_to_screen(...this.position), 10);

        const lightSys = engine.getSystem("light");
        lightSys.getPointlight(0).position = this.position;
        lightSys.getPointlight(0).quadratic   = 55.0;
        lightSys.getPointlight(0).s_constant  = 50.0;
        lightSys.getPointlight(0).s_quadratic = 20.0;


        this.input(engine);

        if (this.health <= 0)
        {
            this.position = [0, 0];
            // this.ammo = 0.0;
            this.velocity = [0, 0];

            this.health = 100;
        }

    };


    input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");


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

        this.key_input(engine);
        this.mouse_input(engine);
    };


    selecting    = false;
    selection_tl = [0.0, 0.0];
    selection_br = [0.0, 0.0];

    tool_select( engine )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");
        const keylog = engine.getSystem("keylog");

        if (keylog.mouseDown() && this.selecting == false)
        {
            engine.setEvent("player", "selection", undefined);
            this.selection_tl = render.mouse_worldspace;
            this.selecting = true;
        }

        if (keylog.mouseDragged() && this.selecting == true)
        {
            this.selection_br = render.mouse_worldspace;

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
            engine.setEvent("agent", "selection", {header: "num_selected", num_selected: 0});
        }

        if (keylog.mouseUp())
        {
            this.selecting = false;

            const size = render.world_to_screen_dist(64.0);

            const nodespace  = terrain.pathfinder.world_to_node(...render.mouse_worldspace);
            const worldspace = terrain.pathfinder.node_to_world(nodespace);
            let screenspace  = render.world_to_screen(...worldspace);


            noStroke();

            if (terrain.pathfinder.isBlocked(...nodespace))
            {
                fill(155, 0, 0, 50);
            }
            else
            {
                fill(0, 155, 0, 50);
            }

            rect(...screenspace, size, size);
        }

        if (keylog.mouseClicked())
        {
            const data = {
                header: "target",
                target: render.mouse_worldspace
            };

            engine.setEvent("player", "selection", data);
        }

    };


    tool_terrain( engine )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        let world_pos = render.mouse_worldspace;
        fill(0, 0, 0, 100);
        circle(mouseX, mouseY, (render.viewport_w/1024)*2*this.block_ksize*this.block_width);

        if (mouseIsPressed)
        {
            terrain.placeSphere(...world_pos, this.block_type, this.block_ksize, this.block_width);    
        }

    };


    tool_inspect( engine )
    {
        const render = engine.getSystem("render");
        const sprite = engine.getSystem("sprite");
        const keylog = engine.getSystem("keylog");
        const UIsys  = engine.getSystem("ui");
        const factorySys = engine.getSystem("factory");
        const factory = factorySys.player_factory;

        if (dist(...factory.position, ...render.mouse_worldspace) < 32.0)
        {
            fill(0, 0, 0, 100);
            rectMode(CENTER);
            
            let size = render.world_to_screen_dist(64);

            rect(...render.world_to_screen(...factory.position), size, size);

            if (keylog.mouseClicked())
            {
                UIsys.factory_modal.show();
            }
        }

    };


    flag   = true;
    timer = 0;

    tool_weapon( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");
        const terrain = engine.getSystem("terrain");
        const bulletSys = engine.getSystem("bullet");

        let dir = vec2_dir(render.mouse_worldspace, this.position);
        let tangent = vec2_tangent(dir);
        let origin = vec2_add(this.position, vec2_mult(tangent, 7));


        const data = terrain.nearest_intersection(...origin, ...dir);
        const end = [data[0], data[1]];

        stroke(255, 0, 0, 100);
        fill(255, 0, 0, 100);
        line(...render.world_to_screen(...origin), ...render.world_to_screen(...end));
        circle(...render.world_to_screen(...end), 10);

        if (keylog.mouseDown())
        {
            if (this.timer >= this.weapon_cooldown && this.ammo > 0)
            {

                bulletSys.createBullet(...origin, ...dir, this.weapon_spread);
                this.ammo -= 1;
                this.view_offset2 = vec2_sub(this.view_offset2, vec2_mult(dir, 150/deltaTime));

                this.timer = 0;
            }
        }

        else
        {
            this.timer = this.weapon_cooldown;
        }

        this.timer += deltaTime;
    };


    mouse_input( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");

        if (keylog.mouseLocked())
        {
            return;
        }

        switch (this.tool_mode)
        {
            case TOOL_SELECT:  this.tool_select(engine);  break;
            case TOOL_TERRAIN: this.tool_terrain(engine); break;
            case TOOL_INSPECT: this.tool_inspect(engine); break;
            case TOOL_WEAPON:  this.tool_weapon(engine);  break;

        }


        if (mouseIsPressed)
        {
            const lightSys = engine.getSystem("light");

            switch (this.tool_mode)
            {
                case TOOL_LIGHT_A:

                    lightSys.getPointlight(0).position = render.mouse_worldspace;
                    break;

                case TOOL_LIGHT_B:
                    lightSys.getPointlight(1).position = render.mouse_worldspace;
                    break;
            }

        }
    
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

        const mouse_worldspace = render.mouse_worldspace;

        let dir = vec2_sub(mouse_worldspace, this.position);
        dir = vec2_mult(dir, 0.1);
        
        this.view_offset[0] = dir[0];
        this.view_offset[1] = dir[1];

        this.view_offset2[0] *= 0.95;
        this.view_offset2[1] *= 0.95;

        render.setView(
            this.position[0] + this.view_offset[0] + this.view_offset2[0],
            this.position[1] + this.view_offset[1] + this.view_offset2[1]
        );
    };


};