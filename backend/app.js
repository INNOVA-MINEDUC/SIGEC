import express from "express";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import authRoutes from './routes/auth.routes.js'
import casoRoutes from './routes/caso.routes.js'
import deptRoutes from './routes/dept.routes.js'
import uploadRoutes from './routes/upload.routes.js'
// import niñasRoutes from './routes/niña.routes.js'
// import quejasRoutes from './routes/queja.routes.js'
import dotenv from 'dotenv'
dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' })

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());


app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/caso", casoRoutes);
app.use("/api/v1/dept", deptRoutes);
// app.use('/api/v1/ninas', niñasRoutes)
app.use('/api/v1/upload', uploadRoutes)
// app.use('/api/v1/queja', quejasRoutes)


export default app;