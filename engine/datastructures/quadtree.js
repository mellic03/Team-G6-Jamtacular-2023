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


const NODESIZE  = 4;
const GROUPSIZE = 16;

const BLOCKTYPE_IDX = 0;
const CHILDREN_IDX  = 1;



class QuadNode_Allocator
{
    buffer_size;

    computebuffer;
    bufferdata = null;

    nodegroups_allocated = 0;
    unused_group_ids = [];

    constructor( compute_buffer )
    {
        this.computebuffer = compute_buffer;

        // this.buffer_size = buffer_size;
        // this.computebuffer = new ComputeBuffer(
        //     buffer_size, buffer_size, COMPUTEBUFFER_FLOAT
        // );

        // Initialize all nodes
        this.mapBuffer();
    
        const num_nodes = this.res_x * this.res_y;

        for (let i=0; i<num_nodes; i++)
        {
            const idx = NODESIZE*i;

            this.bufferdata[idx+0] = 0.0;
            this.bufferdata[idx+1] = 0.0;
            this.bufferdata[idx+2] = 0.0;
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
        // this.bufferdata = null;
    }


    clearNodeGroup( group_id )
    {
        const group_idx = GROUPSIZE * group_id;

        for (let i=0; i<4; i++)
        {
            const node_idx = group_idx + NODESIZE*i;

            this.bufferdata[node_idx + BLOCKTYPE_IDX] = 0.0; // blocktype
            this.bufferdata[node_idx + CHILDREN_IDX ] = 0.0; // children_id
            this.bufferdata[node_idx + 2] = 0.5; // z
            this.bufferdata[node_idx + 3] = 1.0; // w
        }

    };


    create()
    {
        let group_id = undefined;

        if (this.unused_group_ids.length > 0)
        {
            group_id = this.unused_group_ids.pop();
        }

        else
        {
            group_id = this.nodegroups_allocated;
            this.nodegroups_allocated += 1;
        }

        if (group_id == undefined)
        {
            console.log("[QuadNode_Allocator::create] WTF???????????????");
        }

        this.clearNodeGroup(group_id);
        return group_id;
    };


    get_node_idx( group_id, quadrant )
    {
        return GROUPSIZE*group_id + NODESIZE*quadrant;
    }

    get_blocktype( group_id, quadrant )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        return this.bufferdata[idx + BLOCKTYPE_IDX];
    };

    set_blocktype( group_id, quadrant, blocktype )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        this.bufferdata[idx + BLOCKTYPE_IDX] = blocktype;
    };

    get_children_id( group_id, quadrant )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        return this.bufferdata[idx + CHILDREN_IDX];
    };

    set_children_id( group_id, quadrant, children_id )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        this.bufferdata[idx + CHILDREN_IDX] = children_id;
    };

    destroyGroup( group_id )
    {
        this.clearNodeGroup(group_id);
        this.unused_group_ids.push(group_id);
    };
};




class Quadtree
{
    nodegroups;
    MAX_SPAN;
    root_id;

    constructor( max_span, compute_buffer )
    {
        this.MAX_SPAN = max_span;

        this.nodegroups = new QuadNode_Allocator(compute_buffer);

        this.nodegroups.mapBuffer();
        this.root_id = this.nodegroups.create();
        for (let i=0; i<4; i++)
        {
            this.nodegroups.set_children_id(this.root_id, i, 0);
        }
        this.nodegroups.unmapBuffer();

        console.log("root nodegroup id: " + this.root_id);
    };


    _get_quadrant( x, y, cx, cy )
    {
        let quadrant = int(0);

        if (x < cx) { quadrant |= 1 };
        if (y < cy) { quadrant |= 2 };

        return quadrant;
    };


    _shift_center_x( quadrant, cx, span )
    {
        let offset_x = ((quadrant & 1) == 0) ? +span/4.0 : -span/4.0;
        return cx + offset_x;
    };


    _shift_center_y( quadrant, cy, span )
    {
        let offset_y = ((quadrant & 2) == 0) ? +span/4.0 : -span/4.0;
        return cy + offset_y;
    };


    _children_same( children_id )
    {
        // If any children have children, return false
        for (let i=0; i<4; i++)
        {
            if (this.nodegroups.get_children_id(children_id, i) > 0)
            {
                return false;
            }
        }

        // If any two children are not the same, return false
        for (let i=0; i<3; i++)
        {
            const b1 = this.nodegroups.get_blocktype(children_id, i);
            const b2 = this.nodegroups.get_blocktype(children_id, i+1);

            if (b1 != b2)
            {
                return false;
            }
        }

        return true;
    };


    _remove_group( group_id )
    {
        for (let i=0; i<4; i++)
        {
            const child_id = this.nodegroups.get_children_id(group_id, i);

            if (child_id > 0)
            {
                this._remove_group(child_id);
                this.nodegroups.destroyGroup(child_id);
            }
        }
    };


    _insert( group_id, x, y, cx, cy, blocktype, current_span, min_span )
    {
        const quadrant = this._get_quadrant(x, y, cx, cy);

        if (this.nodegroups.get_blocktype(group_id, quadrant) == blocktype)
        {
            return;
        }

        if (current_span < min_span)
        {
            if (this.nodegroups.get_children_id(group_id, quadrant) > 0)
            {
                let child_id = this.nodegroups.get_children_id(group_id, quadrant);
                this._remove_group(child_id);
                this.nodegroups.destroyGroup(child_id);
                this.nodegroups.set_children_id(group_id, quadrant, 0.0);
            }

            this.nodegroups.set_blocktype(group_id, quadrant, blocktype);
            this.nodegroups.set_children_id(group_id, quadrant, 0);
            return;
        }

        if (this.nodegroups.get_children_id(group_id, quadrant) == 0.0)
        {
            let children_id = this.nodegroups.create();
            this.nodegroups.set_children_id(group_id, quadrant, children_id);
        }

        let children_id = this.nodegroups.get_children_id(group_id, quadrant);
        const ncx = this._shift_center_x(quadrant, cx, current_span);
        const ncy = this._shift_center_y(quadrant, cy, current_span);

        this.nodegroups.set_blocktype(group_id, quadrant, 0);
        this._insert(children_id, x, y, ncx, ncy, blocktype, current_span/2.0, min_span);

        if (this._children_same(children_id))
        {
            this._remove_group(children_id);
            this.nodegroups.destroyGroup(children_id);
            this.nodegroups.set_children_id(group_id, quadrant, 0.0);
            this.nodegroups.set_blocktype(group_id, quadrant, blocktype);
        }
    };


    insert( x, y, blocktype, min_span )
    {
        this._insert( this.root_id, x, y, 0, 0, blocktype, this.MAX_SPAN, min_span);
    };


    __draw( group_id, cx, cy, current_span )
    {
        const half_span = current_span / 2.0;

        for (let i=0; i<4; i++)
        {
            const ncx = this._shift_center_x(i, cx, current_span);
            const ncy = this._shift_center_y(i, cy, current_span);

            if (this.nodegroups.get_children_id(group_id, i) > 0.0)
            {
                const children_id = this.nodegroups.get_children_id(group_id, i);
                this.__draw(children_id, ncx, ncy, half_span);
            }
            else
            {
                stroke(this.nodegroups.get_blocktype(group_id, i)*255, 0, 0);
                noFill();
                rect(ncx, ncy, half_span, half_span);
            }
        }

    };


    draw()
    {
        noStroke();
        fill(0);
        rectMode(CENTER);
        this.__draw(this.root_id, 0, 0, this.MAX_SPAN);
    };


    buffer()
    {
        return this.nodegroups.computebuffer.data();
    };
};
