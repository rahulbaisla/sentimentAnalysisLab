#!/usr/bin/env bash

echo Clone GitHubRepo

mkdir ~/Desktop/devlabs
cd ~/Desktop/devlabs
git clone https://github.com/rahulbaisla/sentimentAnalysisLab.git
cd sentimentAnalysisLab

echo Install Dependencies
npm install
