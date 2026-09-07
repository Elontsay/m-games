import os

from app import create_app

app = create_app()

if __name__ == "__main__":
    # Defaults to 5000 (what the README and the Google redirect URI expect);
    # PORT gets you out of the way when something else already has that one.
    app.run(debug=True, port=int(os.environ.get("PORT", 5000)))
