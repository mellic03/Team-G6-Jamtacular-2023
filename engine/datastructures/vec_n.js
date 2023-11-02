
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


function vec2_mult( v, s )
{
    return [ s*v[0], s*v[1] ];
}


function vec2_add( u, v )
{
    return [ u[0]+v[0], u[1]+v[1] ];
}

function vec2_multadd( u, v, s )
{
    return [ u[0] + s*v[0], u[1] + s*v[1] ];
}


function vec2_sub( u, v )
{
    return [ u[0]-v[0], u[1]-v[1] ];
}


function vec2_dot( u, v )
{
    return u.x * v.x  +  u.y * v.y;
}


function vec2_magSq( v )
{
    return v[0]*v[0] + v[1]*v[1];
}


function vec2_mag( v )
{
    return Math.sqrt(v[0]*v[0] + v[1]*v[1]);
}


function vec2_normalize( v )
{
    const mag = vec2_mag(v);
    return [ v[0]/mag, v[1]/mag ];
}


// function vec2_reflect( dx, dy, nx, ny )
// {
//     let mag = Math.sqrt(nx**2 + dx**2);
//     nx /= mag;
//     ny /= mag;

//     let dot = dx*nx + dy*ny;

//     let rx = dx - 2*dot*nx;
//     let ry = dy - 2*dot*ny;

//     return [rx, ry];
// }

