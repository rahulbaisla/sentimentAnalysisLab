  # Dev Labs: Build a Sentiment Analysis App in minutes using Amplify Framework

In this workshop we will demonstrate how to add the AI and ML cloud service feature to your web application with [React](https://reactjs.org/) and the [Amplify Framework](https://aws-amplify.github.io/). We will learn to integrate following 3 AWS Services in your web application in few minutes

1. **Amazon Cognito**- Fully managed User Management
2. **Amazon Transcribe** - Adds speech-to-text capability
3. **Amazon Comprehend** -  Uses ML to find insights and relationships in text.


# Install the Amplify CLI 

Install the AWS Amplify CLI:

```bash
npm install -g @aws-amplify/cli
```

## Clone the UI from GitHub and Install dependencies

```bash
Run following scripts provided to automate the project and installing dependencies:
sh cleanup.sh
sh setup.sh
```

OR 

```bash
mkdir ~/Desktop/devlabs
cd ~/Desktop/devlabs
git clone https://github.com/rahulbaisla/sentimentAnalysisLab.git
cd sentimentAnalysisLab
npm install
```

## Initialize Amplify

```bash
cd ~/Desktop/devlabs/sentimentAnalysisLab
amplify init
```

`Enter a name for the project:` **sentimentAnalysisLab**

`Enter a name for the environment:` **dev**

`Choose your default editor:` **Visual Studio Code**

`Choose the type of app that you're building:` **javascript**
 
`What javascript framework are you using:` **react**

`Source Directory Path:`  **src**

`Distribution Directory Path:` **build**

`Build Command:`  **npm run-script build**

`Start Command:` **npm run-script start**

`Do you want to use an AWS profile?` **Yes**

`Please choose the profile you want to use` **default**


The AWS Amplify CLI will initialize a new project inside your React project & you will see a new folder: `amplify`. The files in this folder hold your project configuration.

## Add Authentication to the Web Application


`amplify add auth`
`Do you want to use the default authentication and security configuration?` **Default configuration**

`Warning: you will not be able to edit these selections. 
How do you want users to be able to sign in?` **Username**

`Do you want to configure advanced settings?` **No, I am done.**

## Add Speech-To-Text Functionality

`amplify add Predictions`

`Please select from one of the categories below:` **Convert**

`What would you like to convert?` **Transcribe text from audio**

`Provide a friendly name for your resource:` **transcription**

`What is the source language?`  **US English**

`Who should have access?`  **Auth users only**



## Add Speech-To-Text Functionality

`amplify add Predictions`

`Please select from one of the categories below:` **Interpret**

`What would you like to interpret Interpret:` **Text**

`Provide a friendly name for your resource:` **interpret**

`What kind of interpretation would you like?` **All**

`Who should have access? ` **Auth users only**


## Push the Backend to AWS Cloud

amplify push
```
✔ Successfully pulled backend environment dev from the cloud.

Current Environment: dev

| Category    | Resource name                | Operation | Provider plugin   |
| ----------- | ---------------------------- | --------- | ----------------- |
| Auth        | sentimentanalysislab | Create    | awscloudformation |
| Predictions | transcription                | Create    | awscloudformation |
| Predictions | interpret                    | Create    | awscloudformation |

Are you sure you want to continue? Yes
```


## Test the Application

1. 
```
In your project directory ~/Desktop/devlabs/sentimentAnalysisLab run following command
npm run start
```

2. Create an user account
   ![](images/SignUp.png)


3. Sign-in to the Application

    ![](images/SignIn.png "Sign In")

4. Start Recording and speak some text. Once finished stop the recording. 
   
   ![](images/Dashboard.png "App Dashboard")

The audio will be converted into text using Amazon Transcribe Service and the converted text will be interpreted to perform sentiment analysis using Amazon Comprehend Service.


## Understanding the code

Imports 
```
import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import { withAuthenticator, AmplifyTheme} from 'aws-amplify-react';
import awsconfig from './aws-exports';
```

Convert recorder audio to text and performing sentiment analysis on text  
```
function convertFromBuffer(bytes) {
    setResponse('Performing Sentiment Analysis...');

    Predictions.convert({
        transcription: {
          source: {
            bytes
          },
           language: "en-US", // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
        },
      }).then(({ transcription: { fullText } }) => {interpretFromPredictions(JSON.stringify(fullText, null, 2))})
        .catch(err => console.log(JSON.stringify(err, null, 2)))   
  }

  function interpretFromPredictions(textToInterpret) {
    console.log("inside interpretFromPredictions")
    Predictions.interpret({
      text: {
        source: {
          text: textToInterpret,
        },
        type: "ALL"
      }
    }).then(result => {setResponse(JSON.stringify(result, null, 2));setGauge(result);})
      .catch(err => setResponse(JSON.stringify(err, null, 2)))
  }
```
