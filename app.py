import os	
import parsefile
from flask import Flask, render_template, request, redirect, url_for
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = 'uploads/'
ALLOWED_EXTENSIONS = set(['xlsx', 'csv'])


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/index")
def index():
	return render_template("index.html")

@app.route("/")
def login():
    return redirect(url_for("index"))

@app.route("/home")
def home():
    return render_template("home.html")

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/new_idp', methods=['POST'])
def new_idp(): 
	print "entered"
	if 'file' in request.files:
		file = request.files['file']
		if file.filename == '':
			flash('No selected file')
			return redirect ("/home")
		if file and allowed_file(file.filename):
			print "trying to upload"
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
			print "uploaded"

			#participant already exists
			if not parsefile.upload_new_participant_data(filename):
				error = 'Participant already exists. To update their data, use the update data button.'
				return render_template("home.html", error = error)
	return redirect(url_for('home'))
    
@app.route('/update_idp', methods=['POST'])
def update_idp():
	if 'file' in request.files:
		file = request.files['file']
		if file.filename == '':
			flash('No selected file')
			return redirect ("/home")
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

			parsefile.update_participant_data(filename)

	return redirect(url_for('home'))



if __name__ == "__main__":
    app.run()