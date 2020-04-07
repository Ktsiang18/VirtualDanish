from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route('/')
def hello():
    return "<h1 style='color: blue;'>Welcome to  danish!</h1>"

@app.route("/start")
def start():
    return render_template("welcome.html")

if __name__  == '__main__':
    app.run()
