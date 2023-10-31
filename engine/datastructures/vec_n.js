
class vec2
{
    constructor( x=0, y=0 )
    {
        this.x = x;
        this.y = y;
    };


    reset( x=0, y=0 )
    {
        this.x = x;
        this.y = y;
    };


    mag()
    {
        return Math.sqrt(this.x**2 + this.y**2);
    };


    magSq()
    {
        return this.x**2 + this.y**2;
    };


    normalize()
    {
        const MAG = this.mag();
        this.x /= MAG;
        this.y /= MAG;
    };

    clamp( a, b )
    {
        this.x = max(a, min(this.x, b));
    };

    add( vec )
    {
        this.x += vec.x;
        this.y += vec.y;
    };


    sub( vec )
    {
        this.x += vec.x;
        this.y += vec.y;
    };


    mult( s )
    {
        this.x *= s;
        this.y *= s;
    };
}



function vec2_dot( u, v )
{
    return u.x * v.x  +  u.y * v.y;
}


function reflect( dx, dy, nx, ny )
{
    let mag = Math.sqrt(nx**2 + dx**2);
    nx /= mag;
    ny /= mag;

    let dot = dx*nx + dy*ny;

    let rx = dx - 2*dot*nx;
    let ry = dy - 2*dot*ny;

    return [rx, ry];
}

