// Base imports
const express = require('express');
const app = express();
const multer = require('multer');
const fse = require('fs-extra');

// Multer strategies||config
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

// Middleware
const cors = require('cors');
express.static('./uploads');
app.use(cors());

// DB
console.log(process.env.DB_USER,process.env.DB_HOST,process.env.DB_NAME,process.env.DB_PASS,process.env.DB_PORT);
const { Pool } = require('pg');
const pool = new Pool({
    user: 'docker',
    host: 'database',
    database: 'docker',
    password: 'docker',
    port: 5432
});

// Request Deconstructor/Regex functions
const deconstructUrl = (url, requestType) => {
    if (requestType.toLowerCase() == 'get') return url.match(/[^\/]+/g).slice(1,-1);
    return url.match(/[^\/]+/g).slice(-4)
};
const getExtensionFromUrl = url => url.match(/[^\/]+/g).slice(-1)[0];
const isValidFileExtension = ext => (ext === 'mp3' ? true: false);
const hasUserAndPhraseAndId = deconstructedUrl => deconstructedUrl[0] == 'user' && deconstructedUrl[2] == 'phrase' && !Number.isNaN(deconstructedUrl[1]) && !Number.isNaN(deconstructedUrl[3]);

// EXPORT TO TESTING SUITE
module.exports = {
    deconstructUrl: deconstructUrl, 
    getExtensionFromUrl: getExtensionFromUrl,
    isValidFileExtension: isValidFileExtension,
    hasUserAndPhraseAndId: hasUserAndPhraseAndId
}

// Handlers
//GET [audio file]
app.get('/audio/*', async (req, res) => {

    // Deconstruct request >> /user/1/phrase/1/mp3 -> ['user', 1, 'phrase', 1]
    let deconstructedUrl = deconstructUrl(req.url, req.method);

    // if user and phrase not present, return error
    if (!hasUserAndPhraseAndId(deconstructedUrl)) return res.status(400).json({success: false, message: 'Either user id or phrase id not provided.'})

    //Capture file extension
    let ext = getExtensionFromUrl(req.url);

    //If not mp3, return error 
    if (!isValidFileExtension(ext)) return res.status(400).json({success: false, message:  'URL must end with a file extension i.e. mp3'})

    // If deconstructed array < 4, URL is invalid so return error
    if (deconstructedUrl.length < 4) return res.status(400).json({success: false, message: 'Either a user or a phrase was not provided.'})

    let userId = deconstructedUrl[1];
    let phraseId = deconstructedUrl[3];

    // Query for user, if none exists return no user error
    let userQuery = await pool.query(`
        SELECT * from users u
        WHERE u.uuid = 'user-${userId}'
    `);

    // if user not found in database, return user does not exist error
    if (!userQuery.rows || userQuery.rows.length < 1) return res.status(404).json({success: false, message: 'User does not exist.'})
    
    // Query for path of audio file
    let audioFileQuery = await pool.query(`SELECT filepath from phrases where user_id = 'user-${userId}' AND id = ${phraseId}`);
    
    //if no file exists, return error
    if (!audioFileQuery.rows || audioFileQuery.rows.length < 1) return res.status(404).json({success: false, message:  'No file found.'});

    // read file bytes from local filesystem
    fse.readFile(audioFileQuery.rows[0].filepath, async (err, data) => {

        // Update [last_downloaded] column
        let updateText = 'UPDATE phrases SET last_downloaded = $1 where user_id = $2 AND id = $3';
        await pool.query(updateText, [new Date(), `user-${userId}`, phraseId]);

        // Send success - download file
        res.download(audioFileQuery.rows[0].filepath);
    });
});

// POST [upload audio file]
app.post('/audio/*', upload.any(), async (req, res) => {
    
    // Deconstruct request >> /user/1/phrase/1 -> ['user', 1, 'phrase', 1]
    let deconstructedUrl = deconstructUrl(req.url, req.method)
    let userId = deconstructedUrl[1];
    let phraseId = deconstructedUrl[3];

    // if user and phrase not present, return error
    if (!hasUserAndPhraseAndId(deconstructedUrl)) return res.status(400).json({success: false, message: 'Either user id or phrase id not provided.'})

    // if user does not exist, return error//
    let userQuery = await pool.query(`SELECT uuid from users where uuid = 'user-${userId}'`);
    if (!userQuery.rows || userQuery.rows.length < 1) return res.status(400).json({success: false, message: 'User does not exist.'});

    // if no file, return error message
    if(!req.files || req.files.length < 1) return res.status(400).json({success:false, message: 'Please upload a valid file.'});

    // if mimetype != audio, return error message
    const file = req.files[0]
    if(file.mimetype!= 'audio/mpeg') return res.status(400).json({success:false, message: 'Please upload an audio file.'});

     // If folder exists for "user_id-phrase_id", return error
     if (fse.pathExistsSync(`./uploads/users/${userId}/phrases/${phraseId}`) == true){
        return res.status(400).json({success: false, message: 'Phrase with this ID already exists for this user.'});
     };

    // Create filename & save file
    let filename = `${new Date().toISOString()}-${req.files[0].originalname.match(/.*?(?=\.mp3)/)[0]}.wav`;
    let outputPath = `./uploads/users/${userId}/phrases/${phraseId}/${filename}`;

    // Output as .wav file into static directory [./Uploads]
    fse.outputFile(outputPath, file.buffer, err => {});

    // Async write to database
    //No need to handle error as handled above by check on existence of user/phrase id combination
    await pool.query(`INSERT INTO phrases (id, user_id, filepath) values(${phraseId}, 'user-${userId}', '${outputPath}')`);
    
    // Send 200 success
    res.json({success: true, message: 'file uploaded.'});
});
// Server initialize
app.listen(3000, console.log(`Server is running on port 3000`));