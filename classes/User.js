class User{

    //Properties


    //Constructor
    constructor(name , email, password, phone, token) {
        this.name = name;    
        this.email = email;
        this.password = password
        this.phone = phone;
        // this.#status = status;
        this.token = token;
        // this.#type = type;
    }
}

module.exports = User;