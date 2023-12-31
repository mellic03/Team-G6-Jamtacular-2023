
const COMPUTEBUFFER_UNSIGNED_BYTE  = 0;
const COMPUTEBUFFER_FLOAT          = 1;
const COMPUTEBUFFER_HALF_FLOAT     = 2;

class ComputeBuffer
{
    w; h;
    dtype;
    buffer = null;

    constructor( w, h, render_context, dtype=COMPUTEBUFFER_FLOAT )
    {
        this.w = w;
        this.h = h;
        this.dtype = dtype;

        if (dtype == COMPUTEBUFFER_FLOAT)
        {
            this.buffer = render_context.createFramebuffer(
                {
                    width: w,
                    height: h,
                    density: 1,
                    format: FLOAT,
                    textureFiltering: NEAREST
                }
            );
        }

        else if (dtype == COMPUTEBUFFER_UNSIGNED_BYTE)
        {
            this.buffer = render_context.createFramebuffer(
                {
                    width: w,
                    height: h,
                    density: 1,
                    format: FLOAT,
                    textureFiltering: NEAREST
                }
            );
        }

    };

    readBuffer()
    {
        return this.buffer.pixels;
    };

    mapBuffer()
    {
        this.buffer.loadPixels();
        return this.buffer.pixels;
    };

    data()
    {
        return this.buffer.color;
    };

    unmapBuffer()
    {
        this.buffer.updatePixels();
    };

    toFile( filename )
    {
        // this.buffer.loadPixels();
        // saveJSON(JSON.stringify(this.buffer.pixels), "ree.json");
        // this.buffer.updatePixels();
    };
};

