const cluster = require("cluster");
const cookieParser = require("cookie-parser");
const express = require("express");
const expressSession = require("express-session");
const handlebars = require("express-handlebars");
const http = require("http");
const os = require("os");
const path = require("path");
const SocketServer = require("socket.io");

const CONFIG = require("./config");
const Contenedor = require("./Contenedor");
const Chat = require("./Chat");
const mongo = require("./db/mongo");
const passport = require("./passport");
const processValues = require("./processValues");
const routerProductos = require("./routers/productos");
const routerRandoms = require("./routers/randoms");
const sessions = require("./sessions");
const userHandler = require("./userHandler");

const app = express();
const server = http.Server(app);
const socketIO = SocketServer(server);

const TEMPLATER_ENGINE = "hbs";
const PUBLIC_PATH = path.join(__dirname, "public");
const VIEWS_PATH = path.join(__dirname, "./views", TEMPLATER_ENGINE);
const LAYOUTS_PATH = path.join(VIEWS_PATH, "layouts");
const PARTIALS_PATH = path.join(VIEWS_PATH, "layouts");

const contenedor = new Contenedor();
const chat = new Chat();

/**
 * CONFIGURACIÓN DE VISTAS (handlebars).
 */
app.set(`views`, VIEWS_PATH);
app.set(`view engine`, TEMPLATER_ENGINE);
if (TEMPLATER_ENGINE === "hbs") {
  app.engine(
    `hbs`,
    handlebars.engine({
      extname: ".hbs",
      layoutsDir: LAYOUTS_PATH,
      partialsDir: PARTIALS_PATH,
    })
  );
}

/**
 * SERVIDO DE ARCHIVOS PÚBLICOS.
 */
app.use("/public", express.static(PUBLIC_PATH));

/**
 * INFO.
 */
app.get("/info", (req, res) => {
  const info = processValues.get();
  res.render("info", { info });
});

/**
 * RANDOMS.
 */
app.use("/api/randoms", routerRandoms);

/**
 * CONTROL DE SESIÓN.
 */
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(sessions);
app.use(passport.initialize());
app.use(passport.session());
app.get("/register", (req, res) => res.render("register"));
app.post("/register", userHandler.handleRegister);
app.get("/login", (req, res) => res.render("login"));
app.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login-error" }),
  function (req, res) {
    res.redirect("/");
  }
);
app.get("/logout", userHandler.handleLogout);
app.get("/login", (req, res) => res.render("login"));
app.get("*", userHandler.forceLogin);
app.use((error, req, res, next) => {
  const errorMessage = error.message;
  res.render("error", { errorMessage });
});

/**
 * API DE PRODUCTOS.
 */

app.use("/api/productos", routerProductos);
app.use("/api/productos-test", (req, res) => {
  res.json(contenedor.getFakeProducts(5));
});

/**
 * CONTROL DE PRODUCTOS.
 */
app.get("/productos", async (req, res) => {
  const productos = await contenedor.getAll();
  const hayProductos = productos.length > 0;
  res.render("datos", { productos, hayProductos });
});

app.post("/productos", async (req, res) => {
  const { title, price, thumbnail } = req.body;
  if (
    typeof title !== "undefined" &&
    typeof price !== "undefined" &&
    typeof thumbnail !== "undefined"
  ) {
    await contenedor.save(title, price, thumbnail);
  }
  const products = await contenedor.getAll();
  socketIO.sockets.emit("products", products);
  res.redirect("/productos");
});
app.get("*", (req, res) => {
  const { username } = req.user;
  res.render("formulario", { username });
});

/**
 * CONTROL DE SOCKET.IO.
 */
socketIO.on("connection", async (socket) => {
  const productos = await contenedor.getAll();
  socket.emit("products", productos);

  const chats = await chat.getAllNormalized();
  socket.emit("chats", chats);

  socket.on("chats", async (data) => {
    const { author, text } = data;
    await chat.addMessage(author, text);
    const chats = await chat.getAllNormalized();
    socket.emit("chats", chats);
  });
});
socketIO.on("error", (error) => console.log(error));

/**
 * INICIO DE SERVIDOR.
 */
async function startServerClustered() {
  if (cluster.isMaster) {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
      cluster.fork({ silent: true });
    }
    cluster.on("online", (worker) =>
      console.log(`Worker ${worker.process.pid} iniciado.`)
    );
    cluster.on("exit", (worker, code, signal) => {
      const { pid } = worker.process;
      console.log(`Worker ${pid} terminó con código ${code}.`);
    });
    return;
  }
  startServerForked();
}

async function startServerForked() {
  try {
    await mongo.connect(CONFIG.MONGO_URL);
    const { pid } = process;
    const listeningServer = server.listen(CONFIG.PORT, () => {
      console.log(
        `Servidor proceso ${pid} escuchando en el puerto ${CONFIG.PORT}`
      );
    });
    listeningServer.on(`error`, (error) =>
      console.log(`Este es el error ${error}`)
    );
  } catch (error) {
    throw error;
  }
}

if (CONFIG.IS_CLUSTER) {
  startServerClustered();
} else {
  startServerForked();
}
