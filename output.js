const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function validFile(file) {
  const allowedFormatsList = [".csv"]; // The list consists of all the allowed file formats
  const fileExtension = path.extname(file); // This extracts the file extension of the given file

  // Checks if the provided file extention is allowed
  if (allowedFormatsList.includes(fileExtension.toLowerCase())) {
    return true;
  } else {
    throw new Error("Invalid file format.");
  }
}

function checkFileNotEmpty(file) {}

const file = "Node.js Sample_Test_File.csv";
try {
  validFile(file);
  checkFileNotEmpty(file);
} catch (error) {
  console.error(error.message);
}
