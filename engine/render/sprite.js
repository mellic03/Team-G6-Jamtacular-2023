

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
};



class PhysicsBody
{
    position;
    velocity;

    last_position;
    velocity_magSq;

    width;
    height;

    hasDrag = true;
    drag    = 0.05;

    constructor( x=0, y=0, w=32, h=32 )
    {
        this.position = [x, y];
        this.velocity = [0, 0];

        this.last_position  = [x, y];
        this.velocity_magSq = 0.0;
        
        this.width  = w;
        this.height = h;
    };


    applyForce( dx, dy )
    {
        this.velocity[0] += dx;
        this.velocity[1] += dy;
    };


    applyForceTowards( x, y, strength=1.0 )
    {
        let dir = vec2_dir([x, y], this.position);
        dir = vec2_mult(dir, strength);
        this.applyForce(...dir);
    };


    update()
    {
        this.last_position[0] = valueof(this.position[0]);
        this.last_position[1] = valueof(this.position[1]);

        this.position[0] += deltaTime * this.velocity[0];
        this.position[1] += deltaTime * this.velocity[1];

        this.velocity_magSq = vec2_magSq(this.velocity);

        if (this.hasDrag)
            this.velocity = velocityDampening(this.drag, ...this.velocity);
    };

};



const IMG_BULLET = 0;




class BulletSystem
{
    bullet;
    bodies  = [  ];
    visible = [  ];
    current = 0;

    preload( engine )
    {
        this.img = loadImage("game/assets/bullet.png");
    };


    setup( engine )
    {
        this.bullet = new BSprite();
        this.bullet.image(this.img);

        for (let i=0; i<100; i++)
        {
            this.bodies.push(new PhysicsBody(0, 0, 32, 32));
        }

    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        strokeWeight(8)
        stroke(255, 255, 0);

        for (let i=0; i<100; i++)
        {
            if (this.visible[i] == false)
            {
                continue;
            }

            this.bodies[i].update();

            let pos = vec2_add(this.bodies[i].position, vec2_mult(this.bodies[i].velocity, -8.0));
            line(...render.world_to_screen(...this.bodies[i].position), ...render.world_to_screen(...pos));

            const intersection = terrain.nearest_intersection(...this.bodies[i].position, ...this.bodies[i].velocity);

            // const blockdata = terrain.getBlock(...this.bodies[i].position);
            const distanceSq = dist(intersection[0], intersection[1], ...this.bodies[i].position);

            if (distanceSq <= deltaTime*this.bodies[i].velocity_magSq)
            {
                dowith_probability(0.99, () => {
                    terrain.placeSphere(intersection[0], intersection[1], BLOCK_AIR, 4, 8);
                })


                this.bodies[i].velocity = [0, 0];
                this.bodies[i].position = [-1000, -1000];
                this.visible[i] = false;
            }
        }
    

        strokeWeight(1)
    };


    create( x, y, dx, dy )
    {
        this.bodies[this.current].position[0] = x;
        this.bodies[this.current].position[1] = y;
        this.bodies[this.current].velocity[0] = 2*dx;
        this.bodies[this.current].velocity[1] = 2*dy;
        this.bodies[this.current].hasDrag = false;
        this.visible[this.current] = true;

        this.current = (this.current + 1) % 100;
    };

};

