import dotenv from "dotenv";
import app from "./app.js";
import { sequelize } from "./config/database.js";
import "./models/Relations.js"

dotenv.config({ path: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev' });

const PORT = process.env.PORT;

async function main() {
  try {
    await sequelize.authenticate();

    console.log("Base de datos conectada");

    await sequelize.sync();

    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

main();