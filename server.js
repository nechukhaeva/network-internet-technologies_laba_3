const express = require("express");
const app_env = process.env.APP_ENV == "dev" ? "development" : "production"
require('dotenv').config({path: __dirname + `/${process.env.APP_ENV}.env`});
const DB = require("./db");

const db = new DB(process.env.DB_NAME);
const app = express();
const router = express.Router();
const fs = require("fs");
const multer = require("multer");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

let dir = "./upload";
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
    console.log("create dir", dir);
}

let storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, "./upload");
    }, 
    filename: function(req, file, cb){
        cb(null, file.fieldname);
    }
});
let upload = new multer({storage: storage});

router.post("/files", upload.any(), (req, res) => {
    console.log("save files");
    let data = [];
    for (let file of req.files) {
        let object = {
            name: file.filename,
            path: file.destination + "/",
            size: file.size
        };
        console.log(file);
        data.push(object);
    }
    const files = db.insertFiles(data);
    if (files) {
        console.log("files", files);
        res.status(200).send({ success: true, status: "ok", files });
    } else {
        res.status(200).send({ success: false, status: "no files save" });
    }
});

router.get("/files", (req, res) => {
    console.log("get files");
    const files = db.selectFiles();
    if (files.length != 0){
        res.status(200).send({success: true, msg: "ok", files});
    } else {
        res.status(200).send({success: false, msg: "no files found"});
    }
});

router.get("/file", (req, res) => {
    console.log("get file", req.query.name);
    const path = db.selectPathFile(req.query.name);
    if (path || path != ""){
        res.status(200).sendFile(__dirname + path.replace("./", "/") + req.query.name);
    } else {
        res.status(200).send({success: false, msg: "no file found"});
    }
});

router.delete("/file", (req, res) => {
    console.log("delete file", req.query.name);
    const file = db.deleteFile(req.query.name);
    if (file){
        fs.unlink(__dirname + file.path.replace("./", "/") + file.name, function(err){
            if(err) {
                console.log(err);
                res.status(200).send({success: false, msg: "no file deleted"});
            } else{
                res.status(200).send({success: true, msg: "ok", file});
            }
       });
    } else {
        res.status(200).send({success: false, msg: "no file found"});
    }
});

router.get("/health", (req, res) => {
    console.log("get health", process.env.APP_ENV);
    res.status(200).send({APP_ENV: app_env});
});

router.get("/deploy", (req, res) => {
    res.status(200).send({message: `Successful ${process.env.APP_ENV} deploy!`});
});

app.use(router);

let port = process.env.PORT;

app.listen(port, function () {
    console.log("start api", "listening port: " + port);
});