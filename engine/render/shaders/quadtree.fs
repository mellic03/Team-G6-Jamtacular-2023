#version 300 es

precision mediump float;

out vec4 fsout_frag_color;
in vec2 fsin_texcoord;


#define QUADTREE_BUFFER_WIDTH 256
#define QUADTREE_SPAN 1024
#define QUADTREE_HALF_SPAN (QUADTREE_SPAN / 2)
#define VIEWPORT_W 1024
#define VIEWPORT_H 1024

uniform sampler2D un_quadtree;
uniform vec2 un_quadtree_pos;
uniform vec2 un_view_pos;


#define BLOCK_AIR   0
#define BLOCK_GRASS 1
#define BLOCK_DIRT  2
#define BLOCK_GOLD  3


vec3 blocktype_color( int blocktype )
{
    switch (blocktype)
    {
        default:           return vec3(1.0, 0.0, 0.0);
        case BLOCK_AIR:    return vec3(0.05);
        case BLOCK_GRASS:  return vec3(100.0/255.0, 155.0/255.0, 86.0/255.0);
        case BLOCK_DIRT:   return vec3(177.0/255.0, 127.0/255.0, 88.0/255.0);
        case BLOCK_GOLD:   return vec3(0.86, 0.65, 0.07);
    }
}


float blocktype_variation( int blocktype )
{
    switch (blocktype)
    {
        default:           return 0.0;
        case BLOCK_AIR:    return 0.05;
        case BLOCK_GRASS:  return 0.02;
        case BLOCK_DIRT:   return 0.1;
        case BLOCK_GOLD:   return 0.3;
    }
}


float blocktype_coarseness( int blocktype )
{
    switch (blocktype)
    {
        default:           return 1.0 - 0.0;
        case BLOCK_AIR:    return 1.0 - 0.8;
        case BLOCK_GRASS:  return 1.0 - 0.95;
        case BLOCK_DIRT:   return 1.0 - 0.8;
        case BLOCK_GOLD:   return 1.0 - 0.7;
    }
}

struct QuadNode
{
    int children_id, blocktype;
    float variation;
};


ivec2 uv_to_texel( vec2 uv )
{
    return ivec2( float(QUADTREE_BUFFER_WIDTH) * uv );
}


vec2 uv_to_screen( vec2 uv )
{
    uv.y = 1.0 - uv.y;
    uv -= 0.5;

    return vec2(VIEWPORT_W, VIEWPORT_H) * uv;
}


ivec2 xy_from_idx( int idx )
{
    return ivec2(idx % QUADTREE_BUFFER_WIDTH, idx / QUADTREE_BUFFER_WIDTH);
}


QuadNode node_from_texture( int group_id, int quadrant, sampler2D tex )
{
    int idx = 4*group_id + quadrant;
    vec4 data = texelFetch(tex, xy_from_idx(idx), 0);

    QuadNode node;

    node.blocktype   = int(data.x);
    node.children_id = int(data.y);
    node.variation   = data.z;

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
    vec2 center  = vec2(0.0, 0.0);
    float span   = float(QUADTREE_SPAN);

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


float rand( vec2 seed )
{
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
}


vec3 render_quadtree( vec2 position )
{
    QuadNode node = get_quadnode(position);
    
    vec2 ree = vec2(0.0);

    if (node.blocktype == 0)
    {
        ree = 0.5*un_view_pos;
    }

    float coarseness = blocktype_coarseness(node.blocktype);
    float intensity = rand(vec2(ivec2(coarseness*(position - ree))));
    float variation = blocktype_variation(node.blocktype);

    return blocktype_color(node.blocktype) + intensity*variation;
}


vec3 render_buffer( vec2 uv )
{
    ivec2 position = uv_to_texel(uv);
    return texelFetch(un_quadtree, position, 0).rgb;
}


void main()
{
    vec2 uv = fsin_texcoord.xy;

    vec2 position = uv_to_screen(uv) + un_view_pos - un_quadtree_pos;
    vec3 color = render_quadtree(position);


    float half_span = float(QUADTREE_HALF_SPAN);

    if (position.x < -half_span || position.x > half_span)
    {
        // color = vec3(0.0);
        discard;
    }
    if (position.y < -half_span || position.y > half_span)
    {
        // color = vec3(0.0);
        discard;
    }

    // vec3 color2 = render_buffer(uv);
    // if (color2.x + color2.y + color2.z > 0.0)
    // {
    //     color = color2;
    // }

    fsout_frag_color = vec4(color, 1.0);
}