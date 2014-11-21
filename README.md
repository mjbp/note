#Note
A note-making snippet app

Visit the website: [https://lit-anchorage-4877.herokuapp.com/] (https://lit-anchorage-4877.herokuapp.com/)

##What does it do?
1. Make Notes, each with a unique URL
2. The Note is saved as you type, persisting locally offline (localStorage) and in the mongodb when online
3. Edit the Note in a contenteditable div, anyone can edit a note if they know the URL
4. Send the Note by email, by downloading as a Blob or simply by sharing the unique URL

##Installing your own version
1. Fork and npm install
2. Create mongodb called note collection called 'note', with a collection called 'note'
3. Edit default connection string /app.js) if necessary (for example if you're using a non-default port)
4. To enable Note emailing you must enter your own SMTP details in routes/mail.js, to use Gmail see the file comments

###License
[MIT] (http://opensource.org/licenses/MIT)
