# NodeJS_Project



This tool is designed to process CSV files containing student records. It validates the file format, checks for empty files, and verifies the correctness of headers. It then processes a specified number of records (N) from the file, validates each record, and sends a post request of the valid records to a specified API endpoint using Axios. After processing, the tool sends success and failure emails using Nodemailer to notify about the outcome. If there is a data issue in a record, the specific record is returned back. 

How to Use
Installation:

Clone the repository: git clone <repository_url>
Change into the project directory
Install dependencies: npm install
Run the Tool:

Open a terminal in the project directory.
Run the tool: node output.js
Enter the CSV file name when prompted.
User Input:

The tool prompts the user to enter the CSV file name. Ensure the file is in the correct format.
The tool processes the first N records from the CSV file.
Output:

The tool prints the processing result and logs any invalid rows.
Success and failure emails are sent to the specified email addresses.
Dependencies:

Axios: Used for making HTTP requests.
Csv-parser: Parses CSV files.
Nodemailer: Sends emails.
Readline: Handles user input.
Configuration:

Update email credentials, recipient addresses, and other details in the email options.
Note:

Ensure you have Node.js installed on your machine.
