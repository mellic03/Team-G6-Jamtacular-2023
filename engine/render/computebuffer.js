
const COMPUTEBUFFER_UNSIGNED_BYTE  = 0;
const COMPUTEBUFFER_FLOAT          = 1;
const COMPUTEBUFFER_HALF_FLOAT     = 2;


class ComputeBuffer
{
    w; h;
    dtype;
    buffer = null;


    constructor( w, h, dtype=COMPUTEBUFFER_FLOAT )
    {
        console.log("[ComputeBuffer::ComputeBuffer] wxh = " + w + "x" + h);

        this.w = w;
        this.h = h;
        this.dtype = dtype;

        if (dtype == COMPUTEBUFFER_FLOAT)
        {
            this.buffer = createFramebuffer(
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
            this.buffer = createFramebuffer(
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
};
