#version 300 es

precision mediump float;

out vec4 fsout_frag_color;
in vec2 fsin_texcoord;



struct Pointlight
{
    vec2 position;
    vec3 diffuse;
    float constant, linear, quadratic;
    float s_constant, s_linear, s_quadratic;
    float s_radius;
    float radius;
};


uniform Pointlight un_pointlight_0;
uniform Pointlight un_pointlight_1;
uniform Pointlight un_pointlight_2;


uniform int QUADTREE_BUFFER_WIDTH;
uniform int QUADTREE_SPAN;
uniform int QUADTREE_HALF_SPAN;
#define VIEWPORT_W 1024
#define VIEWPORT_H 1024


uniform sampler2D un_quadtree0;
uniform sampler2D un_quadtree1;
uniform sampler2D un_quadtree2;
uniform sampler2D un_quadtree3;

uniform vec2 un_quadtree_pos0;
uniform vec2 un_quadtree_pos1;
uniform vec2 un_quadtree_pos2;
uniform vec2 un_quadtree_pos3;

uniform vec2 un_view_pos;
uniform vec2 un_player_pos;


#define BLOCK_AIR     0
#define BLOCK_GRASS   1
#define BLOCK_DIRT    2
#define BLOCK_STONE   3
#define BLOCK_SILVER  4
#define BLOCK_GOLD    5
#define BLOCK_BEDROCK 6


vec3 blocktype_color( int blocktype )
{
    switch (blocktype)
    {
        default:             return vec3(1.0, 0.0, 0.0);
        case BLOCK_AIR:      return vec3(0.9);
        case BLOCK_GRASS:    return vec3(100.0/255.0, 155.0/255.0, 86.0/255.0);
        case BLOCK_DIRT:     return vec3(177.0/255.0, 127.0/255.0, 88.0/255.0);
        case BLOCK_STONE:    return vec3(0.67, 0.69, 0.71);
        case BLOCK_SILVER:   return vec3(0.67, 0.69, 0.71);
        case BLOCK_GOLD:     return vec3(0.86, 0.65, 0.07);
        case BLOCK_BEDROCK:  return vec3(0.25);
    }
}

float blocktype_variation( int blocktype )
{
    switch (blocktype)
    {
        default:             return 0.0;
        case BLOCK_AIR:      return 0.5;
        case BLOCK_GRASS:    return 0.2;
        case BLOCK_DIRT:     return 0.1;
        case BLOCK_STONE:    return 0.1;
        case BLOCK_SILVER:   return 0.3;
        case BLOCK_GOLD:     return 0.1;
        case BLOCK_BEDROCK:  return 0.05;
    }
}

float blocktype_coarseness( int blocktype )
{
    switch (blocktype)
    {
        default:             return 1.0 - 0.0;
        case BLOCK_AIR:      return 1.0 - 0.85;
        case BLOCK_GRASS:    return 1.0 - 0.95;
        case BLOCK_DIRT:     return 1.0 - 0.8;
        case BLOCK_STONE:    return 1.0 - 0.85;
        case BLOCK_SILVER:   return 1.0 - 0.55;
        case BLOCK_GOLD:     return 1.0 - 0.75;
        case BLOCK_BEDROCK:  return 1.0 - 0.85;
    }
}


float blocktype_parallax( int blocktype )
{
    switch (blocktype)
    {
        default:           return 0.0;
        case BLOCK_AIR:    return 0.1;
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


QuadNode node_from_texture( int group_id, int quadrant, int quadtree_idx )
{
    int idx = 4*group_id + quadrant;
    ivec2 uv = xy_from_idx(idx);

    vec4 data;

    switch (quadtree_idx)
    {
        default:
        case 0: data = texelFetch(un_quadtree0, uv, 0); break;
        case 1: data = texelFetch(un_quadtree1, uv, 0); break;
        case 2: data = texelFetch(un_quadtree2, uv, 0); break;
        case 3: data = texelFetch(un_quadtree3, uv, 0); break;
    }

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


int get_quadtree_idx( vec2 pos )
{
    float dist0 = distance(pos, un_quadtree_pos0);
    float dist1 = distance(pos, un_quadtree_pos1);
    float dist2 = distance(pos, un_quadtree_pos2);
    float dist3 = distance(pos, un_quadtree_pos3);

    float min_dist = min(dist0, min(dist1, min(dist2, dist3)));

    if (min_dist == dist0)
    {
        return 0;
    }

    if (min_dist == dist1)
    {
        return 1;
    }

    if (min_dist == dist2)
    {
        return 2;
    }

    if (min_dist == dist3)
    {
        return 3;
    }


    return -1;
}


vec2 quadtree_pos( int idx )
{
    switch (idx)
    {
        default:
        case 0: return un_quadtree_pos0;
        case 1: return un_quadtree_pos1;
        case 2: return un_quadtree_pos2;
        case 3: return un_quadtree_pos3;
    }
}


QuadNode get_quadnode( vec2 pos, int quadtree_idx )
{
    vec2 center  = quadtree_pos(quadtree_idx);
    float span   = float(QUADTREE_SPAN);

    int group_id = 0;
    int quadrant = get_quadrant(pos, center);

    QuadNode node = node_from_texture(group_id, quadrant, quadtree_idx);

    center += get_offset(quadrant, center, span);
    span /= 2.0;

    while (node.children_id > 0)
    {
        quadrant = get_quadrant(pos, center);

        group_id = node.children_id;

        node = node_from_texture(group_id, quadrant, quadtree_idx);

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

    float lengthSq_h = hdx*hdx + hdy*hdy;
    float lengthSq_v = vdx*vdx + vdy*vdy;
    float EPSILON  = 0.07;

    float result = (lengthSq_h < lengthSq_v) ? sqrt(lengthSq_h) : sqrt(lengthSq_v);

    return result + EPSILON;
}


float attenuation_function( float dist, float constant, float linear, float quadratic, float radius )
{
    float radius_falloff = 1.0 - clamp(dist / radius, 0.0, 1.0);

    dist /= 512.0;
    float attenuation = radius_falloff / (constant + linear*dist + quadratic*dist*dist);

    return attenuation;
}



#define AIR_CONSTANT  1.0
#define AIR_LINEAR    1.0
#define AIR_QUADRATIC 1.0

#define SOLID_CONSTANT  1.0
#define SOLID_LINEAR    1.0
#define SOLID_QUADRATIC 1.0



float trace_direct_multiTree( vec2 start, vec2 end, int start_idx, Pointlight light )
{
    int end_idx = get_quadtree_idx(end);

    vec2 ray_pos = start;
    vec2 ray_dir = normalize(end - start);
    float ray_length = 0.0;

    float dist = distance(start, end);

    QuadNode end_node = get_quadnode(end, end_idx);
    QuadNode node = get_quadnode(ray_pos, start_idx);


    if (node.blocktype > 0)
    {
        return attenuation_function(dist, light.s_constant, light.s_linear, light.s_quadratic, light.radius);
    }

    for (int i=0; i<64; i++)
    {
        if (node.idx == end_node.idx)
        {
            return attenuation_function(dist, light.constant, light.linear, light.quadratic, light.radius);
        }

        float step_size = next_step(ray_pos, ray_dir, node.center, node.span);
        ray_length += step_size;
        ray_pos += step_size*ray_dir;

        int quadtree_idx = get_quadtree_idx(ray_pos);
        node = get_quadnode(ray_pos, quadtree_idx);

        if (node.blocktype > 0)
        {
            return 0.0;
        }
    }

    return 1.0;
}


uniform float un_increment;

#define I_SAMPLES 3
#define F_SAMPLES 3.0


float trace_soft( vec2 frag_pos, int frag_quadtree_idx, Pointlight light )
{
    vec2 dir = light.position - frag_pos;
    vec2 tangent = normalize(vec2(-dir.y, dir.x));

    float offset    = -light.s_radius;
    float step_size = (2.0*light.s_radius) / F_SAMPLES;

    float direct = 0.0;

    for (int i=0; i<I_SAMPLES; i++)
    {
        float variance = step_size * rand(frag_pos);
        vec2 offset_pos = light.position + offset*tangent + variance*tangent;

        direct += trace_direct_multiTree(frag_pos, offset_pos, frag_quadtree_idx, light);
        offset += step_size;
    }

    return direct / F_SAMPLES;
}


vec3 render_quadtree()
{
    vec2 worldspace = un_view_pos + uv_to_screen(fsin_texcoord);
    int frag_quadtree_idx = get_quadtree_idx(worldspace);
    int view_quadtree_idx = get_quadtree_idx(un_view_pos);

    vec2 screenspace = worldspace - quadtree_pos(frag_quadtree_idx);

    QuadNode node = get_quadnode(worldspace, frag_quadtree_idx);
    
    float coarseness = blocktype_coarseness(node.blocktype);
    vec2  parallax   = blocktype_parallax(node.blocktype) * un_view_pos;
    float intensity  = rand(vec2(ivec2(coarseness*(worldspace - parallax))));
    float variation  = blocktype_variation(node.blocktype);

    float direct_0 = trace_soft(worldspace, frag_quadtree_idx, un_pointlight_0);
    float direct_1 = trace_soft(worldspace, frag_quadtree_idx, un_pointlight_1);
    float direct_2 = trace_soft(worldspace, frag_quadtree_idx, un_pointlight_2);

    vec3 illumination_0 = direct_0 * un_pointlight_0.diffuse;
    vec3 illumination_1 = direct_1 * un_pointlight_1.diffuse;
    vec3 illumination_2 = direct_2 * un_pointlight_2.diffuse;

    vec3 illumination = illumination_0 + illumination_1 + illumination_2;

    return illumination * (blocktype_color(node.blocktype) + intensity*variation);
}




const mat3 ACESInputMat = mat3(
    0.59719, 0.35458, 0.04823,
    0.07600, 0.90834, 0.01566,
    0.02840, 0.13383, 0.83777
);

// ODT_SAT => XYZ => D60_2_D65 => sRGB
const mat3 ACESOutputMat = mat3(
     1.60475, -0.53108, -0.07367,
    -0.10208,  1.10813, -0.00605,
    -0.00327, -0.07276,  1.07602
);

vec3 RRTAndODTFit(vec3 v)
{
    vec3 a = v * (v + 0.0245786) - 0.000090537;
    vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081;
    return a / b;
}

vec3 ACESFitted(vec3 color)
{
    color = color * ACESInputMat;

    // Apply RRT and ODT
    color = RRTAndODTFit(color);

    color = color * ACESOutputMat;

    // Clamp to [0, 1]
    color = clamp(color, 0.0, 1.0);

    return color;
}


void main()
{
    vec2 screenspace = uv_to_screen(fsin_texcoord.xy) + un_view_pos;
    float half_span = float(QUADTREE_HALF_SPAN);

    vec3 color = render_quadtree();
    color = ACESFitted(color);
  
    fsout_frag_color = vec4(color, 1.0);
}



