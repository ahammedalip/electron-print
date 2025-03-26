
const { app, BrowserWindow } = require('electron')
const express = require('express')
const cors = require('cors')

let win;

const server = express()

server.use(express.json())
server.use(cors())


const PORT = 3000;


function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
        }
    })
    win.loadURL("data:text/html;charset=utf-8,<h1>Auto Print Example</h1>");

}


// API Route to Trigger Printing
server.post("/print", (req, res) => {
    console.log("Print request received...");

    if (win) {
        win.webContents.print({ silent: true, printBackground: true }, (success, failureReason) => {
            if (!success) {
                console.log("Print failed:", failureReason);
                return res.status(500).json({ message: "Print failed", error: failureReason });
            }
            res.json({ message: "Print successful" });
        });
    } else {
        res.status(500).json({ message: "Window not ready" });
    }
});



server.listen(PORT, () => {
    console.log(`server running on port : http://localhost:${PORT}`);
})

app.whenReady().then(createWindow)