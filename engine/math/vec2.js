
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


function vec2_dir( end, start )
{
    return vec2_normalize(vec2_sub(end, start));
}


function vec2_tangent( dir )
{
    return [-dir[1], dir[0]];
}


function vec2_dot( u, v )
{
    return u[0]*v[0]  +  u[1]*v[1];
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

