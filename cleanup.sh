#!/usr/bin/env bash

read -p "This will remove any prior lab environments and set up a new one. Proceed (y/n)? " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
  echo Cleaning up previous environment. Please wait...
  cd ~/Desktop/devlabs/sentimentAnalysisLab
  amplify delete
  rm -rf ~/Desktop/devlabs/sentimentAnalysisLab
  echo Done cleaning up
END
else
  echo OK. No changes were made
fi
