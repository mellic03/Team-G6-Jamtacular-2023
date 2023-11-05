


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
    return (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)
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