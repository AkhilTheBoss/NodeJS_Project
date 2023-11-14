const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");
const axios = require("axios");
const nodemailer = require("nodemailer");

const invalidRows = [];
let failedRows = [];
let successfulRows = [];
let N = 10;

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
  //   console.log("Student_Id:", Student_Id);
  Upload_Date = new Date(Upload_Date);
  //   console.log("Upload_Date:", Upload_Date);
  Title_Code = parseInt(Title_Code, 10);
  //   console.log("Title_Code:", Title_Code);
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
    // console.log("True");
    return true;
  } else {
    // console.log("False");
    invalidRows.push(row);
    return false;
  }
}

function validHeaders(file) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file, "utf8").pipe(csv());

    let headersChecked = false;
    let rowCount = 0;
    const promises = [];

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
        if (rowCount <= N) {
          const isRowValid = validateRow(row);
          if (isRowValid) {
            const promise = sendRowToAPI(row)
              .then(() => {
                console.log("Record sent to API successfully");
                successfulRows.push(row);
                console.log("The record sent successfully:", row);
              })
              .catch((err) => {
                console.error(`Error sending record to API: ${err.message}`);
                failedRows.push(row);
                console.error("The record not sent successfully:", row);
              });
            promises.push(promise);
          } else {
            console.error("Invalid record:", row);
            stream.destroy();
          }
        }
        if (rowCount == N) {
          console.log("Processed", N, "records. Further processing stopped.");
        }
      }
    });

    stream.on("end", () => {
      if (!headersChecked) {
        reject(new Error("The file has no headers."));
      } else {
        Promise.all(promises).then(() => {
          var transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "myemail@gmail.com",
              pass: "mypassword",
            },
          });

          // Send success email
          if (failedRows.length == 0) {
            var successMailOptions = {
              from: "myemail@gmail.com",
              to: "system_admin@gmail.com",
              subject: "Records Processing Success",
              text: "All the records were successfully processed!",
            };

            transporter.sendMail(successMailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Success Email sent: " + info.response);
                console.log("Records are successfully processed");
              }
            });
          }

          if (failedRows.length !== 0) {
            var failureMailOptions = {
              from: "myemail@gmail.com",
              to: "system_admin@gmail.com",
              subject: "Records Processing Failure",
              text: generateEmailText(
                "These records were not sent to the API successfully:",
                failedRows
              ),
            };

            transporter.sendMail(failureMailOptions, function (error, info) {
              if (error) {
                console.log(error);
              } else {
                console.log("Failure Email sent: " + info.response);
              }
            });
          }

          //   if (successfulRows.length !== 0) {
          //     console.log(
          //       "The records that were successfully sent to API:",
          //       successfulRows
          //     );
          //   }
          //   if (failedRows.length !== 0) {
          //     console.log(
          //       "The records that were failed to send to API:",
          //       failedRows
          //     );
          //   }
        });
      }
    });

    stream.on("error", (err) => {
      reject(new Error(`Error reading file: ${err.message}`));
    });
  });
}

function sendRowToAPI(row) {
  const apiEndpoint = "http://localhost:3000/sample-endpoint-url";

  const payload = {
    studentId: row.Student_Id,
    firstName: row.First_Name,
    lastName: row.Last_Name,
    email: row.Email,
    uploadDate: row.Upload_Date,
    titleCode: row.Title_Code,
    percentage: row.Percentage,
  };

  return axios.post(apiEndpoint, payload);
}

function generateEmailText(msg, rows) {
  let emailText = msg;
  emailText += "\nDetails of records:\n";
  emailText += JSON.stringify(rows, null, 2);
  return emailText;
}

const file = "Node.js Sample_Test_File.csv";

validFile(file)
  .then(() => checkFileNotEmpty(file))
  .then(() => validHeaders(file))
  .then((result) => {
    console.log(result);
  })
  .catch((error) => {
    console.error(error.message);
    if (error.message === "Invalid row. Please check the row data.") {
      console.error("Invalid rows:", invalidRows);
    }
  });
