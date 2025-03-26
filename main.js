
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


server.post("/img", (req, res)=>{
    console.log('image print req recieved');
    
    const { imageUrl, base64Image } = req.body;  // Extract image data from the request

    if (!imageUrl && !base64Image) {
        return res.status(400).json({ message: "No image provided for printing" });
    }

    let imgTag = "";

    if (imageUrl) {
        console.log('img url')
        imgTag = `<img src="${imageUrl}" style="width:100%; height:auto; object: cover">`;
    } else if (base64Image) {
        console.log('base 64');
        imgTag = `<img src="data:image/png;base64,${base64Image}" style="width:100%; height:auto;">`;
    }

    if (win) {
        // Update window with the image
        win.loadURL(`data:text/html;charset=utf-8,<h1>Print Preview</h1>${imgTag}`);

        // Wait for the window to finish loading before printing
        win.webContents.once('did-finish-load', () => {
            win.webContents.print({ silent: true, printBackground: true }, (success, failureReason) => {
                if (!success) {
                    console.log("Print failed:", failureReason);
                    return res.status(500).json({ message: "Print failed", error: failureReason });
                }
                res.json({ message: "Print successful" });
            });
        });
    } else {
        res.status(500).json({ message: "Window not ready" });
    }
})


server.listen(PORT, () => {
    console.log(`server running on port : http://localhost:${PORT}`);
})

app.whenReady().then(createWindow)