class Store {
    constructor(){
        this.state = {};
    }

    // set store
    set(obj, cb = () => {}){
        this.state = {
            ...this.state,
            ...obj
        }

        // callback
        cb();
    }
}