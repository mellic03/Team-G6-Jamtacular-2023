#version 300 es

precision mediump float;

out vec4 fsout_frag_color;
in vec2 fsin_texcoord;


uniform int QUADTREE_BUFFER_WIDTH;
uniform int QUADTREE_SPAN;
uniform int QUADTREE_HALF_SPAN;
#define VIEWPORT_W 1024
#define VIEWPORT_H 1024

uniform sampler2D un_quadtree;
uniform vec2 un_quadtree_pos;

uniform sampler2D un_quadtree0;
uniform sampler2D un_quadtree1;
uniform sampler2D un_quadtree2;
uniform sampler2D un_quadtree3;

uniform vec2 un_quadtree_pos0;
uniform vec2 un_quadtree_pos1;
uniform vec2 un_quadtree_pos2;
uniform vec2 un_quadtree_pos3;

uniform vec2 un_view_pos;


#define BLOCK_AIR     0
#define BLOCK_GRASS   1
#define BLOCK_DIRT    2
#define BLOCK_STONE   3
#define BLOCK_SILVER  4
#define BLOCK_GOLD    5


vec3 blocktype_color( int blocktype )
{
    switch (blocktype)
    {
        default:           return vec3(1.0, 0.0, 0.0);
        case BLOCK_AIR:    return vec3(0.05);
        case BLOCK_GRASS:  return vec3(100.0/255.0, 155.0/255.0, 86.0/255.0);
        case BLOCK_DIRT:   return vec3(177.0/255.0, 127.0/255.0, 88.0/255.0);
        case BLOCK_STONE:  return vec3(0.67, 0.69, 0.71);
        case BLOCK_SILVER: return vec3(0.67, 0.69, 0.71);
        case BLOCK_GOLD:   return vec3(0.86, 0.65, 0.07);
    }
}

float blocktype_variation( int blocktype )
{
    switch (blocktype)
    {
        default:           return 0.0;
        case BLOCK_AIR:    return 0.05;
        case BLOCK_GRASS:  return 0.2;
        case BLOCK_DIRT:   return 0.1;
        case BLOCK_STONE:  return 0.1;
        case BLOCK_SILVER: return 0.3;
        case BLOCK_GOLD:   return 0.3;
    }
}

float blocktype_coarseness( int blocktype )
{
    switch (blocktype)
    {
        default:           return 1.0 - 0.0;
        case BLOCK_AIR:    return 1.0 - 0.85;
        case BLOCK_GRASS:  return 1.0 - 0.95;
        case BLOCK_DIRT:   return 1.0 - 0.8;
        case BLOCK_STONE:  return 1.0 - 0.85;
        case BLOCK_SILVER: return 1.0 - 0.55;
        case BLOCK_GOLD:   return 1.0 - 0.55;
    }
}


float blocktype_parallax( int blocktype )
{
    switch (blocktype)
    {
        default:           return 0.0;
        case BLOCK_AIR:    return 0.5;
    }
}


struct QuadNode
{
    int idx;
    int children_id, blocktype;
    float variation;

    vec2  center;
    float span;
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


vec2 screen_to_world( vec2 screen )
{
    float world_x = un_view_pos.x + screen.x - float(VIEWPORT_W/2);
    float world_y = un_view_pos.y + screen.y - float(VIEWPORT_H/2);

    world_x = un_view_pos.x + 1024.0 * ((world_x - un_view_pos.x) / float(VIEWPORT_W));
    world_y = un_view_pos.y + 1024.0 * ((world_y - un_view_pos.y) / float(VIEWPORT_H));

    return vec2(world_x, world_y);
}


ivec2 xy_from_idx( int idx )
{
    return ivec2(idx % QUADTREE_BUFFER_WIDTH, idx / QUADTREE_BUFFER_WIDTH);
}


float rand( vec2 seed )
{
    return fract(sin(dot(seed, vec2(12.9898, 78.233))) * 43758.5453);
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
    // Determine which quadtree to use


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

    node.idx = 4*group_id + quadrant;

    node.center = center;
    node.span = span;

    return node;
}



float next_step( vec2 pos, vec2 dir, vec2 center, float span )
{
    float mx = dir.y / dir.x;
    float my = dir.x / dir.y;

    float Ax = pos.x - (span * floor(pos.x / span));
    float Ay = pos.y - (span * floor(pos.y / span));

    float dx = (dir.x > 0.0) ? span-Ax : Ax;
    float dy = (dir.y > 0.0) ? span-Ay : Ay;

    float hdx = dx;
    float hdy = dx*mx;

    float vdy = dy;
    float vdx = dy*my;

    float length2_h = hdx*hdx + hdy*hdy;
    float length2_v = vdx*vdx + vdy*vdy;
    float EPSILON  = 0.001;

    if (length2_h < length2_v)
    {
        return sqrt(length2_h) + EPSILON;
    }

    else
    {
        return sqrt(length2_v) + EPSILON;
    }

    return 0.0;
}


float attenuation_function( float dist, float constant, float linear, float quadratic )
{
    dist /= 64.0;

    return 1.0 / (constant + linear*dist + quadratic*dist*dist);
}



#define VISIBLE_CONSTANT  0.25
#define VISIBLE_LINEAR    0.05
#define VISIBLE_QUADRATIC 0.0


#define OCCLUDED_CONSTANT  2.0
#define OCCLUDED_LINEAR    0.05
#define OCCLUDED_QUADRATIC 0.2




float point_visibility( vec2 start, vec2 end )
{
    vec2 ray_pos = start;
    vec2 ray_dir = normalize(end - start);
    float ray_length = 0.0;

    float dist = distance(start, end);

    QuadNode end_node = get_quadnode(end);
    QuadNode node = get_quadnode(ray_pos);

    if (node.blocktype > 0)
    {
        return attenuation_function(dist, OCCLUDED_CONSTANT, OCCLUDED_LINEAR, OCCLUDED_QUADRATIC);
    }

    for (int i=0; i<64; i++)
    {
        if (node.idx == end_node.idx)
        {
            return attenuation_function(dist, VISIBLE_CONSTANT, VISIBLE_LINEAR, VISIBLE_QUADRATIC);
        }

        float step_size = next_step(ray_pos, ray_dir, node.center, node.span);
        ray_length += step_size;
        ray_pos += step_size*ray_dir;

        node = get_quadnode(ray_pos);

        if (node.blocktype > 0)
        {
            return attenuation_function(dist, OCCLUDED_CONSTANT, OCCLUDED_LINEAR, OCCLUDED_QUADRATIC);
        }
    }

    return 1.0;
}


uniform vec2 un_lightsource_pos_0;
uniform vec2 un_lightsource_pos_1;
vec3 un_lightsource_diffuse_0 = vec3(0.25, 1.0, 1.0);
vec3 un_lightsource_diffuse_1 = vec3(1.0, 1.0, 0.25);

uniform vec2 un_target_pos;
vec3         target_color = vec3(1.0, 1.0, 1.0);


vec3 render_quadtree( vec2 position )
{
    QuadNode node = get_quadnode(position);
    
    float coarseness = blocktype_coarseness(node.blocktype);
    vec2  parallax   = blocktype_parallax(node.blocktype) * un_view_pos;
    float intensity  = rand(vec2(ivec2(coarseness*(position - parallax))));
    float variation  = blocktype_variation(node.blocktype);

    vec2  viewpos    = un_view_pos - un_quadtree_pos;
    float visibility = point_visibility(position, viewpos);
    vec3 illumination = visibility*target_color;


    // float visibility_0 = point_visibility(position, un_lightsource_pos_0 - un_quadtree_pos);
    // vec3 illumination_0 = visibility_0*un_lightsource_diffuse_0;

    // float visibility_1 = point_visibility(position, un_lightsource_pos_1 - un_quadtree_pos);
    // vec3 illumination_1 = visibility_1*un_lightsource_diffuse_1;

    // illumination += illumination_0 + illumination_1;

    return illumination * (blocktype_color(node.blocktype) + intensity*variation);
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

    float dist = distance(fsin_texcoord, vec2(0.5, 0.5));
    float attenuation = clamp((1.0-dist) + 0.2, 0.0, 1.0);

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