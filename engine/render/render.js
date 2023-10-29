
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


class RenderSystem
{
    quadtree_shader;
    quadtree_data;
    quadtree;

    res_x;
    res_y;

    constructor( res_x=512, res_y=512 )
    {
        this.res_x = res_x;
        this.res_y = res_y;
    };


    preload()
    {
        this.quadtree_shader = loadShader(
            "engine/render/shaders/screenquad.vs",
            "engine/render/shaders/quadtree.fs"
        );
    };


    setup()
    {
        createCanvas(this.res_x, this.res_y, WEBGL);
        frameRate(60);
        textureWrap(REPEAT);

        this.quadtree = new Quadtree(32.0, 1.0);
        this.quadtree.nodegroups.mapBuffer();
        this.quadtree.insert(new vec2(500, 500), 2.0);
        this.quadtree.nodegroups.unmapBuffer();
    };


    first = 0;

    draw()
    {
        translate(-500, -500);
        background(200);

        shader(this.quadtree_shader);
        this.quadtree_shader.setUniform("un_mouse", [mouseX, mouseY]);
        this.quadtree_shader.setUniform("un_quadtree", this.quadtree.nodegroups.computebuffer.p5data().color);
        rect(0, 0, this.res_x, this.res_y);
    };
};



