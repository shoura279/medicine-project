class Request{


    //Constructor
    constructor(user_id, medicine_id, status) {
        this.user_id = user_id;
        this.medicine_id = medicine_id;
        this.status = status;
    }
}

module.exports = Request;