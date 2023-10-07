const multer = require("multer");

const storage = multer.diskStorage({
  destination: "../uploads", // Directory where uploaded files will be stored
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name for the stored file
  },
});
const upload = multer({ storage });

function productController(app, Models) {
  const { Product } = Models;
  app.post("/", upload.single("image"), async function createProduct(req, res) {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
      console.log("File uploaded successfully");
      const { barcode, ...categories } = req.body;
      const imageUrl = req.file.path;
      const productInstance = await Product.create({ barcode, imageUrl }); //how to add categories
      console.log({ productInstance });
      if (productInstance) {
        return res.status(201).json({
          message: "Product entry added successfully",
          productInstance,
        });
      }
      return res
        .status(400)
        .json({ message: "Error creating product, please try again." });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
  app.get("/products", async function getAllProducts(req, res) {
    try {
      const allProducts = await Product.findAll({});
      if (allProducts.length > 0) {
        return res.status(200).json({ allProducts });
      }
      return res.status(404).json({ message: "No products found" });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
  app.put("/:barcode", async function editProduct(req, res) {
    try {
      const { barcode } = req.params;
      const { imageUrl, ...categories } = req.body;
      if (barcode.length > 0) {
        const updatedProduct = await Product.update(
          { barcode },
          {
            where: {
              imageUrl,
            },
          }
        );
        console.log(updatedProduct);
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
  app.delete("/:barcode", async function deleteProduct(req, res) {
    try {
      const { barcode } = req.params;
      if (barcode.length > 0) {
        const deletedProduct = await Product.destroy({
          where: {
            barcode,
          },
        });
        if (deletedProduct) {
          return res.status(200).json({
            message: `Product with barcode: ${barcode} deleted successfully`,
          });
        } else {
          return res
            .status(200)
            .json({ message: `No product exists with barcode: ${barcode}` });
        }
      } else {
        return res
          .status(400)
          .json({ message: "No barcode receieved, please send barcode." });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  });
}

module.exports = productController;
