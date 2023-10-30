#version 300 es

precision highp float;

out vec4 fsout_frag_color;

in vec2 fsin_texcoord;


#define QUADTREE_BUFFER_SIZE 128
#define QUADTREE_SCREEN_SIZE 1024

uniform sampler2D un_quadtree;
uniform vec2 un_view_pos;


struct QuadNode
{
    int children_id, blocktype;
};


ivec2 uv_to_texel( vec2 uv )
{
    return ivec2( float(QUADTREE_BUFFER_SIZE) * uv );
}


vec2 uv_to_screen( vec2 uv )
{
    uv.y = 1.0 - uv.y;
    uv -= 0.5;

    return float(QUADTREE_SCREEN_SIZE) * uv;
}


ivec2 xy_from_idx( int idx )
{
    return ivec2(idx % QUADTREE_BUFFER_SIZE, idx / QUADTREE_BUFFER_SIZE);
}


QuadNode node_from_texture( int group_id, int quadrant, sampler2D tex )
{
    int idx = 4*group_id + quadrant;
    vec4 data = texelFetch(tex, xy_from_idx(idx), 0);

    QuadNode node;

    node.blocktype   = int(data.x);
    node.children_id = int(data.y);

    return node;
}


int get_quadrant( vec2 pos, vec2 center )
{
    int quadrant = 0;

    // quadrant = (pos.x < center.x) ? quadrant | 1 : quadrant;
    // quadrant = (pos.y < center.y) ? quadrant | 2 : quadrant;

    if (pos.x < center.x) { quadrant |= 1; };
    if (pos.y < center.y) { quadrant |= 2; };

    return quadrant;
}


vec2 get_offset( int quadrant, vec2 center, float span )
{
    vec2 offset;

    offset.x = (quadrant & 1) == 0 ? +span/4.0 : -span/4.0;
    offset.y = (quadrant & 2) == 0 ? +span/4.0 : -span/4.0;

    return offset;
}


QuadNode get_quadnode( vec2 pos )
{
    highp vec2 center  = vec2(0.0, 0.0);
    highp float span   = float(QUADTREE_SCREEN_SIZE);

    int group_id = 0;
    int quadrant = get_quadrant(pos, center);

    QuadNode node = node_from_texture(group_id, quadrant, un_quadtree);

    center += get_offset(quadrant, center, span);
    span /= 2.0;

    while (node.children_id > 0)
    {
        quadrant = get_quadrant(pos, center);

        group_id = node.children_id;
        node = node_from_texture(group_id, quadrant, un_quadtree);

        center += get_offset(quadrant, center, span);
        span /= 2.0;
    }

    return node;
}


vec3 render_quadtree( vec2 position )
{
    QuadNode node = get_quadnode(position);

    vec3 color = vec3(0.0);

    if (node.blocktype == 100)
    {
        color = vec3(1.0, 0.0, 0.0);
    }

    else if (node.blocktype > 0)
    {
        color = vec3(0.0);
    }

    else
    {
        color = vec3(0.8);
    }

    return color;
}


vec3 render_buffer( vec2 uv )
{
    ivec2 position = uv_to_texel(uv);
    return texelFetch(un_quadtree, position, 0).rgb;
}



uniform float mouseX;
uniform float mouseY;


void main()
{
    vec2 uv = fsin_texcoord.xy;

    vec2 position = uv_to_screen(uv);
    vec3 color = render_quadtree(position);
    vec3 color2 = render_buffer(uv);

    if (color2.x + color2.y + color2.z > 0.0)
    {
        color = color2;
    }


    fsout_frag_color = vec4(color, 1.0);
    // fsout_frag_color = vec4(vec3(dist) / 1024.0, 1.0);
    // fsout_frag_color = vec4(vec3(abs(uv.x + uv.y)) / 2.0, 1.0);
}