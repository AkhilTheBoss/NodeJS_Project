# NodeJS_Project


<br />
This tool is designed to process CSV files containing student records. It validates the file format, checks for empty files, and verifies the correctness of headers. It then processes a specified number of records (N) from the file, validates each record, and sends a post request of the valid records to a specified API endpoint using Axios. After processing, the tool sends success and failure emails using Nodemailer to notify about the outcome. If there is a data issue in a record, the specific record is returned back. 
<br />
<br />
How to Use
<br />
Installation:
<br />
<br />
Clone the repository: git clone <repository_url>
<br />
Change into the project directory
<br />
Install dependencies: npm install
<br />
<br />
Run the Tool:
<br />
Open a terminal in the project directory.
<br />
Run the tool: node output.js
<br />
Enter the CSV file name when prompted.
<br />
<br />
User Input:
<br />
The tool prompts the user to enter the CSV file name. Ensure the file is in the correct format.
<br />
The tool processes the first N records from the CSV file.
<br />
<br />
Output:
<br />
The tool prints the processing result and logs any invalid rows.
<br />
Success and failure emails are sent to the specified email addresses.
<br />
<br />
Dependencies:
<br />
Axios: Used for making HTTP requests.
<br />
Csv-parser: Parses CSV files.
<br />
Nodemailer: Sends emails.
<br />
Readline: Handles user input.
<br />
<br />
Configuration:
<br />
Update email credentials, recipient addresses, and other details in the email options.
<br />
<br />
Note:
<br />
Ensure you have Node.js installed on your machine.
