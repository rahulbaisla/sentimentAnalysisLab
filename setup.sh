#!/usr/bin/env bash

echo Clone GitHubRepo

mkdir devlabs
cd devlabs
git clone https://github.com/rahulbaisla/sentimentAnalysisLab.git
cd sentimentAnalysisLab

echo Install Dependencies
npm install
