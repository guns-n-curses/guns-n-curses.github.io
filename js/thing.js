


function World(opt = {}) {
    
    this.things = opt.things || {};
    this.behaviors = opt.behaviors || {};
    this.changers = opt.changers || {};
    this.views = opt.views || {};

    this.cutRequests = [];
    this.delRequests = [];
}



World.prototype.genId = (function() {
    let id = 0n;
    return function(prefix) {
        return prefix + (id++);
    }
})();



World.prototype.update = function(tid) {
    
    this.updateViews(tid);
    this.collectBehaviors(tid);
}



World.prototype.collectBehaviors = function(tid) {
   
    let list = [];

    // behaviors depend on the components
    for (let componentId of this.things[tid].madeof)
        if (this.things[componentId].value.behaviors)
            for (let behavior of this.things[componentId].value.behaviors)
                if (!list.includes(behavior))
                    list.push(behavior);
    
    let that = this;
    list.sort(
        function(a, b) {
            return that.behaviors[a].weight - that.behaviors[b].weight;
        }
    );
    
    this.things[tid].orderedBehaviors = list;
}



World.prototype.partof = function(compoundId, componentId, noUpdate) {

    // getter: get things which are part of argument 1
    if (!componentId) return this.things[compoundId].madeof;

    // setter: attach a new component to argument 1
    this.things[compoundId].madeof.push(componentId);
    this.things[componentId].partof.push(compoundId);
    
    if (!noUpdate) this.update(compoundId);
}



World.prototype.madeof = function(componentId, compoundId, noUpdate) {

    // getter: get things which are made of argument 1
    if (!compoundId) return this.things[componentId].partof;

    // setter: attach argument 1 to a new compound
    this.things[compoundId].madeof.push(componentId);
    this.things[componentId].partof.push(compoundId);
    
    if (!noUpdate) this.update(compoundId);
}



World.prototype.thing = function(t = {}, edges) {
    
    // getter version
    if (typeof t == "string")
        return this.things[t.toString()];
    
    // setter version
    let id = this.genId('T');
    this.things[id] = {
        id,
        value: t,
        partof: [],
        madeof: [],
        orderedBehaviors: []
    };

    // edges can be set up at creation
    // things they link must already exist
    if (edges) {
        
        if (edges.partof)
            for (let compoundId of edges.partof)
                this.madeof(id, compoundId);
        
        if (edges.madeof)
            for (let componentId of edges.madeof)
                this.partof(id, componentId, true);
        
        this.update(id);
    }
    
    return id;
}



World.prototype.cut = function(tid1, tid2) {
    
    // edge-cuts are not immediate
    // they are requested first
    this.cutRequests.push([tid1, tid2]);
}



World.prototype.cutNow = function(tid1, tid2) {

    // if edges still exist
    if (!((tid1 in this.things) && (tid2 in this.things))) return;

    // tid1 is not part of tid2 anymore
    this.things[tid1].partof =
        this.things[tid1].partof.filter(tid => tid != tid2);

    // tid1 is not made of tid2 anymore
    this.things[tid1].madeof =
        this.things[tid1].madeof.filter(tid => tid != tid2);

    // tid2 is not part of tid1 anymore
    this.things[tid2].partof =
        this.things[tid2].partof.filter(tid => tid != tid1);

    // tid2 is not made of tid1 anymore
    this.things[tid2].madeof =
        this.things[tid2].madeof.filter(tid => tid != tid1);

    this.update(tid1);
    this.update(tid2);
}



World.prototype.del = function(tid) {
    
    // thing deletions are not immediate
    // they are requested first
    this.delRequests.push(tid);
}



World.prototype.delNow = function(tid) {

    // if things still exist
    if (!(tid in this.things)) return;

    // they're not part of anything anymore
    for (let compoundId of this.things[tid].partof) {
        
        this.things[compoundId].madeof =
            this.things[compoundId].madeof.filter(t => t != tid);
    
        this.update(compoundId);
    }
    
    // they're not made of anything anymore
    for (let componentId of this.things[tid].madeof) {
        
        this.things[componentId].partof =
            this.things[componentId].partof.filter(t => t != tid);
    }
    
    delete this.things[tid];
}



World.prototype.everything = function() {
    
    return Object.keys(this.things);
}



World.prototype.behavior = function(name, weight, wishmaker) {

    // check no existing behavior has the same weight
    for (let b in this.behaviors)
        if (this.behaviors[b].weight == weight)
            throw `behavior "${name}" has the same weight (${weight}) as "${b}"`;
    
    // check no existing behavior has the same name
    if (name in this.behaviors)
        throw `behavior "${name}" already defined`;
    
    this.behaviors[name] = { name, weight, wishmaker };
}



World.prototype.changer = function(name, body) {
    
    this.changers[name] = body;
}



World.prototype.send = function(tid, message) {

    let wishStack = [];
    
    // all behaviors contribute to the wish stack
    for (let b of this.things[tid].orderedBehaviors) {
        let wish = this.behaviors[b].wishmaker(
            tid,
            message,
            wishStack
        );
        if (wish) wishStack.push(wish);
    }
    
    if (wishStack.length == 0) return;
    
    let finalWish = wishStack[wishStack.length - 1];
    
    // call for actual changes
    if (finalWish.changer)
        this.changers[finalWish.changer](
            tid,
            finalWish
        );
}



World.prototype.value = function(tid, key, val) {
    
    // all getter
    if (!key) return this.things[tid].value;
    
    // key getter
    if (!val) return this.things[tid].value[key];
    
    // setter
    this.things[tid].value[key] = val;
    
    // update
    for (let id of this.things[tid].partof)
        this.update(id);
}



World.prototype.assign = function(tid, val) {
    
    Object.assign(this.things[tid].value[key], val);
    
    // update
    for (let id of this.things[tid].partof)
        this.update(id);
}



World.prototype.view = function(view, selectors) {
    
    // getter version
    if (!selectors)
        return Array.from(this.views[view].list.values());
    
    // setter version
    this.views[view] = {
        list: new Set(),
        selectors
    };
}



World.prototype.updateViews = function(tid) {

    for (let view in this.views) {
        let accept = true;
        // every selector must be satisfied
        for (let selector of this.views[view].selectors) {
            let greenlight = false;
            for (let componentId of this.things[tid].madeof)
                // one component is enough to satisfy the selector
                if (selector(this.things[componentId])) {
                    greenlight = true;
                    break;
                }
            if (!greenlight) {
                accept = false;
                break;
            }
        }
        if (accept) this.views[view].list.add(tid);
        else this.views[view].list.delete(tid);
    }
}



/*

when receiving a message
the behavior of a thing
depends on its components

*/


/*
let w = new World();
let t = w.thing.bind(w);



w.changer("vision", function(tid, wish) {
    
    console.log("[vision] " + wish.vision);
});



w.behavior("sight", 1, function(tid, msg, wishStack) {
    
    if (msg.image)
        return {
            changer: "vision",
            vision: "you see " + msg.image
        }
});



w.behavior("protection from curses", 3, function(tid, msg, wishStack) {

    let uncurse;
    for (let wish of wishStack)
        if (wish.type == "curse")
            uncurse = wish.blocked;

    return uncurse;
});



w.behavior("blind curse", 2, function(tid, msg, wishStack) {
    
    let lastWish = wishStack[wishStack.length - 1];
    
    if (lastWish.changer == "vision")
        return {
            type: "curse",
            blocked: lastWish
        };
});



w.view("able to see", [
    component => component.value.organ == "eyes"
]);



console.log(w.view("able to see"));



let me = t({ who: "me" }, {
    madeof: [
        t({ race: "gobelin" }),
        t({ organ: "eyes", behaviors: ["sight"] }),
        t({ object: "ring", behaviors: ["protection from curses"] }),
        t({ curse: "blind", behaviors: ["blind curse"] }),
    ]
});



console.log(w.view("able to see"));



w.send(me, { image: "gold coins" })
*/
