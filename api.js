const express = require('express');
const bodyParser = require('body-parser');
const sql = require("msnodesqlv8");
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');


const connectionString = "server=192.168.0.155;Database=device;Trusted_Connection=Yes;Driver={ODBC Driver 17 for SQL Server}";
const query = " Select * from deviceinfo";
const query1 ="INSERT INTO deviceinfo (ReaderID,Version,Date,Time,Signalstrength,IMEI,TagID,Amount)VALUES (?, ?, GETDATE(), GETDATE(), ?, ?, ?, ?)";
// query to retrieve data by ID
const query2 = `SELECT * FROM deviceinfo WHERE TagID =? `;
const query3 = 'UPDATE deviceinfo SET ReaderID = ?, Version = ?, Signalstrength = ?, IMEI = ?, Amount = ? WHERE TagID = ?';
const query4 = "DELETE FROM deviceinfo WHERE TagID = ?";



sql.query(connectionString, query, (err, rows) => {
  if (err) {
    res.status(err['code']).send(err);
    console.log(err);
  
  } 
  else 
  {
    console.log("connected")
  }
});

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('public'));
// enabling CORS for all requests
app.use(cors());
// adding Helmet to enhance your Rest API's security
app.use(helmet());
// adding morgan to log HTTP requests
app.use(morgan('combined'));

// define an array to hold data


// define a GET endpoint to retrieve data
app.get('/api/data', (req, res) => {
  sql.query(connectionString, query, (err, rows) => {
    if (err) {
      res.status(err['code']).send(err);
      console.log(err);
    
    } 
    else 
    {
      data=rows;
      console.log(rows);
      res.status(200).send(data);
    }
  });
         
      }    
    );


// define a POST endpoint to add data
// app.post('/api/post', (req, res) => {
//   const { ReaderID,Version,Date,Time,Signalstrength,IMEI,TagID,Amount } = req.body;
//   if (!ReaderID || !Version || !Signalstrength || !IMEI || !TagID || !Amount) {
//     res.status(400).json({ error: 'All fields are required' });
//   } else {
//     sql.query(connectionString, query1, [ReaderID,Version,Signalstrength,IMEI,TagID,Amount], (err, rows) => {
//       if (err) {
//         console.log(err);
//         res.status(500).json({ error: 'An error occurred while inserting data into the database.' });
//       } else {
//         console.log(rows);
//         const response = `$+DATE:${Date},+ID:${TagID},+STATUS:Verified,+MSG:Available Balance ${Amount}#`;
//         res.status(200).json(response);
        
//       }
//     });
//   }
// });






app.post('/api/post', (req, res) => {
  const { ReaderID, Version, Signalstrength, IMEI, TagID, Amount } = req.body;
  if (![ReaderID, Version, Signalstrength, IMEI, TagID, Amount]) {
    res.status(400).json({ error: 'All fields are required' });
  } else {
    const query5 = `SELECT * FROM deviceinfo WHERE TagID='${TagID}'`;
    sql.query(connectionString, query5, (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while querying the database.' });
      } else if (rows.length > 0) {
        const message = `Tag ID ${TagID} already exists in the database.`;
        res.status(400).json({ error: message});
      } else {
        const  query6 = 'INSERT INTO deviceinfo (ReaderID, Version, Signalstrength, IMEI, TagID, Amount) VALUES (?, ?, ?, ?, ?, ?)';
        sql.query(connectionString, query6, [ReaderID, Version, Signalstrength, IMEI, TagID, Amount], (err, rows) => {
          if (err) {
            console.log(err);
            res.status(500).json({ error: 'An error occurred while inserting data into the database.' });
          } else {
            console.log(rows);
            res.status(201).json({ success: 'Data successfully inserted into the database.' });
          }
        });
      }
    });
  }
});





// define a GET endpoint to retrieve data by ID

app.get('/api/data/:tagId', (req, res) => {
  const tagId = req.params.tagId;
  if (!tagId) {
    res.status(400).json({ error: 'Tag ID is required' });
  } else {
    sql.query(connectionString, query2, [tagId], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while retrieving data from the database.' });
      } else {
        console.log(rows);
        res.status(200).json(rows);
      }
    });
  }
});


// // define a PUT endpoint to update data
app.put('/api/data/:tagId', (req, res) => {
  const tagId = req.params.tagId;
  const { ReaderID,Version,Date,Time,Signalstrength,IMEI,Amount } = req.body;
  if (!tagId || !ReaderID || !Version || !Signalstrength || !IMEI || !Amount) {
    res.status(400).json({ error: 'All fields are required' });
  } else {
    sql.query(connectionString, query3, [ReaderID,Version,Signalstrength,IMEI,Amount, tagId], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while updating data in the database.' });
      } else {
        console.log(rows);
        res.status(200).json({ success: 'Data successfully updated in the database.' });
      }
    });
  }
});


// // define a DELETE endpoint to delete data
app.delete('/api/data/:tagId', (req, res) => {
  const tagId = req.params.tagId;
  if (!tagId) {
    res.status(400).json({ error: 'Tag ID is required' });
  } else {
    sql.query(connectionString, query4, [tagId], (err, rows) => {
      if (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while deleting data from the database.' });
      } else {
        console.log(rows);
        res.status(200).json({ success: 'Data successfully deleted from the database.' });
      }
    });
  }
});






// start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server started"));

