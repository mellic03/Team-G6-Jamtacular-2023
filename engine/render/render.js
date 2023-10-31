
function approxEqual( a, b, epsilon )
{
    if (abs(a - b) <= epsilon)
    {
        return true;
    }
    else
    {
        return false;
    }
}

let span = 8.0;



class RenderSystem
{
    quadtree_shader;
    quadtree_data;
    quadtree;
    offline_context;

    res_x;
    res_y;

    view_pos = [ 0.0, 0.0 ];

    constructor( res_x=512, res_y=512 )
    {
        this.res_x = res_x;
        this.res_y = res_y;
    };


    translate( x, y )
    {
        this.view_pos[0] += x;
        this.view_pos[1] += y;
    };


    preload( engine )
    {
        this.quadtree_shader = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree.fs"
        );
    };


    setup( engine )
    {
        createCanvas(this.res_x, this.res_y);
        frameRate(60);

        this.offline_context = createGraphics(this.res_x, this.res_y, WEBGL);
        this.offline_context.textureWrap(CLAMP);
    };


    draw( engine )
    {

    };


    draw_data_buffer()
    {
        // this.quadtree.draw();

        // stroke(155);
        // strokeWeight(1);
        // for (let y=-512; y<512; y+=1024/16)
        // {
        //     line(-512, y, 0.1, 512, y, 0.1);
        // }
        // for (let x=-512; x<512; x+=1024/16)
        // {
        //     line(x, -512, 0.1, x, 512, 0.1);
        // }

        // stroke(255);
        // strokeWeight(4);
        // for (let x=-512; x<512; x+=1024/4)
        // {
        //     line(x, -512, 0.1, x, 512, 0.1);
        // }
    };

};


function keyPressed()
{
    if (keyIsDown(38))
    {
        span *= 2.0;
    }

    if (keyIsDown(40))
    {
        span /= 2.0;
    }
}
