
function dowith_probability( p, callback )
{
    if (p > random(0, 1))
    {
        callback();
    }
}


/** Random number between 0-1 which almost follows a normal distribution.
 */
function basicallyNormalDistribution( sigma=1 )
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
    const temp = a;
    a = b;
    b = temp;
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

