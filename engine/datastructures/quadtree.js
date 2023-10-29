"use strict";


class vec2
{
    constructor(x=0, y=0)
    {
        this.x = x;
        this.y = y;
    };

    reset(x=0, y=0)
    {
        this.x = x;
        this.y = y;
    };
}


const GROUPSIZE = 16;
const NODESIZE  = 4;



/** Non-generic version of the Allocator class.
 *  Allocates four-element arrays used for quadtree rendering.
 * 
 *  node = [x, y, z, w]
 *  
 *  nodegroup = [ node, node, node, node ]
 *  nodegroup = [ x, y, z, w,  x, y, z, w,  x, y, z, w,  x, y, z, w ]
 * 
 *  node = [ blocktype, children_id, z, w ]
 * 
 */
class QuadNode_Allocator
{
    res_x; res_y;

    computebuffer;
    bufferdata = null;

    nodegroups_allocated = 0;
    unused_group_ids = [];

    constructor()
    {
        this.res_x = 1024;
        this.res_y = 1024;
        this.computebuffer = new ComputeBuffer(this.res_x, this.res_y);
        
        // Initialize all nodes
        this.mapBuffer();
    
        const num_nodes   = floor(this.res_x * this.res_y);
        const num_groups  = floor(num_nodes / 4);

        for (let i=0; i<num_nodes; i++)
        {
            const idx = NODESIZE*i;

            this.bufferdata[idx+0] = 0.2;
            this.bufferdata[idx+1] = 0.2;
            this.bufferdata[idx+2] = 1.0;
            this.bufferdata[idx+3] = 1.0;
        }

        this.unmapBuffer();
    };

    
    mapBuffer()
    {
        this.bufferdata = this.computebuffer.mapBuffer();
    };


    unmapBuffer()
    {
        this.computebuffer.unmapBuffer();
    }


    clearNodeGroup( start_idx )
    {
        for (let i=0; i<8; i++)
        {
            this.bufferdata[start_idx + NODESIZE*i + 0] =  0.0; // blocktype
            this.bufferdata[start_idx + NODESIZE*i + 1] =  0.0; // children_id
            this.bufferdata[start_idx + NODESIZE*i + 2] =  0.0; // z
            this.bufferdata[start_idx + NODESIZE*i + 3] =  0.0; // w
        }
    };


    create()
    {
        let group_id = -1;

        if (this.unused_group_ids.length > 0)
        {
            group_id = this.unused_group_ids.pop();
        
            const idx = GROUPSIZE*group_id;
            this.clearNodeGroup(idx);
        }

        else
        {
            group_id = this.nodegroups_allocated;

            const idx = GROUPSIZE*group_id;
            this.clearNodeGroup(idx);
            
            this.nodegroups_allocated += 1;
        }

        if (group_id == -1)
        {
            console.log("[QuadNode_Allocator::create] WTF???????????????");
        }

        return group_id;
    };


    getGroup( group_id )
    {
        const idx = GROUPSIZE*group_id;
        return this.bufferdata[idx];
    };

    get_blocktype( group_id, quadrant )
    {
        const idx = GROUPSIZE*group_id + NODESIZE*quadrant;
        return this.bufferdata[idx + 0];
    };

    get_children_id( group_id, quadrant )
    {
        const idx = GROUPSIZE*group_id + NODESIZE*quadrant;
        return this.bufferdata[idx + 1];
    };


    destroyGroup( group_id )
    {
        this.unused_ids.push(group_id);
    };
};




class Quadtree
{
    nodegroups;

    span;
    root_id;

    constructor( max_span, min_span )
    {
        this.MAX_SPAN = max_span;
        this.MIN_SPAN = min_span;

        this.nodegroups = new QuadNode_Allocator();
        // this.nodegroups.mapBuffer();
        // this.root_id = this.nodegroups.create();
        // this.nodegroups.unmapBuffer();
    };


    _get_quadrant( point, center )
    {
        let quadrant = int(0);

        if (point.x < center.x) { quadrant |= 1 };
        if (point.y < center.y) { quadrant |= 2 };

        return quadrant;
    };


    _shift_center( quadrant, center, span )
    {
        let offset = new vec2(0.0, 0.0);

        offset.x = ((quadrant & 1) == 0) ? span/4.0 : -span/4.0;
        offset.y = ((quadrant & 2) == 0) ? span/4.0 : -span/4.0;

        return new vec2(center.x+offset.x, center.y+offset.y);
    };


    _give_children( group_id )
    {

    };


    _insert( group_id, position, center, blocktype, current_span )
    {
        if (current_span <= this.MIN_SPAN)
        {
            return;
        }

        const quadrant = this._get_quadrant(position, center);
        const new_center = this._shift_center(quadrant, center, current_span);

        console.log("blocktype: " + this.nodegroups.get_blocktype(0, 0));
        console.log("children: " + this.nodegroups.get_children_id(0, 0));

        // if ( this.nodegroups.getNode(group_id, quadrant)[2] == -1.0 )
        // {
        // }

    };


    insert( position, blocktype=1 )
    {
        const center = new vec2(this.MAX_SPAN/2, this.MAX_SPAN/2);
        this._insert( this.root_id, position, center, blocktype, this.MAX_SPAN);
    };


    buffer()
    {
        return this.nodegroups;
    };
};
