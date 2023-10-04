function productController(app, Models) {
  const { Product } = Models;
  app.post("/", upload.single("image"), async function createProduct(req, res) {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
      console.log('File uploaded successfully');
      console.log(req.file);
      const { barcode, ...categories } = req.body;

      const productInstance = await Product.create({ barcode, imageUrl }); //how to add categories
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
  app.get("/", async function getAllProducts(req, res) {
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
  app.put("/", async function editProduct(req, res) {
    try {
    } catch (error) {}
  });
  app.delete("/", async function deleteProduct(req, res) {
    try {
    } catch (error) {}
  });
}
