"use strict";


const NODESIZE  = 4;
const GROUPSIZE = 16;

const BLOCKTYPE_IDX = 0;
const CHILDREN_IDX  = 1;

const BLOCK_AIR     = 0;
const BLOCK_GRASS   = 1;
const BLOCK_DIRT    = 2;
const BLOCK_STONE   = 3;
const BLOCK_SILVER  = 4;
const BLOCK_GOLD    = 5;
const BLOCK_BEDROCK = 6;


function blocktype_softness( blocktype )
{
    switch (blocktype)
    {
        case BLOCK_AIR:      return 0.0;
        case BLOCK_GRASS:    return 1.0;
        case BLOCK_DIRT:     return 1.0;
        case BLOCK_STONE:    return 0.3;
        case BLOCK_SILVER:   return 0.5;
        case BLOCK_GOLD:     return 0.8;
        case BLOCK_BEDROCK:  return 0.0;
    }
}


class QuadNode_Allocator
{
    buffer_size;

    computebuffer;
    bufferdata = null;

    nodegroups_allocated = 0;
    nodegroups_active = 0;
    unused_group_ids = [];

    constructor( compute_buffer )
    {
        this.computebuffer = compute_buffer;

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


    readBuffer()
    {
        return this.computebuffer.readBuffer();
    };

    
    mapBuffer()
    {
        this.bufferdata = this.computebuffer.mapBuffer();
    };


    unmapBuffer()
    {
        this.computebuffer.unmapBuffer();
        this.bufferdata = null;
    }


    clearNodeGroup( group_id )
    {
        const group_idx = GROUPSIZE * group_id;

        for (let i=0; i<4; i++)
        {
            const node_idx = group_idx + NODESIZE*i;

            this.bufferdata[node_idx + BLOCKTYPE_IDX] = 0.0; // blocktype
            this.bufferdata[node_idx + CHILDREN_IDX ] = 0.0; // children_id
            this.bufferdata[node_idx + 2] = 0.0 // z
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

        this.nodegroups_active += 1;

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
        const data = this.readBuffer();
        return data[idx + BLOCKTYPE_IDX];
    };

    set_blocktype( group_id, quadrant, blocktype )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        this.bufferdata[idx + BLOCKTYPE_IDX] = blocktype;
    };

    get_children_id( group_id, quadrant )
    {
        const idx = this.get_node_idx(group_id, quadrant);
        const data = this.readBuffer();
        return data[idx + CHILDREN_IDX];
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
        this.nodegroups_active -= 1;
    };
};




class Quadtree
{
    nodegroups;
    MAX_SPAN;
    pos_x;  pos_y;
    root_id;

    constructor( pos_x, pos_y, max_span, compute_buffer )
    {
        this.pos_x = pos_x;
        this.pos_y = pos_y;


        this.MAX_SPAN = max_span;

        this.nodegroups = new QuadNode_Allocator(compute_buffer);

        this.nodegroups.mapBuffer();
        this.root_id = this.nodegroups.create();
        for (let i=0; i<4; i++)
        {
            this.nodegroups.set_children_id(this.root_id, i, 0);
        }
        this.nodegroups.unmapBuffer();

        // console.log("root nodegroup id: " + this.root_id);
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
            if (this.nodegroups.get_children_id(group_id, quadrant) == 0)
            {
                return;
            }
        }

        if (current_span/2 <= min_span)
        {
            if (this.nodegroups.get_children_id(group_id, quadrant) > 0)
            {
                let child_id = this.nodegroups.get_children_id(group_id, quadrant);
                this._remove_group(child_id);
                this.nodegroups.destroyGroup(child_id);
            }

            this.nodegroups.set_blocktype(group_id, quadrant, blocktype);
            this.nodegroups.set_children_id(group_id, quadrant, 0);
            return;
        }

        if (this.nodegroups.get_children_id(group_id, quadrant) == 0.0)
        {
            let children_id = this.nodegroups.create();
            this.nodegroups.set_children_id(group_id, quadrant, children_id);
            for (let i=0; i<4; i++)
            {
                this.nodegroups.set_blocktype(children_id, i, this.nodegroups.get_blocktype(group_id, quadrant));
            }
        }

        let children_id = this.nodegroups.get_children_id(group_id, quadrant);
        const ncx = this._shift_center_x(quadrant, cx, current_span);
        const ncy = this._shift_center_y(quadrant, cy, current_span);

        this._insert(children_id, x, y, ncx, ncy, blocktype, current_span/2.0, min_span);

        if (this.nodegroups.get_children_id(group_id, quadrant) > 0)
        {
            this.nodegroups.set_blocktype(group_id, quadrant, 0);
        }

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
        if (x < this.pos_x - this.MAX_SPAN/2 || x > this.pos_x + this.MAX_SPAN/2)
        {
            return;
        }
        if (y < this.pos_y - this.MAX_SPAN/2 || y > this.pos_y + this.MAX_SPAN/2)
        {
            return;
        }

        this._insert( this.root_id, x, y, this.pos_x, this.pos_y, blocktype, this.MAX_SPAN, min_span);
    };



    /** Find the node corresponding to a world-space position and return it's group id and quadrant.
     * 
     * @param {*} x 
     * @param {*} y 
     * @returns [blocktype, center_x, center_y, span]
     */
    find( x, y )
    {
        fill(255);

        let cx = this.pos_x;
        let cy = this.pos_y;
        let span = this.MAX_SPAN;
        let blocktype;

        let quadrant = this._get_quadrant(x, y, cx, cy);
        let group_id = this.nodegroups.get_children_id(0, quadrant);
        blocktype = this.nodegroups.get_blocktype(0, quadrant);

        cx = this._shift_center_x(quadrant, cx, span);
        cy = this._shift_center_y(quadrant, cy, span);

        span /= 2.0;

        while (group_id > 0)
        {
            quadrant = this._get_quadrant(x, y, cx, cy)
            blocktype = this.nodegroups.get_blocktype(group_id, quadrant);
            group_id = this.nodegroups.get_children_id(group_id, quadrant);

            cx = this._shift_center_x(quadrant, cx, span);
            cy = this._shift_center_y(quadrant, cy, span);
            span /= 2.0;
        }

        return [ blocktype, cx, cy, span ];
    };


    __next_step( x, y, xdir, ydir, cx, cy, span )
    {
        const mx = ydir / xdir;
        const my = xdir / ydir;

        let nx = -xdir;
        let ny = -ydir;

        const Ax = x - (span * Math.floor(x / span));
        const Ay = y - (span * Math.floor(y / span));

        let dx, dy;
        if (xdir <= 0) { dx = Ax;        };
        if (xdir >  0) { dx = span - Ax; };
        if (ydir <= 0) { dy = Ay;        };
        if (ydir >  0) { dy = span - Ay; };


        const hdx = dx;
        const hdy = dx*mx;

        const vdy = dy;
        const vdx = dy*my;

        const length_h = Math.sqrt(hdx**2 + hdy**2);
        const length_v = Math.sqrt(vdx**2 + vdy**2);
        const EPSILON = 0.01;

        if (length_h < length_v)
        {
            const sign_h = Math.sign(xdir);
            return [ sign_h*(hdx+EPSILON), sign_h*(hdy+EPSILON), sign_h, 0.0 ];
        }

        else
        {
            const sign_v = Math.sign(ydir);
            nx = 0.0;
            ny = 1.0;

            return [ sign_v*(vdx+EPSILON), sign_v*(vdy+EPSILON), 0.0, sign_v ];
        }
    };


    __out_of_bounds( x, y )
    {
        if (x < this.pos_x - HALF_SPAN || x > this.pos_x + HALF_SPAN)
        {
            return true;
        }
    
        if (y < this.pos_y - HALF_SPAN || y > this.pos_y + HALF_SPAN)
        {
            return true;
        }

        return false;
    }

    /** Given a position and direction, determine the nearest intersection with a block of blocktype > 0
     * 
     * @param {*} x starting x position
     * @param {*} y starting y position
     * @param {*} xdir x direction
     * @param {*} ydir y direction
     * @returns [ x, y, nx, ny, blocktype ] intersection point
     */
    nearest_intersection( x, y, xdir, ydir )
    {
        const render = engine.getSystem("render");

        let node_data = this.find(x, y);
    
        let blocktype = node_data[0];
        let cx        = node_data[1];
        let cy        = node_data[2];
        let span      = node_data[3];

        let normalx = 0;
        let normaly = 0;

        let px = 1.0*x;
        let py = 1.0*y;


        if (blocktype > 0)
        {
            const step = this.__next_step(px, py, xdir, ydir, cx, cy, span);
            normalx = step[2];
            normaly = step[3];

            return [px, py, Math.sign(normalx), Math.sign(normaly), blocktype];
        }

        for (let i=0; i<20; i++)
        {
            const step = this.__next_step(px, py, xdir, ydir, cx, cy, span);

            px += step[0];
            py += step[1];
            normalx = step[2];
            normaly = step[3];

            // const world = render.world_to_screen(px, py);
            // fill(255, 0, 0);
            // circle(...world, 5);

            node_data = this.find(px, py);
            blocktype = node_data[0];
            cx        = node_data[1];
            cy        = node_data[2];
            span      = node_data[3];

            if (this.__out_of_bounds(px, py))
            {
                // let world_xy   = engine.getSystem("render").world_to_screen(x, y);
                // let world_pxpy = engine.getSystem("render").world_to_screen(px, py);
                // stroke(255);
                // line(...world_xy, ...world_pxpy);
                return [px, py];
            }

            if (blocktype > 0)
            {
                break;
            }
        }


        // let world_xy   = engine.getSystem("render").world_to_screen(x, y);
        // let world_pxpy = engine.getSystem("render").world_to_screen(px, py);

        // stroke(255);
        // line(...world_xy, ...world_pxpy);

        // fill(0, 255, 0);
        // circle(...world_pxpy, 10);

        return [px, py, Math.sign(normalx), Math.sign(normaly), blocktype];
    };


    __draw( group_id, cx, cy, current_span )
    {
        const render = engine.getSystem("render");

        const half_span = current_span / 2.0;

        for (let i=0; i<4; i++)
        {
            const ncx = this._shift_center_x(i, cx, current_span);
            const ncy = this._shift_center_y(i, cy, current_span);

            stroke(255);
            noFill();

            const tl = render.world_to_screen(ncx-half_span/2, ncy-half_span/2);
            const br = render.world_to_screen(ncx+half_span/2, ncy+half_span/2);

            rect(...tl, ...br);

            if (this.nodegroups.get_children_id(group_id, i) > 0.0)
            {
                const children_id = this.nodegroups.get_children_id(group_id, i);
                this.__draw(children_id, ncx, ncy, half_span);
            }
        }
    };


    draw()
    {
        noStroke();
        fill(0);
        rectMode(CORNERS);

        this.__draw(this.root_id, this.pos_x, this.pos_y, this.MAX_SPAN);
    };


    buffer()
    {
        return this.nodegroups.computebuffer.data();
    };


    __leafList( list, group_id, cx, cy, span )
    {
        for (let i=0; i<4; i++)
        {
            const quadrant  = i;
            const blocktype = this.nodegroups.get_blocktype(group_id, quadrant);
            const ncx = this._shift_center_x(quadrant, cx, span);
            const ncy = this._shift_center_y(quadrant, cy, span);

            const children_id = this.nodegroups.get_children_id(group_id, quadrant);

            if (children_id > 0)
            {
                this.__leafList(list, children_id, ncx, ncy, span/2);
            }

            else
            {
                list.push(blocktype);
                list.push(ncx);
                list.push(ncy);
                list.push(span/2);
            }
        }
    };


    // Return a list of leaf block types and positions.
    leafList()
    {
        let list = [  ];
        this.__leafList(list, this.root_id, this.pos_x, this.pos_y, this.MAX_SPAN);

        return list;
    };


    currentBufferUsage()
    {
        const capacity = this.nodegroups.computebuffer.w * this.nodegroups.computebuffer.h;        
        const used     = NODESIZE * this.nodegroups.nodegroups_active;
    
        return used / capacity;
    };


    maxBufferUsage()
    {
        const capacity = this.nodegroups.computebuffer.w * this.nodegroups.computebuffer.h;        
        const used     = NODESIZE * this.nodegroups.nodegroups_allocated;
    
        return used / capacity;
    };

};
