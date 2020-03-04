import React, { useState } from 'react';

import './App.css';
import Amplify, { Predictions } from 'aws-amplify';
import { AmazonAIPredictionsProvider } from '@aws-amplify/predictions';
import mic from 'microphone-stream';
import { withAuthenticator, AmplifyTheme} from 'aws-amplify-react';
import GaugeChart from 'react-gauge-chart'
import JSONPretty from 'react-json-pretty';
import awsconfig from './aws-exports';
import { makeStyles } from '@material-ui/core/styles';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange'
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const theme = createMuiTheme({
    palette: {
      primary: orange,
    }
  });

  
const useStyles = makeStyles(theme => ({
    root: {
      flexGrow: 1,
      height: "100vh"
    },
    container: {
        fontFamily: "-apple-system,\n                BlinkMacSystemFont,\n                \"Segoe UI\",\n                Roboto,\n                \"Helvetica Neue\",\n                Arial,\n                sans-serif,\n                \"Apple Color Emoji\",\n                \"Segoe UI Emoji\",\n                \"Segoe UI Symbol\"",
        fontWeight: '400',
        lineHeight: '1.5',
        color: '#212529',
        textAlign: 'center',
        paddingLeft: '15px',
        paddingRight: '15px',
        height: '100%'
    },
    recBtnContainer:{
        display: "flex",
        justifyContent: "space-evenly",
        padding: '30px 10px 30px 10px'
    },
    gaugeContainer: {
        display: "flex",
        justifyContent: "space-evenly",
        padding: '30px 10px 30px 10px',
        height: '100%',
    },
    textContainer : {
        display: "flex",
        padding: '5px 5px 5px 5px',
        border: '3px solid transparent',
        borderColor: '#ccc',
        width: '70%',
        height: '65%',
        textAlign: 'left'
    },
    button: {
    display: 'inline-block',
    padding: '6px 12px',
    marginBottom: '0',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.42857143',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    touchAction: 'manipulation',
    cursor: 'pointer',
    userSelect: 'none',
    backgroundImage: 'none',
    border: '1px solid transparent',
    borderRadius: '4px',
    color: '#333',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
    chartStyle : {
        height: 250
    },
    chartDivStyle : {
        height: 300, 
        width: 540,
        border: 3
      }
  }));

Amplify.configure(awsconfig);

Amplify.addPluggable(new AmazonAIPredictionsProvider());


function SpeechToText(props) {
  const classes = props.classes;
  console.log("SpeechToText :: props :: " + props)
  console.log("SpeechToText :: classes :: " + classes)
  
  const [response, setResponse] = useState("")

  const [percent, setPercent] = useState(0);
  
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
      console.log('start recording');
      audioBuffer.reset();

      window.navigator.mediaDevices.getUserMedia({ video: false, audio: true }).then((stream) => {
        const startMic = new mic();

        startMic.setStream(stream);
        startMic.on('data', (chunk) => {
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
      console.log('stop recording');
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
        <Button id = "stopRecBtn" disabled={!recording} variant="contained" color="primary" onClick={stopRecording} hidden={true}>Stop recording</Button>
        <Button  id = "startRecBtn" disabled={recording} variant="contained" color="primary" onClick={startRecording} hidden={true}>Start recording</Button>
        </MuiThemeProvider>
        
          
        </div>
      </div>
    );
  }

  function convertFromBuffer(bytes) {
    setResponse('Performing Sentiment Analysis...');

    Predictions.convert({
        transcription: {
          source: {
            bytes
          },
           language: "en-US", // other options are "en-GB", "fr-FR", "fr-CA", "es-US"
        },
      }).then(({ transcription: { fullText } }) => {console.log(fullText);interpretFromPredictions(JSON.stringify(fullText, null, 2))})
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

  function setGauge(result) {
    
    if (result.textInterpretation.sentiment.predominant === 'POSITIVE') {
        console.log("Inside condition POSITIVE :: ")
        //setPercent(JSON.stringify(result.textInterpretation.sentiment.positive))
        setPercent(0.83)
    } else if (result.textInterpretation.sentiment.predominant === 'NEGATIVE') {
        console.log("Inside condition NEGATIVE :: ")
        //setPercent(JSON.stringify(result.textInterpretation.sentiment.negative))
        setPercent(0.17)
    } else if (result.textInterpretation.sentiment.predominant === 'NEUTRAL') {
        console.log("Inside condition NEUTRAL :: ")
        //setPercent(JSON.stringify(result.textInterpretation.sentiment.negative))
        setPercent(0.50)
    }
    

  }
  return (
      <div className={classes.container}>
        <AudioRecorder classes = {classes} finishRecording={convertFromBuffer} />
        <div className={classes.gaugeContainer}>
            <div className={classes.chartDivStyle}>
                <GaugeChart id="gauge-chart1"  className={classes.chartStyle} percent={percent} hideText={true}
                colors={['#FF0000', '#FFFF00', '#00FF00']}/>
            </div>
            <div className={classes.textContainer}>
            <Typography display="initial" noWrap={true} align="left" variant="h6" gutterBottom>
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
            <SpeechToText classes={classes}/>
        </div>
    </div>
  );
}

export default withAuthenticator(App, true);