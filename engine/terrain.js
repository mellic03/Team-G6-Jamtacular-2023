QUADTREE_SPAN = 4096.0;
SECTORS_X = 4;
SECTORS_Y = 1;


class TerrainSystem
{
    sectors = [  ];

    constructor()
    {

    };


    placeBlock( x, y, blocktype, size )
    {
        // First find which quadtree is responsible for the given coordinate.
        let row = 0;
        let col = 0;
        this.sectors[row][col].nodegroups.mapBuffer();
        this.sectors[row][col].insert(x, y, blocktype, size);
        this.sectors[row][col].nodegroups.unmapBuffer();
    };


    removeBlock( x, y )
    {

    };


    preload( engine )
    {

    };


    setup( engine )
    {


        let pg = engine.getSystem("render").offline_context;

        for (let row=0; row<SECTORS_Y; row++)
        {
            this.sectors.push([]);

            for (let col=0; col<SECTORS_X; col++)
            {
                let cb = new ComputeBuffer(256, 256, pg, COMPUTEBUFFER_FLOAT);
                this.sectors[row].push(new Quadtree(QUADTREE_SPAN, cb));
            }
        }
    };


    draw( engine )
    {
        const render = engine.getSystem("render");
        const pg = render.offline_context;

        pg.shader(render.quadtree_shader);
        render.quadtree_shader.setUniform("un_quadtree", this.sectors[0][0].buffer());
        render.quadtree_shader.setUniform("un_view_pos", render.view_pos);
        render.quadtree_shader.setUniform("mouseX", mouseX-512);
        render.quadtree_shader.setUniform("mouseY", mouseY-512);
        pg.rect(0, 0, render.res_x, render.res_y);

        image(pg, 0, 0, render.res_x, render.res_y);
    };

};