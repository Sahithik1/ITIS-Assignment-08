const express = require('express');
const mariadb = require('mariadb');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());

const options = {
  swaggerDefinition: {
      info: {
          title: 'Swagger Demo',
          version: '1.0.0',
          description: 'autogenerated by swagger'
      },
      host:'134.122.123.218:3000',
      basePath:'/'
  },
  apis:['server.js']
};

const specs = swaggerJsDoc(options);

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());

const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'sample',
    allowPublicKeyRetrieval: true,
    port: 3306,
    connectionLimit: 5
});

app.get('/', (req, res) => {
    res.send('Hello World');
});

/**
 * @swagger
 * definitions:
 *   Agent:
 *     properties:
 *       AGENT_CODE:
 *         type: string
 *       AGENT_NAME:
 *         type: string
 *       WORKING_AREA:
 *         type: string
 *       COMMISSION:
 *         type: integer
 *       PHONE_NO:
 *         type: string
 *       COUNTRY:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   Customer:
 *     properties:
 *       CUST_CODE:
 *         type: string
 *       CUST_NAME:
 *         type: string
 *       CUST_CITY:
 *         type: string
 *       WORKING_AREA:
 *         type: string
 *       CUST_COUNTRY:
 *         type: string
 *       GRADE:
 *         type: integer
 *       OPENING_AMT:
 *         type: integer
 *       RECEIVE_AMT:
 *         type: integer
 *       PAYMENT_AMT:
 *         type: integer
 *       OUTSTANDING_AMT:
 *         type: integer
 *       PHONE_NO:
 *         type: string
 *       AGENT_CODE:
 *         type: string
 */

/**
 * @swagger
 * definitions:
 *   Company:
 *     properties:
 *       COMPANY_ID:
 *         type: string
 *       COMPANY_NAME:
 *         type: string
 *       COMPANY_CITY:
 *         type: string
 */

/**
 * @swagger
 * /agents:
 *   get:
 *     tags:
 *       - Agents
 *     description: Return all agents
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all the agents in the system
 *         schema:
 *           $ref: '#/definitions/Agent'
 */
app.get('/agents', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from agents;")
        .then(rows => {
          res.json(rows);
        })
        .then(res => {
          conn.release();
        })
        .catch(err => {
          conn.release();
        })
        
    }).catch(err => {
      console.log('Database not connected: ', err);
    });
});

/**
 * @swagger
 * /customers:
 *   get:
 *     tags:
 *       - Customers
 *     description: Return all customers
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all the customers in the system
 *         schema:
 *           $ref: '#/definitions/Customer'
 */
app.get('/customers', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from customer;")
        .then(rows => {
          res.json(rows);
        })
        .then(res => {
          conn.release();
        })
        .catch(err => {
          conn.release();
        })
        
    }).catch(err => {
      console.log('Database not connected: ', err);
    });
});

/**
 * @swagger
 * /companies:
 *   get:
 *     tags:
 *       - Companies
 *     description: Return all companies
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Returns all the companies in the system
 *         schema:
 *           $ref: '#/definitions/Company'
 */
app.get('/companies', (req, res) => {
    pool.getConnection()
    .then(conn => {
    
      conn.query("SELECT * from company;")
        .then(rows => {
          res.json(rows);
        })
        .then(res => {
          conn.release();
        })
        .catch(err => {
          conn.release();
        })
        
    }).catch(err => {
      console.log('Database not connected: ', err);
    });
});


async function postAgent(data) {
  let conn;
  try {

	conn = await pool.getConnection();
	const rows = await conn.query(`SELECT * from agents where AGENT_CODE='${data.AGENT_CODE}'`);
	// console.log("rows: ", rows.length);

  if (rows.length === 0){
    const res = await conn.query("INSERT INTO agents value (?, ?, ?, ?, ?, ?)", Object.values(data));
    console.log("res: ", res);
    return {
      statusCode:200,
      message:"Agent Added successfully"
    };
  }
  else{
    return {
      statusCode:201,
      message:"AGENT_CODE already exists, please enter a new AGENT_CODE"
    };
  }

  } catch (err) {
	throw err;
  } finally {
	if (conn) conn.release(); //release to pool
  }
}
/**
 * @swagger
 * /agents:
 *   post:
 *     tags:
 *       - Agents
 *     description: Adds an agent
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: Agent
 *         description: The Agent to create.
 *         schema:
 *           $ref: '#/definitions/Agent'
 *     responses:
 *       200:
 *         description: Adds a new agent into the system
 *       201:
 *         description: Agent already exists
 */
app.post('/agents', async (req, res) => {
  const response = await postAgent(req.body);
  res.json(response);
});


async function patchAgent(AGENT_CODE, data) {
  let conn;
  try {

	conn = await pool.getConnection();
	const rows = await conn.query(`SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`);
	console.log("rows: ", rows.length);

  if (rows.length !== 0){
    const res = await conn.query(
      `UPDATE agents set AGENT_NAME=?, WORKING_AREA=?, COMMISSION=?, PHONE_NO=?, COUNTRY=? where AGENT_CODE = ?`, [...Object.values(data), AGENT_CODE]);
    console.log("res: ", res);
    return {
      statusCode:200,
      message:"Agent updated successfully"
    };
  }
  else{
    return {
      statusCode:201,
      message:"AGENT_CODE doesn't exist"
    };
  }

  } catch (err) {
	throw err;
  } finally {
	if (conn) conn.release();
  }
}

/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *  patch:
 *      tags:
 *         - Agents
 *      description: Patch request on Agents
 *      parameters:
 *          - name: AGENT_CODE
 *            description: Agent Code 
 *            in: path
 *            type: string
 *            required: true
 *          - name: reqBody
 *            description: request body
 *            in: body
 *            schema:
 *              type: object
 *              properties:
 *                  AGENT_NAME:
 *                      type: string
 *                  WORKING_AREA:
 *                      type: string
 *                  COMMISSION:
 *                      type: integer
 *                  PHONE_NO:
 *                      type: string
 *                  COUNTRY:
 *                      type: string
 *              required:
 *                  -AGENT_NAME
 *                  -WORKING_AREA
 *                  -COMMISSION
 *                  -PHONE_NO
 *                  -COUNTRY
 *      responses:
 *          '200':
 *              description: Agent updated Successfully
 *          '201':
 *              description: Agent doesn't exist
 */
app.patch('/agents/:AGENT_CODE', async(req, res) => {
  console.log("req: ", req.body, req.params);
  const response = await patchAgent(req.params.AGENT_CODE, req.body);
  res.json(response);
});


async function putAgent(AGENT_CODE, data) {
  let conn;
  try {

	conn = await pool.getConnection();
	const rows = await conn.query(`SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`);
	console.log("rows: ", rows.length);

  if (rows.length !== 0){
    const res = await conn.query(
      `UPDATE agents set AGENT_NAME=?, WORKING_AREA=?, COMMISSION=?, PHONE_NO=?, COUNTRY=? where AGENT_CODE = ?`, [...Object.values(data), AGENT_CODE]);
    console.log("res: ", res);
    return {
      statusCode:200,
      message:"Agent updated successfully"
    };
  }
  else{
    const res = await conn.query("INSERT INTO agents value (?, ?, ?, ?, ?, ?)", [AGENT_CODE, ...Object.values(data)]);
    console.log("res: ", res);
    return {
      statusCode:200,
      message:"Agent Added successfully"
    };
  }
  } catch (err) {
	throw err;
  } finally {
	if (conn) conn.release();
  }
}
/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *  put:
 *      tags:
 *         - Agents
 *      description: PUT request on Agents table
 *      parameters:
 *          - name: AGENT_CODE
 *            description: Agent Code 
 *            in: path
 *            type: string
 *            required: true
 *          - name: reqBody
 *            description: request body
 *            in: body
 *            schema:
 *              type: object
 *              properties:
 *                  AGENT_NAME:
 *                      type: string
 *                  WORKING_AREA:
 *                      type: string
 *                  COMMISSION:
 *                      type: integer
 *                  PHONE_NO:
 *                      type: string
 *                  COUNTRY:
 *                      type: string
 *              required:
 *                  -AGENT_NAME
 *                  -WORKING_AREA
 *                  -COMMISSION
 *                  -PHONE_NO
 *                  -COUNTRY
 *      responses:
 *          '200':
 *              description: Agent updated Successfully
 *          '201':
 *              description: Agent doesn't exist
 */
app.put('/agents/:AGENT_CODE', async(req, res) => {
  const response = await putAgent(req.params.AGENT_CODE, req.body);
  res.json(response);
});



async function deleteAgent(AGENT_CODE) {
  let conn;
  try {

	conn = await pool.getConnection();
	const rows = await conn.query(`SELECT * from agents where AGENT_CODE='${AGENT_CODE}'`);
	console.log("rows: ", rows.length);

  if (rows.length !== 0){
    const res = await conn.query(
      `DELETE from agents where AGENT_CODE = ?`, [AGENT_CODE]);
    console.log("res: ", res);
    return {
      statusCode:200,
      message:"Agent deleted successfully"
    };
  }
  else{
    return {
      statusCode:201,
      message:"AGENT_CODE doesn't exist"
    };
  }

  } catch (err) {
	throw err;
  } finally {
	if (conn) conn.release();
  }
}
/**
 * @swagger
 * /agents/{AGENT_CODE}:
 *   delete:
 *     tags:
 *       - Agents
 *     description: Deletes a single Agent
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: AGENT_CODE
 *         description: Agent's code
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Agent Successfully deleted
 *       201:
 *         description: Agent doesn't exist
 */
app.delete('/agents/:AGENT_CODE', async(req, res) => {
  const response = await deleteAgent(req.params.AGENT_CODE);
  res.json(response);
});



app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});