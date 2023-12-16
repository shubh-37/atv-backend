const multer = require("multer");
const fs = require('fs');
const aws = require('aws-sdk');
const { AWS_ACCESS_KEY_ID, AWS_ACCESS_SECRET_KEY, AWS_ACCESS_REGION } = process.env;

const s3 = new aws.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_ACCESS_SECRET_KEY,
  region: AWS_ACCESS_REGION,
  signatureVersion: 'v4'
});

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
        const { barcode, categoryOne, categoryTwo, categoryThree, imageUrl } =
          req.body;
        const [productInstance, isCreated] = await Product.upsert(
          {
            barcode,
            imageUrl,
            categoryOne,
            categoryTwo,
            categoryThree,
          },
          {
            where: {
              barcode,
            },
          }
        );
        if (!isCreated) {
          return res.status(200).json({
            message: "Product entry updated successfully",
            productInstance,
          });
        }
        return res
          .status(400)
          .json({ message: "Error creating product, please try again." });
      } else {
        console.log("File uploaded successfully");
        console.log({ image: req.file });

        const fileName = req.file.originalname;
        const params = {
          Bucket: "inventory-photo",
          Key: fileName,
          Body: fs.createReadStream(req.file.path),
          ContentType: req.file.mimetype,
          ACL: 'public-read'
        };
  
        let s3ImageUrl = null;
        try {
        const response = await s3.upload(params).promise();;
          console.log({response});
          s3ImageUrl = response.Location;
        } catch (error) {
          console.log({error})
        }

        const { barcode, categoryOne, categoryTwo, categoryThree } = req.body;
        const productInstance = await Product.upsert(
          {
            barcode,
            imageUrl: s3ImageUrl,
            categoryOne,
            categoryTwo,
            categoryThree,
          },
          {
            where: {
              barcode,
            },
          }
        );
        if (productInstance) {
          return res.status(201).json({
            message: "Product entry added successfully",
            productInstance,
          });
        }
        return res
          .status(400)
          .json({ message: "Error creating product, please try again." });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }
  });
  app.get("/product", async function getSingleProduct(req, res) {
    try {
      const { barcode } = req.query;
      const product = await Product.findOne({ where: { barcode } });
      if (product) {
        return res.status(200).json({
          message: `Fetched product successfully with barcode: ${barcode}`,
          product,
        });
      }
      return res.status(404).json({ message: "Product not found" });
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
  app.delete("/", async function deleteProduct(req, res) {
    try {
      const { barcode } = req.query;
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
