import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import ConnectDB from './utils/db_connect';
import router from "./router"
dotenv.config();

const app = express();
const port = process.env.PORT || 1004;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.raw());
app.use(morgan('dev'));

ConnectDB();
app.use('/', router);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});