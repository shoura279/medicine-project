class Medicine {
  //Constructor
  constructor(name, description, price, exp_date, category_id, image_url) {
    this.category_id = category_id;
    this.description = description;
    this.expiration_date = exp_date;
    this.image_url = image_url;
    this.name = name;
    this.price = price;
  }

}

module.exports = Medicine;
