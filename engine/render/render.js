
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

let span = 32.0;



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
        frameRate(122);
        textureWrap(CLAMP);

        this.quadtree = new Quadtree(this.res_x, 2.0, 256);

        this.quadtree.nodegroups.mapBuffer();
        // this.quadtree.insert(+60, -60, 1.0);
        // this.quadtree.insert(-60, +60, 1.0);
        // this.quadtree.insert(-60, -60, 1.0);
        // this.quadtree.insert(+60, +60, 1.0);

        // this.quadtree.insert(286, 266, 1.0);
        // this.quadtree.insert(386, 266, 1.0);

        for (let i=0; i<10000; i++)
        {
            const x = random(0, this.res_x) - this.res_x/2;
            const y = random(0, this.res_y) - this.res_y/2;

            this.quadtree.insert(x, y, 1, 16.0);
        }
        this.quadtree.nodegroups.unmapBuffer();

        // this.quadtree.print();
    };



    draw()
    {
        background(200);
        noStroke();

        shader(this.quadtree_shader);
        this.quadtree_shader.setUniform("un_quadtree", this.quadtree.buffer());
        this.quadtree_shader.setUniform("mouseX", mouseX-512);
        this.quadtree_shader.setUniform("mouseY", mouseY-512);
        rect(0, 0, this.res_x, this.res_y);
    
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


        // this.quadtree.nodegroups.mapBuffer();
        // this.quadtree.insert(mouseX-512, mouseY-512, 1, span);
        // this.quadtree.nodegroups.unmapBuffer();
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
