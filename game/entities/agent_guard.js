

/*
    Agent2.sprite is a BSprite (Better Sprite) object.
    Agent2.body is a PhysicsBody object.
    - body contains the postion and velocity of the object.

    To access the position/velocity of an Agent:
        agent.body.position
        agent.body.velocity

*/


class Agent2
{
    sprite;
    body;

    selected  = false;
    energy    = 10.0;
    inventory = [ 0, 0, 0, 0 ];

    path = [  ];
    current_target = -1;

    constructor( sprite )
    {
        this.body = new PhysicsBody(random(-150, 150), random(-150, 150), 16, 16);
        this.sprite = sprite;
    };


    draw()
    {
        const render = engine.getSystem("render");
        const terrain = engine.getSystem("terrain");

        if (this.at_destination() == false)
        {
            this.follow_path();
 
            // if (terrain.visualize_pathfinding)
            {
                terrain.pathfinder.drawPath(this.path, this.current_target);
            }
        }

        if (this.selected == true)
        {
            const size = render.world_to_screen_dist(64);
            rectMode(CENTER);
            fill(0, 0, 0, 100);
            rect(...render.world_to_screen(...this.body.position), size, size);
        }

        if (this.at_destination())
        {
            this.behaviour();
        }

        this.body.update();
        this.sprite.draw(...this.body.position);
    };


    follow_path( )
    {
        const target = this.path[this.current_target];
        this.body.applyForceTowards(...target, 0.1);

        if (dist(...this.body.position, ...target) < 32.0)
        {
            this.current_target -= 1;
        }
    };


    set_target( target )
    {
        const terrain = engine.getSystem("terrain");

        const T = [ valueof(target[0]), valueof(target[1]) ];
        this.path = terrain.pathfinder.find(...this.body.position, ...T);
        this.current_target = this.path.length - 2;
    };


    unset_target( )
    {
        this.path = [ ];
        this.current_target = -1;
    };


    at_destination()
    {
        return this.current_target < 0;
    };


    behaviour()
    {

    };
};


class Guard extends Agent2
{
    behaviour()
    {
        
    };
};



