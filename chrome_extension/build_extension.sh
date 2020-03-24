set -e  # fail on failure of any simple command
set -v  # print lines as they are being executed
# popup and options directory should exist

# build react application for popup
cd popup
npm run-script build
cd ..

# build react application for options page
cd options
npm run-script build
cd ..


# generate combined folder related to the chrome extension
rsync -r popup/build/ build
rsync -r options/build/ build/options