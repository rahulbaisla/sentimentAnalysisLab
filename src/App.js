import React, { useState } from "react";
import "./App.css";

// Amplify 
import Amplify, { Predictions } from "aws-amplify";
import { AmazonAIPredictionsProvider } from "@aws-amplify/predictions";
import { withAuthenticator, AmplifyTheme } from "aws-amplify-react";
import awsconfig from "./aws-exports";

// Utilities
import mic from "microphone-stream";
import GaugeChart from "react-gauge-chart";
import JSONPretty from "react-json-pretty";

// material-ui
import { makeStyles } from "@material-ui/core/styles";
import { createMuiTheme, MuiThemeProvider } from "@material-ui/core/styles";
import orange from "@material-ui/core/colors/orange";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";

const theme = createMuiTheme({
  palette: {
    primary: orange
  }
});

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    height: "100vh"
  },
  container: {
    fontFamily:
      '-apple-system,\n                BlinkMacSystemFont,\n                "Segoe UI",\n                Roboto,\n                "Helvetica Neue",\n                Arial,\n                sans-serif,\n                "Apple Color Emoji",\n                "Segoe UI Emoji",\n                "Segoe UI Symbol"',
    fontWeight: "400",
    lineHeight: "1.5",
    color: "#212529",
    textAlign: "center",
    paddingLeft: "15px",
    paddingRight: "15px",
    height: "100%"
  },
  recBtnContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    padding: "30px 10px 30px 10px"
  },
  gaugeContainer: {
    display: "flex",
    justifyContent: "space-evenly",
    padding: "30px 10px 30px 10px",
    height: "100%"
  },
  textContainer: {
    display: "flex",
    padding: "5px 5px 5px 5px",
    border: "3px solid transparent",
    borderColor: "#ccc",
    width: "70%",
    height: "65%",
    textAlign: "left"
  },
  chartStyle: {
    height: 250
  },
  chartDivStyle: {
    height: 300,
    width: 540,
    border: 3
  }
}));

Amplify.configure(awsconfig);

Amplify.addPluggable(new AmazonAIPredictionsProvider());

/** Function to convert speech to text  */
function SpeechToText(props) {
  const classes = props.classes;
  console.log("SpeechToText :: props :: " + props);
  console.log("SpeechToText :: classes :: " + classes);

  const [response, setResponse] = useState("");

  const [percent, setPercent] = useState(0);

  /** Function to Start/Stop Audio Recording  */
  function AudioRecorder(props) {
    const [recording, setRecording] = useState(false);
    const [micStream, setMicStream] = useState();
    const [audioBuffer] = useState(
      (function() {
        let buffer = [];
        function add(raw) {
          buffer = buffer.concat(...raw);
          return buffer;
        }
        function newBuffer() {
          console.log("reseting buffer");
          buffer = [];
        }

        return {
          reset: function() {
            newBuffer();
          },
          addData: function(raw) {
            return add(raw);
          },
          getData: function() {
            return buffer;
          }
        };
      })()
    );

    async function startRecording() {
      console.log("start recording");
      audioBuffer.reset();

      window.navigator.mediaDevices
        .getUserMedia({ video: false, audio: true })
        .then(stream => {
          const startMic = new mic();

          startMic.setStream(stream);
          startMic.on("data", chunk => {
            var raw = mic.toRaw(chunk);
            if (raw == null) {
              return;
            }
            audioBuffer.addData(raw);
          });

          setRecording(true);
          setMicStream(startMic);
        });
    }

    async function stopRecording() {
      console.log("stop recording");
      const { finishRecording } = props;

      micStream.stop();
      setMicStream(null);
      setRecording(false);

      const resultBuffer = audioBuffer.getData();

      if (typeof finishRecording === "function") {
        finishRecording(resultBuffer);
      }
    }

    return (
      <div>
        <div className={classes.recBtnContainer}>
          <MuiThemeProvider theme={theme}>
            <Button
              id="stopRecBtn"
              disabled={!recording}
              variant="contained"
              color="primary"
              onClick={stopRecording}
              hidden={true}
            >
              Stop recording
            </Button>
            <Button
              id="startRecBtn"
              disabled={recording}
              variant="contained"
              color="primary"
              onClick={startRecording}
              hidden={true}
            >
              Start recording
            </Button>
          </MuiThemeProvider>
        </div>
      </div>
    );
  }

  /** Function to convert recorded audio to text using Amazon Transcribe   */
  function convertFromBuffer(bytes) {
    setResponse("Performing Sentiment Analysis...");

    Predictions.convert({
      transcription: {
        source: {
          bytes
        },
        language: "en-US" // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
      }
    })
      .then(({ transcription: { fullText } }) => {
        console.log(fullText);
        interpretFromPredictions(JSON.stringify(fullText, null, 2));
      })
      .catch(err => console.log(JSON.stringify(err, null, 2)));
  }

  /** Function to apply sentiment analysis on converted text using Amazon Comprehend */
  function interpretFromPredictions(textToInterpret) {
    console.log("inside interpretFromPredictions");
    Predictions.interpret({
      text: {
        source: {
          text: textToInterpret
        },
        type: "ALL"
      }
    })
      .then(result => {
        var textToDisplay = textToInterpret + "\n\n" + JSON.stringify(result, null, 2);
        setResponse(textToDisplay);
        setGauge(result);
      })
      .catch(err => setResponse(JSON.stringify(err, null, 2)));
  }

  function setGauge(result) {
    if (result.textInterpretation.sentiment.predominant === "POSITIVE") {
      console.log("Inside condition POSITIVE :: ");
      setPercent(0.83);
    } else if (result.textInterpretation.sentiment.predominant === "NEGATIVE") {
      console.log("Inside condition NEGATIVE :: ");
      setPercent(0.17);
    } else if (result.textInterpretation.sentiment.predominant === "NEUTRAL") {
      console.log("Inside condition NEUTRAL :: ");
      setPercent(0.5);
    }
  }
  return (
    <div className={classes.container}>
      <AudioRecorder classes={classes} finishRecording={convertFromBuffer} />
      <div className={classes.gaugeContainer}>
        <div className={classes.chartDivStyle}>
          <GaugeChart
            id="gauge-chart1"
            className={classes.chartStyle}
            percent={percent}
            hideText={true}
            colors={["#FF0000", "#FFFF00", "#00FF00"]}
          />
        </div>
        <div className={classes.textContainer}>
          <Typography
            display="initial"
            noWrap={true}
            align="left"
            variant="h6"
            gutterBottom
          >
            <JSONPretty id="json-pretty" data={response}></JSONPretty>
          </Typography>
        </div>
      </div>
    </div>
  );
}

function App() {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <h1>Voice Sentiment Analysis</h1>
        <SpeechToText classes={classes} />
      </div>
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true,
  signUpConfig: {
    hiddenDefaults: ["phone_number"]
  }
});
