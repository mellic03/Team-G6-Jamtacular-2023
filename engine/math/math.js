


function velocityDampening( drag, dx, dy )
{
    const magSq = dx*dx + dy*dy;

    let dampening = (1.0 - drag) / (1.0 + magSq);
    dampening = min(dampening, 0.9);

    dx *= dampening;
    dy *= dampening;

    return [dx, dy];
}


function clamp( n, low, high )
{
    return min(high, max(n, low));
}

