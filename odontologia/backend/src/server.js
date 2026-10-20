import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("--------------------------------");
  console.log("Servidor odontológico iniciado!");
  console.log(`URL: http://localhost:${PORT}`);
  console.log("--------------------------------");
});
