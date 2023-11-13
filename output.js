const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const axios = require("axios");

const invalidRows = [];
let failedRows = [];
let successfulRows = [];

function validFile(file) {
  return new Promise((resolve, reject) => {
    const allowedFormats = [".csv"];

    const fileExtension = path.extname(file);

    if (allowedFormats.includes(fileExtension.toLowerCase())) {
      resolve();
    } else {
      reject("Invalid file format. Please upload a CSV file.");
    }
  });
}

function checkFileNotEmpty(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        reject(new Error(`Error reading file: ${err.message}`));
      } else if (data.length === 0) {
        reject(new Error("File is empty."));
      } else {
        resolve();
      }
    });
  });
}

function validateRow(row) {
  let {
    Student_Id,
    First_Name,
    Last_Name,
    Email,
    Upload_Date,
    Title_Code,
    Percentage,
  } = row;
  Student_Id = parseInt(Student_Id, 10);
  console.log("Student_Id:", Student_Id);
  Upload_Date = new Date(Upload_Date);
  console.log("Upload_Date:", Upload_Date);
  Title_Code = parseInt(Title_Code, 10);
  console.log("Title_Code:", Title_Code);
  if (
    typeof Student_Id === "number" &&
    typeof First_Name === "string" &&
    typeof Last_Name === "string" &&
    typeof Email === "string" &&
    !isNaN(new Date(Upload_Date)) &&
    typeof Title_Code === "number" &&
    typeof parseFloat(Percentage) === "number" &&
    parseFloat(Percentage) >= 0 &&
    parseFloat(Percentage) <= 1
  ) {
    console.log("True");
    return true;
  } else {
    console.log("False");
    invalidRows.push(row);
    return false;
  }
}

function validHeaders(file) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file, "utf8").pipe(csv());

    let headersChecked = false;
    let rowCount = 0;

    stream.on("headers", (headers) => {
      const expectedHeadersList = [
        "Student_Id",
        "First_Name",
        "Last_Name",
        "Email",
        "Upload_Date",
        "Title_Code",
        "Percentage",
      ];

      const isValidHeaders = expectedHeadersList.every((header) =>
        headers.includes(header)
      );

      if (!isValidHeaders) {
        stream.destroy();
        reject(new Error("Invalid headers. Please check the column names."));
      } else {
        headersChecked = true;
      }
    });

    stream.on("data", (row) => {
      if (headersChecked) {
        rowCount++;
        const isRowValid = validateRow(row);
        if (!isRowValid) {
          stream.destroy();
          reject(new Error("Invalid row. Please check the row data."));
        }
        if (rowCount >= 10) {
          stream.destroy();
          reject(new Error("Processed 10 rows. Further processing stopped."));
        }
      }
    });

    stream.on("end", () => {
      if (!headersChecked) {
        reject(new Error("The file has no headers."));
      } else {
        resolve("The file processing is successful.");
      }
    });

    stream.on("error", (err) => {
      reject(new Error(`Error reading file: ${err.message}`));
    });
  });
}

function sendRowToAPI(row) {
  // Placeholder API endpoint (replace with the actual endpoint)
  const apiEndpoint = "http://localhost:3000/sample-endpoint-url";

  // Placeholder API request payload (replace with the actual payload structure)
  const payload = {
    // Replace with the structure of your payload
    studentId: row.Student_Id,
    firstName: row.First_Name,
    lastName: row.Last_Name,
    email: row.Email,
    uploadDate: row.Upload_Date,
    titleCode: row.Title_Code,
    percentage: row.Percentage,
  };

  // Send a POST request to the API endpoint
  return axios.post(apiEndpoint, payload);
}

const file = "Node.js Sample_Test_File.csv";

validFile(file)
  .then(() => checkFileNotEmpty(file))
  .then(() => validHeaders(file))
  .then((result) => {
    console.log(result);
    // Process each row and send it to the API
    const stream = fs.createReadStream(file, "utf8").pipe(csv());
    stream.on("data", (row) => {
      sendRowToAPI(row)
        .then(() => {
          console.log("Row sent to API successfully");
          successfulRows.push(row);
        })
        .catch((err) => {
          console.error(`Error sending row to API: ${err.message}`);
          failedRows.push(row);
        });
    });
  })
  .catch((error) => {
    console.error(error.message);
    if (error.message === "Invalid row. Please check the row data.") {
      console.error("Invalid rows:", invalidRows);
    }
  });
