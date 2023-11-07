

class VoxelSprite
{
    image;

    x = 0;
    y = 0;
    last_x = 0;
    last_y = 0;

    rotation = 0;
    last_rotation = 0;


    constructor( img )
    {
        this.image = img;
        this.image.loadPixels();
    };


    __draw()
    {
        const terrain = engine.getSystem("terrain");
    
        const lcosr = cos(this.last_rotation);
        const lsinr = sin(this.last_rotation);
        const cosr = cos(this.rotation);
        const sinr = sin(this.rotation);

        const pixels = this.image.pixels;

        for (let row=0; row<16; row++)
        {
            for (let col=0; col<16; col++)
            {
                const idx = 4*(16*row + col);
                
                if (pixels[idx] > 0)
                {
                    let px = (8*(col-8))*lcosr - (8*(row-8))*lsinr;
                    let py = (8*(row-8))*lcosr + (8*(col-8))*lsinr;
                    terrain.placeBlock(this.last_x+px, this.last_y+py, 0, 8);
                    
                    px = (8*(col-8))*cosr - (8*(row-8))*sinr;
                    py = (8*(row-8))*cosr + (8*(col-8))*sinr;
                    terrain.placeBlock(this.x+px, this.y+py, 2, 8);
                }
            }
        }

        this.last_rotation = valueof(this.rotation);
        this.last_x = valueof(this.x);
        this.last_y = valueof(this.y);
    };


    rotate( r )
    {
        this.rotation += r;
    };


    draw( x, y )
    {
        this.x = x;
        this.y = y;

        const terrain = engine.getSystem("terrain");
        terrain.drawVoxelSprite(this);
    };

};


