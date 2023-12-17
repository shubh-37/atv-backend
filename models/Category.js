function createCategory(sequelize, DataTypes) {
    const Category = sequelize.define(
      "Category",
      {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        categoryOne: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          field: "category_one",
        },
        categoryTwo: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          field: "category_two",
        },
        categoryThree: {
          type: DataTypes.ARRAY(DataTypes.STRING),
          field: "category_three",
        },
      },
      {
        timestamps: false,
        tableName: "category",
      }
    );
    return Category;
  }
  
  module.exports = createCategory;
  