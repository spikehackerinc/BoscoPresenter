const fs = require('fs');
const path = require('path');
const multer  = require('multer');

const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.json());

const baseUploadPath = './uploads/';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, baseUploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const uploader = multer({ storage: storage });






app.get('/presentOpenWindow', (req, res) => {
    const { exec } = require('child_process');

    const url = 'http://localhost:3000/present';
    const chromePathLinux = '/usr/bin/google-chrome';
    const chromePathWindows = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; // '/usr/bin/google-chrome'
    
    const chromePath = chromePathLinux;

    const command = `"${chromePath}" --new-window --kiosk "${url}"`;

    exec(command, (err) => {
    if (err) {
        console.error('Failed to open Chrome:', err);
    }
    });
});


/*
const { exec } = require('child_process');

const url = 'http://localhost:3000/present';

// Path to Chrome executable
const chromePath = '/usr/bin/google-chrome'; // Update this with the actual Chrome path

// Chrome command with flags to open in kiosk mode
const command = `"${chromePath}" --new-window --kiosk "${url}"`;

// Execute the command to open Chrome
exec(command, (err) => {
  if (err) {
    console.error('Failed to open Chrome:', err);
  }
});*/













app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/basic.html');
});



app.get('/testSongContents', (req, res) => {
    const contents = readFile("./songs/" + getFileNamesInFolder("./songs")[0]);
    res.send(splitSections(contents));
});



app.post('/loadFilesInFolder', (req, res) => {
    let folderPath = req.body.folderPath;
    const files = getFileNamesInFolder(folderPath);
    res.send(files);
});








let currentSection = 0;
let isBasicSending = false;
let basicSendingContent = "";

app.post('/setBasicSendingContent', (req, res) => {
  basicSendingContent = req.body.content;
  basicSendingContent = basicSendingContent.replace(/\n/g, "<br>");

  if(basicSendingContent == "STOP") {
    isBasicSending = false;
  }
  else {
    isBasicSending = true;
  }

  res.send("OK");
});

app.get('/getSectionServer', (req, res) => {
    if (isBasicSending) {
        res.send(basicSendingContent);
    } else {
        res.send('');

        /*
    const contents = readFile("./songs/" + getFileNamesInFolder("./songs")[0]);

    if (currentSection < 0) {
      currentSection = 0;
    }
    if (currentSection > splitSections(contents).length - 1) {
      currentSection = splitSections(contents).length - 1;
    }
  
    // if currentsection match following regex 100140407 then increment
    const ignoreSectionRegex = /\d{9}/;
  
    if (splitSections(contents)[currentSection].match(ignoreSectionRegex)) {
      currentSection++;
    }
    
  
    res.send(splitSections(contents)[currentSection]);*/
    }
});

app.get('/incrementSectionServer', (req, res) => {
  currentSection++;
  res.send("OK");
});

app.get('/decrementSectionServer', (req, res) => {
  currentSection--;
  res.send("OK");
});

app.listen(port, () => {
    console.log(`Bosco Presenter listening at http://localhost:${port}`);
});









function splitSections(text) {
    // Split the text by any combination of \r and \n characters
    const lines = text.split(/\r?\n/);

    // Initialize an array to hold all sections
    let sections = [];
    // Initialize a variable to hold the current section
    let currentSection = [];

    // Iterate over each line
    lines.forEach((line) => {
        // Check if the line is a section number (3 digits, possibly with leading/trailing whitespace)
        if (line.trim().match(/^\d{3}$/)) {
            // If currentSection has content, push it to sections and start a new section
            if (currentSection.length) {
                sections.push(currentSection.join(' ')); // Join with space to remove newlines
            }
            currentSection = [];
        } else if (line.trim() !== '') {
            // Ignore empty lines
            // If it's not a section number, add the line to the current section
            currentSection.push(line.trim()); // Trim each line to remove whitespace
        }
    });

    // Push the last section if it exists
    if (currentSection.length) {
        sections.push(currentSection.join(' '));
    }

    return sections;
}












app.get('/present', (req, res) => {
    res.sendFile(__dirname + '/public/present.html');
});

app.get('/setup', (req, res) => {
    res.sendFile(__dirname + '/public/setup.html');
});

app.get('/basic', (req, res) => {
    res.sendFile(__dirname + '/public/basic.html');
});

app.post('/loadFileFromPreviewName', async (req, res) => {
    let folderPath = req.body.folderPath;

    // make sure folderPath has / at the end of it
    if(folderPath != "") {
        if(folderPath[folderPath.length - 1] != "/") {
            folderPath += "/";
        }
    }

    res.json(await loadFileFromPreviewName(req.body.previewName, folderPath));
});

app.post('/upload', uploader.single('file'), async (req, res) => {
    const sections = await readFileFormattedIntoSections(req.file.path);

    res.json(sections);
});

app.get('/getFilesAndPreviews', (req, res) => {
    res.send(listFilesAndPreviews());
});

async function loadFileFromPreviewName(previewName, folderPath) {
    let basePath = './songs/';
    let bypasscheckandloadfiledirectly = false;

    if(folderPath != "") {
        basePath = folderPath;
        bypasscheckandloadfiledirectly = true;
    }

    var files = getFileNamesInFolder(basePath);

    for (var i = 0; i < files.length; i++) {
        const filePath = files[i];
        const previewNameFromFile = getPreviewName(basePath + filePath);

        if(bypasscheckandloadfiledirectly) {
            if(previewName == filePath) {
                const sections = await readFileFormattedIntoSections(
                    basePath + filePath
                );
    
                return sections;
            }
        }

        if (previewNameFromFile == previewName) {
            const sections = await readFileFormattedIntoSections(
                basePath + filePath
            );

            return sections;
        }


    }

    return [];
}

function getPreviewName(filePath) {
    var firstLine = readFileLine(filePath, 2);
    // replace \r characters with empty string
    firstLine = firstLine.replace(/\r/g, '');

    // Get file name accounting for any path
    const fileName = filePath.split('/').pop();
    const fileNameWithoutExtension = fileName.replace('.txt', '');

    return firstLine + ' - ' + fileNameWithoutExtension;
}

function readFile(filePath) {
    var fileContent = fs.readFileSync(filePath, 'utf8');
    return fileContent;
}

function readFileLine(filePath, lineNumber) {
    var fileContent = readFile(filePath);
    var lines = fileContent.split('\n');
    return lines[lineNumber];
}

async function readFileFormattedIntoSections(filePath) {
    const file = await fs.readFileSync(filePath, 'utf8');
    const lines = file.split('\r\n');
    const sections = [];

    lines.shift(); // remove first line

    let currentSection = [];

    lines.forEach((line) => {
        if (line.trim().match(/^\d{3}$/)) {
            // if line is a section number
            if (currentSection.length) {
                sections.push(currentSection.join(' '));
            }
            currentSection = [];
        } else if (line.trim() !== '') {
            currentSection.push(line.trim());
        }
    });

    if (currentSection.length) {
        sections.push(currentSection.join(' ')); // Join with space to remove newlines
    }

    sections.push('');
    sections.push('');

    return sections;
}

function readFilesFromFolder(folder) {
    const items = fs.readdirSync(folder);
    const files = items.filter(item => {
        const itemPath = path.join(folder, item);
        return fs.statSync(itemPath).isFile();
    });
    return files;
}

function getFileNamesInFolder(folder) {
    //var files = fs.readdirSync(folder);
    var files = readFilesFromFolder(folder);
    return files;
}

function listFilesAndPreviews() {
    const basePath = './songs/';
    var files = getFileNamesInFolder(basePath);
    var previews = [];

    files.forEach((file) => {
        const fileName = file;
        const previewName = getPreviewName(basePath + fileName);

        previews.push(previewName);
    });

    return previews;
}







// -------------
// Debug Section
// -------------
let files = getFileNamesInFolder('./songs');

files.forEach((file) => {
  // console.log(getPreviewName('./songs/' + file));
});