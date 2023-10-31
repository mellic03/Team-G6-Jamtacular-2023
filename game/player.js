
/*
    Player does not necessarily mean a literal player character.
    The Player class contains logic relevant to player input.
*/

class Player
{
    block_width = 32.0;

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
        const terrain = engine.getSystem("terrain");
        const keylog  = engine.getSystem("keylog");

        const pos = render.view_pos;

        terrain.placeBlock(pos[0]+mouseX-512, pos[1]+mouseY-512, 1, this.block_width);


        if (keylog.keyTapped(KEYCODES.UP))
        {
            this.block_width *= 2;
        }

        if (keylog.keyTapped(KEYCODES.DOWN))
        {
            this.block_width /= 2;
        }

        if (keyIsDown(KEYCODES.D))
        {
            render.translate(+2.5, 0);
        }
    
        if (keyIsDown(KEYCODES.A))
        {
            render.translate(-2.5, 0);
        }

        if (keyIsDown(KEYCODES.S))
        {
            render.translate(0, +2.5);
        }
    
        if (keyIsDown(KEYCODES.W))
        {
            render.translate(0, -2.5);
        }

    };

};