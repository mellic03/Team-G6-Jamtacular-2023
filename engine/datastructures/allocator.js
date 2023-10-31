
class Allocator
{
    template_constructor;
    unused_ids = [];
    objects    = [];

    /**
     * @param {*} T Typename of some class T
     */
    constructor( T )
    {
        this.template_constructor = T;
    };

    __create_from_none()
    {
        let object_id = -1;

        if (this.unused_ids.length > 0)
        {
            object_id = this.unused_ids.pop();
            this.objects[object_id].reset();
        }

        else
        {
            object_id = this.objects.length;
            this.objects.push(new this.template_constructor());
        }

        return object_id;
    };


    __create_from_constructor( args )
    {
        let object_id = -1;

        if (this.unused_ids.length > 0)
        {
            object_id = this.unused_ids.pop();
            this.get(object_id).reset();
        }

        else
        {
            object_id = this.objects.length;
            this.objects.push(new this.template_constructor(...args));
        }

        return object_id;
    };


    create( args = null )
    {
        if (args == null)
        {
            return this.__create_from_none();
        }

        else
        {
            return this.__create_from_constructor(args);
        }
    };


    get( object_id )
    {
        return this.objects[object_id];
    };


    destroy( object_id )
    {
        this.unused_ids.push(object_id);
    };
};

