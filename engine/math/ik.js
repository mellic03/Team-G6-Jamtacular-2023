
/**
 * @param start [ x, y ]
 * @param ab    distance between start and mid.
 * @param bc    distance between mid and end.
 * @param end   [ x, y ]
 * 
 * @returns [ x, y ] of mid.
 */
function solveIK(start, AB, BC, end)
{
    const AC = vec2_mag(vec2_sub(start, end));


    // a^2 = b^2 + c^2 - 2*b*c*cos(a)
    // a = cos^{-1}(a^2 - b^2 - c^2) / (2*b*c)

    // B = 180 - b
    // A =


}

