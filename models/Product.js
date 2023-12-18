function createProduct(sequelize, DataTypes) {
  const Product = sequelize.define(
    "Product",
    {
      barcode: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "image_url",
      },
      categoryOne: {
        type: DataTypes.STRING,
        field: "category_one",
      },
      categoryTwo: {
        type: DataTypes.STRING,
        field: "category_two",
      },
      categoryThree: {
        type: DataTypes.STRING,
        field: "category_three",
      },
    },
    {
      timestamps: true,
      tableName: "products",
    }
  );
  return Product;
}

module.exports = createProduct;
