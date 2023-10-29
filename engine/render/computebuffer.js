class ComputeBuffer
{
    framebuffer = null;
    w; h;


    constructor( w, h )
    {
        this.w = w;  this.h = h;
        this.framebuffer = createFramebuffer(
            {
                width: w,
                height: h,
                density: 1,
                format: FLOAT
            }
        );
    };


    mapBuffer()
    {
        this.framebuffer.loadPixels();
        return this.framebuffer.pixels;
    };

    p5data()
    {
        return this.framebuffer;
    };

    unmapBuffer()
    {
        this.framebuffer.updatePixels();
    };
};
