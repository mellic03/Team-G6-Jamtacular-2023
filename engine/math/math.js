
function dowith_probability( p, callback )
{
    if (p > random(0, 1))
    {
        callback();
    }
}


/** Random number between 0-1 which almost follows a normal distribution.
 */
function abnormalDist( sigma=1 )
{
    let total = 0.0;

    for (let i=1; i<=sigma; i++)
    {
        total += random(-1/i, +1/i);
    }

    return total / sigma;
};


function velocityDampening( drag, dx, dy )
{
    const magSq = dx*dx + dy*dy;

    let dampening = (1.0 - drag) / (1.0 + magSq);
    dampening = min(dampening, 0.9);

    dx *= dampening;
    dy *= dampening;

    return [dx, dy];
}


function distance2( x1, y1, x2, y2 )
{
    return (x1-x2)**2 + (y1-y2)**2;
}


function clamp( n, low, high )
{
    return min(high, max(n, low));
}


function swap( a, b )
{
    [a, b] = [b, a];
}


function point_line_dist_SQ( px, py, x1, y1, x2, y2 )
{
    const numerator = (x2-x1)*(y1-py) - (x1-px)*(y2-y1);
    const denominator = (x2-x1)**2 + (y2-y1)**2;

    return numerator**2 / denominator;
}


function point_line_dist( px, py, x1, y1, x2, y2 )
{
    const numerator = abs( (x2-x1)*(y1-py) - (x1-px)*(y2-y1) );
    const denominator = sqrt( (x2-x1)**2 + (y2-y1)**2 );

    return numerator / denominator;
}



function swept_circle( x1, y1, dx1, dy1, r1, x2, y2, dx2, ry2, r2 )
{
    
}




function point_in_AABB( px, py, bx, by, bw, bh )
{
    const half_w = bw/2;
    const half_h = bh/2;

    if (px < bx-half_w || px > bx+half_w)
    {
        return false;
    }

    if (py < by-half_h || py > by+half_h)
    {
        return false;
    }

    return true;
}
