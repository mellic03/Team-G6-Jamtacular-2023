
const TOOL_NONE    = 0;
const TOOL_SELECT  = 1;
const TOOL_TERRAIN = 2;
const TOOL_RECT    = 3;
const TOOL_WEAPON  = 4;
const TOOL_INSPECT = 5;
const TOOL_CONTROL = 6;

const TOOL_LIGHT_A = 7;
const TOOL_LIGHT_B = 8;



class Player
{
    player_img;
    sprite;

    block_type  = BLOCK_AIR;
    block_width = 8.0;
    block_ksize = 8.0;

    body;
    acceleration = 0.0125;
    drag         = 0.01;
    max_velocity = 1.0;

    health = 100.0;

    weapons = [  ];
    active_weapon = WEAPON_RIFLE;
    ammo    = 100;
    timer   = 0.0;

    tool_mode     = TOOL_TERRAIN;
    rect_w        = 128;
    rect_h        = 64;
    rect_r        = 0.0;

    position      = [0.0, 0.1];
    view_offset   = [0.0, 0.0];
    view_offset2  = [0.0, 0.0];
    view_shake    = 0.0;
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
        const weaponSys = engine.getSystem("weapon");

        this.sprite = new BSprite(32, 32, 64, 64, allSprites);
        this.sprite.image(this.player_img);
        this.player_img.resize(128, 128);

        this.weapons[WEAPON_RIFLE] = weaponSys.createWeapon(WEAPON_RIFLE);
        this.weapons[WEAPON_RIFLE].hair_trigger = true;
        this.weapons[WEAPON_SHOTGUN] = weaponSys.createWeapon(WEAPON_SHOTGUN);

        this.body = new PhysicsBody(10, 10, 16, 16, "PLAYER");
        this.body.fast_collisions = false;

        this.body.body_resolution = (other) => {

            if (other.label > PLAYER_BULLET && other.label <= FRIENDLY_BULLET)
            {
                const damage = other.generic_data;
                this.health -= damage;
            }
        };
    };


    draw( engine )
    {
        const render = engine.getSystem("render");

        const dir = vec2_dir(render.mouse_worldspace, this.position);
        this.sprite.setRotation(atan2(dir[1], dir[0]));
        this.sprite.draw(...this.position);


        const lightSys = engine.getSystem("light");
        lightSys.getPointlight(0).diffuse  = [1, 2, 2];
        lightSys.getPointlight(0).position = this.position;
        lightSys.getPointlight(0).quadratic   = 100.0;
        lightSys.getPointlight(0).s_constant  = 50.0;
        lightSys.getPointlight(0).s_quadratic = 20.0;


        this.input(engine);

        if (this.health <= 0)
        {
            this.body.position = [0, 0];
            this.body.velocity = [0, 0];

            this.health = 100;
        }

        this.timer += deltaTime;

        this.draw_health();
    };


    draw_health()
    {
        const render  = engine.getSystem("render");

        let screenspace = render.world_to_screen(
            this.body.position[0],
            this.body.position[1] - 2*this.body.radius
        );

        const w = render.world_to_screen_dist(2*this.body.radius);
        const h = render.world_to_screen_dist(8);

        rectMode(CENTER);

        fill(255, 0, 0);
        rect(...screenspace, w, h);

        fill(0, 255, 0);
        rect(...screenspace, w*(this.health/100), h);
    };

    addBodies()
    {
        const physics = engine.getSystem("physics");
        physics.grid.addBody(this.body);
    };


    input( engine )
    {
        const render  = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        this.key_input(engine);
        this.mouse_input(engine);

        if (is_devmode())
        {
            this.acceleration = 0.2;
            return;
        }

        this.acceleration = 0.0125;
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

            const size = render.world_to_screen_dist(32.0);

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

            rectMode(CENTER);
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

        const size = render.world_to_screen_dist(this.block_ksize*this.block_width);
        circle(mouseX, mouseY, 2*size);

        if (mouseIsPressed)
        {
            terrain.placeSphere(...world_pos, this.block_type, this.block_ksize, this.block_width);    
        }

    };


    tool_rect( engine )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        fill(0, 0, 0, 100);
        rectMode(CENTER);

        let screen_w   = render.world_to_screen_dist(this.rect_w);
        let screen_h   = render.world_to_screen_dist(this.rect_h);


        let world_pos = render.mouse_worldspace;

        world_pos[0] = 16 * Math.floor(world_pos[0] / 16);
        world_pos[1] = 16 * Math.floor(world_pos[1] / 16);

        let screenspace = render.world_to_screen(...world_pos);

        translate(+screenspace[0], +screenspace[1]);
        rotate(this.rect_r)
        translate(-screenspace[0], -screenspace[1]);

        rect(...screenspace, screen_w, screen_h);

        translate(+screenspace[0], +screenspace[1]);
        rotate(-this.rect_r)
        translate(-screenspace[0], -screenspace[1]);



        if (mouseIsPressed)
        {
            const sinr = sin(this.rect_r);
            const cosr = cos(this.rect_r);

            for (let y=-this.rect_h/2; y<+this.rect_h/2; y++)
            {
                for (let x=-this.rect_w/2; x<+this.rect_w/2; x++)
                {
                    const X = x*cosr - y*sinr;
                    const Y = y*cosr + x*sinr;

                    terrain.placeBlock(world_pos[0]+X, world_pos[1]+Y, this.block_type, 8);
                }
            }
        }


    };


    tool_weapon( engine )
    {
        const render = engine.getSystem("render");
        const keylog = engine.getSystem("keylog");
        const terrain = engine.getSystem("terrain");

        let dir = vec2_dir(render.mouse_worldspace, this.position);
        let tangent = vec2_tangent(dir);
        let origin = vec2_add(this.position, vec2_mult(tangent, 7));
        // origin = vec2_sub(this.position, vec2_mult(dir, 64.0));

        const data = terrain.nearest_intersection(...origin, ...dir);
        const end = [data[0], data[1]];

        stroke(255, 0, 0, 100);
        fill(255, 0, 0, 100);
        line(...render.world_to_screen(...origin), ...render.world_to_screen(...end));
        circle(...render.world_to_screen(...end), 10);

        const weapon = this.weapons[this.active_weapon];
        let shot = false;

        if (keylog.mouseDown() && this.ammo >= weapon.ammo_cost)
        {
            shot = weapon.pew(...origin, ...dir);
        }

        if (shot)
        {
            this.ammo -= weapon.ammo_cost;

            this.view_offset2 = vec2_sub(
                this.view_offset2,
                vec2_mult(dir, weapon.recoil/deltaTime)
            );

            this.view_shake += weapon.shake/deltaTime;
        }
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
            case TOOL_RECT:    this.tool_rect(engine);    break;
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
            this.body.applyForce(+this.acceleration, 0.0);
        }
    
        if (keyIsDown(KEYCODES.A))
        {
            this.body.applyForce(-this.acceleration, 0.0);
        }

        if (keyIsDown(KEYCODES.S))
        {
            this.body.applyForce(0.0, +this.acceleration);
        }
    
        if (keyIsDown(KEYCODES.W))
        {
            this.body.applyForce(0.0, -this.acceleration);
        }
        this.position = this.body.position;


        const mouse_worldspace = render.mouse_worldspace;

        let dir = vec2_sub(mouse_worldspace, this.position);
        dir = vec2_mult(dir, 0.35);

        const alpha = min(0.005*deltaTime, 0.9);

        this.view_offset[0] = lerp(this.view_offset[0], dir[0], alpha);
        this.view_offset[1] = lerp(this.view_offset[1], dir[1], alpha);

        this.view_offset2[0] *= 0.95;
        this.view_offset2[1] *= 0.95;

        let shake_dir = [random(-1, +1), random(-1, +1)];
        shake_dir = vec2_mult(shake_dir, this.view_shake);
        this.view_shake *= 0.8;

        render.setView(
            this.position[0] + this.view_offset[0] + this.view_offset2[0] + shake_dir[0],
            this.position[1] + this.view_offset[1] + this.view_offset2[1] + shake_dir[1]
        );
    };


};