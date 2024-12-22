import mongoose from 'mongoose';
import express, { Express } from 'express';
import dotenv from 'dotenv'; 
import all from '../routes/all'
import {loggerMiddleware} from '../utils/Middleware'
dotenv.config();

export class RootServer {
  private app: Express;
  private port: number;
  private dbURI: string;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '5000', 10);
    this.dbURI = process.env.MONGO_URI;
  }

  // Method to connect to the MongoDB database
  private async connectToDatabase(): Promise<void> {
    try {
      await mongoose.connect(this.dbURI);
      mongoose.set('debug', true);
      console.log('Connected to MongoDB:',this.dbURI.split(":")[1]);
    } catch (e) {
      console.error('Failed to connect to MongoDB',this.dbURI);
      throw e
    }
  }

  // Method to start the server
  public start(): void {
    this.connectToDatabase()
      .then(() => {
        // app logic
        this.app.use(express.json());
        this.app.use(loggerMiddleware)
       
        this.app.use('/api',all)
        this.app.get("/",(req,res)=>{
          res.send("Hello World!")
      })
        this.app.listen(this.port, () => {
          console.log(`Server is running on port ${this.port}`);
        });
      })
      .catch((e: Error) => {
        console.error('Server will not start due to MongoDB connection error', e);
      });
  }
}


